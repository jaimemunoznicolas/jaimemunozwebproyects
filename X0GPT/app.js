const App = (() => {
  const MAX_HISTORY = 200;
  const STORAGE_KEY = 'x0gpt_chat';
  let isProcessing = false;
  let isStreaming = false;
  let abortController = null;
  let currentStreamInterval = null;

  /* ═══════════════════════════════════════════
     INITIALIZATION
     ═══════════════════════════════════════════ */
  function init() {
    setupEventListeners();
    loadHistory();
    updateConnectionStatus();
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);

    setTimeout(() => {
      showWelcome();
      updateStatusIndicator();
    }, 100);
  }

  /* ═══════════════════════════════════════════
     EVENT LISTENERS
     ═══════════════════════════════════════════ */
  function setupEventListeners() {
    const sendBtn = document.getElementById('sendBtn');
    const chatInput = document.getElementById('chatInput');
    const clearBtn = document.getElementById('clearChatBtn');
    const exportBtn = document.getElementById('exportChatBtn');
    const importBtn = document.getElementById('importChatBtn');
    const searchBtn = document.getElementById('searchChatBtn');
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebarClose');
    const overlay = document.getElementById('overlay');
    const newChatBtn = document.getElementById('newChatBtn');

    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
      chatInput.addEventListener('input', autoResize);
    }
    if (clearBtn) clearBtn.addEventListener('click', clearChat);
    if (exportBtn) exportBtn.addEventListener('click', exportChat);
    if (importBtn) importBtn.addEventListener('click', importChat);
    if (searchBtn) searchBtn.addEventListener('click', toggleSearchBar);
    if (newChatBtn) newChatBtn.addEventListener('click', clearChat);

    // Sidebar toggle
    function openSidebar() {
      if (sidebar) sidebar.classList.add('open');
      if (overlay) overlay.classList.add('active');
    }
    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('active');
    }
    if (menuBtn) menuBtn.addEventListener('click', openSidebar);
    if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSidebar();
      if (e.ctrlKey && e.key === 'k') { e.preventDefault(); chatInput?.focus(); }
      if (e.ctrlKey && e.key === 'l') { e.preventDefault(); clearChat(); }
    });

    // Suggestion buttons
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const question = btn.dataset.question;
        if (question && chatInput) {
          chatInput.value = question;
          sendMessage();
          closeSidebar();
        }
      });
    });

    // Character count
    if (chatInput) {
      chatInput.addEventListener('input', () => {
        const count = document.getElementById('charCount');
        if (count) count.textContent = chatInput.value.length;
      });
    }
  }

  function autoResize() {
    const ta = document.getElementById('chatInput');
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }

  /* ═══════════════════════════════════════════
     MESSAGING
     ═══════════════════════════════════════════ */
  async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const text = chatInput?.value.trim();
    if (!text || isProcessing) return;

    chatInput.value = '';
    chatInput.style.height = 'auto';
    isProcessing = true;
    updateSendButton(true);
    addMessage(text, 'user');

    const thinkingMsg = addMessage('Pensando...', 'bot', true);

    try {
      abortController = new AbortController();
      const response = await Engine.processMessage(text);
      removeMessage(thinkingMsg);
      isStreaming = true;
      await streamResponse(response.text);
      isStreaming = false;
      saveHistory();
    } catch (error) {
      removeMessage(thinkingMsg);
      addMessage('Error al procesar tu mensaje. Intenta de nuevo.', 'bot');
      isStreaming = false;
    }

    isProcessing = false;
    updateSendButton(false);
    scrollToBottom();
    updateStatusIndicator();
  }

  async function streamResponse(text) {
    const msgDiv = addMessage('', 'bot', false, true);
    const contentDiv = msgDiv?.querySelector('.message-content');
    if (!contentDiv) return;

    const chars = [...text];
    let i = 0;
    let currentHTML = '';

    return new Promise((resolve) => {
      currentStreamInterval = setInterval(() => {
        if (i >= chars.length) {
          clearInterval(currentStreamInterval);
          currentStreamInterval = null;
          contentDiv.innerHTML = formatText(text);
          scrollToBottom();
          resolve();
          return;
        }

        const chunk = chars.slice(i, i + 5).join('');
        currentHTML += chunk;
        i += 5;

        contentDiv.innerHTML = formatText(currentHTML) + (i < chars.length ? '<span class="cursor">▌</span>' : '');
        scrollToBottom();
      }, 20);
    });
  }

  function stopStreaming() {
    if (currentStreamInterval) {
      clearInterval(currentStreamInterval);
      currentStreamInterval = null;
      isStreaming = false;
    }
  }

  /* ═══════════════════════════════════════════
     MESSAGE RENDERING — XSS-Safe
     ═══════════════════════════════════════════ */
  function addMessage(text, role, isTemporary = false, isStreaming = false) {
    const chatContainer = document.getElementById('messages') || document.getElementById('chatMessages');
    if (!chatContainer) return null;

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}-message`;
    if (isTemporary) msgDiv.classList.add('temporary');
    if (isStreaming) msgDiv.classList.add('streaming');

    const icon = document.createElement('div');
    icon.className = 'message-icon';
    icon.textContent = role === 'user' ? '👤' : '⚡';

    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;
    if (!isTemporary && !isStreaming) {
      content.innerHTML = formatText(text);
    }

    msgDiv.appendChild(icon);
    msgDiv.appendChild(content);
    chatContainer.appendChild(msgDiv);
    scrollToBottom();
    return msgDiv;
  }

  function removeMessage(msgDiv) {
    if (msgDiv && msgDiv.parentNode) {
      msgDiv.parentNode.removeChild(msgDiv);
    }
  }

  function getChatContainer() {
    return document.getElementById('messages') || document.getElementById('chatMessages');
  }

  function formatText(text) {
    if (!text) return '';
    let html = escapeHtml(text);
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    html = html.replace(/\n/g, '<br>');
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    return html;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ═══════════════════════════════════════════
     CHAT MANAGEMENT
     ═══════════════════════════════════════════ */
  function clearChat() {
    const container = getChatContainer();
    if (container) container.innerHTML = '';
    Engine.clearContext();
    localStorage.removeItem(STORAGE_KEY);
    showWelcome();
    updateStatusIndicator();
  }

  function exportChat() {
    const data = {
      version: '2.0',
      exported: new Date().toISOString(),
      app: 'X0GPT',
      messages: getChatHistory()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `x0gpt-chat-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importChat() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.messages && Array.isArray(data.messages)) {
          clearChat();
          for (const msg of data.messages) {
            addMessage(msg.text, msg.role);
          }
          saveHistory();
        }
      } catch (err) {
        addMessage('Error al importar el chat. Archivo inválido.', 'bot');
      }
    };
    input.click();
  }

  function toggleSearchBar() {
    let searchBar = document.getElementById('chatSearchBar');
    if (searchBar) {
      searchBar.remove();
      return;
    }
    searchBar = document.createElement('div');
    searchBar.id = 'chatSearchBar';
    searchBar.className = 'chat-search-bar';
    searchBar.innerHTML = `
      <input type="text" id="chatSearchInput" placeholder="Buscar en el chat..." class="chat-search-input">
      <button id="chatSearchNext" class="chat-search-btn">↓</button>
      <button id="chatSearchPrev" class="chat-search-btn">↑</button>
      <button id="chatSearchClose" class="chat-search-btn">✕</button>
    `;
    const header = document.querySelector('.chat-header');
    if (header) header.after(searchBar);

    let searchIndex = -1;
    let matches = [];

    function doSearch() {
      const query = document.getElementById('chatSearchInput')?.value.toLowerCase();
      if (!query) { clearHighlights(); return; }
      const messages = document.querySelectorAll('.message-content');
      matches = [];
      messages.forEach((m, i) => {
        m.classList.remove('highlight');
        if (m.textContent.toLowerCase().includes(query)) {
          m.classList.add('highlight');
          matches.push(m);
        }
      });
      searchIndex = matches.length > 0 ? 0 : -1;
      if (matches.length > 0) matches[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function clearHighlights() {
      document.querySelectorAll('.message-content.highlight').forEach(m => m.classList.remove('highlight'));
      matches = [];
      searchIndex = -1;
    }

    document.getElementById('chatSearchInput')?.addEventListener('input', doSearch);
    document.getElementById('chatSearchNext')?.addEventListener('click', () => {
      if (matches.length === 0) return;
      searchIndex = (searchIndex + 1) % matches.length;
      matches[searchIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    document.getElementById('chatSearchPrev')?.addEventListener('click', () => {
      if (matches.length === 0) return;
      searchIndex = (searchIndex - 1 + matches.length) % matches.length;
      matches[searchIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    document.getElementById('chatSearchClose')?.addEventListener('click', () => {
      searchBar.remove();
    });
    document.getElementById('chatSearchInput')?.focus();
  }

  function getChatHistory() {
    const messages = [];
    const container = getChatContainer();
    if (container) {
      container.querySelectorAll('.message').forEach(msg => {
        const isUser = msg.classList.contains('user-message');
        const content = msg.querySelector('.message-content');
        if (content) {
          messages.push({ role: isUser ? 'user' : 'bot', text: content.textContent });
        }
      });
    }
    return messages;
  }

  function saveHistory() {
    const messages = getChatHistory().slice(-MAX_HISTORY);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Storage full, trimming...');
      const trimmed = messages.slice(-50);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed)); } catch (e2) {}
    }
  }

  function loadHistory() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const messages = JSON.parse(saved);
      if (!Array.isArray(messages)) return;
      const container = getChatContainer();
      if (!container) return;
      container.innerHTML = '';
      for (const msg of messages) {
        if (msg.text && msg.role) {
          addMessage(msg.text, msg.role);
        }
      }
    } catch (e) {
      console.error('Load history error:', e);
    }
  }

  /* ═══════════════════════════════════════════
     UI HELPERS
     ═══════════════════════════════════════════ */
  function showWelcome() {
    const container = getChatContainer();
    if (!container) return;
    container.innerHTML = '';

    const welcome = document.createElement('div');
    welcome.className = 'welcome-screen';
    welcome.innerHTML = `
      <div class="welcome-icon">⚡</div>
      <h2>X0GPT</h2>
      <p>Tu asistente inteligente con acceso a internet y conocimiento offline</p>
      <div class="welcome-features">
        <div class="feature">🔍 Búsqueda en tiempo real</div>
        <div class="feature">📚 Base de conocimientos</div>
        <div class="feature">🆘 Guía de supervivencia</div>
        <div class="feature">💬 Conversación natural</div>
      </div>
      <p class="welcome-hint">Escribe tu pregunta para comenzar</p>
    `;
    container.appendChild(welcome);
  }

  function scrollToBottom() {
    const container = getChatContainer();
    if (container) container.scrollTop = container.scrollHeight;
  }

  function updateSendButton(processing) {
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
      sendBtn.disabled = processing;
      sendBtn.textContent = processing ? '⏳' : '➤';
    }
  }

  function updateConnectionStatus() {
    const badge = document.getElementById('connectionBadge');
    const dot = document.getElementById('badgeDot');
    const online = navigator.onLine;
    if (badge) {
      badge.textContent = online ? 'En línea' : 'Sin conexión';
    }
    if (dot) {
      dot.classList.toggle('offline', !online);
    }
  }

  function updateStatusIndicator() {
    const status = document.getElementById('statusIndicator');
    if (status) {
      const s = Engine.getStatus();
      status.title = `KB: ${s.knowledgeLoaded ? '✅' : '❌'} | Survival: ${s.survivalLoaded ? '✅' : '❌'} | Contexto: ${s.contextSize}`;
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => App.init());

const STORAGE_KEY = 'x0gpt_msgs';
let messages = [];
let isGenerating = false;

const dom = {
  chat: document.getElementById('chatArea'),
  msgs: document.getElementById('messages'),
  welcome: document.getElementById('welcome'),
  input: document.getElementById('userInput'),
  send: document.getElementById('sendBtn'),
  footer: document.getElementById('inputFooter'),
  exportBtn: document.getElementById('exportBtn'),
  clearBtn: document.getElementById('clearBtn'),
};

function escapeHtml(t) {
  const d = document.createElement('div');
  d.textContent = t;
  return d.innerHTML;
}

function renderMarkdown(text) {
  if (!text) return '';
  let h = escapeHtml(text);
  h = h.replace(/```(\w*)\n([\s\S]*?)```/g, (m, l, c) =>
    '<pre><code' + (l ? ' class="lang-' + l + '"' : '') + '>' + escapeHtml(c.trim()) + '</code></pre>');
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  h = h.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  h = h.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  h = h.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  h = h.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
  h = h.replace(/^- (.+)$/gm, '<li>$1</li>');
  h = h.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  h = h.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  h = h.replace(/\n\n/g, '</p><p>');
  h = h.replace(/\n/g, '<br>');
  return '<p>' + h + '</p>';
}

function appendMsg(role, text, typing) {
  const div = document.createElement('div');
  div.className = 'message ' + role;
  const a = document.createElement('div');
  a.className = 'msg-avatar';
  a.textContent = role === 'user' ? 'T' : 'X';
  const b = document.createElement('div');
  b.className = 'msg-bubble';
  if (typing) b.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
  else if (role === 'user') b.textContent = text;
  else b.innerHTML = renderMarkdown(text);
  div.appendChild(a); div.appendChild(b);
  dom.msgs.appendChild(div);
  scrollBottom();
  return div;
}

function scrollBottom() {
  requestAnimationFrame(() => { dom.chat.scrollTop = dom.chat.scrollHeight; });
}

function renderAll() {
  dom.msgs.innerHTML = '';
  for (const m of messages) {
    if (m.role === 'system') continue;
    appendMsg(m.role, m.content, false);
  }
  scrollBottom();
}

function saveMsgs() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.filter(m => m.role !== 'system')));
  } catch (e) {}
}

function loadMsgs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (Array.isArray(saved) && saved.length > 0) {
        messages = saved;
        renderAll();
        dom.welcome.style.display = 'none';
        return;
      }
    }
  } catch (e) {}
  dom.welcome.style.display = 'flex';
}

/* ═══ Knowledge Matching ═══ */

function findBestMatch(query) {
  const userKeywords = extractKeywords(query);

  if (userKeywords.length === 0) {
    const tokens = tokenize(query);
    if (tokens.length === 0) return null;
    const filtered = removeStopWords(tokens);
    if (filtered.length === 0) return null;
    userKeywords.push(...filtered.map(stem));
  }

  let best = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE) {
    const entryStems = entry.keywords.map(stem);
    const jaccard = jaccardSimilarity(userKeywords, entryStems);
    const overlap = wordOverlap(userKeywords, entryStems);

    let score = Math.max(jaccard, overlap * 0.9);

    const userTokens = tokenize(query);
    const exactMatches = entry.keywords.filter(kw => {
      const stemmed = stem(kw);
      return userKeywords.some(uk => uk === stemmed);
    }).length;

    if (exactMatches > 0) {
      score += exactMatches * 0.15;
    }

    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return bestScore >= 0.3 ? best : null;
}

/* ═══ Generate Response ═══ */

function generateResponse(text) {
  const lower = text.toLowerCase().trim();
  const intent = detectIntent(text);
  const processed = processText(text);

  if (intent === 'greeting') {
    const hora = new Date().getHours();
    if (hora < 12) return '¡Buenos días! Soy X0GPT, tu asistente personal. ¿En qué puedo ayudarte hoy?';
    if (hora < 18) return '¡Buenas tardes! Soy X0GPT, tu asistente personal. ¿En qué puedo ayudarte?';
    return '¡Buenas noches! Soy X0GPT, tu asistente personal. ¿En qué necesitas ayuda?';
  }

  if (intent === 'thanks') return '¡De nada! Me alegra poder ayudarte. ¿Necesitas algo más?';
  if (intent === 'farewell') return '¡Hasta luego! Cuídate y no dudes en volver si necesitas ayuda. Estaré aquí.';
  if (intent === 'fine') return '¡Me alegra que estés bien! ¿En qué puedo ayudarte hoy?';

  if (intent === 'about') {
    const qStems = processed;
    if (qStems.some(s => s === 'hac' || s === 'pod' || s === 'funcion' || s === 'servici' || s === 'util')) {
      const entry = KNOWLEDGE.find(e => e.keywords.includes('funcion'));
      if (entry) return entry.ans;
    }
    const entry = KNOWLEDGE.find(e => e.keywords.includes('x0gpt') && e.keywords.includes('quien'));
    if (entry) return entry.ans;
  }

  if (intent === 'question' || intent === 'statement') {
    const match = findBestMatch(text);
    if (match) return match.ans;
  }

  const mathMatch = text.match(/(\d+)\s*([\+\-\*\/\^])\s*(\d+)/);
  if (mathMatch) {
    const ops = { '+': (a,b)=>a+b, '-': (a,b)=>a-b, '*': (a,b)=>a*b, '/': (a,b)=>a/b, '^': (a,b)=>Math.pow(a,b) };
    const r = ops[mathMatch[2]](parseFloat(mathMatch[1]), parseFloat(mathMatch[3]));
    return 'El resultado de ' + mathMatch[1] + ' ' + mathMatch[2] + ' ' + mathMatch[3] + ' es: **' + r + '**';
  }

  const fallbacks = [
    'Interesante pregunta. No tengo información específica sobre ese tema en mi base de conocimiento. ¿Puedo ayudarte con otro tema? Tengo información sobre ciencia, historia, geografía, tecnología, salud, supervivencia y muchos más.',
    'Buena pregunta. No tengo una respuesta preparada para eso, pero puedo hablarte de otros temas como ciencia, historia, geografía, salud o tecnología. ¿Qué te gustaría saber?',
    'No estoy seguro de tener información sobre eso. Mi conocimiento es amplio pero no infinito. ¿Quieres preguntarme sobre otro tema?',
    'No encontré información específica sobre eso en mi base de datos. ¿Te interesa algún otro tema como ciencia, historia, geografía, tecnología, salud o supervivencia?',
    'Esa es una pregunta interesante, pero no tengo información al respecto. ¿Qué te gustaría saber? Puedo ayudarte con muchos temas diferentes.'
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

/* ═══ Send ═══ */

async function sendMessage() {
  const text = dom.input.value.trim();
  if (!text || isGenerating) return;

  dom.input.value = '';
  dom.input.style.height = 'auto';

  if (messages.length === 0) dom.welcome.style.display = 'none';

  messages.push({ role: 'user', content: text });
  appendMsg('user', text, false);
  scrollBottom();

  messages.push({ role: 'assistant', content: '' });
  const msgDiv = appendMsg('assistant', '', true);

  isGenerating = true;
  dom.send.disabled = true;
  dom.input.disabled = true;

  await new Promise(r => setTimeout(r, 300 + Math.random() * 400));

  const response = generateResponse(text);

  const bubble = msgDiv.querySelector('.msg-bubble');

  let shown = '';
  let idx = 0;
  const speed = 15 + Math.random() * 20;

  function typeChar() {
    if (idx < response.length) {
      shown += response[idx];
      idx++;
      bubble.innerHTML = renderMarkdown(shown) + '<span class="stream-cursor"></span>';
      scrollBottom();
      const delay = response[idx - 1] === '\n' ? speed * 3 : speed;
      setTimeout(typeChar, delay);
    } else {
      bubble.innerHTML = renderMarkdown(response);
      scrollBottom();
      messages[messages.length - 1].content = response;
      saveMsgs();
      isGenerating = false;
      dom.send.disabled = false;
      dom.input.disabled = false;
      dom.input.focus();
    }
  }

  typeChar();
}

/* ═══ Events ═══ */

dom.input.addEventListener('input', () => {
  dom.input.style.height = 'auto';
  dom.input.style.height = Math.min(dom.input.scrollHeight, 120) + 'px';
});

dom.input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

dom.send.addEventListener('click', sendMessage);

dom.clearBtn.addEventListener('click', () => {
  if (messages.length === 0) return;
  if (confirm('¿Iniciar un nuevo chat?')) {
    messages = []; dom.msgs.innerHTML = '';
    dom.welcome.style.display = 'flex';
    localStorage.removeItem(STORAGE_KEY);
    dom.input.focus();
  }
});

dom.exportBtn.addEventListener('click', () => {
  if (messages.length === 0) return;
  let t = 'X0GPT - Chat Export\n' + new Date().toLocaleString() + '\n─────────────────\n\n';
  for (const m of messages) {
    if (m.role === 'system') continue;
    t += (m.role === 'user' ? 'Tú' : 'X0GPT') + ':\n' + m.content + '\n\n';
  }
  const blob = new Blob([t], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'x0gpt-chat-' + new Date().toISOString().slice(0, 10) + '.txt';
  a.click(); URL.revokeObjectURL(url);
});

/* ═══ Init ═══ */

loadMsgs();
dom.footer.textContent = 'X0GPT funciona 100% offline. Tus datos se quedan en tu navegador.';
dom.input.disabled = false;
dom.send.disabled = false;
dom.input.focus();

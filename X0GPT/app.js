const STORAGE_KEY = 'x0gpt_msgs';
let messages = [];
let isGenerating = false;
const dom = {
  chat: document.getElementById('chatArea'),
  msgs: document.getElementById('messages'),
  welcome: document.getElementById('welcome'),
  input: document.getElementById('userInput'),
  send: document.getElementById('sendBtn'),
  footer: document.getElementById('footer'),
  exportBtn: document.getElementById('exportBtn'),
  clearBtn: document.getElementById('clearBtn'),
};
function esc(t) {
  const d = document.createElement('div');
  d.textContent = t;
  return d.innerHTML;
}
function rMD(text) {
  if (!text) return '';
  let h = esc(text);
  h = h.replace(/```(\w*)\n?([\s\S]*?)```/g, (m, l, c) => '<pre><code' + (l ? ' class="lang-' + l + '"' : '') + '>' + esc(c.trim()) + '</code></pre>');
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
  if (typing) {
    b.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
  } else if (role === 'user') {
    b.textContent = text;
    const ts = document.createElement('div');
    ts.className = 'msg-time';
    ts.textContent = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    b.appendChild(ts);
  } else {
    b.innerHTML = rMD(text);
    const btnRow = document.createElement('div');
    btnRow.className = 'msg-actions';
    const copyBtn = document.createElement('button');
    copyBtn.className = 'msg-copy';
    copyBtn.textContent = '📋';
    copyBtn.title = 'Copiar respuesta';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = '✅';
        setTimeout(() => { copyBtn.textContent = '📋'; }, 2000);
      });
    });
    btnRow.appendChild(copyBtn);
    b.appendChild(btnRow);
    const ts = document.createElement('div');
    ts.className = 'msg-time';
    ts.textContent = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    b.appendChild(ts);
  }
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
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.filter(m => m.role !== 'system'))); } catch (e) {}
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
function findEntry(query) {
  const uKeywords = kw(query);
  if (uKeywords.length === 0) {
    const tokens = tok(query);
    if (tokens.length === 0) return null;
    const filtered = remSW(tokens);
    if (filtered.length === 0) return null;
    uKeywords.push(...filtered.map(stem));
  }
  let best = null;
  let bestScore = 0;
  for (const entry of K) {
    const eStems = entry.k.map(stem);
    const j = jaccard(uKeywords, eStems);
    const o = overlap(uKeywords, eStems);
    const c = contain(uKeywords, eStems);
    let score = Math.max(j, o * 0.85, c * 0.7);
    const exactMatches = entry.k.filter(k => {
      const s = stem(k);
      return uKeywords.some(uk => uk === s);
    }).length;
    if (exactMatches > 0) score += exactMatches * 0.12;
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  const THRESHOLD = 0.25;
  return bestScore >= THRESHOLD ? best : null;
}
function getIntentResponse(text) {
  const int = intent(text);
  const hora = new Date().getHours();
  if (int === 'greeting' || int === 'greeting_time') {
    if (hora < 12) return '¡Buenos días! Soy X0GPT, tu asistente personal 100% offline. ¿En qué puedo ayudarte hoy?';
    if (hora < 18) return '¡Buenas tardes! Soy X0GPT, tu asistente personal. ¿En qué puedo ayudarte?';
    return '¡Buenas noches! Soy X0GPT, tu asistente personal. ¿En qué necesitas ayuda?';
  }
  if (int === 'thanks') {
    const txs = ['¡De nada! Me alegra poder ayudarte. ¿Necesitas algo más?', '¡A ti por preguntar! Estoy aquí para lo que necesites.', '¡Con gusto! Recuerda que puedes preguntarme sobre cualquier tema.', '¡De nada! Si tienes más dudas, aquí estoy.'];
    return txs[Math.floor(Math.random() * txs.length)];
  }
  if (int === 'farewell') {
    const fws = ['¡Hasta luego! Cuídate y no dudes en volver si necesitas ayuda.', '¡Nos vemos! Estaré aquí cuando me necesites.', '¡Hasta pronto! Recuerda que funciono 100% offline y sin internet.', '¡Cuídate mucho! Fue un placer ayudarte.'];
    return fws[Math.floor(Math.random() * fws.length)];
  }
  if (int === 'fine') {
    return '¡Me alegra que estés bien! ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre ciencia, historia, tecnología, salud y muchos temas más.';
  }
  if (int === 'about') {
    for (const entry of K) {
      if (entry.k.includes('x0gpt') && (entry.k.includes('quien') || entry.k.includes('creador'))) return entry.a;
    }
    return 'Soy X0GPT, un asistente IA creado por Jaime Muñoz. Funciono completamente offline en tu navegador. Tengo una amplia base de conocimientos sobre ciencia, historia, geografía, tecnología, salud, supervivencia, cocina, finanzas, filosofía, arte y muchos más temas. Todo es privado y gratuito.';
  }
  if (int === 'time') {
    return 'Son las ' + new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) + ' de tu dispositivo.';
  }
  if (int === 'date') {
    return 'Hoy es ' + new Date().toLocaleDateString('es-ES', {weekday:'long',year:'numeric',month:'long',day:'numeric'}) + '.';
  }
  if (int === 'affirmative') {
    return '¡Perfecto! ¿Qué te gustaría saber o preguntar? Puedo ayudarte con muchos temas.';
  }
  if (int === 'negative') {
    return 'No te preocupes. ¿Quieres preguntar algo? Estoy aquí para ayudarte con lo que necesites.';
  }
  return null;
}
function generateResponse(text) {
  const lower = text.toLowerCase().trim();

  const mathMatch = text.match(/(\d+)\s*([\+\-\*\/\^])\s*(\d+)/);
  if (mathMatch) {
    const ops = {'+':(a,b)=>a+b,'-':(a,b)=>a-b,'*':(a,b)=>a*b,'/':(a,b)=>a/b,'^':(a,b)=>Math.pow(a,b)};
    const r = ops[mathMatch[2]](parseFloat(mathMatch[1]), parseFloat(mathMatch[3]));
    return 'El resultado de ' + mathMatch[1] + ' ' + mathMatch[2] + ' ' + mathMatch[3] + ' es: **' + r + '**';
  }

  const intResp = getIntentResponse(text);
  if (intResp) return intResp;

  const int = intent(text);
  if (int === 'question' || int === 'request' || int === 'definition' || int === 'whos' || int === 'where' || int === 'when' || int === 'how' || int === 'compare' || int === 'recommend') {
    const match = findEntry(text);
    if (match) return match.a;
    const conTips = [
      'No tengo información específica sobre ese tema en mi base de conocimiento. ¿Puedo ayudarte con otro tema?',
      'Buena pregunta. No tengo una respuesta preparada para eso, pero tengo información sobre ciencia, historia, geografía, tecnología, salud, supervivencia y muchos otros temas.',
      'No encontré información específica sobre eso. ¿Te interesa algún otro tema como ciencia, historia, geografía, tecnología, salud o supervivencia?',
      'Esa es una pregunta interesante, pero no tengo información al respecto. ¿Qué te gustaría saber? Tengo muchos temas disponibles.'
    ];
    return conTips[Math.floor(Math.random() * conTips.length)];
  }

  const match = findEntry(text);
  if (match) return match.a;

  const fallbacks = [
    'Interesante. No tengo información específica sobre ese tema. ¿Puedo ayudarte con otro tema? Tengo información sobre ciencia, historia, geografía, tecnología, salud, supervivencia y muchos más.',
    'No estoy seguro de tener información sobre eso. Mi conocimiento es amplio pero no infinito. ¿Quieres preguntarme sobre otro tema?',
    'No encontré información específica sobre eso. ¿Te interesa algún otro tema como ciencia, historia, geografía, tecnología, salud o supervivencia?'
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
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
  await new Promise(r => setTimeout(r, 200 + Math.random() * 200));
  const response = generateResponse(text);
  const bubble = msgDiv.querySelector('.msg-bubble');
  let shown = '';
  let idx = 0;
  const speed = 15 + Math.random() * 20;
  function typeChar() {
    if (idx < response.length) {
      shown += response[idx];
      idx++;
      bubble.innerHTML = rMD(shown) + '<span class="stream-cursor"></span>';
      scrollBottom();
      const delay = response[idx - 1] === '\n' ? speed * 3 : speed;
      setTimeout(typeChar, delay);
    } else {
      bubble.innerHTML = rMD(response);
      const btnRow = document.createElement('div');
      btnRow.className = 'msg-actions';
      const copyBtn = document.createElement('button');
      copyBtn.className = 'msg-copy';
      copyBtn.textContent = '📋';
      copyBtn.title = 'Copiar respuesta';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(response).then(() => {
          copyBtn.textContent = '✅';
          setTimeout(() => { copyBtn.textContent = '📋'; }, 2000);
        });
      });
      btnRow.appendChild(copyBtn);
      bubble.appendChild(btnRow);
      const ts = document.createElement('div');
      ts.className = 'msg-time';
      ts.textContent = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
      bubble.appendChild(ts);
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
dom.input.addEventListener('input', () => {
  dom.input.style.height = 'auto';
  dom.input.style.height = Math.min(dom.input.scrollHeight, 150) + 'px';
});
dom.input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  if (e.key === 'Escape') { dom.input.blur(); }
});
dom.send.addEventListener('click', sendMessage);
dom.clearBtn.addEventListener('click', () => {
  if (messages.length === 0) return;
  if (confirm('¿Iniciar un nuevo chat? Se borrará el historial actual.')) {
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
    t += (m.role === 'user' ? '👤 Tú' : '🤖 X0GPT') + ':\n' + m.content + '\n\n';
  }
  const blob = new Blob([t], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'x0gpt-chat-' + new Date().toISOString().slice(0, 10) + '.txt';
  a.click(); URL.revokeObjectURL(url);
});
loadMsgs();
dom.footer.textContent = 'X0GPT - 100% offline · Privado · Sin internet · Sin instalaciones';
dom.input.disabled = false;
dom.send.disabled = false;
dom.input.focus();

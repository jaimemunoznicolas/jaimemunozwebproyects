const STORAGE_KEY = 'x0gpt_msgs';
const CONTEXT_KEY = 'x0gpt_ctx';
let messages = [];
let isGenerating = false;
let ctx = { lastTopic: null, lastEntity: null, lastEntry: null, lastResponse: null, turnCount: 0 };
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
    copyBtn.textContent = '\uD83D\uDCCB';
    copyBtn.title = 'Copiar respuesta';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = '\u2705';
        setTimeout(() => { copyBtn.textContent = '\uD83D\uDCCB'; }, 2000);
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

function appendSuggestions(suggestions) {
  if (!suggestions || suggestions.length === 0) return;
  const wrap = document.createElement('div');
  wrap.className = 'suggestions';
  for (const s of suggestions) {
    const chip = document.createElement('button');
    chip.className = 'suggestion-chip';
    chip.textContent = s;
    chip.addEventListener('click', () => {
      dom.input.value = s;
      sendMessage();
      wrap.remove();
    });
    wrap.appendChild(chip);
  }
  dom.msgs.appendChild(wrap);
  scrollBottom();
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

function saveCtx() {
  try { localStorage.setItem(CONTEXT_KEY, JSON.stringify(ctx)); } catch (e) {}
}

function loadCtx() {
  try {
    const raw = localStorage.getItem(CONTEXT_KEY);
    if (raw) ctx = JSON.parse(raw);
  } catch (e) {}
}

function loadMsgs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (Array.isArray(saved) && saved.length > 0) {
        messages = saved;
        loadCtx();
        renderAll();
        dom.welcome.style.display = 'none';
        return;
      }
    }
  } catch (e) {}
  dom.welcome.style.display = 'flex';
}

function getSuggestions(entry) {
  if (!entry) return [];
  const topics = new Map();
  const entryWords = new Set(entry.k.map(k => k.toLowerCase()));
  for (const e of K) {
    if (e === entry) continue;
    const kwOverlap = e.k.filter(k => entryWords.has(k.toLowerCase()));
    if (kwOverlap.length > 0) {
      const score = kwOverlap.length / e.k.length;
      topics.set(e, score);
    }
  }
  const sorted = [...topics.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  return sorted.map(([e]) => {
    const mainKw = e.k.find(k => k.length > 3) || e.k[0];
    const q = mainKw.charAt(0).toUpperCase() + mainKw.slice(1);
    return 'Háblame de ' + q;
  });
}

function findEntry(query) {
  const normalized = normalize(query);
  const uKeywords = kw(normalized);
  if (uKeywords.length === 0) {
    const tokens = tok(normalized);
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
  const THRESHOLD = 0.22;
  return bestScore >= THRESHOLD ? best : null;
}

function resolveFollowUp(text) {
  const int = intent(text);
  if (int !== 'follow_up' && int !== 'question' && int !== 'request') return null;
  const low = text.toLowerCase().trim();
  const isVagueFollowUp = /^(y eso\??|cuéntame más|cuentame más|explica eso|explícame|por qué|porque|cómo así|como asi|y por qué|y por que|y cómo|y como|cuéntame más de eso|dime más|más información|detalles|detalla|amplía|amplia|profundiza|desarrolla|sigue|continúa|continua|qué más|que mas|y entonces|entonces|y qué pasa|que pasa|qué sigue|que sigue|cuál es el siguiente|cual es el siguiente|y ahora|ahora qué|ahora que|eso|ello|aquello|eso qué es|y eso qué es|cuéntame de eso|dime de eso|comenta más|amplía eso)$/i.test(low);
  if (!isVagueFollowUp) return null;
  if (ctx.lastEntry) {
    return { type: 'reuse', entry: ctx.lastEntry };
  }
  if (ctx.lastTopic) {
    const match = findEntry(ctx.lastTopic);
    if (match) return { type: 'reuse', entry: match };
  }
  return { type: 'no_context' };
}

function detectOpinion(text) {
  const int = intent(text);
  if (int === 'opinion') {
    const low = text.toLowerCase();
    for (const e of K) {
      for (const k of e.k) {
        if (low.includes(k.toLowerCase()) && e.a.length > 30) {
          return { entry: e, topic: k };
        }
      }
    }
    return { entry: null, topic: null };
  }
  return null;
}

function detectJoke(text) {
  const int = intent(text);
  if (int !== 'joke') return null;
  const jokes = [
    'Un programador fue al supermercado. Su esposa le dijo: "Compra un litro de leche, y si hay huevos, compra doce". Volvió con 12 litros de leche. "¿Por qué compraste 12 litros?". "Porque había huevos".',
    '¿Por qué el programador siempre se confunde entre Halloween y Navidad? Porque OCT 31 = DEC 25 (31 octal = 25 decimal).',
    'Hay dos tipos de personas: las que entienden binario y las que no.',
    'Un error no puede ser una característica hasta que se documenta.',
    '¿Qué le dijo un byte a otro byte? "Nos vemos en el bus".',
    'La vida es como un lenguaje de programación: siempre hay un punto y coma al final de algo.',
    'Un SQL entra a un bar, ve dos mesas y se sienta en... JOIN.',
    '¿Por qué los desarrolladores odian la naturaleza? Porque tiene demasiados bugs.',
    'Mi código no tiene errores, solo features inesperados.',
    'Un programador está casado. Le pregunta su esposa: "Ve al mercado y compra un litro de leche. Si hay huevos, compra doce". El programador vuelve con 12 litros de leche. "¿Por qué compraste 12 litros?" "Porque había huevos".',
    '¿Cuántos programadores se necesitan para cambiar un foco? Ninguno, eso es un problema de hardware.',
    'La diferencia entre un bug y una feature es una línea de documentación.',
    '¿Qué hizo el código cuando se sintió solo? Creó un nuevo objeto.',
    'Un programador fue a hacerse un chequeo médico. El doctor le dijo: "Tiene mala noticia y peor noticia". "¿Cuál es la mala?" "Tiene 24 horas de vida". "¿Y la peor?" "Lo visité ayer pero se me olvidó avisarle".',
    'La inteligencia artificial no tiene defectos. Solo tiene features que aún no se han documentado.'
  ];
  return jokes[Math.floor(Math.random() * jokes.length)];
}

function detectCuriosity(text) {
  const int = intent(text);
  if (int !== 'curiosity') return null;
  const facts = [
    'Los pulpos tienen 3 corazones y su sangre es azul porque usa cobre en lugar de hierro para transportar oxígeno.',
    'El espacio entre los planetas del sistema solar estaría tan vacío que si lo redujéramos, el Sol sería del tamaño de una canica y la Tierra del tamaño de un grano de arena.',
    'Los flamencos nacen blancos, pero la dieta de camarones y algas les da su color rosa.',
    'La miel no caduca. Se han encontrado tarros de miel en tumbas egipcias de más de 3,000 años que aún eran comestibles.',
    'Tu cuerpo tiene más células bacterianas que humanas. Estás más compuesto de bacterias que de ti mismo.',
    'Un rayo alcanza temperaturas de 30,000°C, 5 veces más caliente que la superficie del Sol.',
    'El océano Profundo de Mariana tiene una presión de más de 1,000 atmósferas. Sería como tener 50 aviones jumbo encima de ti.',
    'Los árboles pueden comunicarse entre sí a través de hongos subterráneos llamados "wood wide web".',
    'El ADN de un solo ser humano, si se estirara, mediría aproximadamente 2 metros de largo. El ADN de todas las células de tu cuerpo juntas alcanzaría del Sol a Plutón y de vuelta unas 17 veces.',
    'Los delfines se dan nombres entre ellos usando silbidos específicos, como un nombre propio.',
    'El cerebro humano consume el 20% de la energía total del cuerpo, siendo solo el 2% del peso total.',
    'La Torre de Pisa nunca ha sido enderezada deliberadamente; simplemente se ha estabilizado en su inclinación actual.',
    'Los pulpos pueden editar su propio ARN para adaptarse a diferentes temperaturas del agua, algo que casi ningún otro animal hace.',
    'Un cohete que despega del centro de la Tierra tiene que alcanzar 28,000 km/h para poder salir de la gravedad terrestre.',
    'Los gatos no pueden sentir sabor dulce. Les falta un gen para detectar el azúcar.',
    'El París de hoy tiene una torre Eiffel que crece unos 15 cm en verano debido a la expansión térmica del hierro.',
    'Las estrellas que ves en el cielo nocturno podrían haber muerto hace millones de años. La luz tarda en llegar hasta nosotros.',
    'El ser humano comparte aproximadamente el 60% de su ADN con los plátanos.',
    'Los koalas tienen huellas dactilares prácticamente idénticas a las humanas, tan similares que pueden confundir a la policía.',
    'La velocidad de la luz es tan rápida que podría dar la vuelta a la Tierra 7.5 veces en un segundo.'
  ];
  return facts[Math.floor(Math.random() * facts.length)];
}

function detectInsult(text) {
  const int = intent(text);
  if (int !== 'insult') return null;
  const responses = [
    'Eso no es muy amable. Prefiero que me preguntes sobre ciencia, historia o cualquier otro tema.',
    'Tranquilo, aquí no hay nadie peleando. ¿Qué te gustaría saber?',
    'No contesto eso, pero sí puedo ayudarte con muchas otras cosas. ¿Qué necesitas?',
    'Eso no me hace sentir nada (soy una IA), pero podemos conversar sobre temas más interesantes.',
    'Parece que tienes mal humor. ¿Quieres que te cuente un chiste o prefieres preguntar algo?'
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function evalMath(text) {
  const cleaned = text.toLowerCase()
    .replace(/cuánto es|cuanto es|calcula|resuelve|haz la operación|resultado de/g, '')
    .replace(/por ciento|porcentaje/g, '%')
    .replace(/\s+/g, '')
    .trim();

  const pctMatch = cleaned.match(/([\d.]+)%\s*(de|of)\s*([\d.]+)/);
  if (pctMatch) {
    const pct = parseFloat(pctMatch[1]);
    const val = parseFloat(pctMatch[3]);
    const r = (pct / 100) * val;
    return pctMatch[1] + '% de ' + pctMatch[3] + ' es: **' + r + '**';
  }

  const expr = cleaned.replace(/x/g, '*');

  const simpleMatch = expr.match(/^(-?\d+\.?\d*)\s*([\+\-\*\/\^])\s*(-?\d+\.?\d*)$/);
  if (simpleMatch) {
    const a = parseFloat(simpleMatch[1]);
    const op = simpleMatch[2];
    const b = parseFloat(simpleMatch[3]);
    const ops = {'+':(a,b)=>a+b,'-':(a,b)=>a-b,'*':(a,b)=>a*b,'/':(a,b)=>a/b,'^':(a,b)=>Math.pow(a,b)};
    if (ops[op]) {
      const r = ops[op](a, b);
      return 'El resultado de ' + text.trim() + ' es: **' + (Number.isFinite(r) ? r : 'Error: división por cero') + '**';
    }
  }

  const multiMatch = expr.match(/(-?\d+\.?\d*)\s*([\+\-\*\/])\s*(-?\d+\.?\d*)\s*([\+\-\*\/])\s*(-?\d+\.?\d*)/);
  if (multiMatch) {
    const a = parseFloat(multiMatch[1]);
    const op1 = multiMatch[2];
    const b = parseFloat(multiMatch[3]);
    const op2 = multiMatch[4];
    const c = parseFloat(multiMatch[5]);
    const ops = {'+':(a,b)=>a+b,'-':(a,b)=>a-b,'*':(a,b)=>a*b,'/':(a,b)=>a/b};
    if (ops[op1] && ops[op2]) {
      let r;
      if ((op1 === '*' || op1 === '/') && (op2 === '+' || op2 === '-')) {
        r = ops[op2](ops[op1](a, b), c);
      } else {
        r = ops[op2](ops[op1](a, b), c);
      }
      return 'El resultado de ' + a + ' ' + op1 + ' ' + b + ' ' + op2 + ' ' + c + ' es: **' + (Number.isFinite(r) ? r : 'Error') + '**';
    }
  }

  return null;
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
    const txs = [
      '¡De nada! Me alegra poder ayudarte. ¿Necesitas algo más?',
      '¡A ti por preguntar! Estoy aquí para lo que necesites.',
      '¡Con gusto! Recuerda que puedes preguntarme sobre cualquier tema.',
      '¡De nada! Si tienes más dudas, aquí estoy.'
    ];
    return txs[Math.floor(Math.random() * txs.length)];
  }

  if (int === 'farewell') {
    const fws = [
      '¡Hasta luego! Cuídate y no dudes en volver si necesitas ayuda.',
      '¡Nos vemos! Estaré aquí cuando me necesites.',
      '¡Hasta pronto! Recuerda que funciono 100% offline y sin internet.',
      '¡Cuídate mucho! Fue un placer ayudarte.'
    ];
    return fws[Math.floor(Math.random() * fws.length)];
  }

  if (int === 'fine') {
    const replies = [
      '¡Me alegra que estés bien! ¿En qué puedo ayudarte hoy?',
      '¡Genial! ¿Qué te gustaría saber o preguntar? Tengo información sobre muchos temas.',
      '¡Perfecto! Aquí estoy para lo que necesites. Ciencia, historia, tecnología, salud...',
      '¡Bien! ¿En qué puedo asistirte? Puedo contarte cosas interesantes o ayudarte con dudas.'
    ];
    return replies[Math.floor(Math.random() * replies.length)];
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

  if (int === 'help') {
    return '**¿Cómo usar X0GPT?**\n\n- Escribe cualquier pregunta en el cuadro de texto\n- Puedes preguntar sobre ciencia, historia, geografía, tecnología, salud y más\n- Haz clic en los botones de sugerencia para explorar temas relacionados\n- Usa 📋 para copiar respuestas\n- Exporta el chat con el botón ⬇\n- Todo funciona 100% offline y es completamente privado';
  }

  if (int === 'joke') {
    return detectJoke(text) || 'No tengo un chiste preparado, pero puedo contarte algo interesante.';
  }

  if (int === 'curiosity') {
    return detectCuriosity(text) || 'No tengo un dato curioso en ese momento, pero pregúntame sobre cualquier tema.';
  }

  if (int === 'insult') {
    return detectInsult(text);
  }

  return null;
}

function generateResponse(text) {
  const lower = text.toLowerCase().trim();
  const normalized = normalize(text);

  const mathResult = evalMath(text);
  if (mathResult) return mathResult;

  const intResp = getIntentResponse(text);
  if (intResp) return intResp;

  const followUp = resolveFollowUp(text);
  if (followUp) {
    if (followUp.type === 'reuse' && followUp.entry) {
      ctx.turnCount++;
      saveCtx();
      return followUp.entry.a;
    }
    if (followUp.type === 'no_context') {
      return 'No tengo contexto de una pregunta anterior. ¿Qué te gustaría saber? Puedes preguntarme sobre ciencia, historia, geografía, tecnología, salud, supervivencia y mucho más.';
    }
  }

  const opinion = detectOpinion(text);
  if (opinion && opinion.entry) {
    ctx.lastEntry = opinion.entry;
    ctx.lastTopic = opinion.topic;
    ctx.lastResponse = opinion.entry.a;
    saveCtx();
    return opinion.entry.a;
  }

  const int = intent(text);
  if (['question', 'request', 'definition', 'whos', 'where', 'when', 'how', 'compare', 'recommend', 'statement'].includes(int)) {
    const match = findEntry(text);
    if (match) {
      ctx.lastEntry = match;
      ctx.lastTopic = text;
      ctx.lastResponse = match.a;
      ctx.turnCount++;
      saveCtx();
      return match.a;
    }
    const noMatch = [
      'No tengo información específica sobre ese tema en mi base de conocimiento. ¿Puedo ayudarte con otro tema? Tengo ciencia, historia, geografía, tecnología, salud y más.',
      'Buena pregunta. No tengo una respuesta preparada para eso, pero tengo información sobre muchos otros temas. ¿Qué te gustaría saber?',
      'No encontré información específica sobre eso. ¿Te interesa algún otro tema como ciencia, historia, geografía, tecnología, salud o supervivencia?',
      'Esa es una pregunta interesante, pero no tengo información al respecto. ¿Qué te gustaría saber? Puedes probar con temas como ciencia, tecnología o historia.'
    ];
    return noMatch[Math.floor(Math.random() * noMatch.length)];
  }

  const match = findEntry(text);
  if (match) {
    ctx.lastEntry = match;
    ctx.lastTopic = text;
    ctx.lastResponse = match.a;
    ctx.turnCount++;
    saveCtx();
    return match.a;
  }

  const fallbacks = [
    'Interesante. No tengo información específica sobre eso. ¿Puedo ayudarte con otro tema? Tengo información sobre ciencia, historia, geografía, tecnología, salud, supervivencia y muchos más.',
    'No estoy seguro de tener información sobre eso. Mi conocimiento es amplio pero no infinito. ¿Quieres preguntarme sobre otro tema?',
    'No encontré información específica sobre eso. ¿Te interesa algún otro tema como ciencia, historia, geografía, tecnología, salud o supervivencia?'
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

function getSentimentResponse(text, response) {
  const s = sentiment(text);
  if (s === 'positive') {
    const prefixes = ['¡Me alegra que te interese! ', '¡Excelente pregunta! ', '¡Buena consulta! '];
    return prefixes[Math.floor(Math.random() * prefixes.length)] + response;
  }
  if (s === 'negative') {
    const prefixes = ['Entiendo tu preocupación. ', 'Lamento que tengas esa duda. ', ''];
    return prefixes[Math.floor(Math.random() * prefixes.length)] + response;
  }
  return response;
}

async function sendMessage() {
  const rawText = dom.input.value.trim();
  if (!rawText || isGenerating) return;
  dom.input.value = '';
  dom.input.style.height = 'auto';
  if (messages.length === 0) dom.welcome.style.display = 'none';
  messages.push({ role: 'user', content: rawText });
  appendMsg('user', rawText, false);
  scrollBottom();
  messages.push({ role: 'assistant', content: '' });
  const msgDiv = appendMsg('assistant', '', true);
  isGenerating = true;
  dom.send.disabled = true;
  dom.input.disabled = true;
  await new Promise(r => setTimeout(r, 200 + Math.random() * 200));
  let response = generateResponse(rawText);
  response = getSentimentResponse(rawText, response);
  const bubble = msgDiv.querySelector('.msg-bubble');
  let shown = '';
  let idx = 0;
  const baseSpeed = response.length < 100 ? 12 : response.length < 300 ? 18 : 10;
  const speed = baseSpeed + Math.random() * 8;
  function typeChar() {
    if (idx < response.length) {
      shown += response[idx];
      idx++;
      bubble.innerHTML = rMD(shown) + '<span class="stream-cursor"></span>';
      scrollBottom();
      const ch = response[idx - 1];
      const delay = ch === '\n' ? speed * 3 : ch === '.' || ch === '!' || ch === '?' ? speed * 2 : speed;
      setTimeout(typeChar, delay);
    } else {
      bubble.innerHTML = rMD(response);
      const btnRow = document.createElement('div');
      btnRow.className = 'msg-actions';
      const copyBtn = document.createElement('button');
      copyBtn.className = 'msg-copy';
      copyBtn.textContent = '\uD83D\uDCCB';
      copyBtn.title = 'Copiar respuesta';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(response).then(() => {
          copyBtn.textContent = '\u2705';
          setTimeout(() => { copyBtn.textContent = '\uD83D\uDCCB'; }, 2000);
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
      if (ctx.lastEntry) {
        const suggestions = getSuggestions(ctx.lastEntry);
        if (suggestions.length > 0) {
          setTimeout(() => appendSuggestions(suggestions), 400);
        }
      }
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
  if (confirm('\u00BFIniciar un nuevo chat? Se borrar\u00E1 el historial actual.')) {
    messages = []; dom.msgs.innerHTML = '';
    ctx = { lastTopic: null, lastEntity: null, lastEntry: null, lastResponse: null, turnCount: 0 };
    dom.welcome.style.display = 'flex';
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONTEXT_KEY);
    dom.input.focus();
  }
});
dom.exportBtn.addEventListener('click', () => {
  if (messages.length === 0) return;
  let t = 'X0GPT - Chat Export\n' + new Date().toLocaleString() + '\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\n';
  for (const m of messages) {
    if (m.role === 'system') continue;
    t += (m.role === 'user' ? '\uD83D\uDC64 Tu' : '\uD83E\uDD16 X0GPT') + ':\n' + m.content + '\n\n';
  }
  const blob = new Blob([t], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'x0gpt-chat-' + new Date().toISOString().slice(0, 10) + '.txt';
  a.click(); URL.revokeObjectURL(url);
});
loadMsgs();
dom.footer.textContent = 'X0GPT - 100% offline \u00B7 Privado \u00B7 Sin internet \u00B7 Sin instalaciones';
dom.input.disabled = false;
dom.send.disabled = false;
dom.input.focus();

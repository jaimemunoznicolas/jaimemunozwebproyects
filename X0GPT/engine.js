const Engine = (() => {
  let knowledgeBase = null;
  let survivalBase = null;
  let conversationContext = [];
  let conversationSummary = '';
  const MAX_CONTEXT = 40;
  const MAX_SUMMARY = 500;
  let responseCache = new Map();
  const CACHE_TTL = 1000 * 60 * 10;
  let topicHistory = [];
  let pendingIntents = [];

  /* ═══════════════════════════════════════════
     INIT — Load knowledge bases
     ═══════════════════════════════════════════ */
  async function init() {
    try {
      const [kbRes, svRes] = await Promise.allSettled([
        fetch('./knowledge.json').then(r => r.json()),
        fetch('./survival.json').then(r => r.json())
      ]);
      if (kbRes.status === 'fulfilled') knowledgeBase = kbRes.value;
      if (svRes.status === 'fulfilled') survivalBase = svRes.value;
    } catch (e) {
      console.error('Init error:', e);
    }
  }

  /* ═══════════════════════════════════════════
     CONTEXT MANAGEMENT — Enhanced
     ═══════════════════════════════════════════ */
  function addToContext(role, content, intent) {
    conversationContext.push({ role, content: content.substring(0, 2000), intent, timestamp: Date.now() });
    if (conversationContext.length > MAX_CONTEXT) {
      conversationContext = conversationContext.slice(-MAX_CONTEXT);
    }
    updateSummary();
  }

  function updateSummary() {
    const recent = conversationContext.slice(-6);
    const topics = recent.map(c => {
      if (c.role === 'user') return c.content.substring(0, 80);
      return '';
    }).filter(Boolean);
    conversationSummary = topics.join(' → ').substring(0, MAX_SUMMARY);
  }

  function getNameFromContext() {
    for (let i = conversationContext.length - 1; i >= Math.max(0, conversationContext.length - 10); i--) {
      const ctx = conversationContext[i];
      if (ctx.role !== 'user') continue;
      const m = ctx.content.match(/me\s+(?:llamo|soy|llamas|llamamos)\s+(\w+)/i);
      if (m) return m[1];
      const m2 = ctx.content.match(/mi\s+nombre\s+es\s+(\w+)/i);
      if (m2) return m2[1];
    }
    return null;
  }

  function getTopicContext() {
    return conversationContext.slice(-5).map(c => c.content.toLowerCase()).join(' ');
  }

  function getRecentTopics() {
    return conversationContext.slice(-3).map(c => c.intent || 'unknown');
  }

  function getPreviousQuestion() {
    for (let i = conversationContext.length - 1; i >= 0; i--) {
      if (conversationContext[i].role === 'user') return conversationContext[i].content;
    }
    return null;
  }

  function getConversationTopic() {
    const allText = conversationContext.map(c => c.content).join(' ');
    const words = allText.split(/\s+/).filter(w => w.length > 4);
    const freq = {};
    for (const w of words) {
      const lw = w.toLowerCase();
      freq[lw] = (freq[lw] || 0) + 1;
    }
    return Object.entries(freq)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  /* ═══════════════════════════════════════════
     RESPONSE CACHE
     ═══════════════════════════════════════════ */
  function getCachedResponse(key) {
    const entry = responseCache.get(key);
    if (entry && Date.now() - entry.time < CACHE_TTL) return entry.data;
    responseCache.delete(key);
    return null;
  }

  function setCacheResponse(key, data) {
    if (responseCache.size > 100) {
      const oldest = responseCache.keys().next().value;
      responseCache.delete(oldest);
    }
    responseCache.set(key, { data, time: Date.now() });
  }

  /* ═══════════════════════════════════════════
     SURVIVAL SEARCH — Optimized with pre-computed tokens
     ═══════════════════════════════════════════ */
  function searchSurvival(text, intent) {
    if (!survivalBase) return null;
    const textLower = text.toLowerCase();
    const inputTokens = NLP.processText(text);
    let best = null, bestScore = 0;
    const seenAnswers = new Set();

    for (const [section, data] of Object.entries(survivalBase)) {
      if (['meta', 'fallbacks', 'jokes', 'facts'].includes(section)) continue;

      const entries = collectEntries(data);

      for (const entry of entries) {
        if (!entry.a) continue;
        if (seenAnswers.has(entry.a.substring(0, 100))) continue;
        seenAnswers.add(entry.a.substring(0, 100));

        let score = 0;

        if (entry.q) {
          for (const kw of entry.q) {
            const kwLower = kw.toLowerCase();
            if (textLower.includes(kwLower)) {
              score += kw.length * 6;
              if (textLower === kwLower) score += 25;
              if (kwLower.split(' ').length > 1) score += 12;
            }
            const kwTokens = NLP.processText(kwLower);
            const sim = NLP.similarity(inputTokens.filtered, kwTokens.filtered);
            score += sim * 18;
          }
        }

        if (entry.tags) {
          for (const t of entry.tags) {
            if (textLower.includes(t.toLowerCase())) score += 10;
          }
        }

        if (entry.a && textLower.length > 5) {
          const answerLower = entry.a.toLowerCase();
          const words = textLower.split(/\s+/).filter(w => w.length > 3);
          for (const w of words) {
            if (answerLower.includes(w)) score += 3;
          }
        }

        if (intent === 'survival') score *= 1.3;

        if (score > bestScore) {
          bestScore = score;
          best = { ...entry, section };
        }
      }
    }

    return (best && bestScore > 8) ? {
      answer: best.a,
      category: best.section,
      score: bestScore,
      source: 'survival'
    } : null;
  }

  function collectEntries(data) {
    const entries = [];
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item && typeof item === 'object') {
          if (item.a) entries.push(item);
          else entries.push(...collectEntries(item));
        }
      }
    } else if (data && typeof data === 'object') {
      for (const value of Object.values(data)) {
        if (Array.isArray(value)) {
          for (const item of value) {
            if (item && typeof item === 'object') {
              if (item.a) entries.push(item);
              else entries.push(...collectEntries(item));
            }
          }
        } else if (value && typeof value === 'object') {
          entries.push(...collectEntries(value));
        }
      }
    }
    return entries;
  }

  /* ═══════════════════════════════════════════
     KNOWLEDGE BASE SEARCH — Enhanced with dedup
     ═══════════════════════════════════════════ */
  function searchKnowledgeBase(text) {
    if (!knowledgeBase) return null;
    const textLower = text.toLowerCase();
    const inputTokens = NLP.processText(text);
    let best = null, bestScore = 0;

    for (const section of ['greetings', 'farewells', 'thanks', 'self']) {
      const entries = knowledgeBase[section];
      if (entries && typeof entries === 'object' && !Array.isArray(entries)) {
        for (const [key, answer] of Object.entries(entries)) {
          if (textLower.includes(key) || key.split(' ').some(w => w.length > 3 && textLower.includes(w))) {
            const s = key.length * 6;
            if (s > bestScore) { bestScore = s; best = { a: answer, category: section }; }
          }
        }
      }
    }

    if (Array.isArray(knowledgeBase.jokes)) {
      for (const joke of knowledgeBase.jokes) {
        if (joke.q) for (const kw of joke.q) {
          if (textLower.includes(kw.toLowerCase())) {
            const s = kw.length * 5;
            if (s > bestScore) { bestScore = s; best = { ...joke, category: 'jokes' }; }
          }
        }
      }
    }

    if (knowledgeBase.facts && typeof knowledgeBase.facts === 'object') {
      for (const [key, answer] of Object.entries(knowledgeBase.facts)) {
        if (textLower.includes(key) || key.split(' ').some(w => w.length > 3 && textLower.includes(w))) {
          const s = key.length * 5;
          if (s > bestScore) { bestScore = s; best = { a: answer, category: 'facts' }; }
        }
      }
    }

    const cats = knowledgeBase.categories || knowledgeBase;
    for (const [category, entries] of Object.entries(cats)) {
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        let score = 0;
        if (entry.q) for (const kw of entry.q) {
          if (textLower.includes(kw.toLowerCase())) score += kw.length * 5;
          score += NLP.similarity(inputTokens.filtered, NLP.processText(kw.toLowerCase()).filtered) * 15;
        }
        if (entry.tags) for (const t of entry.tags) if (textLower.includes(t.toLowerCase())) score += 8;
        if (entry.q && entry.q.some(kw => textLower === kw.toLowerCase())) score += 25;
        if (score > bestScore) { bestScore = score; best = { ...entry, category }; }
      }
    }

    return (best && bestScore > 10) ? {
      answer: best.a,
      category: best.category,
      score: bestScore,
      source: 'knowledge_base'
    } : null;
  }

  /* ═══════════════════════════════════════════
     INTENT RESPONSES — Enhanced with more intents
     ═══════════════════════════════════════════ */
  function handleIntent(intent, text) {
    const name = getNameFromContext();
    const topicWords = getConversationTopic();
    const topicCtx = topicWords.length > 0 ? ` Veo que estás hablando sobre ${topicWords.slice(0, 3).join(', ')}.` : '';

    const responses = {
      greeting: () => {
        const h = new Date().getHours();
        const saludo = h < 6 ? 'Buenas madrugadas' : h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
        return `${saludo}${name ? ' ' + name : ''}! Soy **X0GPT**, tu asistente inteligente.${topicCtx}\n\nPuedo responder **cualquier pregunta** buscando en internet, y también tengo conocimiento sobre supervivencia, ciencia, historia y más.\n\n¿En qué puedo ayudarte?`;
      },
      farewell: () => {
        const phrases = [
          '¡Hasta luego! ¡Vuelve cuando quieras! 👋',
          '¡Nos vemos! Cuídate mucho. 🛡️',
          '¡Adiós! La información salva vidas. 🌟',
          '¡Hasta pronto! Estaré aquí cuando me necesites. ⚡',
          '¡Chao! Fue un gusto ayudarte. ¡Éxito! 🎯',
          '¡Hasta la próxima! No dudes en volver. 💫'
        ];
        return phrases[Math.floor(Math.random() * phrases.length)];
      },
      thanks: () => {
        const phrases = [
          '¡De nada! Para eso estoy aquí. 😊',
          '¡Con gusto! Siempre listo para ayudar. 🛡️',
          '¡No hay de qué! 🌟',
          '¡A la orden! Pregunta lo que necesites. ⚡',
          '¡Me alegra poder ayudar! 💪',
          '¡Para servirle! 🎯'
        ];
        return phrases[Math.floor(Math.random() * phrases.length)];
      },
      creator: () => `Fui creado por **Jaime Muñoz** 🧑‍💻. Mi objetivo es ayudarte con cualquier pregunta o problema.`,
      help: () => `**X0GPT - Qué puedo hacer:**\n\n🔍 **Buscar cualquier cosa** en internet (DuckDuckGo + Wikipedia)\n🆘 **Supervivencia**: guerra, naturaleza, crisis, primeros auxilios\n📚 **Conocimiento**: ciencia, historia, tecnología, matemáticas\n🔧 **Cómo hacer**: reparaciones, construcciones, herramientas\n💊 **Salud**: primeros auxilios, plantas medicinales\n🗺️ **Navegación**: orientación, mapas, señales\n💬 **Conversar**: chistes, datos curiosos, opiniones\n🧮 **Matemáticas**: operaciones, cálculos\n🕐 **Tiempo/hora**: fecha y hora actual\n\nSimplemente pregunta de forma natural.`,
      joke: () => {
        const jokes = [
          '¿Por qué los programadores prefieren el modo oscuro? Porque la luz atrae a los bugs! 🐛',
          '¿Qué le dijo un byte a otro byte? "Nos vemos en el bus" 💻',
          'Un SQL entra a un bar... y hace un JOIN con las mesas. 🍺',
          '¿Cuál es la fruta del programador? ¡El Google! 🍎',
          '¿Por qué el HTML se fue al psicólogo? Porque tenía muchos problemas de "div" 😄',
          '¿Qué hace un programador en el gimnasio? ¡Hace "push" y "pull"! 💪',
          '¿Por qué JavaScript siempre está triste? Porque no entiende "this" 😢',
          '¿Qué dijo el bit al otro bit? "Eres tan positivo". 🔋',
          'Un programador entra a una tienda. La mujer dice: "¿Quieres algo?". Él dice: "Sí, un bug gratis". 🐞'
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
      },
      fact: () => {
        const facts = [
          'La miel no caduca. Se han encontrado tarros de miel en tumbas egipcias de más de 3000 años que aún eran comestibles. 🍯',
          'Un rayo alcanza temperaturas de 30.000°C, 5 veces más caliente que la superficie del sol. ⚡',
          'Los pulpos tienen 3 corazones y sangre azul. 🐙',
          'El espacio no es completamente vacío: hay aproximadamente 1 átomo por centímetro cúbico. 🌌',
          'Las estrellas fugaces no son estrellas: son meteoritos quemándose en la atmósfera. 🌠',
          'Tu cerebro usa tanta energía como una bombilla de 60 vatios. 🧠',
          'Las abejas pueden reconocer rostros humanos. 🐝',
          'Un día en Venus es más largo que un año en Venus. 🪐',
          'El agua caliente se congela más rápido que la caliente (efecto Mpemba). 🧊',
          'Los delfines se reconocen entre sí por silbidos únicos, como si tuvieran nombres. 🐬'
        ];
        return facts[Math.floor(Math.random() * facts.length)];
      },
      time: () => {
        const now = new Date();
        const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const date = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        return `🕐 Son las **${time}** del ${date}.`;
      },
      weather: () => {
        if (API.isOnline()) {
          return 'Puedo buscar información del clima para ti. ¿De qué ciudad o país quieres saber el tiempo?';
        }
        return 'No puedo acceder a datos del clima sin conexión a internet. Conéctate y pregunta de nuevo.';
      },
      confirmation: () => {
        const responses = [
          '¡Genial! ¿En qué más puedo ayudarte?',
          'Perfecto, estoy listo para lo que necesites.',
          '¡Bien! Pregúntame lo que quieras.',
          '¡A sus órdenes! ¿Qué sigue?'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      },
      negation: () => {
        const responses = [
          'Entendido. ¿Hay algo más en lo que pueda ayudarte?',
          'De acuerdo. Si necesitas algo, aquí estaré.',
          'No hay problema. Pregunta lo que necesites.',
          'Tranquilo, aquí estoy para lo que necesites.'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      },
      math: () => {
        const expr = text.replace(/[^0-9+\-*/().%\s]/g, '').trim();
        if (expr) {
          try {
            const result = NLP.evaluateMath(expr);
            if (result !== null) return `🧮 **Resultado:** ${result}`;
          } catch (e) {}
        }
        return 'Puedo calcular operaciones matemáticas. Escribe la expresión, por ejemplo: `2 + 3 * 4`';
      }
    };

    return responses[intent] ? responses[intent]() : null;
  }

  /* ═══════════════════════════════════════════
     FOLLOW-UP GENERATION — Enhanced
     ═══════════════════════════════════════════ */
  function generateFollowUp(answer, question) {
    const lower = question.toLowerCase();
    const ups = [];
    if (/como|cómo/i.test(lower)) ups.push('¿Quieres que te explique algún paso con más detalle?');
    if (/que es|qué es|define/i.test(lower)) ups.push('¿Te gustaría saber más sobre este tema?');
    if (/guerra|superviv|emergencia|peligro/i.test(lower)) ups.push('¿Necesitas info sobre algún aspecto específico de supervivencia?');
    if (/reparar|arreglar|hacer|construir/i.test(lower)) ups.push('¿Quieres los pasos detallados?');
    if (/quien|quién/i.test(lower)) ups.push('¿Te gustaría saber más sobre esta persona?');
    if (/diferencia|comparar|versus/i.test(lower)) ups.push('¿Quieres que profundice en alguna de las opciones?');
    if (/lista|tipos|ejemplos/i.test(lower)) ups.push('¿Necesitas más ejemplos o detalles de alguno?');
    if (/donde|ubicacion/i.test(lower)) ups.push('¿Quieres saber más sobre la ubicación o el lugar?');
    if (/por que|por qué|razón/i.test(lower)) ups.push('¿Quieres que profundice en las causas?');
    if (/cuando|fecha/i.test(lower)) ups.push('¿Quieres saber más sobre la cronología de eventos?');
    if (ups.length) return '\n\n💡 ' + ups[Math.floor(Math.random() * ups.length)];
    return '';
  }

  /* ═══════════════════════════════════════════
     FOLLOW-UP DETECTION — Enhanced
     ═══════════════════════════════════════════ */
  function detectFollowUp(text) {
    if (/^(sí|si|ok|dale|claro|cuéntame|explícame|y|cuéntame más|cuenta más|dime más|continua|sigue|yes|yep|sure|tell me more|continue|go on|elabora|profundiza|detalla|cuéntame más de eso|amplia|expande|otro|otra|más|mas|algo más|que más|y eso|y por qué|y cómo|por qué|cómo|cuándo|dónde)/i.test(text)) {
      const last = conversationContext.filter(c => c.role === 'bot').pop();
      if (last) {
        const prevQ = getPreviousQuestion();
        return { previousAnswer: last.content, previousQuestion: prevQ };
      }
    }
    return null;
  }

  /* ═══════════════════════════════════════════
     MATH EVALUATION
     ═══════════════════════════════════════════ */
  function detectMathIntent(text) {
    const mathPatterns = [
      /cuanto\s+es\s+[\d+\-*/().%\s]+/i,
      /cuánto\s+es\s+[\d+\-*/().%\s]+/i,
      /calcula\s+[\d+\-*/().%\s]+/i,
      /calcula\s+el\s+[\d+\-*/().%\s]+/i,
      /suma\s+[\d+\-*/().%\s]+/i,
      /resta\s+[\d+\-*/().%\s]+/i,
      /multiplica\s+[\d+\-*/().%\s]+/i,
      /divide\s+[\d+\-*/().%\s]+/i,
      /^[\d+\-*/().%\s]+$/ // Pure math expression
    ];
    return mathPatterns.some(p => p.test(text.trim()));
  }

  /* ═══════════════════════════════════════════
     MAIN PROCESS — WEB FIRST APPROACH (enhanced)
     ═══════════════════════════════════════════ */
  async function processMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return { text: 'Escribe algo para que pueda ayudarte. 😊', source: 'empty', intent: 'empty', confidence: 0 };

    addToContext('user', trimmed);

    /* 0) Math detection first */
    if (detectMathIntent(trimmed)) {
      const mathResult = NLP.evaluateMath(trimmed);
      if (mathResult !== null) {
        const response = `🧮 **Resultado:** ${mathResult}`;
        addToContext('bot', response, 'math');
        return { text: response, source: 'math', intent: 'math', confidence: 1, sentiment: {}, entities: [] };
      }
    }

    /* 1) Detect intent — single NLP call */
    const intent = NLP.detectIntent(trimmed);
    const entities = NLP.extractEntities(trimmed);
    const sentiment = NLP.analyzeSentiment(trimmed);

    /* 2) Handle conversational intents locally */
    const intentResp = handleIntent(intent, trimmed);
    if (intentResp) {
      addToContext('bot', intentResp, intent);
      return { text: intentResp, source: 'intent', intent, confidence: 1, sentiment, entities };
    }

    /* 3) Check follow-up context */
    const followUp = detectFollowUp(trimmed);
    if (followUp) {
      const enriched = `${followUp.previousAnswer || ''} ${trimmed}`;
      const sv = searchSurvival(enriched, intent);
      if (sv) {
        const r = sv.answer + generateFollowUp(sv.answer, trimmed);
        addToContext('bot', r, intent);
        return { text: r, source: 'survival', intent, confidence: Math.min(sv.score / 30, 1), sentiment, entities };
      }
    }

    /* 4) SURVIVAL topics → check local first (fast offline response) */
    const survivalKeywords = /guerra|superviv|emergencia|bunker|refugio|terremoto|inundacion|incendio|tsunami|huracan|avalancha|herida|quemadura|mordedura|veneno|fuego natural|purificar agua|construir refugio|trampa|nudo|cuchillo|orientar|brujula|señal.*socorro|primeros.*auxilio|RCP|planta.*medicinal|planta.*venenosa|francotirador|emboscada|bala|trinchera|minas|pandemia|cuarentena|botiquin|heridas|quemaduras|mordeduras|venenos/i;
    if (survivalKeywords.test(trimmed)) {
      const sv = searchSurvival(trimmed, intent);
      if (sv && sv.score > 10) {
        const r = sv.answer + generateFollowUp(sv.answer, trimmed);
        addToContext('bot', r, intent);
        return { text: r, source: 'survival', intent, confidence: Math.min(sv.score / 30, 1), sentiment, entities };
      }
    }

    /* 5) CONVERSATIONAL / GREETINGS → check local first */
    const localKB = searchKnowledgeBase(trimmed);
    if (localKB && localKB.score > 20 && ['greetings', 'farewells', 'thanks', 'self', 'jokes'].includes(localKB.category)) {
      const r = localKB.answer;
      addToContext('bot', r, intent);
      return { text: r, source: 'knowledge_base', intent, confidence: 1, sentiment, entities };
    }

    /* 6) ══ WEB SEARCH FIRST ══ — for ALL factual questions */
    if (API.isOnline()) {
      try {
        const query = NLP.buildSearchQuery(trimmed, entities);
        const cacheKey = `web:${query}`;
        const cached = getCachedResponse(cacheKey);
        if (cached) {
          addToContext('bot', cached, intent);
          return { text: cached, source: 'web_cache', intent, confidence: 0.9, sentiment, entities };
        }

        const webResults = await API.searchWithAlternatives(query);
        const formatted = API.formatAnswer(webResults);
        if (formatted) {
          let finalAnswer = formatted;
          if (localKB && localKB.score > 12) {
            const localSnippet = localKB.answer.length > 300 ? localKB.answer.substring(0, 300) + '...' : localKB.answer;
            if (!formatted.toLowerCase().includes(localSnippet.substring(0, 50).toLowerCase())) {
              finalAnswer = formatted + '\n\n---\n📚 **Additional info from knowledge base:**\n' + localSnippet;
            }
          }
          setCacheResponse(cacheKey, finalAnswer);
          addToContext('bot', finalAnswer, intent);
          return { text: finalAnswer, source: 'web', intent, confidence: webResults.confidence, sentiment, entities };
        }
      } catch (e) { console.error('Web search error:', e); }
    }

    /* 7) Fallback: local knowledge base (works offline) */
    if (localKB) {
      const r = localKB.answer + generateFollowUp(localKB.answer, trimmed);
      addToContext('bot', r, intent);
      return { text: r, source: 'knowledge_base', intent, confidence: Math.min(localKB.score / 50, 0.8), sentiment, entities };
    }

    /* 8) Last resort: try web search with simplified query */
    if (API.isOnline()) {
      try {
        const keywords = NLP.extractKeywords(trimmed);
        if (keywords.length > 0) {
          const simpleQuery = keywords.slice(0, 4).join(' ');
          const cacheKey = `web2:${simpleQuery}`;
          const cached = getCachedResponse(cacheKey);
          if (cached) {
            addToContext('bot', cached, intent);
            return { text: cached, source: 'web_cache', intent, confidence: 0.7, sentiment, entities };
          }

          const web2 = await API.search(simpleQuery);
          const fmt2 = API.formatAnswer(web2);
          if (fmt2) {
            setCacheResponse(cacheKey, fmt2);
            addToContext('bot', fmt2, intent);
            return { text: fmt2, source: 'web', intent, confidence: web2.confidence * 0.7, sentiment, entities };
          }
        }
      } catch (e) {}
    }

    /* 9) Absolute fallback — contextual */
    const recentTopics = getRecentTopics();
    const topicContext = getConversationTopic();
    let fb;

    if (topicContext.length > 0 && trimmed.length > 10) {
      fb = `No encontré información específica sobre eso relacionado con **${topicContext.slice(0, 2).join(' y ')}**. ¿Podrías reformular tu pregunta o ser más específico?`;
    } else if (recentTopics.includes('survival')) {
      fb = 'No encontré información específica de supervivencia sobre eso. Intenta ser más específico o pregunta sobre un tema de supervivencia en particular.';
    } else if (trimmed.length < 10) {
      fb = '¿Podrías darme más contexto? Cuanto más específico seas, mejor podré ayudarte.';
    } else {
      const fallbacks = [
        'No encontré información sobre eso. ¿Podrías reformular la pregunta?',
        'No tengo esa respuesta. ¿Puedes darme más contexto?',
        'No encontré resultado. Intenta con otras palabras clave.',
        'No pude encontrar esa información. ¿Qué aspecto específico necesitas?',
        'Intenta ser más específico o usa diferentes palabras. Puedo buscar en internet o en mi base de conocimientos.',
        'No logré encontrar lo que buscas. ¿Puedes darme más detalles sobre tu pregunta?'
      ];
      fb = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
    addToContext('bot', fb, intent);
    return { text: fb, source: 'fallback', intent, confidence: 0.1, sentiment, entities };
  }

  /* ═══════════════════════════════════════════
     STATUS
     ═══════════════════════════════════════════ */
  function getStatus() {
    return {
      knowledgeLoaded: !!knowledgeBase,
      survivalLoaded: !!survivalBase,
      knowledgeCategories: knowledgeBase ? Object.keys(knowledgeBase).length : 0,
      survivalCategories: survivalBase ? Object.keys(survivalBase).length : 0,
      contextSize: conversationContext.length,
      online: API.isOnline(),
      summary: conversationSummary,
      topicWords: getConversationTopic()
    };
  }

  function clearContext() {
    conversationContext = [];
    conversationSummary = '';
    topicHistory = [];
    pendingIntents = [];
    responseCache.clear();
  }

  return { init, processMessage, getStatus, clearContext, searchKnowledgeBase, searchSurvival };
})();

if (typeof module !== 'undefined') module.exports = Engine;

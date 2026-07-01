const NLP = (() => {
  /* ═══════════════════════════════════════════
     STOP WORDS — Spanish + English (deduplicated)
     ═══════════════════════════════════════════ */
  const STOP_WORDS_ES = new Set([
    'de','la','el','en','y','a','los','del','las','un','por','con','una','su',
    'para','es','al','que','se','no','lo','como','más','mas','pero','sus',
    'le','ya','o','este','ha','si','porque','esta','son','entre','cuando',
    'muy','sin','sobre','ser','también','me','hasta','hay','donde','quien',
    'desde','todo','nos','durante','todos','uno','les','ni','contra','otros',
    'fue','ese','eso','ante','ellos','e','esto','mi','antes','algunos','qué',
    'unos','yo','otro','otras','otra','él','tanto','esa','estos','mucho',
    'quienes','nada','muchos','cual','poco','ella','estar','estas','era',
    'algunas','algo','nosotros','tiene','había','hecho','después','despues',
    'puede','pueden','cada','he','aquí','asi','así','va','voy','dije','creo',
    'pues','da','dijo','dice','ver','bueno','buen','bien','entonces','aunque',
    'todavía','todavia','acá','allá','allí','ahí','aquel','aquella','aquellos',
    'aquellas','mismo','misma','mismos','mismas','tan','tanta','tantos',
    'tantas','cuyo','cuya','cuyos','cuyas','os','te','nuestro','nuestra',
    'nuestros','nuestras','vuestro','vuestra','vuestros','vuestras',
    'esos','esas','the','is','are','was','were','be','been','being','have',
    'has','had','do','does','did','will','would','could','should','may',
    'might','shall','can','to','of','in','for','on','with','at','by','from',
    'as','into','through','during','before','after','above','below','between',
    'out','off','over','under','again','further','then','once','here','there',
    'when','where','why','how','all','both','each','few','more','most','other',
    'some','such','no','nor','not','only','own','same','so','than','too',
    'very','s','t','just','don','now','also','much','many','well','back',
    'even','still','new','want','tell','think','know','take','come','make',
    'like','time','look','people','thing','way','day','man','woman','child'
  ]);

  /* ═══════════════════════════════════════════
     INTENTS — Priority-based with deduped keywords
     ═══════════════════════════════════════════ */
  const INTENTS = {
    greeting: {
      priority: 10,
      keywords: ['hola','buenos dias','buenas tardes','buenas noches','saludos','hey','que tal','como estas','que hay','holi','que onda','que pex','sup','hello','hi','que pasa','como va','que hubo','saludame'],
      patterns: [/^(hola|buenos|buenas|hey|saludos)/i, /que\s+(tal|hay|onda|pex|pasa|hubo)/i, /como\s+(estas|vas|te va)/i, /\b(hi|hello|hey)\b/i]
    },
    farewell: {
      priority: 10,
      keywords: ['adios','hasta luego','chao','bye','nos vemos','hasta pronto','me voy','hasta mañana','chau','hasta la vista','nos vemos luego','bye bye','nos vemos pronto','me despido','nos dejamos'],
      patterns: [/(adios|hasta|chao|bye|nos vemos|me voy|chau|me despido)/i]
    },
    thanks: {
      priority: 10,
      keywords: ['gracias','muchas gracias','te agradezco','thanks','thx','mil gracias','agradecido','agradecida','thank you','ty','te lo agradezco','grasias'],
      patterns: [/gracias/i, /agradezco/i, /thanks/i, /\bty\b/i, /te lo agradezco/i]
    },
    creator: {
      priority: 9,
      keywords: ['quien te creo','quien te hizo','quien es tu creador','quien es tu padre','quien te programo','quien te desarrollo','quien es jaime','quien es tu dueno','quien te invento'],
      patterns: [/quien\s+(te\s+cre[oó]|te\s+hizo|es\s+tu\s+(creador|padre|dueño|dueno)|te\s+program[oó]|te\s+desarroll[oó]|te\s+invent[oó])/i]
    },
    help: {
      priority: 8,
      keywords: ['ayuda','help','que puedes hacer','que sabes hacer','funciones','comandos','menu','opciones','capacidades','ayudame','como te uso','para que sirves'],
      patterns: [/ayuda/i, /help/i, /que\s+puedes/i, /funciones/i, /comandos/i, /capacidades/i, /para\s+que\s+sirves/i, /como\s+te\s+uso/i]
    },
    joke: {
      priority: 7,
      keywords: ['chiste','broma','cuéntame un chiste','cuantame un chiste','divierteme','hasme reir','algo gracioso','risa','reir','divertir','humor','gracioso','chistoso'],
      patterns: [/(chiste|broma|reir|divertir|joke|humor)/i, /cu[ée]ntame\s+un/i, /algo\s+gracioso/i, /hasme\s+re[ií]r/i]
    },
    fact: {
      priority: 7,
      keywords: ['dato curioso','dato interesante','sabias que','sabías que','curiosidad','algo interesante','dato random','dame un dato','cuente algo','cuentame algo interesante','algo curioso'],
      patterns: [/dato\s+(curioso|interesante)/i, /sab[ií]as\s+que/i, /curiosidad/i, /dame\s+un\s+dato/i, /cu[ée]ntame\s+algo\s+(interesante|curioso)/i]
    },
    survival: {
      priority: 6,
      keywords: ['supervivir','sobrevivir','supervivencia','emergencia','peligro','guerra','bombardeo','terremoto','inundacion','incendio','huracán','tsunami','avalancha','refugio','bunker','evacuar','huir','escapar','herida','quemadura','mordedura','veneno','fuego','agua','comida','bosque','selva','desierto','montaña','rio','mar','francotirador','emboscada','arma','bala','trinchera','minas','quimico','nuclear','radiacion','pandemia','virus','cuarentena','crisis','sin luz','sin agua','sin comida','primitivo','natural','improvisar','herramienta','cuchillo','cuerda','nudo','trampa','cazar','pescar','purificar','filtrar','orientar','brujula','señal de socorro','primeros auxilios','RCP','resucitar','torniquete','vendaje','medicina','planta medicinal','planta venenosa','botiquin'],
      patterns: [/superviv(ir|encia)/i, /sobrevivir/i, /emergencia/i, /en\s+(guerra|peligro)/i, /como\s+(sobrevivir|escapar|huir|evacuar)/i, /que\s+hacer\s+(en|si|cuando)/i, /primera\s+linea/i, /botiquin/i, /refugio/i, /bunker/i, /trinchera/i, /emboscada/i, /francotirador/i, /sniper/i, /hacer\s+fuego/i, /purificar\s+agua/i, /construir\s+(refugio|cabaña)/i, /trampa(s)?/i, /nudo(s)?/i, /cuchillo/i, /cuerda/i, /orientacion/i, /brujula/i, /señal(es)?\s+(de\s+)?socorro/i, /primeros\s+auxilios/i, /RCP/i, /herida/i, /quemadura/i, /mordedura/i, /veneno/i, /planta(s)?\s+(medicinal|comestible|venenosa)/i]
    },
    definition: {
      priority: 5,
      keywords: ['que es','define','definicion','definición','significa','concepto de','qué es','que significa','que quiere decir','como se define'],
      patterns: [/(que\s+es|define|definicion|significa|concepto)/i]
    },
    explanation: {
      priority: 5,
      keywords: ['explica','explicame','cuéntame','cuantame','háblame','hablame','describe','detalla','como funciona','por que','quiero saber','cuentame mas','detallame'],
      patterns: [/(explica|cu[ée]ntame|h[áa]blame|describe|detalla|como\s+funciona|quiero\s+saber)/i]
    },
    how_to: {
      priority: 5,
      keywords: ['como hacer','como puedo','como se hace','pasos para','tutorial','guia de','instrucciones','paso a paso','que tengo que hacer','que debo hacer','enseñame'],
      patterns: [/como\s+(hacer|puedo|se\s+hace)/i, /pasos\s+para/i, /tutorial/i, /gu[ií]a/i, /paso\s+a\s+paso/i, /ense[ñn]ame/i]
    },
    question: {
      priority: 3,
      keywords: ['que','como','por que','porque','quien','quienes','donde','cuando','cuanto','cuantos','cuantas','cual','cuales'],
      patterns: [/^(que|como|por que|porque|quien|quienes|donde|cuando|cuanto|cual|cuales)\s/i, /\?$/]
    },
    comparison: {
      priority: 4,
      keywords: ['diferencia entre','comparar','comparación','cual es mejor','qué es mejor','ventajas','desventajas','versus','vs'],
      patterns: [/(diferencia\s+entre|compar[ae]r|cu[aá]l\s+es\s+mejor|versus|vs\.?)/i]
    },
    list: {
      priority: 4,
      keywords: ['lista de','ejemplos de','tipos de','clases de','nombres de','principales','mejores','peores','enumera','menciona'],
      patterns: [/(lista|ejemplos|tipos|clases|nombres|principales|mejores|peores|enumera|menciona)\s+(de|del|los|las)/i]
    },
    who_is: {
      priority: 4,
      keywords: ['quien es','quien fue','quien era','conoces a','sabes quien','que es de la vida de'],
      patterns: [/quien\s+(es|fue|era)/i, /conoces\s+a/i, /sabes\s+quien/i]
    },
    where_is: {
      priority: 4,
      keywords: ['donde esta','donde queda','donde se encuentra','ubicacion','ubicación','direccion','en que lugar','en que parte'],
      patterns: [/donde\s+(est[aá]|queda|se\s+encuentra)/i, /ubicaci[oó]n/i, /direcci[oó]n/i]
    },
    why: {
      priority: 4,
      keywords: ['por que','porque','cual es la razon','para que sirve','cual es el motivo'],
      patterns: [/por\s+que/i, /para\s+que\s+sirve/i, /raz[oó]n/i, /motivo/i]
    },
    when: {
      priority: 4,
      keywords: ['cuando','en que año','que fecha','que dia','en que momento','desde cuando'],
      patterns: [/cuando/i, /en\s+que\s+añ[oó]/i, /que\s+fecha/i]
    },
    opinion: {
      priority: 3,
      keywords: ['que opinas','que piensas','cual es tu opinion','que te parece','que dices','dame tu opinion'],
      patterns: [/que\s+(opinas|piensas|te\s+parece|dices)/i]
    },
    translate: {
      priority: 3,
      keywords: ['traducir','traduce','como se dice','como se escribe','en ingles','en español','en frances','en aleman'],
      patterns: [/traducir|traduce/i, /como\s+se\s+(dice|escribe)/i, /en\s+(ingles|espa[nñ]ol|frances|aleman)/i]
    },
    math: {
      priority: 3,
      keywords: ['cuanto es','calcula','resolver','operacion','suma','resta','multiplicacion','division','ecuacion','calcular'],
      patterns: [/(cuanto\s+es|calcula|resolver)/i, /\d+\s*[+\-*/÷×]\s*\d+/]
    },
    time: {
      priority: 2,
      keywords: ['que hora es','hora actual','hora en','hora local'],
      patterns: [/que\s+hora\s+es/i, /hora\s+(actual|local)/i]
    },
    weather: {
      priority: 2,
      keywords: ['clima','tiempo atmosferico','temperatura','lluvia','nieve','viento','sol','nublado','预报','tiempo hoy','como esta el clima','que tiempo hace'],
      patterns: [/clima/i, /tiempo\s+(atmosferico|hoy)/i, /temperatura/i, /como\s+(esta|va)\s+el\s+(clima|tiempo)/i, /que\s+tiempo\s+hace/i]
    },
    confirmation: {
      priority: 2,
      keywords: ['si','ok','dale','claro','por favor','exacto','correcto','affirmative','yep','yeah','sí'],
      patterns: [/^(sí|si|ok|dale|claro|por favor|exacto|correcto)$/i]
    },
    negation: {
      priority: 2,
      keywords: ['no','nunca','jamás','para nada','de ninguna forma','nop','nah','nope'],
      patterns: [/^(no|nunca|jamás|para nada|nop|nah|nope)$/i]
    }
  };

  /* ═══════════════════════════════════════════
     TOKENIZER
     ═══════════════════════════════════════════ */
  function tokenize(text) {
    return text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1);
  }

  function removeStopWords(tokens) {
    return tokens.filter(t => !STOP_WORDS_ES.has(t));
  }

  /* ═══════════════════════════════════════════
     STEMMER — Spanish stemmer
     ═══════════════════════════════════════════ */
  function stem(word) {
    if (word.length < 4) return word;
    let w = word;

    const rules = [
      [/logías?$/, 'logi'], [/logos$/, 'logo'],
      [/amiento$/, ''], [/imiento$/, ''],
      [/izarse$/, 'iz'], [/izar$/, 'iz'], [/izador$/, 'iz'],
      [/ísimo$/, ''], [/ísima$/, ''],
      [/adamente$/, ''], [/iblemente$/, ''], [/osamente$/, ''],
      [/mente$/, ''],
      [/ción$/, 'cion'], [/siones$/, 'sion'], [/sión$/, 'sion'],
      [/ancias$/, 'ancia'], [/encias$/, 'encia'],
      [/ando$/, ''], [/iendo$/, ''],
      [/ar$/, ''], [/er$/, ''], [/ir$/, ''],
      [/aje$/, ''],
      [/ero$/, ''], [/era$/, ''],
      [/ado$/, ''], [/ada$/, ''],
      [/ido$/, ''], [/ida$/, ''],
      [/oso$/, ''], [/osa$/, ''],
      [/ible$/, ''], [/able$/, ''],
      [/al$/, ''], [/ales$/, 'al'],
      [/ón$/, 'on'], [/ones$/, 'on'],
      [/ía$/, 'ia'], [/ías$/, 'ia'],
      [/os$/, ''], [/as$/, ''],
      [/es$/, ''], [/e$/, ''],
      [/o$/, ''], [/a$/, '']
    ];

    for (const [pattern, replacement] of rules) {
      if (pattern.test(w) && w.length > 4) {
        w = w.replace(pattern, replacement);
        break;
      }
    }
    return w;
  }

  function processText(text) {
    const tokens = tokenize(text);
    const filtered = removeStopWords(tokens);
    const stemmed = filtered.map(stem);
    return { tokens, filtered, stemmed };
  }

  /* ═══════════════════════════════════════════
     INTENT DETECTION — Priority-based scoring
     ═══════════════════════════════════════════ */
  function detectIntent(text) {
    const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const results = [];

    for (const [intent, config] of Object.entries(INTENTS)) {
      let score = 0;

      for (const kw of config.keywords) {
        if (lower.includes(kw)) {
          score += kw.length * 2;
          if (lower.startsWith(kw)) score += 5;
        }
      }

      for (const pattern of config.patterns) {
        try {
          if (pattern.test(text)) score += 10;
        } catch(e) {}
      }

      // Multi-word bonus
      for (const kw of config.keywords) {
        const kwWords = kw.split(' ');
        if (kwWords.length > 1) {
          const matchCount = kwWords.filter(w => lower.includes(w)).length;
          if (matchCount === kwWords.length) score += kwWords.length * 3;
        }
      }

      if (score > 0) {
        results.push({ intent, score: score * (config.priority || 1) });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.length > 0 ? results[0].intent : 'question';
  }

  /* ═══════════════════════════════════════════
     QUESTION TYPE
     ═══════════════════════════════════════════ */
  function detectQuestionType(text) {
    const t = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (/^(que es|qué es|define|definición|significa|concepto)/i.test(t)) return 'definition';
    if (/^(como|cómo)\s+(hacer|puedo|se\s+hace|funciona)/i.test(t)) return 'how_to';
    if (/^(quien|quién)\s+(es|fue|era)/i.test(t)) return 'who';
    if (/^(donde|dónde)\s+(esta|queda|se\s+encuentra)/i.test(t)) return 'where';
    if (/^(cuando|cuándo)/i.test(t)) return 'when';
    if (/^(por\s+que|por\s+qué|porque)/i.test(t)) return 'why';
    if (/^(cuanto|cuánto|cuantos|cuántos|cuantas|cuántas)/i.test(t)) return 'quantity';
    if (/diferencia\s+entre|compar[ae]r|versus|vs|cuál es mejor|qué es mejor/i.test(t)) return 'comparison';
    if (/lista|ejemplos|tipos|clases|mejores|peores|principales|enumera/i.test(t)) return 'list';
    if (/que\s+(opinas|piensas|te\s+parece)/i.test(t)) return 'opinion';
    if (/traducir|traduce|como\s+se\s+(dice|escribe)/i.test(t)) return 'translate';
    if (/cuanto\s+es|calcula|\d+\s*[+\-*/÷×]\s*\d+/i.test(t)) return 'math';
    if (/que\s+hora\s+es|hora\s+actual/i.test(t)) return 'time';
    if (/clima|tiempo\s+(atmosferico|hoy)|temperatura|como\s+esta\s+el\s+(clima|tiempo)/i.test(t)) return 'weather';
    return 'general';
  }

  /* ═══════════════════════════════════════════
     ENTITY EXTRACTION — Expanded + deduped
     ═══════════════════════════════════════════ */
  function extractEntities(text) {
    const entities = [];
    const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const persons = [
      'einstein','newton','tesla','darwin','napoleon','cleopatra','da vinci','shakespeare','mozart','beethoven',
      'gandhi','martin luther','mandela','obama','trump','steve jobs','elon musk','mark zuckerberg','bill gates','jeff bezos',
      'aristoteles','platón','socrates','jesús','mahoma','buda','confucio',
      'cristobal colon','magallanes','alexander humboldt','simon bolivar','san martin','artigas',
      'galileo','kepler','faraday','edison','bohr','planck','feynman','hawking','sagan',
      'shakira','bad bunny','j balvin','daddy yankee','pitbull','pedro infante',
      'zlatan','messi','cristiano','neymar','maradona','pele','jordan','lebron',
      'picasso','van gogh','monet','rembrandt','klimt','dali',
      'stephen king','tolkien','gabriel garcia marquez','pablo neruda','miguel de cervantes',
      'edgar allan poe','franz kafka','jorge luis borges',
      'winston churchill','franklin roosevelt','lenin','karl marx','friedrich engels',
      'abraham lincoln','thomas jefferson','george washington','benjamin franklin',
      'bach','vivaldi','chopin','tchaikovsky','stravinsky',
      'charlie chaplin','alfred hitchcock','stanley kubrick','spielberg','tarantino','nolan',
      'homer','plutarco','seneca','marco aurelio','descartes','spinoza',
      'freud','jung','maslow','pavlov','curie','hubble',
      'ronaldo','mbappe','haaland','modric','iniesta','xavi','ronaldinho',
      'dostoyevski','tolstoi','saramago','eco','borges','proust',
      'scorsese','coppola','bergman','kurosawa'
    ];

    const places = [
      'mexico','españa','francia','alemania','italia','japon','china','india','brasil','argentina',
      'colombia','chile','peru','venezuela','ecuador','bolivia','uruguay','paraguay','costa rica','cuba',
      'eeuu','estados unidos','reino unido','rusia','canada','australia','africa','europa','asia','america','oceanía','antartida',
      'amazonas','andes','himalaya','sahara','pacifico','atlantico','mediterraneo',
      'ciudad de mexico','buenos aires','bogota','lima','santiago','quito','caracas','montevideo',
      'tokio','osaka','pekin','shanghai','delhi','bombay','nueva york','los angeles','chicago','miami',
      'londres','paris','roma','berlin','madrid','barcelona','lisboa','amsterdam','moscu',
      'cairo','el cairo','estambul','dubai','singapur','bangkok',
      'islandia','groenlandia','madagascar','sri lanka','filipinas','indonesia',
      'pakistan','afganistan','irak','iran','siria','israel','palestina','jordania','libano',
      'arabia saudita','emiratos','qatar','kuwait','oman','yemen',
      'corea del sur','corea del norte','taiwan','vietnam','tailandia','camboya','laos','malasia',
      'nigeria','sudafrica','kenia','etiopia','marruecos','tunez','argelia','libia',
      'grecia','turquia','hungria','polonia','republica checa','austria','suiza','belgica','dinamarca','suecia','noruega','finlandia',
      'napoles','venecia','milan','florencia','praga','Viena',
      'Atenas','Esparta','Troya','Babilonia','Cartago','Persia',
      'Machu Picchu','Chichen Itza','Coliseo','Taj Mahal','Gran Muralla','Petra','Egipto'
    ];

    const dates = [
      '1492','1776','1810','1815','1863','1865','1903','1910','1914','1917','1929','1939','1941','1945',
      '1969','1989','2000','2001','2008','2010','2012','2019','2020','2021','2022','2023','2024','2025','2026',
      'edad media','renacimiento','prehistoria','antigüedad','imperio romano',
      'revolucion francesa','revolucion industrial','guerra fria',
      'primera guerra mundial','segunda guerra mundial'
    ];

    const orgs = [
      'google','microsoft','apple','amazon','facebook','meta','tesla','spacex','nasa','onu','naciones unidas',
      'fifa','uefa','fbi','cia','nato','otan','bbc','cnn',
      'oms','banco mundial','fmi','oea','union europea',
      'real madrid','barcelona','manchester united','bayern munich','juventus',
      'ferrari','mercedes','bmw','toyota','honda','samsung','sony','intel','nvidia','amd',
      'netflix','spotify','twitter','instagram','tiktok','youtube','linkedin','uber','airbnb',
      'disney','warner','paramount','universal','pixar','marvel','dc comics',
      'harvard','mit','stanford','oxford','cambridge','yale','princeton',
      'openai','qualcomm','arm','chevrolet','audi','volkswagen','liverpool','chelsea',
      'nba','nfl','mlb','nhl','f1','motogp','ufc'
    ];

    const tech = [
      'javascript','python','java','html','css','react','angular','vue','nodejs','typescript',
      'machine learning','deep learning','inteligencia artificial','redes neuronales',
      'blockchain','bitcoin','ethereum','criptomonedas','nft',
      'cloud computing','aws','azure','docker','kubernetes','linux','windows','macos',
      'internet','wifi','bluetooth','5g','4g','iot','arduino','raspberry',
      'gpu','cpu','ram','ssd','hdd','usb','hdmi','pci','nvme'
    ];

    // Entity matching using includes (O(n) per entity)
    for (const p of persons) {
      if (lower.includes(p)) {
        entities.push({ type: 'person', value: p, text: p });
      }
    }
    for (const pl of places) {
      if (lower.includes(pl)) {
        entities.push({ type: 'place', value: pl, text: pl });
      }
    }
    for (const d of dates) {
      if (lower.includes(d)) entities.push({ type: 'date', value: d, text: d });
    }
    for (const o of orgs) {
      if (lower.includes(o)) entities.push({ type: 'organization', value: o, text: o });
    }
    for (const t of tech) {
      if (lower.includes(t)) entities.push({ type: 'technology', value: t, text: t });
    }

    // Deduplicate entities
    const seen = new Set();
    const unique = entities.filter(e => {
      const key = `${e.type}:${e.value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return unique;
  }

  /* ═══════════════════════════════════════════
     SENTIMENT — Optimized (no Set spread in loop)
     ═══════════════════════════════════════════ */
  function analyzeSentiment(text) {
    const positives = ['bueno','buena','excelente','genial','increible','maravilloso','fantastico','perfecto',
      'hermoso','lindo','bonito','agradable','satisfecho','feliz','alegre','contento','optimista',
      'interesante','divertido','cool','chido','padre','bacano','chevere','fantástico','increíble',
      'brillante','magnífico','estupendo','fenomenal','amor','paz','alegria','felicidad','exito',
      'logro','victoria','triunfo','ganar','mejor','ideal','extraordinario','agradecido','orgulloso',
      'emocionado','entusiasmado','esperanzado','confiado'];
    const negatives = ['malo','mala','terrible','horrible','feo','odio','odiar','detesto','desagradable',
      'triste','decepcion','decepcionado','furioso','enojado','molesto','aburrido','peor',
      'desastre','asco','basura','inutil','defectuoso','roto','dolor','sufrimiento',
      'pésimo','desastroso','lamentable','rabia','ira','rencor',
      'fracaso','perder','derrota','muerte','guerra','peligro','miedo','temor','ansiedad',
      'preocupacion','problema','crisis','desesperacion','soledad','tristeza','llorar'];
    const intensifiers = ['muy','bastante','extremadamente','totalmente','completamente','absolutamente','realmente','sumamente','increiblemente','demasiado'];
    const negators = ['no','nunca','jamás','nada','ni','tampoco','sin','carece','falta'];

    const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const words = lower.split(/\s+/);
    let score = 0;
    let hasNegation = false;

    for (let i = 0; i < words.length; i++) {
      if (negators.includes(words[i])) { hasNegation = true; continue; }

      let wordScore = 0;
      if (positives.some(p => words[i].includes(p))) wordScore += 1;
      if (negatives.some(n => words[i].includes(n))) wordScore -= 1;

      if (hasNegation) { wordScore *= -0.5; hasNegation = false; }
      if (intensifiers.some(x => words[i].includes(x))) {
        if (i + 1 < words.length) {
          if (positives.some(p => words[i+1].includes(p))) score += 1.5;
          if (negatives.some(n => words[i+1].includes(n))) score -= 1.5;
        }
      }
      score += wordScore;
    }

    if (/\?/.test(text) && Math.abs(score) < 2) return { label: 'neutral', score: 0 };
    if (score > 1) return { label: 'positive', score: Math.min(score / 5, 1) };
    if (score < -1) return { label: 'negative', score: Math.max(score / 5, -1) };
    return { label: 'neutral', score: 0 };
  }

  /* ═══════════════════════════════════════════
     SIMILARITY — Optimized
     ═══════════════════════════════════════════ */
  function similarity(tokensA, tokensB) {
    if (!tokensA.length || !tokensB.length) return 0;
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);
    let intersection = 0;
    for (const x of setA) { if (setB.has(x)) intersection++; }
    const union = setA.size + setB.size - intersection;
    const jaccard = union > 0 ? intersection / union : 0;

    // Stemmed matching
    const setSA = new Set(tokensA.map(stem));
    const setSB = new Set(tokensB.map(stem));
    let stemIntersect = 0;
    for (const x of setSA) { if (setSB.has(x)) stemIntersect++; }
    const stemUnion = setSA.size + setSB.size - stemIntersect;
    const stemSim = stemUnion > 0 ? stemIntersect / stemUnion : 0;

    return Math.max(jaccard, stemSim);
  }

  function extractKeywords(text) {
    const { filtered } = processText(text);
    return filtered;
  }

  /* ═══════════════════════════════════════════
     QUERY EXPANSION
     ═══════════════════════════════════════════ */
  function expandQuery(text) {
    const synonyms = {
      'que es': ['definicion de','significado de','concepto de','que significa'],
      'como': ['de que manera','cuales son los pasos','paso a paso','forma de'],
      'quien': ['cual es el nombre de','quien fue el','quien es el'],
      'donde': ['en que lugar','en que ubicacion','en que parte'],
      'cuando': ['en que fecha','en que ano','en que epoca'],
      'por que': ['cual es la razon','por cual motivo','que causa','causa de'],
      'cuanto': ['cual es la cantidad','cantidad de'],
      'mejor': ['cual es el mejor','mejores opciones','ranking de','top'],
      'ejemplo': ['ejemplos de','casos de','caso práctico de'],
      'ventaja': ['ventajas de','beneficios de','puntos a favor de'],
      'desventaja': ['desventajas de','problemas de','puntos en contra de'],
      'diferencia': ['diferencia entre','como se distinguen']
    };

    const lower = text.toLowerCase();
    const expansions = [];
    for (const [key, values] of Object.entries(synonyms)) {
      if (lower.includes(key)) expansions.push(...values);
    }
    return expansions;
  }

  /* ═══════════════════════════════════════════
     BUILD SEARCH QUERY
     ═══════════════════════════════════════════ */
  function buildSearchQuery(text, entities) {
    const questionType = detectQuestionType(text);
    const lower = text.toLowerCase();

    if (questionType === 'definition') {
      const topic = lower.replace(/^(que es|qué es|define|definición de|significa|concepto de)\s*/i, '').trim();
      return `definición ${topic}`;
    }
    if (questionType === 'how_to') return text;
    if (['who', 'where', 'when', 'why'].includes(questionType)) return text;
    if (questionType === 'comparison') {
      const match = lower.match(/diferencia\s+entre\s+(.+?)\s+y\s+(.+)/i);
      if (match) return `${match[1]} vs ${match[2]}`;
      return text;
    }
    if (questionType === 'list') {
      const topic = lower.replace(/^(lista de|ejemplos de|tipos de|clases de|nombres de|principales|mejores|peores)\s*/i, '').trim();
      return `lista de ${topic}`;
    }

    if (entities.length > 0) {
      const entityText = entities.map(e => e.value).join(' ');
      const keywords = extractKeywords(text).slice(0, 4).join(' ');
      return `${entityText} ${keywords}`.trim();
    }

    return text;
  }

  /* ═══════════════════════════════════════════
     SPELLING — Levenshtein
     ═══════════════════════════════════════════ */
  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = Math.min(
          dp[i-1][j] + 1,
          dp[i][j-1] + 1,
          dp[i-1][j-1] + (a[i-1] !== b[j-1] ? 1 : 0)
        );
      }
    }
    return dp[m][n];
  }

  function suggestSpelling(word, dictionary, maxDistance = 2) {
    let best = null, bestDist = maxDistance + 1;
    for (const w of dictionary) {
      const d = levenshtein(word, w);
      if (d < bestDist) { bestDist = d; best = w; }
    }
    return best;
  }

  /* ═══════════════════════════════════════════
     LANGUAGE DETECTION
     ═══════════════════════════════════════════ */
  function detectLanguage(text) {
    const esWords = ['el','la','los','las','de','en','que','por','con','para','como','mas','pero','este','esta','son','hay','ser','estar','tiene'];
    const enWords = ['the','is','are','was','were','have','has','had','do','does','did','will','would','could','should','can','to','of','in','for','on','with','at','by'];
    const lower = text.toLowerCase();
    const esCount = esWords.filter(w => lower.includes(w)).length;
    const enCount = enWords.filter(w => lower.includes(w)).length;
    if (esCount > enCount) return 'es';
    if (enCount > esCount) return 'en';
    return 'unknown';
  }

  /* ═══════════════════════════════════════════
     MATH EVALUATOR — Basic operations
     ═══════════════════════════════════════════ */
  function evaluateMath(text) {
    const match = text.match(/(\d+\.?\d*)\s*([+\-*/÷×])\s*(\d+\.?\d*)/);
    if (!match) return null;
    const a = parseFloat(match[1]);
    const op = match[2];
    const b = parseFloat(match[3]);
    let result;
    switch(op) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': case '×': result = a * b; break;
      case '/': case '÷': result = b !== 0 ? a / b : null; break;
      default: return null;
    }
    if (result === null) return 'No se puede dividir por cero.';
    return `**${a} ${op} ${b} = ${Number.isInteger(result) ? result : result.toFixed(4)}**`;
  }

  return {
    tokenize,
    removeStopWords,
    stem,
    processText,
    detectIntent,
    detectQuestionType,
    extractEntities,
    analyzeSentiment,
    similarity,
    extractKeywords,
    expandQuery,
    buildSearchQuery,
    levenshtein,
    suggestSpelling,
    detectLanguage,
    evaluateMath,
    STOP_WORDS_ES,
    INTENTS
  };
})();

if (typeof module !== 'undefined') module.exports = NLP;

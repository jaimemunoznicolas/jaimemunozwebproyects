const SW = new Set([
  'de','la','que','el','en','y','a','los','del','se','las','por','un','para','con','no',
  'una','su','al','lo','como','más','pero','sus','le','ya','este','entre','porque','todo',
  'esta','sin','son','también','me','está','muy','este','ese','esa','ti','te','eso','cual',
  'donde','quien','cuando','cómo','qué','hay','ser','más','tan','cada','puede','debe','tiene',
  'hace','era','han','tenido','tienen','hacer','podría','mis','eres','somos','soy','sea','he',
  'has','había','haber','estoy','estás','estamos','están','estaba','fuera','fue','voy','vas',
  'va','vamos','van','iban','iba','sido','suelen','suele','dicha','dicho','mismo','misma',
  'otros','otra','otro','unas','unos','tanto','poco','mucha','mucho','muchas','muchos','varios',
  'varias','durante','ante','bajo','contra','hasta','mediante','tras','sobre','según','desde',
  'hacia','vía','muy','casi','quizá','quizás','acaso','tal','también','siquiera','ambos',
  'cualquier','cuando','como','donde','porque','pues','sino','mas','sea','tanto','cuanto',
  'etc','es','ser','son','eres','somos','soy','era','eras','éramos','eran','www','https','http'
]);

const SUFFIXES = ['mente','ción','sión','miento','mientos','mienta','mientas',
  'ando','iendo','ador','adora','adores','adoras','ante','antes','anza','anzas',
  'azgo','azgos','ísimo','ísima','ísimos','ísimas','ciónes','siones',
  'aba','ada','ido','ido','ido','aba','ías','ías','ar','er','ir','ado','ido',
  'ando','iendo','a','o','os','as','es','e','os','an','mos','ste','ron','ré',
  'rás','rá','remos','réis','rán','ría','rías','ríamos','ríais','rían',
  'se','le','lo','la','los','las', 'dad','dades','ble','bles','ción','ciones',
  'ista','istas','ismo','ismos','tud','tudes','ario','aria','arios','arias',
  'ero','era','eros','eras','dor','dora','dores','doras','tor','tora','sor','sora',
  'ivo','iva','ivos','ivas','izo','iza','izos','izas'];

const SYNONYMS = {
  'ordena':'computador','ordenado':'computador','laptop':'computador','pc':'computador','portatil':'computador',
  'movil':'telefono','celular':'telefono','smartphone':'telefono','iphone':'telefono','android':'telefono',
  'program':'codigo','software':'program','desarroll':'program',
  'web':'internet','sitio':'internet','pagina':'internet','naveg':'internet',
  'coche':'auto','carro':'auto','automovil':'auto','vehiculo':'auto',
  'empleo':'trabajo','labor':'trabajo','profesion':'trabajo','oficio':'trabajo',
  'casa':'hogar','vivienda':'hogar','domicilio':'hogar','residencia':'hogar',
  'enfermo':'enfermedad','malestar':'enfermedad','dolenci':'enfermedad',
  'medic':'salud','sanidad':'salud','saludable':'salud',
  'pais':'nacion','nacion':'pais','territorio':'pais',
  'chico':'joven','muchacho':'joven','adolescent':'joven',
  'alimento':'comida','comestible':'comida','nutricion':'comida',
  'edu':'aprender','enseñ':'aprender','formacion':'aprender',
  'inteligenci':'ia','ia':'inteligencia',
  'robot':'ia','automat':'ia','algoritm':'program',
  'estrell':'sol','lumin':'sol','solar':'sol',
  'numer':'matematicas','calculo':'matematicas','suma':'matematicas',
  'hablar':'idioma','lengua':'idioma','lingu':'idioma',
  'perro':'animal','gato':'animal','mascot':'animal','can':'animal','felin':'animal',
  'ave':'pajaro','pajaro':'ave',
  'arbol':'planta','arbol':'vegetal','flor':'planta','hierb':'planta',
  'hermos':'belleza','bell':'belleza','lind':'belleza','bonit':'belleza',
  'rapid':'velocidad','lent':'velocidad','veloz':'velocidad',
  'feliz':'alegria','content':'alegria','dichos':'alegria','goz':'alegria',
  'trist':'tristeza','apen':'tristeza','melanco':'tristeza',
  'enfad':'enojo','rabia':'enojo','furios':'enojo','enoj':'enojo',
  'temer':'miedo','pav':'miedo','terror':'miedo','pánico':'miedo',
  'amabl':'amable','gentil':'amable','cortes':'amable',
  'inteligent':'inteligencia','list':'inteligencia','brillant':'inteligencia',
  'fuert':'fuerza','podero':'fuerza','robust':'fuerza',
  'debil':'debilidad','fragil':'debilidad','delic':'debilidad',
  'guerr':'guerra','conflict':'guerra','batall':'guerra','contiend':'guerra',
  'paz':'pacifico','armonia':'paz','tranquil':'paz',
  'cancion':'musica','melodia':'musica','ritm':'musica','sonid':'musica',
  'pelicul':'cine','film':'cine','peli':'cine',
  'cocin':'cocina','cocin':'receta','gastronom':'cocina','chef':'cocina',
  'amig':'amistad','amist':'amistad','camarad':'amistad','cumpa':'amistad',
  'famil':'familia','parient':'familia','hogar':'familia',
  'viaj':'viaje','turism':'viaje','vacacion':'viaje','destin':'viaje',
  'deport':'deporte','atlet':'deporte','ejercici':'deporte','entren':'deporte',
  'futbol':'deporte','tenis':'deporte','baloncest':'deporte','beisbol':'deporte',
  'nad':'deporte','corr':'deporte',
  'diner':'finanza','ahorr':'finanza','inver':'finanza','econ':'finanza','presupuest':'finanza',
  'ahorr':'ahorro','inver':'inversion','gast':'gasto','ingres':'ingreso',
  'compr':'compra','vend':'venta','comerci':'comercio','negar':'negocio',
  'bell':'arte','pintur':'arte','escultur':'arte','muse':'arte','galeri':'arte',
  'literatur':'lectura','novel':'lectura','libro':'lectura','autor':'lectura','escrit':'lectura',
  'poem':'poesia','vers':'poesia','poet':'poesia','rima':'poesia',
  'dios':'religion','religio':'religion','creenci':'religion','espiritual':'religion','fe':'religion',
  'filosofo':'filosofia','pensador':'filosofia','sabiduria':'filosofia',
  'consej':'consejo','recomend':'consejo','sugerencia':'consejo','tips':'consejo',
  'truc':'consejo','tip':'consejo','truco':'consejo'
};

function tok(text) {
  if (!text) return [];
  return text.toLowerCase().match(/[a-záéíóúüñ]+/g) || [];
}

function remSW(tokens) {
  return tokens.filter(t => t.length > 1 && !SW.has(t));
}

function stem(w) {
  if (w.length < 4) return w;
  if (SYNONYMS[w]) return SYNONYMS[w];
  for (const s of SUFFIXES) {
    if (w.endsWith(s) && w.length - s.length >= 3) return w.slice(0, -s.length);
  }
  return w;
}

function bigrams(tokens) {
  const b = [];
  for (let i = 0; i < tokens.length - 1; i++) b.push(tokens[i] + '_' + tokens[i + 1]);
  return b;
}

function proc(text) {
  if (!text) return [];
  const t = tok(text);
  const f = remSW(t);
  const st = f.map(stem);
  const bg = bigrams(tok(text));
  const stbg = remSW(bg).map(b => b.split('_').map(stem).join('_'));
  return [...st, ...stbg.filter(s => s.length > 1)];
}

function kw(text) {
  const p = proc(text);
  const freq = {};
  for (const w of p) freq[w] = (freq[w] || 0) + 1;
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).map(e => e[0]);
}

function intent(text) {
  const l = text.toLowerCase().trim();
  if (/(^|\s)(hola|buen[oa]|saludo|hey|que tal|que tal|como estas|cómo estás)/.test(l)) return 'greeting';
  if (/^(gracias|muchas gracia|te agradezco|se agradece|graci|thank)/.test(l)) return 'thanks';
  if (/(adiós|chao|hasta luego|nos vemos|bye|hasta pronto|cuídate)/.test(l) && !/\?/.test(l)) return 'farewell';
  if (/^(quien eres|qué eres|que eres|quien eres|que puedes|qué puede|que haces|qué hac)/.test(l)) return 'about';
  if (/^(bien|estoy bien|bien y tu|bien y tú|todo bien|genial|excelente)/.test(l)) return 'fine';
  if (/\?/.test(l) || /^(qué |que |cómo |como |cuál |cual |dónde |donde |quien |cuándo |cuando |por qué|porque |para qué|hay |sabes |conoces |puede|podrías|podria|cuentame|explica|dime|define|significa)/.test(l)) return 'question';
  if (/^(cuenta|dime|dígame|quiero|quisiera|necesito|puedes|podrias)/.test(l)) return 'request';
  if (/^(no|naa|nop|pus|pss|no sé|no sab)/.test(l)) return 'negative';
  if (/^(si|sí|ok|vale|de acuerdo|claro|bueno|dale|sip|simon|simón)/.test(l)) return 'affirmative';
  if (/^(quién|quien) (es|era|fue|será)/.test(l)) return 'whos';
  if (/^(dónde|donde) (está|esta|queda|encuentra)/.test(l)) return 'where';
  if (/^(cuándo|cuando) (fue|ocurrió|nació|empezó|comenzó|terminó|sucedió)/.test(l)) return 'when';
  if (/^(cómo|como) (se|hacer|hago|puedo|funciona)/.test(l)) return 'how';
  if (/\b(qué|que) (significa|es el|es la|son los|son las)\b/.test(l)) return 'definition';
  return 'statement';
}

function jaccard(a, b) {
  const sa = new Set(a), sb = new Set(b);
  const inter = new Set([...sa].filter(x => sb.has(x)));
  const union = new Set([...sa, ...sb]);
  return union.size === 0 ? 0 : inter.size / union.size;
}

function overlap(a, b) {
  const sa = new Set(a), sb = new Set(b);
  const inter = new Set([...sa].filter(x => sb.has(x)));
  return Math.min(sa.size, sb.size) === 0 ? 0 : inter.size / Math.min(sa.size, sb.size);
}

function sentiment(text) {
  const pos = ['bien','feliz','alegre','contento','genial','excelente','maravilloso','bueno','bonito','hermoso','fantástico','increíble','mejor','amor','paz','alegría','felicidad','gracias','gusta','encanta','divertido','lindo','perfecto','súper','super','bacán','bacano','chido','padre','pura','vida'];
  const neg = ['mal','triste','enojado','enfadado','molesto','cansado','aburrido','horrible','terrible','feo','malo','peor','odio','rabia','furia','temor','miedo','pánico','horror','asustado','preocupado','deprimido','solo','soledad','llorar','llanto','enfermedad','dolor','sufrir','sufrimiento','tristeza','depresión','ansiedad','estrés','stress','cansancio','fracaso','perder','pérdida','muerte','morir','muerto','desgraci','infeliz','pésimo','fatiga','agotado'];
  const tokens = tok(text);
  const p = tokens.filter(t => pos.some(w => t.includes(w))).length;
  const n = tokens.filter(t => neg.some(w => t.includes(w))).length;
  if (p > n) return 'positive';
  if (n > p) return 'negative';
  return 'neutral';
}

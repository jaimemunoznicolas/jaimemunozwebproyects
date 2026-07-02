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
  'etc','es','ser','son','eres','somos','soy','era','eras','éramos','eran','www','https','http',
  'fue','ir','ido','iba','iban','vaya','vayas','vayamos','vayan','fuera','fuesen','fuese',
  'hubo','hubiera','hubiese','hubieran','hubiesen','hubiéramos','hubiésemos',
  'habré','habrás','habrá','habremos','habréis','habrán','habría','habrías',
  'habríamos','habríais','habrían','estuve','estuviste','estuvo','estuvimos','estuvisteis','estuvieron',
  'estuviera','estuvieras','estuviéramos','estuvieran','estuviese','estuvieses',
  'tuve','tuviste','tuvo','tuvimos','tuvisteis','tuvieron','tuviera','tuvieras',
  'hiciera','hicieras','hiciéramos','hicieran','hiciese','hicieses','hiciésemos',
  'dijo','dijeron','dijera','dijeras','dijéramos','dijeran','dijese','dijesen',
  'ello','ellos','ellas','nos','nosotros','vos','vosotros','uds','ustedes',
  'ningún','ninguna','ningunos','ningunas','algún','alguna','algunos','algunas',
  'cualquier','cualquiera','cualesquiera','quienquiera','sean','fuésemos',
  'ante','bajo','cabe','contra','desde','durante','hacia','hasta','mediante',
  'para','por','según','sin','so','sobre','tras','versus','vía',
  'salvo','excepto','incluso','más','menos','acerca','además','alrededor',
  'apenas','aproximadamente','bastante','cerca','cierto','como','conforme',
  'consigo','cuanto','debajo','delante','demás','dentro','detrás','dondequiera',
  'encima','enfrente','entonces','especialmente','excepto','frente','gracias',
  'incluso','jamás','lejos','mientras','mismísimo','nada','nadie','ni',
  'ninguna parte','no obstante','nunca','pa','pero','po','próximo','pues',
  'punto','qué','quien','quién','quienes','quienés','sino','sí','tal',
  'tampoco','tan','tanto','todo','todos','tras','tras','uh','umm','ah','eh',
  'oh','ajá','claro','vale','bueno','listo','hecho','visto','dicho',
  'primer','primero','primera','segundo','segunda','tercer','tercera',
  'último','última','próximo','próxima','pasado','pasada','presente',
  'primeros','primeras','segundos','segundas','terceros','terceras',
  'mil','millón','millones','billón','billones','trillón','trillones',
  'cien','cientos','ciento','quinientos','quinientas','setecientos',
  'novecientos','ochocientos','seiscientos','trescientos','cuatrocientos',
  'doscientos','doscientas','trescientas','cuatrocientas','quinientas',
  'seiscientas','setecientas','ochocientas','novecientas',
  '1º','2º','3º','4º','5º','6º','7º','8º','9º','10º',
  'primera','segunda','tercera','cuarta','quinta','sexta','séptima','octava',
  'novena','décima','undécima','duodécima',' última','penúltima','anteúltima',
  'antepenúltimo','antepenúltima','susodicho','susodicha','susodichos','susodichas',
  'consabido','consabida','consabidos','consabidas','expresado','expresada',
  'indicado','indicada','mencionado','mencionada'];
const SUFFIXES = [
  'mente','ción','sión','miento','mientos','mienta','mientas',
  'ando','iendo','ador','adora','adores','adoras','ante','antes','anza','anzas',
  'azgo','azgos','ísimo','ísima','ísimos','ísimas','ciónes','siones',
  'aba','ada','ido','ido','ido','aba','ías','ías','ar','er','ir','ado','ido',
  'ando','iendo','a','o','os','as','es','e','os','an','mos','ste','ron','ré',
  'rás','rá','remos','réis','rán','ría','rías','ríamos','ríais','rían',
  'se','le','lo','la','los','las','dad','dades','ble','bles','ción','ciones',
  'ista','istas','ismo','ismos','tud','tudes','ario','aria','arios','arias',
  'ero','era','eros','eras','dor','dora','dores','doras','tor','tora','sor','sora',
  'ivo','iva','ivos','ivas','izo','iza','izos','izas',
  'dura','duras','dero','dera','deros','deras','tero','tera','teros','teras',
  'anejo','aneja','anejos','anejas','engo','enga','engos','engas',
  'eza','ezas','izo','iza','izos','izas','izo','iza','izos','izas',
  'ito','ita','itos','itas','ico','ica','icos','icas','illo','illa','illos','illas',
  'uelo','uela','uelos','uelas','ucho','ucha','uchos','uchas','azo','aza','azos','azas',
  'ote','ota','otes','otas','ón','ona','ones','onas',
  'ís','éis','áis','és','ás','ó','á','é','í'
];
const SYN = {
  'ordenador':'computadora','computador':'computadora','laptop':'computadora','pc':'computadora','portatil':'computadora',
  'movil':'telefono','celular':'telefono','smartphone':'telefono','iphone':'telefono','android':'telefono','móvil':'telefono',
  'programa':'codigo','software':'programa','desarrollo':'programa','desarrolla':'programa',
  'web':'internet','sitio':'internet','pagina':'internet','navega':'internet','página':'internet',
  'coche':'auto','carro':'auto','automovil':'auto','vehiculo':'auto','auto':'auto',
  'empleo':'trabajo','labor':'trabajo','profesion':'trabajo','oficio':'trabajo','trabaja':'trabajo','trabaj':'trabajo',
  'casa':'hogar','vivienda':'hogar','domicilio':'hogar','residencia':'hogar',
  'enfermo':'enfermedad','malestar':'enfermedad','dolencia':'enfermedad','dolen':'enfermedad',
  'medicina':'salud','sanidad':'salud','saludable':'salud','médic':'salud',
  'pais':'nacion','nacion':'pais','territorio':'pais','país':'nacion',
  'chico':'joven','muchacho':'joven','adolescente':'joven','jóven':'joven','joven':'joven',
  'alimento':'comida','comestible':'comida','nutricion':'comida','aliment':'comida',
  'educacion':'aprender','enseñanza':'aprender','formacion':'aprender','educ':'aprender','enseñ':'aprender','aprend':'aprender',
  'inteligencia':'ia','ia':'inteligencia','iai':'inteligencia',
  'robot':'ia','automatizacion':'ia','algoritmo':'programa',
  'estrella':'sol','luminosidad':'sol','solar':'sol','luminos':'sol',
  'numero':'matematicas','calculo':'matematicas','suma':'matematicas','numer':'matematicas',
  'hablar':'idioma','lengua':'idioma','linguistica':'idioma','lengu':'idioma',
  'perro':'animal','gato':'animal','mascota':'animal','canino':'animal','felino':'animal','can':'animal',
  'ave':'pajaro','pajaro':'ave','pájaro':'ave',
  'arbol':'planta','vegetal':'planta','flor':'planta','hierba':'planta','árbol':'planta',
  'hermoso':'belleza','belleza':'belleza','lindo':'belleza','bonito':'belleza','hermos':'belleza',
  'rapido':'velocidad','lento':'velocidad','veloz':'velocidad','rápid':'velocidad',
  'feliz':'alegria','contento':'alegria','dichoso':'alegria','gozo':'alegria','felic':'alegria',
  'triste':'tristeza','apenado':'tristeza','melancolia':'tristeza','trist':'tristeza',
  'enfadado':'enojo','rabia':'enojo','furioso':'enojo','enojado':'enojo','enfad':'enojo','furios':'enojo',
  'temeroso':'miedo','pavor':'miedo','terrorifico':'miedo','panico':'miedo','terror':'miedo','atemoriz':'miedo',
  'amable':'gentileza','gentil':'gentileza','cortes':'gentileza',
  'inteligente':'inteligencia','listo':'inteligencia','brillante':'inteligencia','genial':'inteligencia',
  'fuerte':'fuerza','poderoso':'fuerza','robusto':'fuerza','fortalez':'fuerza',
  'debil':'debilidad','fragil':'debilidad','delicado':'debilidad','debilit':'debilidad',
  'guerra':'conflicto','conflicto':'guerra','batalla':'guerra','contienda':'guerra','combat':'guerra','belic':'guerra',
  'paz':'armonia','armonia':'paz','tranquilidad':'paz','pacífic':'paz',
  'cancion':'musica','melodia':'musica','ritmo':'musica','sonido':'musica','canción':'musica',
  'pelicula':'cine','film':'cine','peli':'cine','película':'cine',
  'cocina':'cocinar','receta':'cocinar','gastronomia':'cocinar','chef':'cocinar','cocinero':'cocinar',
  'amigo':'amistad','amistad':'amistad','camarada':'amistad','compa':'amistad','cuate':'amistad','amig':'amistad',
  'familia':'familia','pariente':'familia','familiar':'familia',
  'viaje':'viajar','turismo':'viajar','vacaciones':'viajar','destino':'viajar','viaj':'viajar',
  'deporte':'deporte','atleta':'deporte','ejercicio':'deporte','entrenamiento':'deporte','atlet':'deporte',
  'futbol':'deporte','tenis':'deporte','baloncesto':'deporte','beisbol':'deporte','natacion':'deporte',
  'nadar':'deporte','correr':'deporte',
  'dinero':'finanza','ahorro':'finanza','inversion':'finanza','economia':'finanza','presupuesto':'finanza','económic':'finanza',
  'ahorr':'ahorro','invert':'inversion','gasto':'gasto','ingreso':'ingreso',
  'compra':'comercio','venta':'comercio','comercio':'comercio','negocio':'comercio','mercad':'comercio','comerc':'comercio',
  'arte':'artistico','pintura':'artistico','escultura':'artistico','museo':'artistico','galeria':'artistico',
  'literatura':'lectura','novela':'lectura','libro':'lectura','autor':'lectura','escritor':'lectura',
  'poema':'poesia','verso':'poesia','poeta':'poesia','rima':'poesia','poem':'poesia',
  'dios':'religion','religion':'religion','creencia':'religion','espiritualidad':'religion','fe':'religion','religios':'religion',
  'filosofo':'filosofia','pensador':'filosofia','sabiduria':'filosofia','filosof':'filosofia',
  'consejo':'consejo','recomendacion':'consejo','sugerencia':'consejo','consej':'consejo','recomend':'consejo',
  'truco':'consejo','tip':'consejo',
  'computacion':'informatica','ordenadores':'informatica','sistemas':'informatica',
  'circuito':'electronica','chip':'electronica','microchip':'electronica','transistor':'electronica',
  'atom':'quimica','molecula':'quimica','elemento':'quimica','compuesto':'quimica','reaccion':'quimica',
  'planeta':'astronomia','galaxia':'astronomia','universo':'astronomia','cosmo':'astronomia','espaci':'astronomia',
  'rey':'monarquia','reina':'monarquia','emperador':'monarquia','imperio':'monarquia','corona':'monarquia',
  'presidente':'politica','gobierno':'politica','politica':'politica','democraci':'politica',
  'historiador':'historia','historia':'historia','cronica':'historia','históric':'historia',
  'montaña':'geografia','rio':'geografia','lago':'geografia','oceano':'geografia','mares':'geografia',
  'cancer':'enfermedad','diabetes':'enfermedad','alzheimer':'enfermedad','parkinson':'enfermedad',
  'corazon':'salud','pulmon':'salud','cerebro':'salud','higado':'salud','riñon':'salud',
  'violin':'instrumento','guitarra':'instrumento','piano':'instrumento','bateria':'instrumento','flauta':'instrumento',
  'arquitectura':'edificio','construccion':'edificio','ingenieria':'edificio',
  'escuela':'educacion','universidad':'educacion','colegio':'educacion','academia':'educacion',
  'bosque':'naturaleza','selva':'naturaleza','jungla':'naturaleza','sabana':'naturaleza','tundra':'naturaleza',
  'heroe':'mitologia','mito':'mitologia','leyenda':'mitologia','dios':'mitologia',
  'nobel':'premio','oscar':'premio','grammy':'premio','galardon':'premio',
  'idiota':'insulto','tonto':'insulto','estupido':'insulto','imbecil':'insulto','mentecat':'insulto',
  'broma':'humor','chiste':'humor','risa':'humor','comedia':'humor','gracios':'humor',
  'deuda':'credito','prestamo':'credito','hipoteca':'credito','credito':'credito',
  'seguro':'proteccion','garantia':'proteccion','cobertura':'proteccion',
  'sabio':'conocimiento','erudito':'conocimiento','sabidur':'conocimiento','conoc':'conocimiento',
  'lider':'liderazgo','jefe':'liderazgo','director':'liderazgo','capitan':'liderazgo','comand':'liderazgo',
  'abogado':'derecho','juez':'derecho','ley':'derecho','legal':'derecho','justici':'derecho',
  'medico':'doctor','doctor':'doctor','cirujano':'doctor','pediatra':'doctor','psiquiatra':'doctor',
  'terrorismo':'seguridad','violencia':'seguridad','crimen':'seguridad','delito':'seguridad',
  'pintor':'artista','escultor':'artista','dibujante':'artista','ilustrador':'artista',
  'actor':'actuacion','actriz':'actuacion','actuacion':'actuacion','actu':'actuacion',
  'bailar':'danza','bailarin':'danza','danza':'danza','ball':'danza',
  'cantante':'canto','canto':'canto','vocalista':'canto',
  'director':'cineasta','productor':'cineasta','guionista':'cineasta',
  'periodista':'comunicacion','reportero':'comunicacion','noticia':'comunicacion','medios':'comunicacion',
  'madera':'material','metal':'material','plastico':'material','ceramica':'material','vidrio':'material',
  'deportista':'atleta','gimnasta':'atleta','nadador':'atleta','corredor':'atleta',
  'mariposa':'insecto','abeja':'insecto','hormiga':'insecto','mosca':'insecto','escarabajo':'insecto',
  'leon':'felino','tigre':'felino','pantera':'felino','leopardo':'felino','guepardo':'felino',
  'lobo':'canino','zorro':'canino','coyote':'canino','perro':'canino',
  'ballena':'mamifero','delfin':'mamifero','foca':'mamifero','morsa':'mamifero',
  'aguila':'rapaz','halcon':'rapaz','buitre':'rapaz','cernicalo':'rapaz','rapaz':'rapaz',
  'tiburon':'pez','sardina':'pez','atun':'pez','salmón':'pez','pez':'pez',
  'rosa':'flor','girasol':'flor','tulipan':'flor','margarita':'flor','orquidea':'flor','clavel':'flor',
  'roble':'arbol','pino':'arbol','cedro':'arbol','sauce':'arbol','palmera':'arbol','eucalipto':'arbol',
  'soltero':'estadocivil','casado':'estadocivil','divorciado':'estadocivil','viudo':'estadocivil',
  'carta':'documento','documento':'documento','archivo':'documento','fichero':'documento',
  'herramienta':'utensilio','instrumento':'utensilio','aparato':'utensilio','dispositivo':'utensilio',
  'cuchillo':'cocina','tenedor':'cocina','cuchara':'cocina','olla':'cocina','sarten':'cocina',
  'destornillador':'bricolaje','martillo':'bricolaje','llave':'bricolaje','taladro':'bricolaje',
  'magia':'ilusionismo','truco':'ilusionismo','ilusionismo':'ilusionismo','mago':'ilusionismo',
  'fantasma':'paranormal','espiritu':'paranormal','ovni':'paranormal','ufo':'paranormal','paranormal':'paranormal',
  'santo':'cristianismo','beato':'cristianismo','martir':'cristianismo','apostol':'cristianismo',
  'profeta':'islam','meca':'islam','coran':'islam','musulman':'islam','islam':'islam',
  'budista':'budismo','nirvana':'budismo','meditacion':'budismo','zen':'budismo',
  'torah':'judaismo','rabino':'judaismo','sinagoga':'judaismo','judio':'judaismo',
  'calendario':'tiempo','fecha':'tiempo','hora':'tiempo','minuto':'tiempo','segundo':'tiempo','reloj':'tiempo',
  'piscina':'natacion','alberca':'natacion',
  'estadio':'deporte','cancha':'deporte','campo':'deporte','pista':'deporte',
  'bosque':'ecosistema','oceano':'ecosistema','desierto':'ecosistema','sabana':'ecosistema','selva':'ecosistema',
  'cactus':'desierto','duna':'desierto','oasis':'desierto',
  'iceberg':'polo','glaciar':'polo','polo':'polo','antartida':'polo','artico':'polo',
  'volcan':'montaña','erupcion':'montaña','lava':'montaña','magma':'montaña',
  'tsunami':'desastre','terremoto':'desastre','huracan':'desastre','tornado':'desastre','inundacion':'desastre',
  'bombero':'emergencia','policia':'emergencia','ambulancia':'emergencia','samu':'emergencia','proteccion civil':'emergencia',
  'petroleo':'energia','gas':'energia','carbon':'energia','combustible':'energia','gasolina':'energia',
  'nuclear':'energia','fision':'energia','fusion':'energia','radiactivo':'energia','uranio':'energia',
  'satelite':'comunicacion','antena':'comunicacion','radar':'comunicacion','gps':'comunicacion',
  'cohete':'nave','transbordador':'nave','astronave':'nave','capsula':'nave',
  'astronauta':'espacio','cosmonauta':'espacio','tripulante':'espacio',
  'telescopio':'observacion','microscopio':'observacion','lupa':'observacion','periscopio':'observacion',
  'certificado':'titulo','diploma':'titulo','grado':'titulo','master':'titulo','doctorado':'titulo',
  'pasaporte':'viaje','visa':'viaje','visado':'viaje','documentacion':'viaje',
  'hotel':'alojamiento','hostal':'alojamiento','hostel':'alojamiento','albergue':'alojamiento',
  'crucero':'barco','velero':'barco','yate':'barco','buque':'barco','navio':'barco',
  'avion':'aereo','helicoptero':'aereo','aeroplano':'aereo','aereo':'aereo',
  'tren':'ferrocarril','metro':'ferrocarril','tranvia':'ferrocarril','ferrocarril':'ferrocarril',
  'bicicleta':'transporte','moto':'transporte','patinete':'transporte',
  'autobus':'transporte','camion':'transporte','taxi':'transporte','uber':'transporte',
  'carretera':'via','autopista':'via','calle':'via','camino':'via','senda':'via',
  'puente':'infraestructura','tunel':'infraestructura','presa':'infraestructura','canal':'infraestructura',
  'ladrillo':'construccion','cemento':'construccion','hormigon':'construccion','acero':'construccion',
  'ascensor':'edificio','escalera':'edificio','rampa':'edificio',
  'ventana':'casa','puerta':'casa','techo':'casa','suelo':'casa','pared':'casa',
  'dormitorio':'habitacion','cocina':'habitacion','baño':'habitacion','salon':'habitacion','comedor':'habitacion',
  'sofa':'mueble','mesa':'mueble','silla':'mueble','armario':'mueble','cama':'mueble','estanteria':'mueble',
  'nevera':'electrodomestico','lavadora':'electrodomestico','microondas':'electrodomestico','horno':'electrodomestico',
  'aspiradora':'limpieza','fregona':'limpieza','escoba':'limpieza','recogedor':'limpieza',
  'jabon':'higiene','champu':'higiene','pasta':'higiene','desodorante':'higiene','colonia':'higiene',
  'camiseta':'ropa','pantalon':'ropa','chaqueta':'ropa','zapatos':'ropa','vestido':'ropa','abrigo':'ropa',
  'algodon':'tela','lana':'tela','seda':'tela','lino':'tela','poliester':'tela','nylon':'tela',
  'bolso':'accesorio','cartera':'accesorio','reloj':'accesorio','gafas':'accesorio','sombrero':'accesorio',
  'anillo':'joya','collar':'joya','pulsera':'joya','pendiente':'joya','broche':'joya',
  'futbolista':'futbol','delantero':'futbol','defensa':'futbol','portero':'futbol','centrocampista':'futbol',
  'baloncestista':'baloncesto','base':'baloncesto','alero':'baloncesto','pivot':'baloncesto',
  'tenista':'tenis','raqueta':'tenis','pelota':'tenis','set':'tenis','grand slam':'tenis',
  'nadador':'natacion','braza':'natacion','crol':'natacion','espalda':'natacion','mariposa':'natacion',
  'gimnasta':'gimnasia','voltereta':'gimnasia','acrobacia':'gimnasia','barra':'gimnasia',
  'ciclista':'ciclismo','etapa':'ciclismo','tour':'ciclismo','maillot':'ciclismo',
  'boxeador':'boxeo','ring':'boxeo','puñetazo':'boxeo','guante':'boxeo',
  'luchador':'lucha','llave':'lucha','combate':'lucha','wrestling':'lucha',
  'karateca':'karate','cinta':'karate','kat':'karate','kumite':'karate',
  'judoka':'judo','tatami':'judo','i.':'judo',
  'esquiador':'esqui','pista':'esqui','snowboard':'esqui','remonte':'esqui',
  'surfista':'surf','ola':'surf','tabla':'surf','pico':'surf',
  'escalador':'escalada','roca':'escalada','pared':'escalada','rapel':'escalada','arnes':'escalada',
  'ajedrez':'tablero','tablero':'ajedrez','pieza':'ajedrez','jaque':'ajedrez','mate':'ajedrez',
  'videojuego':'juego','consola':'juego','pc':'juego','steam':'juego','playstation':'juego',
  'dado':'azar','probabilidad':'azar','suerte':'azar','aleatorio':'azar',
  'moneda':'divisa','euro':'divisa','dolar':'divisa','libra':'divisa','yen':'divisa','peso':'divisa',
  'oro':'metal','plata':'metal','cobre':'metal','hierro':'metal','aluminio':'metal','bronce':'metal',
  'diamante':'piedra','rubi':'piedra','esmeralda':'piedra','zafiro':'piedra','joya':'piedra',
  'pizarra':'escuela','tiza':'escuela','aula':'escuela','profesor':'escuela','alumno':'escuela',
  'biblioteca':'lectura','libreria':'lectura','estanteria':'lectura',
  'carta':'correspondencia','sello':'correspondencia','buzon':'correspondencia','cartero':'correspondencia',
  'telegrama':'comunicacion','fax':'comunicacion','telegrafo':'comunicacion',
  'internet':'red','wifi':'red','ethernet':'red','conexion':'red','router':'red',
  'contraseña':'seguridad','clave':'seguridad','password':'seguridad','pin':'seguridad',
  'virus':'malware','antivirus':'malware','troyano':'malware','spyware':'malware','ransomware':'malware',
  'servidor':'informatica','cliente':'informatica','backup':'informatica','nube':'informatica',
  'base':'datos','sql':'datos','mysql':'datos','mongodb':'datos','oracle':'datos',
  'javascript':'lenguaje','python':'lenguaje','java':'lenguaje','c++':'lenguaje','rust':'lenguaje',
  'html':'web','css':'web','frontend':'web','backend':'web','fullstack':'web',
  'app':'aplicacion','aplicacion':'aplicacion','programa':'aplicacion','software':'aplicacion',
  'inteligencia':'ia','artificial':'ia','machine':'ia','deep':'ia','red neuronal':'ia',
  'chatgpt':'ia','copilot':'ia','gemini':'ia','claude':'ia',
  'facebook':'redsocial','instagram':'redsocial','twitter':'redsocial','tiktok':'redsocial',
  'whatsapp':'redsocial','telegram':'redsocial','signal':'redsocial',
  'youtube':'redsocial','twitch':'redsocial','linkedin':'redsocial',
  'apple':'empresa','microsoft':'empresa','google':'empresa','amazon':'empresa','meta':'empresa',
  'tesla':'empresa','sony':'empresa','samsung':'empresa','nintendo':'empresa',
  'accion':'bolsa','etf':'bolsa','sp500':'bolsa','nasdaq':'bolsa','ibex':'bolsa',
  'bitcoin':'cripto','ethereum':'cripto','solana':'cripto','cardano':'cripto','blockchain':'cripto',
  'pension':'jubilacion','jubilacion':'jubilacion','retiro':'jubilacion',
  'alquiler':'vivienda','hipoteca':'vivienda','propiedad':'vivienda','inmueble':'vivienda',
  'contrato':'trabajo','salario':'trabajo','sueldo':'trabajo','nomina':'trabajo',
  'curriculum':'trabajo','entrevista':'trabajo','carta presentacion':'trabajo',
  'emprendedor':'negocio','startup':'negocio','empresa':'negocio','pyme':'negocio',
  'ong':'voluntariado','fundacion':'voluntariado','sin fines de lucro':'voluntariado',
  'donacion':'caridad','solidaridad':'caridad','voluntario':'caridad',
  'matrimonio':'boda','boda':'boda','aniversario':'boda','luna de miel':'boda',
  'cumpleaños':'celebracion','fiesta':'celebracion','festejo':'celebracion',
  'funeral':'muerte','entierro':'muerte','velatorio':'muerte','duelo':'muerte',
  'bautizo':'sacramento','comunion':'sacramento','confirmacion':'sacramento',
  'carnaval':'fiesta','feria':'fiesta','procesion':'fiesta','romeria':'fiesta',
  'año nuevo':'fiesta','navidad':'fiesta','semana santa':'fiesta','ramadan':'fiesta',
  'halloween':'fiesta','san valentin':'fiesta','dia madre':'fiesta','dia padre':'fiesta',
  'independencia':'patria','himno':'patria','bandera':'patria','patriotismo':'patria',
  'himno':'musica','letra':'musica','partitura':'musica','compositor':'musica',
  'orquesta':'musica','sinfonia':'musica','concierto':'musica','opera':'musica',
  'jazz':'musica','blues':'musica','rock':'musica','pop':'musica','reggaeton':'musica',
  'salsa':'musica','bachata':'musica','merengue':'musica','cumbia':'musica','vallenato':'musica',
  'tango':'musica','flamenco':'musica','rumba':'musica','buleria':'musica',
  'rap':'musica','hiphop':'musica','trap':'musica','reggae':'musica','dancehall':'musica',
  'electronica':'musica','house':'musica','techno':'musica','trance':'musica','dubstep':'musica',
  'beethoven':'compositor','mozart':'compositor','bach':'compositor','vivaldi':'compositor',
  'michael jackson':'artista','madonna':'artista','prince':'artista','queen':'artista',
  'los beatles':'artista','rolling stones':'artista','pink floyd':'artista','led zeppelin':'artista',
  'beyonce':'artista','taylor swift':'artista','ed sheeran':'artista','billie eilish':'artista',
  'bad bunny':'artista','daddy yankee':'artista','ozuna':'artista','j balvin':'artista',
  'shakira':'artista','juanes':'artista','carlos vives':'artista','romeo santos':'artista',
  'dibujo':'arte','pintura':'arte','acuarela':'arte','oleo':'arte','pastel':'arte','carboncillo':'arte',
  'fotografia':'imagen','camara':'imagen','lente':'imagen','revelado':'imagen','digital':'imagen',
  'escultura':'arte','talla':'arte','fundicion':'arte','modelado':'arte',
  'grabado':'arte','litografia':'arte','xilografia':'arte','serigrafia':'arte',
  'mosaico':'arte','vidriera':'arte','fresco':'arte','icono':'arte',
  'renacimiento':'epoca','barroco':'epoca','rococo':'epoca','neoclasico':'epoca',
  'impresionismo':'epoca','cubismo':'epoca','surrealismo':'epoca','expresionismo':'epoca',
  'picasso':'artista','van gogh':'artista','dali':'artista','gaudin':'artista',
  'frida':'artista','rivera':'artista','botero':'artista','kahlo':'artista',
  'da vinci':'artista','miguel angel':'artista','rafael':'artista','donatello':'artista',
  'velazquez':'artista','goya':'artista','el greco':'artista','murillo':'artista',
  'monet':'artista','renoir':'artista','degas':'artista','manet':'artista',
  'platon':'filosofo','aristoteles':'filosofo','socrates':'filosofo','nietzsche':'filosofo',
  'kant':'filosofo','descartes':'filosofo','hegel':'filosofo','locke':'filosofo',
  'hobbes':'filosofo','rousseau':'filosofo','voltaire':'filosofo','marx':'filosofo',
  'freud':'psicologo','jung':'psicologo','piaget':'psicologo','pavlov':'psicologo',
  'newton':'cientifico','einstein':'cientifico','darwin':'cientifico','curie':'cientifico',
  'pasteur':'cientifico','tesla':'cientifico','hawking':'cientifico','galileo':'cientifico',
  'edison':'inventor','bell':'inventor','gutenberg':'inventor','watt':'inventor',
  'colon':'explorador','magallanes':'explorador','pizarro':'explorador','cortes':'explorador',
  'alejandro':'militar','napoleon':'militar','cesar':'militar','anibal':'militar',
  'gandhi':'lider','mandela':'lider','luther king':'lider','madre teresa':'lider',
  'cleopatra':'gobernante','isabel':'gobernante','catalina':'gobernante','victoria':'gobernante',
  'sigmund':'psicologia','freud':'psicologia','psicolog':'psicologia',
  'depresion':'saludmental','ansiedad':'saludmental','estres':'saludmental','bipolar':'saludmental',
  'autismo':'saludmental','tdah':'saludmental','esquizofrenia':'saludmental','trastorno':'saludmental',
  'terapia':'saludmental','psicologo':'saludmental','psiquiatra':'saludmental','consejeria':'saludmental',
  'yoga':'relajacion','meditacion':'relajacion','mindfulness':'relajacion','respira':'relajacion',
  'masaje':'relajacion','spa':'relajacion','sauna':'relajacion','baño termal':'relajacion',
  'acupuntura':'medicina','homeopatia':'medicina','naturopatia':'medicina','ayurveda':'medicina',
  'menopausia':'salud','embarazo':'salud','parto':'salud','lactancia':'salud','fertilidad':'salud',
  'anticonceptivo':'salud','preservativo':'salud','pastilla':'salud','diu':'salud',
  'vacuna':'salud','inyeccion':'salud','suero':'salud','transfusion':'salud',
  'antibiotico':'medicamento','analgesico':'medicamento','antiinflamatorio':'medicamento',
  'paracetamol':'medicamento','ibuprofeno':'medicamento','aspirina':'medicamento',
  'alergia':'salud','asma':'salud','diabetes':'salud','hipertension':'salud',
  'colesterol':'salud','obesidad':'salud','anemia':'salud','tiroides':'salud',
  'fractura':'hueso','esguince':'hueso','luxacion':'hueso','torcedura':'hueso',
  'vendaje':'herida','gasas':'herida','esparadrapo':'herida','tirita':'herida',
  'desmayo':'emergencia','convulsion':'emergencia','infarto':'emergencia','derrame':'emergencia',
  'alergia':'reaccion','anafilaxia':'reaccion','urticaria':'reaccion',
  'mordedura':'animal','picadura':'animal','arañazo':'animal','ponzoña':'animal',
  'congelacion':'frio','hipotermia':'frio','frostbite':'frio',
  'insolacion':'calor','golpe calor':'calor','deshidratacion':'calor',
  'altura':'montaña','mal altura':'montaña','apnea':'montaña','oxigeno':'montaña',
  'brujula':'orientacion','gps':'orientacion','mapa':'orientacion','norte':'orientacion',
  'supervivencia':'supervivencia','superviviente':'supervivencia','naufrago':'supervivencia',
  'sed':'agua','hambre':'comida','inanicion':'comida','ayuno':'comida',
  'yesca':'fuego','pedernal':'fuego','mechero':'fuego','cerilla':'fuego',
  'tienda':'campaña','saco dormir':'campaña','moquilon':'campaña','camping':'campaña',
  'mochila':'equipaje','cantimplora':'equipaje','navaja':'equipaje','linterna':'equipaje',
  'cuerda':'nudo','soga':'nudo','cabo':'nudo','maroma':'nudo',
  'cazar':'caza','pescar':'pesca','trampa':'caza','anzuelo':'pesca',
  'seta':'hongo','champiñon':'hongo','trufa':'hongo','boletus':'hongo',
  'reciclaje':'ambiente','compost':'ambiente','ecologico':'ambiente','organico':'ambiente',
  'contaminacion':'ambiente','polucion':'ambiente','residuo':'ambiente','vertido':'ambiente',
  'energia solar':'renovable','energia eolica':'renovable','biomasa':'renovable','geotermica':'renovable',
  'extincion':'especie','amenazada':'especie','protegida':'especie','conservacion':'especie',
  'nacional':'parque','reserva':'parque','monumento':'parque','patrimonio':'parque'};
const INTENTS = [
  {n:'greeting', p:/(^|\s)(hola|buen[oa]|saludo|hey|que tal|qué tal|cómo estás|como estas|buenas|buen día|buen dia|saludos cordiales|qué hay|que hay|qué onda|que onda|hello|hi)/},
  {n:'thanks', p:/^(gracias|muchas gracias|te agradezco|se agradece|graci|thank you|thanks|agradecido|mil gracias|muchísimas gracias)/},
  {n:'farewell', p:/(adiós|chao|hasta luego|nos vemos|bye|hasta pronto|cuídate|cuidate|hasta la vista|nos vemos luego|hasta otra|ahí nos vemos)/i},
  {n:'about', p:/^(quién eres|quien eres|qué eres|que eres|qué puedes hacer|que puedes hacer|qué haces|que haces|quién te creo|quien te creo)/i},
  {n:'fine', p:/^(bien|estoy bien|bien y tú|bien y tu|todo bien|genial|excelente|muy bien|bastante bien|regular|más o menos|ahí vamos)/i},
  {n:'question', p:/\?|^(qué |que |cómo |como |cuál |cual |dónde |donde |quién |quien |cuándo |cuando |por qué|porque |para qué|hay |sabes |conoces |puedes|podrías|podria|cuéntame|cuentame|explica|dime|defíneme|define|significa)/i},
  {n:'request', p:/^(cuenta|dime|dígame|dígame|quiero|quisiera|necesito|puedes|podrías|podria|me gustaría|recomiéndame|recomiendame|sugiéreme|sugiereme)/i},
  {n:'negative', p:/^(no|naa|nop|pus|pss|no sé|no sab|para nada|en absoluto|quién sabe|quien sabe|nunca|jamás|ni modo)/i},
  {n:'affirmative', p:/^(sí|sí|si|ok|vale|de acuerdo|claro|bueno|dale|sip|simón|simon|por supuesto|desde luego|cierto|así es|exacto|correcto|de una|va|okey|okay|sale vale)/i},
  {n:'whos', p:/^(quién es|quien es|quién era|quien era|quién fue|quien fue|quién será|quien será)/i},
  {n:'where', p:/^(dónde está|donde está|dónde esta|donde esta|dónde queda|donde queda|dónde se encuentra|donde se encuentra)/i},
  {n:'when', p:/^(cuándo fue|cuando fue|cuándo ocurrió|cuando ocurrio|cuándo nació|cuando nacio|cuándo empezó|cuando empezo|cuándo terminó|cuando termino)/i},
  {n:'how', p:/^(cómo se|como se|cómo hacer|como hacer|cómo hago|como hago|cómo puedo|como puedo|cómo funciona|como funciona|cómo se hace|como se hace)/i},
  {n:'definition', p:/\b(qué significa|que significa|qué es |que es |qué son |que son |qué es un|que es un|qué es una|que es una)\b/i},
  {n:'compare', p:/\bdiferencia|diferencias|comparar|comparación|mejor que|peor que|vs |versus\b/i},
  {n:'opinion', p:/^(crees|opinas|piensas|cuál es tu opinión|cuál es tu opinion|qué opinas|que opinas|qué piensas|que piensas)/i},
  {n:'recommend', p:/^(recomiéndame|recomiendame|qué me recomiendas|que me recomiendas|sugiéreme|sugiereme|aconsejame|aconsejame)/i},
  {n:'time', p:/\b(qué hora es|que hora es|hora actual|hora exacta|qué hora tienes|que hora tienes)\b/i},
  {n:'date', p:/\b(qué día es|que dia es|qué fecha|que fecha|día de hoy|fecha actual)\b/i},
  {n:'math', p:/^(cuánto es|cuanto es|calcula|resuelve|haz la operación|resultado de)/i},
  {n:'weather', p:/\b(clima|tiempo|temperatura|pronóstico|lluvia|hará|soleado)\b/i},
  {n:'greeting_time', p:/(buenos días|buenas tardes|buenas noches|buen día|buena tarde|buena noche)/i}
];
function tok(text) {
  if (!text) return [];
  return text.toLowerCase().match(/[a-záéíóúüñ]+/g) || [];
}
function remSW(tokens) {
  return tokens.filter(t => t.length > 1 && !SW.has(t));
}
function stem(w) {
  if (w.length < 4) return w;
  if (SYN[w]) return SYN[w];
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
function trigrams(tokens) {
  const b = [];
  for (let i = 0; i < tokens.length - 2; i++) b.push(tokens[i] + '_' + tokens[i+1] + '_' + tokens[i+2]);
  return b;
}
function proc(text) {
  if (!text) return [];
  const t = tok(text);
  const f = remSW(t);
  const st = f.map(stem);
  const bg = bigrams(tok(text));
  const tg = trigrams(tok(text));
  const stbg = remSW(bg).map(b => b.split('_').map(stem).join('_'));
  const sttg = remSW(tg).map(b => b.split('_').map(stem).join('_'));
  return [...st, ...stbg.filter(s => s.length > 1), ...sttg.filter(s => s.length > 1)];
}
function kw(text) {
  const p = proc(text);
  const freq = {};
  for (const w of p) freq[w] = (freq[w] || 0) + 1;
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).map(e => e[0]);
}
function intent(text) {
  const l = text.toLowerCase().trim();
  for (const {n, p} of INTENTS) {
    if (p.test(l)) return n;
  }
  if (l.startsWith('hola') || l.startsWith('buen') || l.startsWith('hey') || l.startsWith('salud')) return 'greeting';
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
function contain(a, b) {
  const sa = new Set(a), sb = new Set(b);
  const inter = new Set([...sa].filter(x => sb.has(x)));
  return sb.size === 0 ? 0 : inter.size / sb.size;
}
function sentiment(text) {
  const pwords = ['bien','feliz','alegre','contento','genial','excelente','maravilloso','bueno','bonito','hermoso','fantástico','increíble','mejor','amor','paz','alegría','felicidad','gracias','gusta','encanta','divertido','lindo','perfecto','súper','super','bacán','bacano','chido','padre','pura','vida','hermosa','magnífico','espléndido','notable','extraordinario','estupendo','brillante','formidable','interesante','agradable','cómodo','placentero','divertidísimo','buenísimo','fantástico','espectacular','impresionante','precioso','adorable','encantador','inolvidable','emocionante','apasionante','asombroso','grandioso'];
  const nwords = ['mal','triste','enojado','enfadado','molesto','cansado','aburrido','horrible','terrible','feo','malo','peor','odio','rabia','furia','temor','miedo','pánico','horror','asustado','preocupado','deprimido','solo','soledad','llorar','llanto','enfermedad','dolor','sufrir','sufrimiento','tristeza','depresión','ansiedad','estrés','stress','cansancio','fracaso','perder','pérdida','muerte','morir','muerto','desgraciado','infeliz','pésimo','fatiga','agotado','horrendo','asqueroso','repugnante','detestable','aborrecible','odioso','terrible','espantoso','lamentable','deplorable','desastroso','fatal','nefasto','calamitoso','funesto','aborrezco','detesto','desprecio','asco','repulsión'];
  const tokens = tok(text);
  let p = 0, n = 0;
  for (const t of tokens) {
    if (pwords.some(w => t.includes(w))) p++;
    if (nwords.some(w => t.includes(w))) n++;
  }
  const total = tokens.length;
  if (total === 0) return 'neutral';
  const ratio = (p - n) / total;
  if (ratio > 0.1) return 'positive';
  if (ratio < -0.1) return 'negative';
  return 'neutral';
}

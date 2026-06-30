# 🚀 Portafolio de Proyectos — Jaime Muñoz Nicolás

**Un ecosistema web completo donde conviven herramientas útiles, experimentos creativos y proyectos funcionales, todo accesible desde un menú universal con estilo.**

---

## 📋 Índice

1. [¿Qué es este repositorio?](#qué-es-este-repositorio)
2. [Estructura general](#estructura-general)
3. [Menú universal — El hub de navegación](#menú-universal--el-hub-de-navegación)
4. [Proyecto 1: Curriculum Vitae Interactivo](#proyecto-1-curriculum-vitae-interactivo)
5. [Proyecto 2: CyberSafeLine](#proyecto-2-cybersafeline)
6. [Proyecto 3: Tarjetas Gráficas JM (GPU Hub)](#proyecto-3-tarjetas-gráficas-jm-gpu-hub)
7. [Proyecto 4: Ultimate Calculadora](#proyecto-4-ultimate-calculadora)
8. [Tecnologías utilizadas](#tecnologías-utilizadas)
9. [Cómo usar este repositorio](#cómo-usar-este-repositorio)
10. [Licencia](#licencia)

---

## ¿Qué es este repositorio?

Este es el **espacio de trabajo digital** de Jaime Muñoz Nicolás, un estudiante de informática apasionado por el desarrollo web. Aquí no encontrarás un proyecto único, sino **cuatro proyectos distintos** que conviven bajo un mismo techo, cada uno con su propia personalidad, funcionalidad y propósito.

La idea principal es sencilla: desde una **página principal estilo portafolio** puedes acceder a cualquiera de los proyectos con un solo clic. Cada proyecto es completamente independiente, tiene sus propios archivos, su propio estilo y no depende de los demás para funcionar.

Pero lo mejor es que **no tienes que elegir uno solo**: puedes saltar del currículum a la calculadora, de la calculadora al comparador de GPUs, y de ahí a la web de ciberseguridad, todo desde el mismo lugar.

---

## Estructura general

```
📁 jaimemunozwebproyects/
│
├── 📄 index.html              ← Menú universal (página principal)
├── 📄 styles.css               ← Estilos del menú
├── 📄 app.js                   ← Lógica del menú (partículas, buscador, tarjetas)
│
├── 📁 Curriculum/              ← CV interactivo con descarga PDF
│   ├── curriculum.html, .css, .js
│   └── foto.png
│
├── 📁 CyberSafeLine/           ← Web corporativa de ciberseguridad
│   ├── index.html, styles.css, script.js
│   ├── legal.html
│   ├── Logo.png, Logotipo.png, icono.png, plano.png
│   └── *.jpg (fotos de sedes)
│
├── 📁 TarjetasGraficas-JM/     ← Hub de GPUs con comparador, ranking y foro
│   └── public/
│       ├── *.html (9 páginas)
│       ├── css/styles.css
│       ├── js/ (12 archivos)
│       ├── img/ (GPU images)
│       ├── firebase.json
│       └── X/ (zona secreta con juegos retro)
│
├── 📁 ultimatecalculadora/     ← Calculadora con 7 modos
│   ├── index.html, styles.css, app.js
│
├── 📄 LICENSE                  ← Licencia MIT
└── 📄 README.md                ← Este documento
```

---

## Menú universal — El hub de navegación

**Archivos**: `index.html`, `styles.css`, `app.js`

### ¿Qué es?

Imagina un **centro de control** desde el que puedes lanzar cualquier proyecto. Eso es exactamente el menú universal. No es una página de presentación al uso, sino un **lanzador visual** con personalidad propia.

### Diseño y ambiente

Cuando entras, lo primero que notas es el **fondo animado**: un lienzo de canvas donde flotan más de un centenar de partículas que se mueven con suavidad, conectándose entre sí con líneas tenues cuando están cerca. Si mueves el ratón, las partículas **reaccionan** apartándose ligeramente de tu cursor y luego volviendo a su sitio, como si fueran diminutas estrellas conscientes de tu presencia.

### El avatar con truco

En el centro, un círculo con degradado violeta muestra las iniciales **JM**. Pero si haces clic sobre él, ocurre la magia: el círculo **gira en 3D** con una animación elástica y muestra tu foto real. Un clic más y vuelve a las iniciales. Es un detalle pequeño, pero le da un toque interactivo y personal que invita a jugar.

### Buscador en vivo

Conforme escribes en el campo de búsqueda, los proyectos se filtran al instante. No hay botón de buscar, no hay recarga de página. El contador de la esquina se actualiza solo para mostrar cuántos proyectos coinciden con lo que buscas.

### Las tarjetas de proyecto

Cada proyecto se muestra como una **tarjeta** con:
- Un **icono grande** que identifica el proyecto (📄, 🛡️, 🎮, 🧮)
- El **nombre** del proyecto
- Una **descripción breve** pero informativa
- **Etiquetas técnicas** que indican las tecnologías usadas (HTML, CSS, JS)
- Una **flecha** que invita a entrar

Cuando pasas el ratón por encima, la tarjeta se eleva ligeramente, aparece una **barra de colores** en la parte superior con un degradado que se despliega desde la izquierda, y un **glow sutil** sigue la posición de tu ratón como si la tarjeta estuviera viva.

### Enlace a Linktree

Debajo de los proyectos hay un enlace pequeño pero visible a **linktr.ee/jaimemunoznicolas**, un detalle para quienes quieran explorar más allá de este repositorio.

---

## Proyecto 1: Curriculum Vitae Interactivo

**Archivos**: `curriculum.html`, `curriculum.css`, `curriculum.js`, `foto.png`

### ¿Qué es?

Un **currículum vitae en formato web** con un diseño elegante de dos columnas. No es el típico PDF plano y aburrido: aquí los elementos **aparecen con animación** cuando cargan, las secciones **reaccionan al pasar el ratón**, y todo está maquetado con esmero.

### Diseño

La página se divide en dos columnas bien diferenciadas:

**Columna izquierda (sidebar)** — Fondo verde oscuro (#1a3a2a), texto blanco. Contiene:
- La **foto de perfil** en un círculo con borde verde
- El **nombre completo**: Jaime Muñoz Nicolás
- **Información de contacto**: correo, teléfono, ubicación (Orihuela, Alicante) y enlace a Linktree
- **Idiomas**: Inglés nivel B2 indicado con cinco puntos, de los cuales cuatro están rellenos y uno vacío
- **Permiso de conducir**: A2 (moto)
- **Habilidades**: diez capacidades que van desde Git y HTML/CSS/JS hasta trabajo en equipo y gestión del tiempo

**Columna derecha (contenido principal)** — Fondo blanco, texto oscuro. Contiene:
- **Perfil profesional**: un párrafo donde se presenta como estudiante de Grado Superior en Informática, con ganas de trabajar y aprender
- **Experiencia laboral**: cuatro experiencias (mozo de obra, prácticas SMR en TecnoFix y PC-PHONE, inventario en almacén), cada una con su fecha y empresa
- **Formación**: ocho entradas que van desde el grado actual de SMR hasta cursos de manipulador de alimentos, primeros auxilios, prevención de riesgos, APPCC y biocidas

### Comportamiento interactivo

- Todos los elementos **aparecen gradualmente** cuando la página carga: primero la foto y el nombre, luego la sidebar, después las habilidades, y finalmente la experiencia y formación. Es como si la página se estuviera **construyendo sola**.
- Al pasar el ratón sobre un trabajo o estudio, la tarjeta **se desplaza ligeramente a la derecha** y su borde izquierdo se vuelve verde más brillante.
- Los iconos de contacto **se agrandan** al pasar el ratón.

### Descarga en PDF

El botón flotante "Descargar PDF" en la esquina inferior derecha genera un **PDF exacto del currículum** usando la librería `html2pdf.js`. Durante la generación aparece un indicador de carga, y el resultado es un archivo listo para imprimir o enviar por correo. El botón de retroceso al menú se oculta automáticamente durante la generación del PDF para que no aparezca en el archivo final.

---

## Proyecto 2: CyberSafeLine

**Archivos**: `index.html`, `styles.css`, `script.js`, `legal.html`, imágenes

### ¿Qué es?

CyberSafeLine es una **web corporativa completa** para una empresa ficticia de ciberseguridad creada por **Marcin y Jaime**. La página presenta todos los servicios, precios, sedes y filosofía de la empresa como si fuera un negocio real.

### Primer contacto: el selector de tema

La primera vez que entras, una **ventana modal** te pregunta si prefieres el tema **oscuro** (fondo negro con colores neón) o el **claro** (fondo blanco con colores vibrantes). Cada opción tiene una vista previa en miniatura para que puedas decidir. La elección se guarda en tu navegador y no volverás a ver la ventana a menos que borres los datos.

### Navegación

Un menú superior con **glassmorphism** (efecto cristal) se vuelve sólido cuando haces scroll. Incluye enlaces a todas las secciones y un botón para cambiar de tema en cualquier momento.

### Secciones de la página

**Hero** — Una pantalla completa con fondo de hexágonos animados, el logotipo, el nombre "CyberSafeLine" con colores azul y verde, el lema "Formación y servicios de ciberseguridad para pequeñas empresas" y dos botones para explorar servicios o conocer más.

**Introducción** — Explica qué es CyberSafeLine, acompañado de tres tarjetas que resumen los pilares: protección digital gestionada, formación y concienciación, y cumplimiento legal RGPD.

**Misión, Visión y Valores** — Tres tarjetas numeradas que definen la identidad corporativa, con una cuadrícula de valores (claridad, responsabilidad, cercanía, actualización constante, honestidad).

**Servicios** — Seis tarjetas desplazables que cubren:
- Cursos prácticos de ciberseguridad (presencial y online)
- Protección gestionada 24/7
- Asesoramiento personalizado
- Talleres y charlas educativas
- Guías digitales, herramientas y checklists
- Simulaciones de ataques con Kali Linux

**Precios** — Tres planes tarifarios:
- **Pack Básico** (120€/mes): formación online y presencial, guías, checklists
- **Pack PYME** (250€/mes): lo anterior más asesoramiento, auditoría básica y talleres. Es el plan destacado con un distintivo "MÁS POPULAR"
- **Pack Avanzado** (400€/mes): todo lo anterior más simulaciones de ataques, kits de herramientas y soporte continuo

**Cursos** — Cuatro tarjetas que detallan la metodología de formación: niveles adaptados, modalidad presencial u online, casos reales, y seguimiento personalizado.

**Guías** — Cuatro tarjetas sobre recursos digitales: guías claras, checklists prácticas, plantillas y herramientas, y actualización constante.

**Sedes** — Cuatro tarjetas con fotos reales de Monte Alto, Madrid, Barcelona y Alicante. Cada una tiene un marcador de color y al pasar el ratón la imagen se oscurece ligeramente. Incluye un aviso de próxima apertura en Polonia (Varsovia, 2027).

**Mercado** — Estadísticas animadas: 3 millones+ de pymes en España, 99% del tejido empresarial son pymes, 70%+ usan sistemas digitales sin ciberseguridad adecuada. Los números **cuentan hacia arriba** cuando llegas a la sección.

**Ventaja Competitiva** — Seis pilares visuales (cercanía, claridad, precios justos, 100% pymes, protección activa, formación continua) más una tarjeta destacada con el lema.

**Contacto** — Formulario funcional (mediante Formspree) con campos para nombre de empresa, email, pack de interés y mensaje. También muestra datos de contacto (email, teléfono, WhatsApp).

**Footer** — Cuatro columnas con enlaces a servicios, empresa, sedes y una nota de cumplimiento RGPD.

### El panel de valoraciones

En el lateral derecho hay una pestaña flotante con estrellas. Al hacer clic, se despliega un panel completo con:
- **Resumen de valoraciones**: puntuación media, estrellas visuales y número total
- **Lista de valoraciones**: cada una con nombre, estrellas, texto y fecha
- **Formulario para dejar valoración**: selector de estrellas interactivo (se iluminan al pasar el ratón), campo de texto con contador de caracteres (máximo 500)

Las valoraciones se guardan en **Firebase Firestore** y se actualizan en tiempo real. Cuando alguien publica una nueva, aparece al instante sin necesidad de recargar.

### El cursor personalizado

En lugar del cursor normal, CyberSafeLine tiene un **cursor propio**: un punto pequeño que sigue el ratón con suavidad y un círculo más grande que lo rodea. Cuando pasas sobre enlaces o botones, el círculo se expande, dando una sensación muy pulida y profesional.

### Página legal

`legal.html` es una **página jurídica completa** con 10 secciones que cubren aviso legal, términos de uso, política de privacidad RGPD, política de cookies (con tabla detallada de 6 cookies), política de seguridad, DPA, conservación de datos, certificaciones (ISO 27001, ENS), programa de bug bounty y datos de contacto legal. Es el tipo de página que toda web real debería tener pero que a menudo se ignora.

---

## Proyecto 3: Tarjetas Gráficas JM (GPU Hub)

**Archivos**: 9 HTML, 12 JS, 1 CSS, imágenes, zona secreta

### ¿Qué es?

GPU Hub es un **centro de control para tarjetas gráficas** con más de 130 modelos registrados, desde las modernas RTX 50 series hasta reliquias como la GeForce 256. Está diseñado para jugadores y creadores de contenido que quieren comparar GPUs, guardar favoritos y discutir en un foro técnico.

### Las páginas

**Inicio (`index.html`)** — Presenta el sistema con información en vivo: número de modelos registrados, estado de conexión a Firebase, sesión activa y fecha de última actualización. Ofrece accesos directos al catálogo, comparador y favoritos.

**Catálogo (`gpus.html`)** — Grid completo de todas las GPUs con buscador en vivo. Cada GPU se muestra con su imagen, nombre, VRAM, rendimiento, precio y botones para añadir a favoritos o al comparador. Al hacer clic en una GPU, abre su página de detalle.

**Detalle de GPU (`gpu.html`)** — Muestra la imagen a tamaño completo, las especificaciones clave (VRAM, rendimiento, consumo, PSU recomendada, precio) y botones para añadir a favoritos o al comparador. Incluye una sección de especificaciones adicionales.

**Comparador (`compare.html`)** — Tabla comparativa donde puedes ver varias GPUs lado a lado con columnas de modelo, VRAM, rendimiento, consumo, PSU y precio. Puedes añadir o quitar GPUs libremente.

**Ranking (`ranking.html`)** — Lista ordenable de GPUs. Puedes elegir el criterio de ordenación (rendimiento, precio, valor, VRAM, consumo, PSU) y el ranking se reordena al instante. Cada GPU muestra su número de posición.

**Favoritos (`favorites.html`)** — Tus GPUs marcadas como favoritas, guardadas en Firebase por usuario. Puedes verlas, limpiar la lista o hacer clic en cada una para ir a su detalle.

**Foro (`forum.html`)** — Sistema de discusión con hilos y respuestas. Los usuarios autenticados pueden crear hilos con título y contenido, y cualquier usuario puede responder. Todo se guarda en Firebase Realtime Database y se actualiza en tiempo real.

**Login y registro (`login.html`, `register.html`)** — Autenticación con email y contraseña mediante Firebase Auth. El registro también guarda el nombre de usuario y la fecha de registro.

**Perfil (`profile.html`)** — Muestra tu nombre y email, con botón para cerrar sesión.

### El sistema de datos

El archivo `data.js` contiene **130+ GPUs** organizadas por categorías:
- **Ediciones especiales** (9 GPUs)
- **NVIDIA RTX 50 series** (7, las más modernas)
- **RTX 40 series** (7)
- **RTX 30 series** (7)
- **AMD RX 7000 series** (5)
- **RX 6000 series** (10)
- **Superpotentes e hiperpotentes** (12, incluyendo GPUs profesionales y empresariales)
- **Intel Arc series** (8)
- **Intel integradas** (7, desde UHD 770 hasta 605)
- **GTX 1000/900/700/600/500/400/200/FX** (19, legacy)
- **AMD Radeon HD/R9/R7/Vega/Fury** (20, legacy)
- **NVIDIA 2005-2015** (16, desde GTX 295 hasta GeForce 256)

Cada GPU tiene: ID único, nombre, VRAM, puntuación de rendimiento, precio, consumo en vatios, PSU recomendada y ruta de imagen.

### La zona secreta 🎮

Dentro de la carpeta `X/` hay un **easter egg** imprescindible:

1. **`password.html`**: Una pantalla que pide una contraseña. La contraseña es **"envidia"** (sí, como el fabricante de GPUs, pero en español). Si aciertas, te lleva a...

2. **`mensaje.html`**: Una **pantalla azul de Windows falsa** (BSOD) con el tradicional ":(" y una cara triste. Mientras una barra de progreso avanza de 0 a 100%, suena un efecto de sonido. Cuando llega al final, te redirige a...

3. **`menusecreto.html`**: Un **lanzador de juegos retro** con tarjetas para DOOM, Sonic, Tetris, Pac-Man y Super Mario Bros. Cada juego se abre en un **iframe** desde archive.org o retrogames.cc, por lo que puedes jugar directamente en el navegador sin descargar nada.

### El efecto Matrix

En todas las páginas de GPU Hub, un canvas dibuja un **efecto Matrix** de fondo: caracteres verdes y cian ("01[]{}<>/\=+-|") que caen en vertical a diferentes velocidades, creando ese aspecto cyberpunk tan característico.

---

## Proyecto 4: Ultimate Calculadora

**Archivos**: `index.html`, `styles.css`, `app.js`

### ¿Qué es?

Una **calculadora científica todo-en-uno** con 7 modos de funcionamiento. No es una calculadora simple: es una herramienta completa que abarca desde operaciones básicas hasta representación gráfica de funciones, pasando por álgebra matricial, estadística descriptiva, conversión de unidades y operaciones a nivel de bits.

### Modo Básico

El modo básico incluye todo lo esperable: suma, resta, multiplicación, división, porcentaje, cambio de signo, y las funciones científicas esenciales (seno, coseno, tangente, logaritmo natural y decimal, raíz cuadrada, cuadrado, cubo, potencia, factorial, inverso, valor absoluto, suelo, techo y redondeo). También incluye las constantes π y e, un generador de números aleatorios, paréntesis, historial clickeable y soporte completo de teclado.

### Modo Científico

Ampliación del modo básico con funciones adicionales:
- Trigonometría inversa: arcoseno, arcocoseno, arcotangente
- Trigonometría hiperbólica: seno, coseno y tangente hiperbólicos
- Logaritmo en base 2
- Exponencial (eˣ)
- Raíz n-ésima (ʸ√x), donde puedes elegir el índice
- Operador módulo
- Conmutador grados/radianes

### Modo Gráficas

Un **graficador de funciones** en toda regla. Escribes una función como `sin(x)`, `x^2`, `e^(-x^2)` o `sin(1/x)`, ajustas los rangos de X e Y (con valores mínimo y máximo), y el programa dibuja la función en un canvas. La representación incluye:
- **Cuadrícula** de fondo para orientarte
- **Ejes** X e Y resaltados
- La **curva de la función** en verde con un sutil glow
- **10 botones de funciones predefinidas** para explorar rápidamente: sin(x), cos(x), tan(x), x², √x, x³, sin(1/x), e⁻ˣ², log(x), |x|

### Modo Matrices

Trabaja con matrices de **2×2 y 3×3**. Puedes realizar:
- **Suma** (A + B)
- **Resta** (A − B)
- **Multiplicación** (A × B)
- **Determinante** de A o de B
- **Inversa** de A o de B
- **Transpuesta** de A o de B

Las matrices se muestran como cuadrículas de inputs donde puedes escribir los valores directamente, y el resultado aparece formateado como matriz.

### Modo Estadística

Introduces un conjunto de datos separados por comas y la calculadora te devuelve **12 indicadores estadísticos**:
- Número de elementos (n)
- Suma total
- Media aritmética
- Mediana
- Moda (puede mostrar múltiples valores si hay empate)
- Varianza (poblacional)
- Desviación estándar
- Mínimo
- Máximo
- Rango
- Primer cuartil (Q1)
- Tercer cuartil (Q3)

### Modo Conversor

Conversor de unidades con **9 categorías**:
- **Longitud**: m, km, mi, ft, in, cm, mm, yd
- **Masa**: kg, g, mg, lb, oz, t
- **Temperatura**: °C, °F, K (con fórmulas especiales, no simple multiplicación)
- **Velocidad**: m/s, km/h, mph, kn, ft/s
- **Área**: m², km², ha, acre, ft², in²
- **Volumen**: L, mL, m³, gal, qt, cup, floz
- **Tiempo**: s, min, h, d, wk, mo, yr
- **Datos**: B, KB, MB, GB, TB, b, Kb, Mb, Gb
- **Moneda**: USD, EUR

La conversión es **en tiempo real**: conforme escribes o cambias las unidades, el resultado se actualiza automáticamente.

### Modo Programador

Un modo pensado para programadores y estudiantes de informática:
- **Selector de base**: binario (2), octal (8), decimal (10), hexadecimal (16)
- **Conversión en vivo**: al escribir en cualquier base, las otras tres se actualizan al instante
- **Operaciones bitwise** con dos operandos: AND, OR, XOR, NOT, desplazamiento izquierda (<<), desplazamiento derecha (>>)
- El resultado muestra el valor decimal, hexadecimal y binario

---

## Tecnologías utilizadas

| Tecnología | Dónde se usa |
|---|---|
| **HTML5** | Todas las páginas |
| **CSS3** (Flexbox, Grid, Animaciones, Custom Properties, Media Queries) | Todos los estilos |
| **JavaScript Vanilla** (ES6+, IIFE, Módulos, Clases, Arrow Functions) | Toda la lógica |
| **Canvas API** | Partículas del menú, efecto Matrix, gráficas de la calculadora |
| **Firebase Auth** | GPU Hub (login/registro) |
| **Firebase Realtime Database** | GPU Hub (favoritos, foro, perfiles) |
| **Firebase Firestore** | CyberSafeLine (valoraciones) |
| **Bootstrap 5.3** | GPU Hub (navbar, cards, grid) |
| **IntersectionObserver** | CyberSafeLine (animaciones al hacer scroll) |
| **Web Animations API** | CyberSafeLine (cursor personalizado suave) |
| **localStorage** | Tema claro/oscuro, lista de comparación, flag de BSOD |
| **Formspree** | CyberSafeLine (formulario de contacto) |
| **html2pdf.js** | Curriculum (generación de PDF) |
| **Google Fonts** | Exo 2, Space Mono, JetBrains Mono |

---

## Cómo usar este repositorio

1. **Clona o descarga** el repositorio en tu ordenador
2. Abre `index.html` en tu navegador (desde la raíz del proyecto)
3. Desde el menú universal, haz clic en cualquier proyecto para explorarlo
4. Para volver al menú, usa el enlace "← Menú principal" que encontrarás en cada proyecto

**No necesitas un servidor web** — todos los archivos son estáticos y funcionan directamente desde el sistema de archivos. Eso sí, para las funciones de Firebase (autenticación, valoraciones, foro) necesitarás conexión a internet y tener configuradas tus propias credenciales de Firebase si quieres que funcionen.

### Configuración de Firebase (opcional)

Si quieres que el sistema de autenticación, foro y valoraciones funcione en tu copia local:

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Activa **Authentication** (método email/contraseña)
3. Activa **Realtime Database** (en modo de prueba)
4. Activa **Firestore Database** (en modo de prueba)
5. Copia la configuración de Firebase y reemplázala en:
   - `TarjetasGraficas-JM/public/js/firebase.js`
   - `CyberSafeLine/script.js`

---

## Licencia

Este proyecto está bajo la **Licencia MIT**. Eres libre de usar, modificar y distribuir el código siempre que incluyas el aviso de copyright original.

Copyright © 2026 jaimemunoznicolas

---

*Hecho con dedicación, horas de código y muchas tazas de café por Jaime Muñoz Nicolás.*

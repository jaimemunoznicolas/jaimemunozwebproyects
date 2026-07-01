# 🚀 Portafolio de Proyectos — Jaime Muñoz Nicolás

<p align="center">
  <img src="https://img.shields.io/badge/PROYECTOS-7-0088ff" />
  <img src="https://img.shields.io/badge/LINEAS_TOTALES-21.000%2B-44cc44" />
  <img src="https://img.shields.io/badge/ARCHIVOS-50%2B-ff8800" />
  <img src="https://img.shields.io/badge/TECNOLOGIAS-18-aa44ff" />
  <img src="https://img.shields.io/badge/DEPENDENCIAS_EXTERNAS-7-ff6b6b" />
  <img src="https://img.shields.io/badge/ESTADO-ACTIVO-00cc88" />
  <img src="https://img.shields.io/badge/ERRORES_CONOCIDOS-0-success" />
</p>

**7 proyectos independientes, 3 frameworks UI (Bootstrap), 7 dependencias externas, el resto 100% JavaScript vanilla.**  
Un ecosistema web completo donde cada proyecto tiene identidad propia, desde un CV interactivo con PDF hasta un shooter 3D zombie con 14 tipos de enemigos y 6070 líneas de código, todo bajo un menú universal con partículas animadas que reaccionan al ratón.

---

## 📋 Tabla de Contenidos

1. [Dashboard Rápido](#-dashboard-rápido)
2. [Estadísticas Globales](#-estadísticas-globales)
3. [Arquitectura del Ecosistema](#-arquitectura-del-ecosistema)
4. [Menú Universal](#-menú-universal)
5. [Curriculum Vitae Interactivo](#-curriculum-vitae-interactivo)
6. [CyberSafeLine](#-cybersafeline)
7. [Tarjetas Gráficas JM (GPU Hub)](#-tarjetas-gráficas-jm-gpu-hub)
8. [Ultimate Calculadora](#-ultimate-calculadora)
9. [Zombie Strike](#-zombie-strike)
10. [X0GPT](#-x0gpt)
11. [Matriz Tecnológica Completa](#-matriz-tecnológica-completa)
12. [Roadmap y Próximos Pasos](#-roadmap-y-próximos-pasos)
13. [Guía de Uso](#-guía-de-uso)
14. [Licencia](#-licencia)

---

## 📊 Dashboard Rápido

| Proyecto | Líneas | Archivos | Dependencias | Tech Stack Principal | Estado |
|:---------|:------:|:--------:|:------------:|:---------------------|:------:|
| **Menú Universal** | 178 | 3 (HTML/JS/CSS) | 0 | Canvas API, CSS Grid | ✅ Completo |
| **Curriculum Vitae** | 754 | 3 + foto.png | 2 (html2canvas, jsPDF) | Animaciones CSS, PDF gen | ✅ Completo |
| **CyberSafeLine** | ~2800 | 4 + 8 imágenes | 3 (Firebase, Formspree, Google Fonts) | Firestore, CSS Custom Props | ✅ Completo |
| **GPU Hub** | ~5200+ | 21 + 80+ imágenes | 4 (Bootstrap, Firebase Auth+DB, Elfsight) | Matrix Canvas, Firebase | ✅ Completo |
| **Ultimate Calculadora** | 1386 | 3 | 0 | Canvas API, Parser recursivo | ✅ Completo |
| **Zombie Strike** | ~6070 | 3 | 1 (Three.js) | Three.js, Web Audio API | ✅ Completo |
| **X0GPT** | ~4000 | 10 | 0 | Wikipedia API, DuckDuckGo API, NLP, PWA | ✅ Completo |

> **Totales**: ~21.000+ líneas de código · 50+ archivos de código · 80+ imágenes de GPU · 7 dependencias externas (3 Firebase, 2 PDF, 1 Three.js, 1 Bootstrap) · 1 música de fondo (Elfsight)

---

## 📈 Estadísticas Globales

### Por proyecto
<details>
<summary><strong>Desglose detallado</strong></summary>

| Proyecto | HTML | CSS | JS | Imágenes | Total archivos | Líneas |
|:---------|:----:|:---:|:--:|:--------:|:--------------:|:------:|
| Menú Universal | 1 | 1 | 1 | 0 | 3 | 178 |
| Curriculum | 1 | 1 | 1 | 1 | 4 | 754 |
| CyberSafeLine | 2 | 1 | 1 | 8 | 12 | ~2800 |
| GPU Hub | 11 | 1 | 12 | 81 | 105 | ~5200 |
| Calculadora | 1 | 1 | 1 | 0 | 3 | 1386 |
| Zombie Strike | 1 | 1 | 1 | 0 | 3 | ~6070 |
| X0GPT | 1 | 1 | 8 | 0 | 10 | ~4000 |
| **Total** | **20** | **7** | **26** | **90** | **141** | **~21.000** |

</details>

### Funcionalidades totales del ecosistema
- 🎮 **1 shooter 3D** con 14 zombies, 10 armas, 4 jefes, 5 biomas, clima dinámico, 25+ logros
- 🧮 **1 calculadora** con 7 modos (básico → programador), graficador Canvas, matrices 2×2/3×3, 12 indicadores estadísticos
- 🖥️ **130+ GPUs** catalogadas con imágenes individuales, buscador, ranking, comparador, foro en tiempo real
- 🛡️ **1 web corporativa** completa: 6 servicios, 3 packs de precios, 4 sedes con fotos, selector de tema, 10 secciones legales
- 📄 **CV con PDF** generado dinámicamente con html2canvas + jsPDF, paginación automática, enlaces clickeables
- 🎨 **Menú universal** con 120 partículas interactivas, buscador en vivo, avatar 3D, tarjetas con glow dinámico
- 🔐 **1 zona secreta** con contraseña, BSOD falsa, lanzador de 4 juegos retro emulados (Doom, Mario, Sonic, Tetris)
- 💬 **1 foro en tiempo real** con Firebase Realtime Database (GPU Hub)
- ⭐ **1 sistema de valoraciones** con Firebase Firestore (CyberSafeLine)
- 🔑 **Autenticación completa** con Firebase Auth (GPU Hub): login, registro, perfil
- 🧠 **Asistente IA** con búsqueda en internet (Wikipedia + DuckDuckGo), NLP, chat inteligente, supervivencia offline (X0GPT)

---

## 🏗️ Arquitectura del Ecosistema

```
📁 jaimemunozwebproyects/
│
├── 📄 index.html              ← Orquestador principal
├── 📄 styles.css              ← Estilos del menú (partículas, grid, tema oscuro)
├── 📄 app.js                  ← 178 líneas: proyectos[], partículas, avatar, búsqueda, renderizado
│
├── 📁 Curriculum/              ← CV interactivo
│   ├── curriculum.html        ← 189 líneas: estructura 2 columnas, sidebar verde oscuro
│   ├── curriculum.css         ← 333 líneas: diseño oscuro/verde, @media print A4, responsive
│   ├── curriculum.js          ← 232 líneas: animaciones escalonadas, PDF gen, botón flotante
│   └── foto.png               ← Foto de perfil (circular, 150px)
│
├── 📁 CyberSafeLine/           ← Web corporativa de ciberseguridad
│   ├── index.html             ← 673 líneas: 10 secciones, modal tema, sidebar reviews
│   ├── styles.css             ← 1462 líneas: tema dark/light, cursor custom, animaciones
│   ├── script.js              ← ~700 líneas: Firebase, tema, cursor, IntersectionObserver
│   ├── legal.html             ← 10 secciones legales (RGPD, cookies, ISO 27001, bug bounty)
│   ├── Logotipo.png           ← Logo corporativo con filtros CSS por tema
│   ├── Logo.png               ← Versión alternativa del logo
│   ├── icono.png              ← Favicon
│   ├── plano.png              ← Plano de sedes
│   ├── alicante.jpg           ← Foto sede Alicante
│   ├── barcelona.jpg          ← Foto sede Barcelona
│   ├── madrid.jpg             ← Foto sede Madrid
│   └── montealto.jpg          ← Foto sede Monte Alto (principal)
│
├── 📁 TarjetasGraficas-JM/     ← Hub de GPUs
│   └── public/
│       ├── index.html         ← 279 líneas: hero, sistema status, 5 módulos principales
│       ├── gpus.html          ← Catálogo completo con búsqueda en vivo
│       ├── gpu.html           ← 143 líneas: ficha individual con imagen, specs, favoritos
│       ├── compare.html       ← 134 líneas: tabla comparativa lado a lado
│       ├── ranking.html       ← 88 líneas: ranking ordenable por 6 criterios
│       ├── favorites.html     ← 120 líneas: lista personal del usuario (Firebase)
│       ├── forum.html         ← 120 líneas: foro con hilos y respuestas (Firebase)
│       ├── profile.html       ← Perfil de usuario con avatar y datos
│       ├── login.html         ← 129 líneas: login con email/contraseña
│       ├── register.html      ← Registro de nuevo usuario
│       ├── css/styles.css     ← 527 líneas: Matrix theme neon verde/cyan
│       ├── js/
│       │   ├── data.js        ← 130+ GPUs con specs completas
│       │   ├── matrix.js      ← Efecto Matrix (canvas, código binario)
│       │   ├── gpus.js        ← Catálogo + búsqueda
│       │   ├── gpu.js         ← Detalle individual
│       │   ├── compare.js     ← Comparador
│       │   ├── ranking.js     ← Ranking ordenable
│       │   ├── search.js      ← Búsqueda avanzada
│       │   ├── favorites.js   ← Favoritos (Firebase)
│       │   ├── forum.js       ← Foro (Firebase)
│       │   ├── auth.js        ← Autenticación
│       │   ├── firebase.js    ← Config Firebase
│       │   └── profile.js     ← Perfil de usuario
│       ├── img/               ← 81 imágenes de GPUs (organizadas por series)
│       ├── X/                  ← Zona secreta
│       │   ├── password.html  ← Pantalla de contraseña
│       │   ├── mensaje.html   ← Mensaje falso
│       │   ├── mensaje.js     ← Lógica del mensaje
│       │   ├── menusecreto.html ← Menú de juegos
│       │   ├── menusecreto.js ← Lógica del menú
│       │   ├── doom.html      ← Doom emulado
│       │   ├── mario.html     ← Mario Bros emulado
│       │   ├── sonic.html     ← Sonic emulado
│       │   ├── tetris.html    ← Tetris emulado
│       │   └── sounds/bsod.mp3 ← Sonido BSOD
│       ├── firebase.json
│       ├── LICENSE
│       └── README.md
│
├── 📁 ultimatecalculadora/     ← Calculadora 7 modos
│   ├── index.html             ← 220 líneas: 7 panels, Canvas, inputs dinámicos
│   ├── styles.css             ← 357 líneas: tema oscuro, gradientes, responsive
│   └── app.js                 ← 809 líneas: 7 motores completos, keyboard, historial
│
├── 📁 shooter/                 ← Shooter 3D zombie
│   ├── index.html             ← DOM structure: menús, HUD, modals, botones
│   ├── styles.css             ← Animaciones, overlays, HUD styles
│   └── app.js                 ← ~6070 líneas: TODO el juego (ver sección Zombie Strike)
│
├── 📁 X0GPT/                    ← Asistente IA con supervivencia offline y búsqueda web
│   ├── index.html             ← Interfaz chat tipo ChatGPT
│   ├── styles.css             ← Tema oscuro brutal con glow effects
│   ├── app.js                 ← Controlador principal, streaming de respuestas
│   ├── nlp.js                 ← Motor NLP: tokenización, stemmer, 17 intenciones, entidades
│   ├── api.js                 ← DuckDuckGo + Wikipedia API con cache y fallback
│   ├── engine.js              ← Motor IA: búsqueda web primero, KB offline, supervivencia
│   ├── knowledge.json         ← ~250 entradas de conocimiento general
│   ├── survival.json          ← Manual de supervivencia: 1300+ líneas
│   ├── sw.js                  ← Service Worker para PWA offline
│   └── manifest.json          ← PWA manifest
│
├── 📄 LICENSE                  ← MIT
└── 📄 README.md                ← Este documento (¡aquí!)
```

---

## 🎯 Menú Universal

**Archivos**: `index.html` · `styles.css` · `app.js` · **178 líneas**

### Arquitectura interna

```javascript
// app.js — Estructura completa
(function () {
  'use strict';

  // 1. DATA: Array de 5 proyectos (name, path, icon, desc, tags[])
  //    → Cada tag genera un badge coloreado (.tag-html, .tag-css, .tag-js, .tag-threejs, .tag-webgl)

  // 2. PARTÍCULAS: 120 instancias de clase Particle
  //    - Cada partícula: x, y, size (0.5-2.5), speedX/speedY (−0.2 a +0.2), opacity (0.2-0.7)
  //    - Update: movimiento lineal + repulsión si ratón < 150px
  //    - Draw: arc() con fillStyle rgba(200,200,255, opacity)
  //    - Conexiones: drawConnections() — líneas entre partículas < 120px, opacidad 0-0.15

  // 3. AVATAR: click → toggle .flipped (CSS 3D rotation + elastic animation)

  // 4. RENDER: renderProjects(filter)
  //    - Filtro por nombre/desc → innerHTML de cada card
  //    - Cada card: icono, nombre, desc, tags, arrow
  //    - Mousemove: actualiza CSS custom properties --mx, --my para glow dinámico

  // 5. SEARCH: input event → renderProjects() en tiempo real
  //    - Contador actualizado (#projectCount)
  //    - Mensaje "No se encontraron proyectos" si filter vacío
})();
```

### Características

| Característica | Detalle técnico |
|:---------------|:----------------|
| **Fondo interactivo** | 120 partículas, repulsión al ratón (distancia < 150px), conexiones entre partículas (< 120px), 60fps con requestAnimationFrame |
| **Avatar JM** | Círculo con iniciales "JM", click → rotación 3D 180° revelando foto real |
| **Buscador en vivo** | filter() sobre array + innerHTML, resaltado de coincidencias, contador dinámico |
| **Tarjetas con glow** | CSS custom properties `--mx` `--my` actualizadas en mousemove, degradado radial en hover |
| **Tags coloreados** | CSS classes: `.tag-html` (azul), `.tag-css` (rosa), `.tag-js` (amarillo), `.tag-threejs` (verde), `.tag-webgl` (naranja) |
| **Responsive** | CSS Grid con `auto-fill, minmax(300px, 1fr)` |

---

## 📄 Curriculum Vitae Interactivo

**Archivos**: `curriculum.html` (189) · `curriculum.css` (333) · `curriculum.js` (232) · `foto.png` · **Total: 754 líneas**

### Estructura del HTML

```html
<div class="cv-container">
  <div class="sidebar">          <!-- 290px, fondo verde oscuro #1a3a2a -->
    <img class="profile-photo">  <!-- 150px circular, borde #3a5a4a -->
    <h1>Jaime Muñoz Nicolás</h1>
    <section>Contacto</section>  <!-- Email, teléfono, ubicación, Linktree -->
    <section>Idiomas</section>   <!-- Inglés B2 con 5 dots (4 filled) -->
    <section>Permiso</section>   <!-- A2 (moto) -->
    <section>Habilidades</section> <!-- 10 items con bullet verde -->
  </div>
  <div class="main-content">     <!-- Flex: 1, fondo blanco -->
    <section>Perfil Profesional</section>
    <section>Experiencia Laboral</section> <!-- 4 puestos, 2023-2026 -->
    <section>Formación</section>           <!-- 8 entradas, 2019-2026 -->
  </div>
</div>
```

### Motor de animaciones (curriculum.js)

```javascript
// 1. Reset: todos los elementos animables → opacity:0, translateY(20px)
// 2. Stagger cascade (6 fases temporizadas):
//    100ms  → foto + nombre
//    300ms  → sidebar titles (interval 120ms) + contact items (interval 60ms)
//    400ms  → main titles (interval 100ms)
//    500ms  → skill items (interval 40ms)
//    520ms  → language item
//    550ms  → objective text
//    650ms  → exp items (interval 100ms)
//    1000ms → edu items (interval 80ms)
//    1200ms → language dots (scale bounce con spring)
// 3. Hover effects:
//    - exp/edu items: translateX(6px) + border color change
//    - contact icons: scale(1.25)
//    - skill items: color change #4caf50
```

### Generación de PDF

| Paso | Detalle |
|:-----|:--------|
| **1. Reset animations** | Todas las opacidades → 1, transforms → none, transitions → none |
| **2. Hide UI** | Botón de volver oculto, botón flotante oculto |
| **3. Ajuste layout** | body: block, padding 0; CV: max-width 794px, box-shadow none |
| **4. Captura** | `html2canvas(cv, { scale: 2, width: 794, backgroundColor: '#ffffff' })` |
| **5. Creación PDF** | `jsPDF({ orientation: 'portrait', format: 'a4', compress: true })` |
| **6. Una página** | Si imgHeight ≤ usableHeight → centrado vertical |
| **7. Multi página** | Si excede → slice en fragmentos (canvas parciales) con paginación automática |
| **8. Enlace Linktree** | `pdf.textWithLink()` en cada página, centrado abajo |
| **9. Descarga** | `pdf.save('Curriculum-JaimeMunozNicolas.pdf')` |
| **10. Fallback** | Si hay error → `window.print()` |

### Botón flotante PDF

```css
/* position: fixed; bottom: 24px; right: 24px */
/* Aparece a los 1500ms con fadeIn + slideUp */
/* Hover: background #4a9eff, translateY(-2px), box-shadow azul */
/* Click: disabled + opacity 0.6 durante generación */
```

### Especificaciones del CV impreso

| Aspecto | Valor |
|:--------|:------|
| Formato papel | A4 (210×297mm) |
| Márgenes PDF | 6mm laterales, 7mm inferiores para link |
| Escala captura | 2× (retina) |
| Ancho captura | 794px |
| Compresión | Sí (compress: true) |
| Calidad imagen | JPEG |
| Paginación | Automática si contenido excede usableHeight |
| Enlace linktree | Cada página, centrado, tamaño 7pt |

---

## 🛡️ CyberSafeLine

**Archivos**: `index.html` (673) · `styles.css` (1462) · `script.js` (~700) · `legal.html` · 8 imágenes · **Total: ~2800+ líneas**

### Mapa del sitio (10 secciones)

```
1. Theme Modal          ← Selección tema al entrar (dark/light)
2. Hero                 ← Hex background, logo flotante, título con colores
3. Sobre Nosotros       ← Introducción + 3 cards (Protección, Formación, Cumplimiento)
4. Misión/Visión/Valores ← 3 cards con número y animación reveal
5. Servicios            ← 6 servicios (Cursos, Protección 24/7, Asesoramiento, Talleres, Guías, Simulaciones)
6. Precios              ← 3 packs (Básico 120€, PYME 250€, Avanzado 400€)
7. Cursos               ← 4 cards (Niveles, Modalidad, Casos, Seguimiento)
8. Guías                ← 4 cards (Claras, Checklists, Plantillas, Actualización)
9. Sedes                ← 4 oficinas (Monte Alto, Madrid, Barcelona, Alicante) + Polonia 2027
10. Contacto            ← Formulario Formspree + info de contacto
```

### Selector de tema

```javascript
// Modal de bienvenida con preview visual de cada tema
// Persistencia: localStorage.setItem('cyber-theme', theme)
// CSS Custom Properties: 50+ variables por tema (--navy, --teal, --green, --text, etc.)
// Transición: background-color .4s ease, color .4s ease

// Dark theme (default):
//   --navy: #050e1a, --teal: #00c8b4, --green: #3bd16f, --blue: #1a6fff
//   --text: #e8f0fe, --card-bg: rgba(13,33,55,0.85), --glow-teal: 0 0 35px rgba(0,200,180,0.4)

// Light theme:
//   --navy: #f0f6ff, --teal: #007d70, --green: #1a9445, --blue: #1a5fff
//   --text: #0d1f35, --card-bg: rgba(255,255,255,0.9), --glow-teal: 0 0 25px rgba(0,125,112,0.2)
```

### Sistema de cursor personalizado

```css
body, a, button, input, select, textarea,
.service-card, .mvv-card, .pricing-card,
.reviews-sidebar, .theme-toggle, /* ... */ {
  cursor: none !important;  /* Solo en dispositivos con puntero fino */
}

.cursor-dot {        /* 8px círculo teal, glow, sigue al puntero */
.cursor-outline {    /* 40px círculo, borde teal 0.6 */
.cursor-outline.hover {  /* 60px, background teal 0.1, border green */
.cursor-dot.hover {      /* scale(1.5), background green */
```

### Sistema de valoraciones (Firebase Firestore)

```
Colección: "reviews"
  ├── name: string
  ├── stars: number (1-5)
  ├── text: string
  └── timestamp: serverTimestamp

Sidebar lateral:
  - Pestaña "VALORACIONES" con estrellas
  - Media general + count
  - Lista de valoraciones en tiempo real
  - Formulario: nombre, selector estrellas interactivo, texto (500 chars max)
  - Loader durante carga
  - Mensajes de éxito/error inline
```

### Formulario de contacto

```
Action: https://formspree.io/f/xeewraak
Campos: empresa (text), email, pack (select 5 opciones), mensaje (textarea)
Botón: "Enviar Consulta" con gradient primary
```

### Footer

```css
/* 4 columnas: Brand + Servicios + Empresa + Sedes */
/* © 2026 CyberSafeLine S.L. — RGPD Compliant | LSSI-CE */
/* Enlace a legal.html con subrayado */
```

---

## 🎮 Tarjetas Gráficas JM (GPU Hub)

**Archivos**: 9 HTML · 12 JS · 1 CSS · 81 imágenes GPU · 9 archivos zona secreta · **Total: ~5200+ líneas**

### Estructura completa

```
public/
├── index.html       ← Página principal: hero panel, 5 módulos, estado del sistema
├── gpus.html        ← Catálogo completo con búsqueda en vivo
├── gpu.html         ← Ficha individual: imagen, specs, favoritos, comparador
├── compare.html     ← Tabla comparativa con 7 columnas
├── ranking.html     ← Ranking ordenable por 6 criterios
├── favorites.html   ← Lista personal con Firebase
├── forum.html       ← Foro con hilos y respuestas en tiempo real
├── login.html       ← Autenticación email/contraseña
├── register.html    ← Registro de nuevo usuario
├── profile.html     ← Perfil con avatar, datos, tema
├── css/
│   └── styles.css   ← 527 líneas: Matrix theme
├── js/
│   ├── data.js      ← 130+ GPUs con specs completas
│   ├── matrix.js    ← Efecto Matrix canvas
│   ├── gpus.js      ← Catálogo + búsqueda
│   ├── gpu.js       ← Detalle individual
│   ├── compare.js   ← Comparador
│   ├── ranking.js   ← Ranking
│   ├── search.js    ← Búsqueda avanzada
│   ├── favorites.js ← Favoritos Firebase
│   ├── forum.js     ← Foro Firebase
│   ├── auth.js      ← Auth Firebase
│   ├── firebase.js  ← Config Firebase
│   └── profile.js   ← Perfil
├── img/             ← 81 imágenes en 10 carpetas
└── X/               ← Zona secreta con 5 archivos + sonido
```

### Sistema de datos (data.js)

```javascript
// 130+ GPUs con estructura:
{
  id: 'rtx4090',
  name: 'NVIDIA GeForce RTX 4090',
  brand: 'NVIDIA',
  series: 'RTX 40',
  year: 2022,
  performance: 100,       // Escala 0-100
  vram: '24 GB GDDR6X',
  power: 450,             // Watts
  psu: '850W',
  price: 1599,
  image: 'img/NVIDIA RTX 40 SERIES/rtx4090.png',
  specs: {                // Especificaciones adicionales
    architecture: 'Ada Lovelace',
    cores: '16384 CUDA',
    boostClock: '2520 MHz',
    memoryBus: '384-bit',
    bandwidth: '1008 GB/s',
    dlss: '3.5',
    rayTracing: '3rd Gen',
  }
}
```

### GPUs por categoría

| Categoría | Cantidad | Modelos destacados |
|:----------|:--------:|:-------------------|
| **NVIDIA RTX 50 Series** | 7 | RTX 5050 → RTX 5090 |
| **NVIDIA RTX 40 Series** | 7 | RTX 4050 → RTX 4090 |
| **NVIDIA RTX 30 Series** | 7 | RTX 3050 → RTX 3090 |
| **NVIDIA GTX (1000-400)** | 18 | GTX 1050 Ti → GTX 980 Ti |
| **NVIDIA Históricas** | 1 | GeForce 256 |
| **AMD RX 7000 Series** | 5 | RX 7600 → RX 7900 XTX |
| **AMD RX 6000 Series** | 10 | RX 6400 → RX 6950 XT |
| **AMD HD/R9/R7/Vega/Fury** | 1 | Representativa |
| **Intel Arc Series** | 8 | Arc A310 → Arc Pro A60 |
| **Intel Integrated** | 7 | UHD 605 → UHD 770 |
| **Ediciones Especiales** | 9 | Spider-Man, EVA-01, WoW, Miku, Matrix, Monster Hunter |
| **Superpotentes/Hiperpotentes** | 12 | A100, H100, MI100/250, RTX 6000 Ada, Titan RTX/V |
| **Total** | **~92** | |

### Efecto Matrix (matrix.js)

```javascript
// Canvas de fondo con scroll
// Caracteres: katakana + binario + símbolos
// Color: verde neón (#00ff6a) con estela
// Velocidad: aleatoria por columna
// Superposición: opacidad 0.05 en cada frame para efecto estela
```

### Zona secreta (X/)

| Archivo | Descripción |
|:--------|:------------|
| `password.html` | Pantalla con campo de contraseña |
| `mensaje.html` + `mensaje.js` | Mensaje falso estilo "acceso denegado" → BSOD animada con sonido |
| `menusecreto.html` + `menusecreto.js` | Menú lanzador de juegos retro |
| `doom.html` | Doom emulado en canvas/JS |
| `mario.html` | Super Mario Bros emulado |
| `sonic.html` | Sonic the Hedgehog emulado |
| `tetris.html` | Tetris emulado |
| `sounds/bsod.mp3` | Sonido de BSOD de Windows |

### Firebase integración

| Servicio | Uso | Colecciones/Datos |
|:---------|:----|:------------------|
| **Authentication** | Login/registro con email y contraseña | users (UID, email, displayName) |
| **Realtime Database** | Favoritos y foro en tiempo real | `favorites/{uid}/`, `forum/threads/` |

### Footer secreto

```html
<footer class="secret-footer py-3">
  GPU Hub © 2026 — Todos los derechos reservados
  <a href="X/password.html" class="secret-button">acceso</a> 
</footer>
```

---

## 🧮 Ultimate Calculadora

**Archivos**: `index.html` (220) · `styles.css` (357) · `app.js` (809) · **Total: 1.386 líneas**

### Arquitectura interna

```javascript
(function () {
  'use strict';

  // ===== CONFIG =====
  // 7 modos con sus botones:
  //   basic:     4 columnas, 44 botones (numéricos, ops, trig, funciones)
  //   scientific:5 columnas, 50 botones (+ asin/acos/atan, sinh/cosh/tanh, log2, nroot, exp, mod)

  // ===== MOTOR CALCULADORA =====
  // Estado: currentInput, fullExpression, history[], degMode, justEvaluated
  // Parser: replace(×→*, ÷→/, −→-, π→Math.PI, e→Math.E, %→/100) → Function()
  // Funciones: sin, cos, tan, asin, acos, atan, sinh, cosh, tanh, ln, log, log2,
  //            sqrt, cbrt, square, cube, exp, factorial (hasta 170!), inv, abs, floor, ceil, round
  // Historial: 50 elementos, persistido en array, click para reusar resultado

  // ===== GRÁFICAS (Canvas) =====
  // resize: escala 2× para retina
  // parser: replace(sin→Math.sin, cos→Math.cos, ^→**, etc) → new Function('x', ...)
  // Dibujo: grid (opacidad 0.06), ejes (azul 0.5), función (verde neón #43e97b, shadow)
  // 10 funciones predefinidas: sin(x), cos(x), tan(x), x², √x, x³, sin(1/x), e⁻ˣ², log(x), |x|

  // ===== MATRICES =====
  // Tamaños: 2×2 y 3×3
  // Operaciones: A+B, A−B, A×B, det(A), det(B), A⁻¹, B⁻¹, Aᵀ, Bᵀ
  // Fórmulas: determinante 2×2 (ad−bc), 3×3 (regla Sarrus), inversa por cofactores

  // ===== ESTADÍSTICA =====
  // 12 indicadores: n, suma, media, mediana, moda, varianza, desv.est, min, max, rango, Q1, Q3
  // Parse: split(',') → parseFloat → filter(isNaN)

  // ===== CONVERSOR =====
  // 9 categorías: longitud, masa, temperatura, velocidad, área, volumen, tiempo, datos, moneda
  // Unidades por categoría (ej. longitud: m, km, mi, ft, in, cm, mm, yd)
  // Fórmulas: multiplicación por factor de conversión a unidad base
  // Temperatura: fórmulas especiales (C→F: *9/5+32, C→K: +273.15)

  // ===== PROGRAMADOR =====
  // Bases: binario(2), octal(8), decimal(10), hexadecimal(16)
  // Conversiones en vivo: todas las bases se actualizan al escribir
  // Bitwise: AND, OR, XOR, NOT, <<, >> — con dos operandos

  // ===== KEYBOARD =====
  // 0-9, ., +, -, *, /, ^, Enter/=, Backspace, Escape, (, )
  // Solo activo en modo calculadora

  // ===== TOAST =====
  // Notificaciones flotantes inferiores, 2s de duración
})();
```

### Modo Básico — Botones (44)

```
AC  ⌫   %   ÷
sin cos tan ×
ln  log √   −
x²  x³  xⁿ  +
n!  1/x |x| ±
7   8   9   ∛
4   5   6   π
1   2   3   e
0   .   (   )
rand floor ceil round
📜  DEG =   =
```

### Modo Científico — Botones (50)

```
AC  ⌫   %   ÷   log₂
sin cos tan ×   log₁₀
asin acos atan −   ln
sinh cosh tanh +   √
x²  x³  xⁿ  ∛   ʸ√x
n!  1/x |x| ±   eˣ
7   8   9   π   e
4   5   6   (   )
1   2   3   rand mod
0   .   📜  DEG =
```

### Canvas gráficas

| Aspecto | Valor |
|:--------|:------|
| Resolución | 2× (retina) |
| Grid | Opacidad 0.06, paso 1 unidad |
| Ejes | Opacidad 0.5, ancho 1.5px |
| Función | #43e97b, ancho 2.5px, shadow 6px |
| Steps | width × 2 (muestreo) |
| Asíntotas | Detección: if !isFinite(y) → break + moveTo |
| Límite | Si py < -500 o py > H + 500 → break |

---

## 🧟 Zombie Strike

**Archivos**: `index.html` · `styles.css` · `app.js` **(~6070 líneas)**

> **Para la documentación completa y detallada del shooter (14 zombies, 10 armas, 4 jefes, 5 biomas, oleadas infinitas, clima dinámico, 25+ logros, eventos, perks, combos, HUD completo, audio procedural, optimizaciones), véase la sección dedicada más abajo.**

<p align="center">
  <img src="https://img.shields.io/badge/LINEAS-6070-FF4444" />
  <img src="https://img.shields.io/badge/ZOMBIES-14_TIPOS-88ff44" />
  <img src="https://img.shields.io/badge/ARMAS-10-ffaa00" />
  <img src="https://img.shields.io/badge/JEFES-4_VARIANTES-ff4444" />
  <img src="https://img.shields.io/badge/BIOMAS-5-44aaff" />
  <img src="https://img.shields.io/badge/DEPENDENCIAS-1_(Three.js)-aa44ff" />
</p>

> **Shooter zombie en primera persona con oleadas infinitas** — construido desde cero con Three.js v0.160 y JavaScript vanilla. Sin motores de juego, sin frameworks, sin dependencias externas (salvo Three.js), sin archivos de audio, sin modelos 3D precargados. **Todo es procedural.**

### 🔫 Sistema de armas (10)

Cada arma tiene **modelo 3D propio** construido programáticamente con primitivas Three.js (cilindros, cajas, conos, esferas) formando: cañón, cuerpo, culata, cargador, mira, silenciador, etc.

| # | Arma | Daño | Cadencia | Cargador | Especial | Desbloqueo |
|:-:|------|:----:|:--------:|:--------:|----------|:----------:|
| 1 | 🔫 Pistola | 15 | 6.7/s | 15 | Semiautomática, precisa | Oleada 1 |
| 2 | 🔫 Subfusil | 10 | 16.7/s | 30 | Automática, alta cadencia | Oleada 1 |
| 3 | 🔫 Rifle | 22 | 12.5/s | 30 | Automática, precisión media | Oleada 2 |
| 4 | 🔫 Escopeta | 18×8 | 2.2/s | 8 | 8 perdigones en abanico | Oleada 3 |
| 5 | 🚀 Lanzacohetes | 80 (AOE) | 1.3/s | 5 | Proyectil explosivo 5u radio | Oleada 5 |
| 6 | 🔭 Francotirador | 120 | 0.8/s | 5 | Perforante (atraviesa enemigos) | Oleada 7 |
| 7 | ⚙️ Minigun | 8 | 33.3/s | 100 | Spin-up 0.5s antes de disparar | Oleada 10 |
| 8 | 🔥 Lanzallamas | 6 (cono) | 50/s | 50 | Fuego continuo, rango 8u | Oleada 12 |
| 9 | 💣 Lanzagranadas | 60 (AOE) | 1.4/s | 6 | Proyectil explosivo 6u radio | Oleada 15 |
| 10 | 🔦 Rayo Láser | 5 | 20/s | ∞ | Sin munición, haz continuo | Oleada 20 |

**Sistema de mejoras (5 niveles por arma):**

| Nivel | Costo | Daño | Cadencia | Cargador |
|:-----|:-----|:----:|:--------:|:--------:|
| 1 | 100 | ×1.0 | ×1.0 | ×1.0 |
| 2 | 250 (+150) | ×1.3 | ×0.9 | ×1.25 |
| 3 | 500 (+250) | ×1.6 | ×0.8 | ×1.5 |
| 4 | 1000 (+500) | ×1.9 | ×0.7 | ×1.75 |
| 5 | 2250 (+1250) | ×2.2 | ×0.6 | ×2.0 |
| **Total** | **4100** | | | |

### 🧟 Bestiario zombie (14 tipos)

Cada zombie tiene **modelo 3D articulado** (pelvis, piernas, torso con costillas, brazos con garras, cabeza con mandíbula y ojos brillantes) con variaciones por tipo. **IA completa**: separación entre zombies (evitación social), evitación de paredes, persecución con pathfinding simplificado, ataque cuerpo a cuerpo, habilidades especiales con cooldown.

| Tipo | Vel | Vida | Daño | Habilidad Especial | Apariencia | Desbloqueo |
|:-----|:---:|:----:|:----:|:-------------------|:-----------|:----------:|
| **Caminante** 🧟 | 1.2 | 100 | 8 | — | Estándar, mandíbula caída, ojos verdes | Oleada 1 |
| **Corredor** 🏃 | 2.8 | 60 | 10 | Velocidad 2.3× | Torso inclinado 30°, zancada larga | Oleada 2 |
| **Explotador** 💥 | 1.0 | 80 | 0 | Explota al morir (AOE 4u, 80 dmg) | Vientre translúcido verde, venas brillantes | Oleada 2 |
| **Escupidor** 🤮 | 0.9 | 120 | 12 | Ácido a distancia (proyectil esfera verde) | Sacos de ácido en hombros, color amarillento | Oleada 3 |
| **Bruto** 💪 | 0.6 | 400 | 25 | Armadura natural (−30% daño recibido) | Doble tamaño, placas óseas marrones | Oleada 3 |
| **Rastrero** 🕷️ | 1.6 | 50 | 6 | 4 patas, perfil bajo (0.5u altura) | Cuerpo alargado horizontal, 4 extremidades | Oleada 4 |
| **Gritador** 📢 | 2.2 | 40 | 5 | Buffea zombies cercanos (+50% velocidad 3s) | Cabeza grande 1.5×, boca abierta permanentemente | Oleada 5 |
| **Saltador** 🦗 | 1.8 | 90 | 14 | Salta 8u hacia el jugador (CD 3s) | Piernas tipo saltamontes, cuerpo aerodinámico | Oleada 6 |
| **Tanque** 🛡️ | 0.4 | 800 | 35 | Casi indestructible, empuja al atacar | Masivo 2×, blindaje completo, cuernos | Oleada 8 |
| **Nigromante** 💀 | 0.7 | 150 | 10 | Resucita 1 zombie caminante (CD 8s), max 50 zombies | Capa, cuernos de chivo, aura violeta, báculo | Oleada 10 |
| **Acechador** 👻 | 1.5 | 200 | 18 | Invisibilidad (se cloaka 3s, visible al atacar) | Semitransparente, ojos rojos brillantes | Oleada 12 |
| **Bombardero** 💣 | 1.1 | 150 | 0 | Suicida: explosión masiva AOE 6u, 120 dmg | Cinturón explosivo con LEDs, corre hacia ti | Oleada 14 |
| **Escudero** 🛡️ | 0.8 | 300 | 15 | Escudo balístico frontal (bloquea 80% daño frontal) | Escudo óseo 2×, postura defensiva, lento | Oleada 16 |
| **Mutante** 👾 | 2.0 | 250 | 20 | 4 brazos (2 ataques/s), ácido, pulso tóxico AOE 4u | Brazos extra, cuerpo deforme, venas glowing | Oleada 18 |

#### Zombies Élite

Variantes raras con **×2 HP** y brillo naranja. Probabilidad: 8% oleadas normales, 15% horda. Afecta a: Bruto, Tanque, Escudero, Mutante.

### 👑 Sistema de jefes (4 variantes, cada 5 oleadas)

Modelo 3D masivo con **30+ partes**: pelvis, piernas articuladas, torso blindado, cabeza con corona de 5 cuernos + 2 cuernos curvos, brazos con hombreras y cuchillas, capa, 8 picos óseos, esfera de aura. **3 fases de ataque** progresivas.

| Jefe | HP Base | Tamaño | Fase 1 | Fase 2 | Fase 3 |
|:-----|:-------:|:------:|:-------|:-------|:-------|
| **ABOMINACIÓN** 👹 | 1500 | 3.0× | Melee + embestida | + Multi-escupitajo (3 proyectiles) | + Enfurecer (+30% daño) |
| **COLOSOS** 🏔️ | 2500 | 3.5× | Melee + invocar esbirros (2 caminantes) | + Golpe terremoto (AOE 8u + screen shake) | + Carga imparable (atraviesa todo) |
| **TITAN OSCURO** 🌑 | 4000 | 4.0× | Puñetazo doble + onda expansiva | + Tornado (AOE móvil 6u, sigue al jugador) | + Lluvia de escombros (AOE 10u) |
| **DEVORADOR** 🐉 | 6000 | 4.5× | Todas las habilidades básicas (alterna) | + Combinaciones (embestida + terremoto) | + Berserker (velocidad ×1.5, daño ×2) |

**Escalado con oleada**: `HP_extra = 1 + floor(wave / 5) × 0.35`  
A partir de oleada 50: `tamaño += 0.5×` cada 10 oleadas.

### 🗺️ Mapa masivo (170×170 unidades)

| Bioma | Centro | Elementos | Colores |
|:------|:------:|:----------|:--------|
| **🏙️ Ciudad** | (0, 0) | ~60 edificios (ventanas iluminadas aleatoriamente), 3 carreteras con marcas viales, 48+ farolas, 28+ barriles, 32+ cajas, 16+ coches, 24+ barreras, 8 alambradas | Grises, azules |
| **🏭 Industrial** | (−50, −50) | Fábricas, chimeneas humeantes, grúas, tuberías, tanques acero, 16 torres vigilancia, zonas eléctricas | Rojos, marrones |
| **🌲 Bosque** | (50, 50) | ~120 árboles procedurales, ~100 arbustos, helechos, hongos, troncos, fosas de fuego | Verdes, marrones |
| **🏜️ Desierto** | (−50, 50) | Ruinas, muros rotos, pilares piedra, 8 cráteres, 16 tumbas, nubes tóxicas | Amarillos, naranjas |
| **🏛️ Ruinas** | (50, −50) | Estructuras antiguas, columnas derrumbadas, peligros ambientales, barriles hazmat | Grises, verdes |

**Cuantificación total de elementos del mapa:**
- ~60 edificios con ventanas (30-70% iluminadas), puertas, parapetos, AC, chimeneas
- ~120 árboles procedurales (tronco cilindro + copa esfera, alturas 2-8u)
- ~100 arbustos (esferas verdes pequeñas, 0.5-1.5u)
- 3 carreteras principales con marcas viales (líneas blancas cada 3u)
- 48+ farolas (poste + brazo + esfera luminosa, luz punto amarilla)
- 28+ barriles (cilindros rojos/verdes, hazmat con glow verde, explosivos)
- 32+ pilas de cajas (cajas marrones apiladas 2-4)
- 16+ coches (6 quemados con partículas de humo)
- 12+ contenedores de carga (coloridos, 6×2.5×3u)
- 12+ campfires (fuego con partículas anaranjadas + luz punto)
- 16 torres de vigilancia (estructura metálica 8u)
- 24+ barreras de hormigón
- 8 alambradas de espino (cercas con púas)
- 16 tumbas (losas grises 1×0.5u, algunas rotas)
- 8 cráteres (depresiones circulares 3-5u, bordes elevados)
- 12+ neumáticos (toroides negros)
- 12+ sacos arena (apilados 2-3)
- 24+ escombros (rocas triangulares)
- **Elevaciones**: rampas suaves, plataformas multinivel (2-3 alturas), puentes con barandillas (4u ancho), trincheras con sacos de arena (2u profundo)

### ⚙️ Sistema de oleadas infinitas

| Parámetro | Fórmula | Oleada 1 | Oleada 10 | Oleada 20 | Oleada 50 |
|:----------|:--------|:--------:|:---------:|:---------:|:---------:|
| Zombies | `min(5 + wave×4, 80)` | 5 | 40 | 80 | 80 |
| HP × zombie | `1 + (wave−1)×0.12` | ×1.00 | ×2.08 | ×3.28 | ×6.88 |
| Spawn interval | `max(0.2, 2/(1+wave×0.08))` | 1.85s | 1.11s | 0.56s | 0.40s |
| HP jefe extra | `1 + floor(wave/5)×0.35` | — | ×1.70 | ×2.40 | ×4.50 |

**Tipos de oleada:**
| Tipo | Cada X | Modificador |
|:-----|:------:|:------------|
| Normal | — | Mezcla aleatoria de tipos disponibles |
| Rápida | 3 | Zombies +30% velocidad, −20% vida |
| Horda ×2 | 7 | Cantidad ×2 |
| Jefe | 5 | Jefe + escoltas (5-8 zombies) |
| Mixta | — | 3+ tipos diferentes simultáneamente |

**Formaciones de spawn:**
| Formación | Descripción | Radio |
|:----------|:------------|:-----:|
| Círculo | Anillo alrededor del jugador | 20-35u |
| Línea | Frente lineal | 30u ancho |
| Enjambre | Grupo denso aleatorio | 15u radio |
| Clúster | 3-5 grupos separados | 8u cada uno |
| Arco | Semicírculo frontal | 25u |

### 🌤️ Clima y ciclo día/noche

**6 fases lumínicas** (ciclo completo cada 90s):
1. Amanecer (15s) — naranja suave, luz ambiental 0.3, sol horizonte
2. Mañana (15s) — azul claro, luz 0.6, sol 30°
3. Mediodía (15s) — azul brillante, luz 1.0, sol cenital
4. Tarde (15s) — azul medio, luz 0.7, sol 45°
5. Atardecer (15s) — naranja/rojo, luz 0.3, sol horizonte opuesto
6. Noche (15s) — azul oscuro, luz 0.1, luna + estrellas (puntos blancos)

**5 estados meteorológicos:**
| Estado | Gotas 3D | Niebla | Rayos | Viento |
|:-------|:--------:|:------:|:-----:|:------:|
| Despejado | 0 | No | No | Suave |
| Nublado | 0 | Ligera | No | Moderado |
| Lluvia | ~2000 | Media | No | Fuerte |
| Tormenta | ~2000 + estelas | Media | Sí (cada 3-8s) | Muy fuerte |
| Niebla | 0 | Densa (scene.fog) | No | Calma |

**Sistema de viento**: ráfagas sinusoidales, amplitud variable, afecta árboles (animación de copas) y partículas de lluvia (desvío horizontal).

### 🏆 Logros (25+) y desafíos

| Categoría | Logros | Reward |
|:----------|:-------|:------:|
| **Bajas** | Primera baja · 100 kills · 500 kills · 1000 kills · 5000 kills | 100-10000 pts |
| **Oleadas** | Oleada 5 · 10 · 20 · 50 · 100 | 200-10000 pts |
| **Jefes** | Matar ABOMINACIÓN · COLOSOS · TITAN OSCURO · DEVORADOR · Todos | 300-3000 pts |
| **Precisión** | 10 headshots · 50 · 100 · Racha 10 headshots seguidos | 200-2000 pts |
| **Rachas** | 10 kills sin daño · 20 kills sin daño · Combo ×5 · Combo ×10 | 500-5000 pts |
| **Especiales** | Speed demon (10 kills/5s) · Explosive chain (5 kills/1 explosión) · Night survivor · 100k puntos | 1000-5000 pts |
| **Oro** | Todos los logros anteriores | 50000 pts |

**Desafíos de armas**: 25 progresivos por arma (headshots, kills, daño total, kills con carga baja, etc.)

### ⚡ Sistemas adicionales

| Sistema | Detalle técnico |
|:--------|:----------------|
| **💥 Combos** | Ventana 2s entre kills, multiplicador ×1-×10, 6 medallas (Bronce 3, Plata 5, Oro 10, Platino 25, Diamante 50, Inmortal 100) |
| **📊 Multiplicador puntuación** | Headshot ×2 · combo ×1.5-×5 · bonificación oleada (×1 + wave×0.02) · distancia (×1-×2) · sin daño (×1.5) |
| **🎲 Perks** | 5 tipos aleatorios, duración 15s: Perforante (atraviesa), Explosivo (AOE 3u), Ardiente (DoT 5s), Congelante (-50% spd 3s), Vampírico (+10% hp por kill) |
| **🎪 Eventos dinámicos** | 7 eventos con CD 60-180s: Asalto horda (×3 zombies), Suministros aéreos (cofre cae), Lluvia tóxica (daño AOE), Cacería nocturna (noche instantánea), Pulso EMP (armas recargan), Frenesí (×2 daño 10s), Boss rush (2 jefes seguidos) |
| **❤️ Pickups** | Vida+25 (cruz roja), Armadura+30 (escudo azul), Munición+30% (balas), Velocidad×1.5 8s (rayo), Rage×2 daño 8s (fuego), Cofres aleatorios |
| **📷 Sistema de cámaras** | Walk bob senoidal (amplitud 0.05, frecuencia 8Hz), weapon tilt al disparar (0.1rad, restitución 0.15s), FOV dinámico (60→90 en sprint), cámara drone cenital (toggle), screen shake con decay exponencial |
| **✨ Partículas** | Polvo ambiental (100, grises), trazadoras (líneas 0.1×2u, color según arma), fogonazos (mesh Quad + point light 2s), sangre procedural (10 sprites rojos, rotación aleatoria, fade 1s), decals impacto (círculos 0.3u, fade 5s), damage numbers (float up 1s + fade) |
| **🩸 Cadáveres** | Pool 50 cuerpos con fade out (15-25s), rotación aleatoria al morir, GC automático cuando pool lleno. Decals explosivos: 100, fade 20-35s |
| **🚁 Drones** | Desde wave 10: patrullan zona, spotlight amarillo hacia abajo, alertan de peligros con sonido, 15u altura |
| **🔊 Audio procedural** | 25+ sonidos con Web Audio API: OscillatorNode (square, sawtooth, sine) + AudioBuffer (noise blanco/rosa). Armas: pitch según tipo, duración según cadencia. Zombies: growls (sawtooth 120-500Hz), death (noise + sine decay). Jefes: multi-oscillator + distortion. UI: clicks (square 1000Hz 0.03s) |

### 🎮 HUD elementos

| Elemento | Localización | Comportamiento |
|:---------|:-------------|:---------------|
| **Barra vida + armadura** | Esquina inferior izquierda | Gradiente verde→rojo según HP, azul armadura. Efecto de daño: flash rojo direccional |
| **Puntuación** | Superior izquierda | Número animado, incremento con efecto de "pop" |
| **Bajas / Kills** | Bajo puntuación | `kills / zombsNeeded` con barra de progreso |
| **Oleada** | Superior centro | `OLEADA X` con tipo (HORDA, JEFE, RÁPIDA) |
| **Arma actual** | Inferior derecha | Nombre, icono, munición `actual / max`, nivel mejora |
| **Weapon strip** | Centro inferior | 5 slots numerados 1-5, arma activa resaltada, munición por arma |
| **Crosshair** | Centro pantalla | 4 líneas, se expanden al moverse/disparar, rojo al hit |
| **Hitmarker** | Centro | X roja que aparece 0.15s al acertar, fade out |
| **Minimapa** | Esquina superior derecha | 140×140px, canvas 2D, muestra: biomas (colores), posición jugador (punto blanco), zombies (puntos rojos), boss (icono especial), peligros (triángulos), pickups (círculos) |
| **Boss bar** | Superior centro (bajo oleada) | Barra horizontal con nombre del jefe, fase actual, HP restante. Aparece/desaparece con animación |
| **Killfeed** | Derecha | Mensajes de bajas, tipo de zombie, headshot indicator, combo |
| **Damage numbers** | Sobre zombie | Números flotantes que emergen al recibir daño, color blanco/rojo (headshot), tamaño según daño |
| **Toast** | Superior derecha | Notificaciones slide-in: logros, eventos, rachas, perks. 3s duración |
| **Indicador recarga** | Centro | Texto "RECARGANDO..." + barra de progreso |
| **Indicador headshot** | Centro | "¡HEADSHOT!" con efecto de escala + sonido |

### Efectos de pantalla

| Efecto | Disparador | Implementación |
|:-------|:-----------|:---------------|
| **Aberración cromática** | Rage activo o vida < 20% | Overlay CSS con separación RGB (desplazamiento 2px en pra/ver/azul) |
| **Viñeta** | Vida baja (según 100-HP) | Radial gradient negro desde bordes, opacidad dinámica (0 → 0.7) |
| **Speed lines** | Perk velocidad o rage | Líneas blancas paralelas desde centro, opacidad 0.3, fade out |
| **Overlay daño** | Recibir daño | Flash semitransparente en dirección del atacante, 0.2s |
| **Screen shake** | Explosiones, golpes jefe | Desplazamiento cámara aleatorio, amplitud según fuente, decay 0.5s |
| **Muzzle flash** | Disparar | Quad blanco + PointLight amarillo, 0.05s duración |
| **Trazadoras** | Proyectiles | Línea 0.1×2u, color arma, fade 0.3s |

### ⌨️ Controles

| Tecla | Acción |
|:------|:-------|
| `W` `A` `S` `D` / `↑` `←` `↓` `→` | Movimiento forward/left/backward/right |
| `🖱️` Ratón (movimiento) | Rotación cámara (look) |
| `🖱️` Click izquierdo | Disparar |
| `🖱️` Click derecho | Apuntar (zoom ×0.7, cámara lenta 0.5×) |
| `R` | Recargar arma actual |
| `1` `2` `3` `4` `5` | Cambiar arma (slot) |
| `Q` | Arma anterior |
| `E` | Arma siguiente |
| `Espacio` | Saltar (gravedad −25u/s², impulso 8u/s) |
| `Shift` (mantener) | Sprint (velocidad ×1.5, FOV 90) |
| `F` | Interactuar (recoger pickups) |
| `TAB` | Mostrar puntuaciones |
| `ESC` | Pausa (menú pausa: continuar, reiniciar, menú principal) |
| `M` | Toggle sonido ON/OFF |

### 🎚️ Rendimiento y optimización

| Técnica | Detalle |
|:--------|:--------|
| **LOD dinámico** | Zombies a > 40u: animación simplificada, > 60u: no renderizar |
| **Dynamic zombie cap** | FPS < 30 → max 30 zombies · FPS < 45 → max 40 · else → max 50 |
| **Pooling** | Balas: array preasignado 500. Partículas: pool 1000. Decals: pool 200. Cadáveres: pool 50 |
| **GC automático** | Cada 5s: limpia efectos caducados (fade completado), partículas muertas, decals viejos |
| **Shadow map** | PCFSoft, 2048×2048, solo objetos < 30u del jugador |
| **Instanciación** | Árboles: BufferGeometry instanciado ×120. Farolas: ×48. Edificios: geometrías compartidas |
| **Frustum culling** | Three.js automático + manual para objetos > 60u |
| **Frame skip** | Si FPS < 20 → salta frames de física cada 2 |

### 📐 Arquitectura del código

```
app.js (~6070 líneas) — Estructura interna:
├── 1.   CONSTANTS & CONFIG (G, DIFFICULTIES, WEAPONS_DATA, ZOMBIE_TYPES, BIOMES)
│        ├── G: estado global (score, wave, kills, health, armor, etc.)
│        ├── DIFFICULTIES: FACIL, NORMAL, DIFICIL, INFERNAL (multiplicadores)
│        ├── WEAPONS_DATA: 10 armas con stats
│        ├── ZOMBIE_TYPES: 14 tipos con stats
│        └── BIOMES: 5 biomas con colores, peligros, elementos
├── 2.   DOM SHORTCUTS & HELPERS ($, lerp, clamp, rand, dist)
├── 3.   AUDIO ENGINE (25+ sonidos: sfx, weapon, zombie, boss, ambient)
│        ├── initAudio(), playSfx(), playMusic()
│        ├── noise(buffer), tone(oscillator), ambient layers
│        └── updateAmbientSounds(dt)
├── 4.   THREE.JS SETUP (scene, camera, renderer, lights, fog)
├── 5.   WEAPON MODELS (10 armas procedurales)
├── 6.   ZOMBIE MODELS (14 tipos + 4 bosses procedurales)
├── 7.   MAP GENERATION (5 biomas, 170×170, elementos, elevaciones)
├── 8.   WEATHER & DAY/NIGHT (6 fases, 5 estados, viento)
├── 9.   ZOMBIE AI (separation, wall avoidance, pursuit, special abilities)
├── 10.  WAVE SYSTEM (generation, spawn, formations, rewards)
├── 11.  BOSS SYSTEM (4 variants, 3 phases, scaling)
├── 12.  PARTICLES & EFFECTS (muzzle, tracers, blood, decals, damage numbers)
├── 13.  HUD (DOM updates, minimap, crosshair, boss bar, killfeed, toast)
├── 14.  ACHIEVEMENTS & CHALLENGES (25+ achievements, 25 weapon challenges)
├── 15.  EVENTS & PERKS (7 dynamic events, 5 perks, cooldowns)
├── 16.  COMBAT SYSTEM (hit detection, AOE, piercing, damage calculation)
├── 17.  GAME LOOP (update + render, delta time, frame limiting)
├── 18.  MENUS (main menu, pause, game over, weapon upgrades, difficulty select)
└── 19.  RESET & CLEANUP (resetGame, cleanupScene, garbage collection)
```

---

## 🧠 X0GPT

**Archivos**: `index.html` · `styles.css` · `app.js` · `nlp.js` · `api.js` · `engine.js` · `knowledge.json` · `survival.json` · `sw.js` · `manifest.json` (~4000 líneas)

> **Asistente IA de supervivencia con búsqueda web** — Motor NLP propio, búsqueda en internet con DuckDuckGo + Wikipedia, base de conocimiento offline con ~1300+ líneas de supervivencia (guerra, naturaleza, crisis, salud, navegación, herramientas), streaming de respuestas, badges de fuente, modo PWA offline.

<p align="center">
  <img src="https://img.shields.io/badge/LINEAS-4000-6366f1" />
  <img src="https://img.shields.io/badge/FUENTES-2_(Wikipedia+%2B+DDG)-818cf8" />
  <img src="https://img.shields.io/badge/NLP-17_INTENCIONES-4ade80" />
  <img src="https://img.shields.io/badge/SUPERVIVENCIA-1300%2B_LIN-ef4444" />
  <img src="https://img.shields.io/badge/PWA-OFFLINE-06b6d4" />
  <img src="https://img.shields.io/badge/DEPENDENCIAS-0-c4b5fd" />
</p>

### Funcionalidades

| Característica | Detalle |
|:---------------|:--------|
| **Búsqueda web primero** | DuckDuckGo + Wikipedia en paralelo, respuestas combinadas |
| **NLP propio** | Tokenización, stemmer, 17 intenciones, extracción de entidades (200+ personas, 120+ lugares) |
| **Supervivencia offline** | ~1300+ líneas: guerra, naturaleza, crisis, salud, navegación, herramientas, psicología |
| **Knowledge base** | ~250 entradas: ciencia, historia, tecnología, geografía, chistes, datos curiosos |
| **Streaming de respuestas** | Efecto de escritura progresiva con-awareness de HTML tags |
| **Badges de fuente** | 🌐 Web, 📚 KB local, 🚑 Supervivencia, 💬 Conversación con % de confianza |
| **PWA offline** | Service Worker cachea todos los assets, funciona sin internet |
| **Contexto conversacional** | Mantiene historial de 20 mensajes, detecta follow-ups |
| **Sentiment analysis** | Detecta tono positivo/negativo/neutral del usuario |
| **Query expansion** | Sinónimos y expansión para mejores búsquedas web |
| **Markdown en respuestas** | Negrita, código, enlaces — renderizado en tiempo real |
| **Responsive** | Sidebar colapsable, diseño adaptable a móvil |

### Arquitectura del motor IA

```
Pregunta del usuario
        │
        ▼
┌─────────────────────┐
│  NLP (nlp.js)       │ ← Tokenización, stemmer, intención, entidades, sentiment
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Intent Detection   │ ← Saludo, despedida, ayuda, creador → respuesta local
└─────────┬───────────┘
          │ (no es intent)
          ▼
┌─────────────────────┐
│  Survival Check     │ ← Palabras clave de supervivencia → survival.json offline
└─────────┬───────────┘
          │ (no es supervivencia)
          ▼
┌─────────────────────┐
│  🌐 WEB SEARCH      │ ← DuckDuckGo + Wikipedia en paralelo
│  (API: api.js)      │    Cache 20min, fallback con query alternativa
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Combine Results    │ ← Mejor respuesta + fuentes + confianza
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Streaming Response │ ← Efecto escritura progresiva en UI
└─────────────────────┘
```

### Archivos del proyecto

| Archivo | Líneas | Función |
|:--------|:------:|:--------|
| `engine.js` | ~250 | Motor principal: orquesta NLP + API + KB + survival |
| `api.js` | ~330 | DuckDuckGo Instant Answers + Wikipedia REST + cache |
| `nlp.js` | ~350 | Tokenización, stemmer español, 17 intenciones, entidades |
| `app.js` | ~265 | UI controller, streaming, badges, sidebar |
| `survival.json` | ~1300 | Guerra, naturaleza, crisis, salud, herramientas |
| `knowledge.json` | ~120 | ~250 entradas de conocimiento general |
| `index.html` | ~97 | Interfaz ChatGPT-style |
| `styles.css` | ~1200 | Tema oscuro brutal, glow effects, responsive |
| `sw.js` | ~72 | Service Worker PWA offline |
| `manifest.json` | ~19 | PWA manifest |

### Flujo de búsqueda web

```
1. NLP.buildSearchQuery()     → Query optimizado según tipo de pregunta
   │  (definición, cómo hacer, quién, dónde, comparación, lista)
   │
2. API.searchWithAlternatives()
   │  ├── API.search(query)
   │  │     ├── searchDuckDuckGo()  → Instant Answers, Related Topics, Definitions
   │  │     └── searchWikipedia()   → Summary API + Search API fallback
   │  │     └── combineResults()    → Mejor de ambas fuentes
   │  │
   │  └── Si confianza < 0.5:
   │        ├── Reintentar con keywords
   │        └── Reintentar con expandQuery()
   │
3. API.formatAnswer()         → Formatea respuesta limpia con fuentes
   │
4. Combinar con local KB      → Si hay info local relevante, añadir como suplemento
```

---

## 🧰 Matriz Tecnológica Completa

| Tecnología | Versión | Menú | CV | CyberSafe | GPU Hub | Calc | Shooter | X0GPT |
|:-----------|:-------:|:----:|:--:|:---------:|:-------:|:----:|:-------:|:-------:|
| **HTML5** | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **CSS3** (Flex/Grid) | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **CSS Custom Properties** | — | — | — | ✅ | ✅ | ✅ | ✅ | — |
| **CSS Animations** | — | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| **CSS @media print** | — | — | ✅ | — | — | — | — | — |
| **JavaScript Vanilla ES6+** | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **JavaScript Modules (type="module")** | — | — | — | ✅ | ✅ | — | ✅ | — |
| **Canvas 2D API** | — | ✅ | — | — | ✅ | ✅ | ✅ | — |
| **Three.js** | r160 | — | — | — | — | — | ✅ | — |
| **Web Audio API** | — | — | — | — | — | — | ✅ | — |
| **Firebase Auth** | v12 | — | — | — | ✅ | — | — | — |
| **Firebase Realtime Database** | v12 | — | — | — | ✅ | — | — | — |
| **Firebase Firestore** | v12 | — | — | ✅ | — | — | — | — |
| **Bootstrap** | 5.3 | — | — | — | ✅ | — | — | — |
| **html2canvas** | 1.4 | — | ✅ | — | — | — | — | — |
| **jsPDF** | 2.5 | — | ✅ | — | — | — | — | — |
| **Formspree** | — | — | — | ✅ | — | — | — | — |
| **IntersectionObserver** | — | — | — | ✅ | — | — | — | — |
| **localStorage** | — | ✅ | — | ✅ | ✅ | ✅ | ✅ | — |
| **Google Fonts** | — | — | — | ✅ | — | ✅ | — | — |
| **Elfsight (música)** | — | — | — | — | ✅ | — | — | — |

---

## 🗺️ Roadmap y Próximos Pasos

### Prioridad alta
- [ ] **Shader personalizados** — niebla volumétrica, agua reflectiva, suelo procedural en el shooter
- [ ] **Sonido 3D posicional** — Web Audio API con PannerNode (HRTF) para zombies y disparos
- [ ] **Editor de niveles visual** — para configurar elementos del mapa desde UI

### Prioridad media
- [ ] **Progresión online** — Firebase para rangos globales en Zombie Strike
- [ ] **Compatibilidad gamepad** — soporte para mandos Xbox/PS en el shooter
- [ ] **PWA** — Service Worker + manifest para todos los proyectos
- [ ] **Tema oscuro/claro** — unificado para todos los proyectos

### Prioridad baja
- [ ] **Modo multijugador cooperativo** — WebRTC + WebSocket para Zombie Strike
- [ ] **Sistema de modding** — scripts externos cargados dinámicamente
- [ ] **Internacionalización** — soporte multi-idioma (ES/EN/PL)

---

## 🚀 Guía de Uso

### Requisitos mínimos
- Navegador moderno (Chrome 90+, Firefox 90+, Edge 90+, Safari 15+)
- JavaScript habilitado
- WebGL (para Zombie Strike)
- Conexión a internet (para Firebase, Google Fonts, Bootstrap CDN)

### Instalación

```bash
git clone https://github.com/jaimemunoznicolas/jaimemunozwebproyects.git
cd jaimemunozwebproyects
# No necesitas servidor — abre index.html directamente
start index.html    # Windows
open index.html     # macOS
xdg-open index.html # Linux
```

### Navegación
1. Abre `index.html` → Menú universal con 6 tarjetas
2. Haz clic en cualquier proyecto → Se abre en la misma pestaña
3. Usa **"← Menú principal"** (esquina superior izquierda) para volver

### Funcionalidades especiales
- **Zombie Strike**: Pulsa ESC para pausa, M para mute, 1-5 para armas
- **GPU Hub**: Busca el enlace "acceso" en el footer para la zona secreta
- **CyberSafeLine**: Al entrar, elige tema claro u oscuro
- **Curriculum**: Botón "Descargar PDF" flotante esquina inferior derecha
- **Calculadora**: Atajos de teclado (Enter=calcular, Esc=limpiar, Backspace=borrar)

### Configurar Firebase (solo GPU Hub y CyberSafeLine)

```javascript
// TarjetasGraficas-JM/public/js/firebase.js
const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
  projectId: "tu-proyecto",
  // ...
};
```

---

## 📜 Licencia

**MIT** © 2026 jaimemunoznicolas

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<p align="center">
  <sub>Hecho con dedicación, horas de código y muchas tazas de café por Jaime Muñoz Nicolás.</sub>
  <br>
  <sub>🔗 <a href="https://linktr.ee/jaimemunoznicolas">linktr.ee/jaimemunoznicolas</a> · 📧 munoznicolasjaime@gmail.com · 📞 +34 629 978 325</sub>
</p>

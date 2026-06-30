# Portafolio de Proyectos — Jaime Muñoz Nicolás

**Un ecosistema web con 5 proyectos independientes, accesibles desde un menú universal con estilo propio.**

---

## Índice

1. [¿Qué es?](#qué-es)
2. [Estructura](#estructura)
3. [Menú universal](#menú-universal)
4. [Curriculum Vitae Interactivo](#curriculum-vitae-interactivo)
5. [CyberSafeLine](#cybersafeline)
6. [Tarjetas Gráficas JM (GPU Hub)](#tarjetas-gráficas-jm-gpu-hub)
7. [Ultimate Calculadora](#ultimate-calculadora)
8. [Strike Battle](#strike-battle)
9. [Tecnologías](#tecnologías)
10. [Uso](#uso)
11. [Licencia](#licencia)

---

## ¿Qué es?

Este es el espacio de trabajo digital de **Jaime Muñoz Nicolás**, estudiante de informática. Aquí conviven **5 proyectos independientes** bajo un mismo menú universal: un CV interactivo, una web corporativa de ciberseguridad, un hub de tarjetas gráficas, una calculadora multímode y un shooter 3D en primera persona. Cada proyecto es autónomo, con sus propios archivos y estilo.

---

## Estructura

```
📁 jaimemunozwebproyects/
│
├── 📄 index.html              ← Menú universal
├── 📄 styles.css
├── 📄 app.js
│
├── 📁 Curriculum/              ← CV interactivo con PDF
│   ├── curriculum.html/.css/.js
│   └── foto.png
│
├── 📁 CyberSafeLine/           ← Web corporativa de ciberseguridad
│   ├── index.html, styles.css, script.js
│   ├── legal.html
│   └── imágenes corporativas
│
├── 📁 TarjetasGraficas-JM/     ← Hub de GPUs (130+ modelos, foro, ranking)
│   └── public/ (9 HTML, 12 JS, CSS, imágenes, zona secreta)
│
├── 📁 ultimatecalculadora/     ← Calculadora 7 modos
│   └── index.html, styles.css, app.js
│
├── 📁 shooter/                 ← FPS 3D con 5 armas y bots con IA
│   ├── index.html, styles.css
│   └── js/ (12 módulos ES)
│
├── 📄 LICENSE
└── 📄 README.md
```

---

## Menú universal

**Archivos**: `index.html`, `styles.css`, `app.js`

### Diseño

Un centro de control con **fondo de partículas animadas** que reaccionan al ratón. Incluye:

- **Avatar interactivo**: círculo con iniciales "JM" que gira en 3D al hacer clic para mostrar la foto real (`foto.png`), con animación elástica CSS.
- **Buscador en vivo**: filtra proyectos al instante mientras escribes, con contador actualizado.
- **Tarjetas con glow**: cada proyecto se muestra con icono, nombre, descripción y etiquetas técnicas. Al pasar el ratón se elevan con una barra de colores degradada y un glow que sigue el cursor.
- **Linktree**: enlace sutil a `linktr.ee/jaimemunoznicolas`.

---

## Curriculum Vitae Interactivo

**Archivos**: `curriculum.html`, `.css`, `.js`, `foto.png`

CV web de dos columnas con diseño elegante. Usa `html2canvas` + `jsPDF` para generar un PDF A4 perfecto con enlace clickeable a Linktree. Los elementos aparecen con animación escalonada al cargar. Incluye foto de perfil circular, datos de contacto, idiomas, habilidades, experiencia laboral (4 puestos) y formación (8 entradas).

### PDF

- Generación con `html2canvas` (escala 2, 794 px de ancho) + `jsPDF`.
- Paginación automática con división de contenido.
- Botones flotantes se ocultan durante la captura.
- Enlace a Linktree insertado como `pdf.textWithLink()` en cada página.

---

## CyberSafeLine

**Archivos**: `index.html`, `styles.css`, `script.js`, `legal.html`

Web corporativa completa para una empresa ficticia de ciberseguridad. Funcionalidades destacadas:

- **Selector de tema** claro/oscuro al entrar (guardado en localStorage).
- **Cursor personalizado** con punto + círculo que se expande en enlaces.
- **Panel de valoraciones** lateral con Firebase Firestore en tiempo real.
- **Contador animado** de estadísticas (IntersectionObserver).
- **Formulario de contacto** mediante Formspree.
- **Página legal** completa con 10 secciones (RGPD, cookies, ISO 27001, bug bounty).

---

## Tarjetas Gráficas JM (GPU Hub)

**Archivos**: 9 HTML, 12 JS, 1 CSS, imágenes, zona secreta

Centro de control con **más de 130 GPUs** registradas. Funcionalidades:

- Catálogo completo con buscador en vivo.
- Detalle individual de cada GPU con especificaciones.
- Comparador visual lado a lado.
- Ranking ordenable por rendimiento, precio, VRAM, etc.
- Favoritos por usuario (Firebase Auth + Realtime Database).
- Foro con hilos y respuestas en tiempo real.
- Efecto Matrix de fondo en todas las páginas.
- **Zona secreta** (`X/`): pantalla de contraseña → BSOD falsa → lanzador de juegos retro emulados.

---

## Ultimate Calculadora

**Archivos**: `index.html`, `styles.css`, `app.js`

Calculadora todo-en-uno con **7 modos**:

| Modo | Funcionalidad |
|---|---|
| **Básico** | Operaciones aritméticas, trigonometría, logaritmos, factorial, constantes π/e, historial |
| **Científico** | Trigonometría inversa e hiperbólica, log₂, eˣ, raíz n-ésima, módulo, grados/radianes |
| **Gráficas** | Graficador canvas con cuadrícula, ejes, 10 funciones预definidas, rangos ajustables |
| **Matrices** | 2×2 y 3×3: suma, resta, multiplicación, determinante, inversa, transpuesta |
| **Estadística** | Media, mediana, moda, varianza, desviación, cuartiles y más (12 indicadores) |
| **Conversor** | 9 categorías (longitud, masa, temperatura, velocidad, área, volumen, tiempo, datos, moneda) |
| **Programador** | Binario/octal/decimal/hexadecimal, operaciones bitwise AND/OR/XOR/NOT/<<<>> |

---

## Strike Battle

**Archivos**: `index.html`, `styles.css`, `js/` (12 módulos)

**Shooter 3D en primera persona** construido con Three.js. Juego completo con:

### Características principales

| Aspecto | Detalle |
|---|---|
| **Mapa** | 120×120 metros con 11 zonas: plaza con fuente, oficinas, banco, almacén, garaje, tiendas, farolas, barriles, cajas, 20+ muros de cobertura |
| **Armas** | 5 armas seleccionables con modelo 3D propio: fusil de asalto, escopeta (8 perdigones), subfusil, francotirador, pistola. Cada una con stats únicas (daño, cadencia, precisión, cargador) |
| **Bots** | 4 tipos con modelos articulados: soldado, pesado (casco, mucha vida), francotirador (precisión), explorador (velocidad). IA con patrullaje, persecución, strafe lateral y línea de visión |
| **Rondas** | 10 rondas progresivas (4→6→8→...→30 bots) |
| **Dificultad** | 4 niveles: fácil / normal / difícil / loco |
| **Físicas** | Gravedad, salto, colisión AABB con ściany y objetos |
| **HUD** | Barra de vida + armadura, minimapa 140px, crosshair dinámico, hitmarker, daño direccional, killfeed, números de daño flotantes, indicador de recarga |
| **Pickups** | Salud (+25), armadura (+30), munición (+20) con rotación flotante y reaparición |
| **Sonidos** | Web Audio API: sonido único por arma, impactos, headshot, kill, recarga, victoria |
| **Partículas** | Explosiones al matar bots, chispas en impactos |
| **Menú** | Fondo 3D animado con cristales flotantes, selección de arma y dificultad |

### Arquitectura (12 módulos ES)

```
shooter/js/
├── main.js       ← Entry point, game loop, orquestación
├── scene.js      ← Renderer, luces, cielo estrellado, menú 3D
├── map.js        ← Mapa 120×120 con colisión AABB
├── player.js     ← Físicas, cámara, movimiento, armadura
├── weapons.js    ← 5 armas con stats, modelos 3D, recarga
├── bots.js       ← 4 tipos de bot con IA y modelos articulados
├── hud.js        ← Minimapa, crosshair, hitmarker, killfeed
├── menu.js       ← Menú principal con selección de arma/dificultad
├── pickups.js    ← Salud, armadura, munición
├── particles.js  ← Sistema de partículas (explosiones, chispas)
├── sounds.js     ← Web Audio API con sonidos por arma
└── utils.js      ← Funciones auxiliares
```

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| **HTML5** | Todas las páginas |
| **CSS3** (Flexbox, Grid, Animaciones, Custom Properties, Media Queries) | Todos los estilos |
| **JavaScript Vanilla** (ES6+, Módulos, Clases) | Toda la lógica |
| **Three.js** (CDN importmap) | Strike Battle (3D, sombras PCFSoft, físicas, iluminación) |
| **Canvas API** | Partículas del menú, efecto Matrix, gráficas calculadora, minimapa |
| **Web Audio API** | Strike Battle (sonidos procedurales por arma) |
| **Firebase Auth** | GPU Hub (login/registro) |
| **Firebase Realtime Database** | GPU Hub (favoritos, foro) |
| **Firebase Firestore** | CyberSafeLine (valoraciones) |
| **Bootstrap 5.3** | GPU Hub (navbar, cards) |
| **IntersectionObserver** | CyberSafeLine (animaciones al scroll) |
| **html2canvas + jsPDF** | Curriculum (PDF del CV con enlaces clickeables) |
| **localStorage** | Tema claro/oscuro, lista comparación GPU |
| **Formspree** | CyberSafeLine (formulario de contacto) |
| **Google Fonts** | Exo 2, Space Mono, JetBrains Mono |

---

## Cómo usar

1. **Clona o descarga** el repositorio.
2. Abre `index.html` (raíz) en tu navegador.
3. Desde el menú universal, haz clic en cualquier proyecto.
4. Usa "← Menú principal" en cada proyecto para volver.

**No necesitas servidor** — todo es estático y funciona desde el sistema de archivos. Las funciones de Firebase requieren conexión a internet y credenciales propias.

### Configurar Firebase (opcional)

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com).
2. Activa **Authentication** (email/contraseña), **Realtime Database** y **Firestore** (modo prueba).
3. Reemplaza la configuración en:
   - `TarjetasGraficas-JM/public/js/firebase.js`
   - `CyberSafeLine/script.js`

---

## Licencia

**MIT**. Libre de usar, modificar y distribuir manteniendo el aviso de copyright original.

Copyright © 2026 jaimemunoznicolas

---

*Hecho con dedicación, horas de código y muchas tazas de café por Jaime Muñoz Nicolás.*

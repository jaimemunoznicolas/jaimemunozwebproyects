import * as THREE from 'three';

const $ = id => document.getElementById(id);
const $c = id => { const e = $(id); if (!e) console.warn('Missing element:', id); return e; };

const dom = {
  canvas: $c('gameCanvas'), menu: $c('menu'), go: $c('gameOver'),
  controls: $c('controlsModal'), hud: $c('hud'), pause: $c('pauseOverlay'),
  crosshair: $c('crosshair'), hitmarker: $c('hitmarker'), dmgOverlay: $c('dmgOverlay'),
  killFeed: $c('killFeed'), roundInfo: $c('roundInfo'), botsAlive: $c('botsAlive'),
  lowhp: $c('lowhpOverlay'), dmgNums: $c('damageNumbers'),
  healthBar: $c('healthBar'), armorBar: $c('armorBar'), healthText: $c('healthText'),
  ammoText: $c('ammoText'), ammoReserve: $c('ammoReserve'),
  scoreText: $c('scoreText'), killsText: $c('killsText'), hudRound: $c('hudRound'),
  weaponName: $c('weaponName'), weaponIcon: $c('weaponIcon'),
  weaponStrip: $c('weaponStrip'), reloadInd: $c('reloadIndicator'),
  minimap: $c('minimapCanvas'), streakText: $c('streakText'),
  finalScore: $c('finalScore'), finalKills: $c('finalKills'),
  finalRounds: $c('finalRounds'), finalAcc: $c('finalAcc'), finalStreak: $c('finalStreak'),
  mvp: $c('mvpDisplay'), goTitle: $c('goTitle'), goScores: $c('goScores'),
  menuInfo: $c('menuInfo'), menuWeapon: $c('menuWeapon'), menuDifficulty: $c('menuDifficulty'),
  menuSnd: $c('menuSnd'), hudSndBtn: $c('hudSndBtn'),
  wsGrid: $c('wsGrid'), diffGrid: $c('diffGrid'),
  scoresBody: $c('scoresBody'), hsIndicator: $c('hsIndicator'),
  streakMsg: $c('streakMsg'),
  scoresModal: $c('scoresModal'), settingsModal: $c('settingsModal'),
  weaponSelect: $c('weaponSelect'), diffSelect: $c('diffSelect'),
};

const HALF = 60, MAP_SZ = 120;
const PH = 1.6, PR = 0.4, GRAV = -22, SPD = 9, JUMP = 8.5;

// ─── ZOMBIE TYPES ───
const ZT = [
  { id:'n', name:'ZOMBI', hp:80, spd:3.0, dmg:10, col:0x557744, sc:1.0, atkR:1.5, atkRate:1.0, pts:100 },
  { id:'f', name:'CORREDOR', hp:50, spd:6.5, dmg:8, col:0x667744, sc:0.85, atkR:1.8, atkRate:0.6, pts:150 },
  { id:'t', name:'TANQUE', hp:350, spd:1.8, dmg:30, col:0x553333, sc:1.4, atkR:1.8, atkRate:1.5, pts:300 },
  { id:'s', name:'ESCUPIDOR', hp:70, spd:2.5, dmg:8, col:0x447744, sc:1.0, atkR:12, atkRate:2.0, pts:200, spitDmg:15 },
  { id:'e', name:'EXPLOSIVO', hp:50, spd:3.5, dmg:50, col:0x883333, sc:1.1, atkR:2.5, atkRate:999, pts:250 },
];

// ─── DIFFICULTIES ───
const DIFFS = {
  easy:   { name:'FÁCIL', hpM:0.6, spdM:0.75, dmgM:0.5, waveM:0.7, scoreM:0.5, ph:150, pa:50, desc:'Enemigos débiles y lentos', bonus:'×0.5 puntos' },
  normal: { name:'NORMAL', hpM:1.0, spdM:1.0, dmgM:1.0, waveM:1.0, scoreM:1.0, ph:100, pa:0, desc:'Experiencia equilibrada', bonus:'×1.0 puntos' },
  hard:   { name:'DIFÍCIL', hpM:1.5, spdM:1.15, dmgM:1.3, waveM:1.2, scoreM:1.5, ph:75, pa:0, desc:'Zombis más duros y rápidos', bonus:'×1.5 puntos' },
  nightmare: { name:'PESADILLA', hpM:2.5, spdM:1.35, dmgM:1.8, waveM:1.5, scoreM:2.5, ph:50, pa:0, desc:'Sobrevive si puedes...', bonus:'×2.5 puntos' },
};
let curDiff = 'normal';
let startWeapon = 'pistol';

// ─── WEAPONS ───
const WPS = {
  pistol:  { id:'p', name:'PISTOLA', dmg:20, rate:0.18, reload:1.2, mag:15, res:60, spread:0.015, auto:false, pellets:1, range:40, col:0x555555, tc:0xffff88, icon:'🔫' },
  smg:     { id:'s', name:'SUBfusil', dmg:10, rate:0.065, reload:1.5, mag:40, res:200, spread:0.03, auto:true, pellets:1, range:35, col:0x446644, tc:0x88ff88, icon:'🔫' },
  assault: { id:'a', name:'RIFLE', dmg:25, rate:0.1, reload:1.8, mag:30, res:120, spread:0.01, auto:true, pellets:1, range:60, col:0x444466, tc:0x88aaff, icon:'🔫' },
  shotgun: { id:'sg', name:'ESCOPETA', dmg:12, rate:0.55, reload:2.5, mag:8, res:32, spread:0.12, auto:false, pellets:8, range:20, col:0x664444, tc:0xff8844, icon:'💥' },
  rocket:  { id:'r', name:'LANZADOR', dmg:150, rate:1.2, reload:3.0, mag:1, res:8, spread:0.005, auto:false, pellets:1, range:80, col:0x664422, tc:0xff4400, icon:'🚀', aoe:5, aoeDmg:80 },
};
const WORDER = ['pistol','smg','assault','shotgun','rocket'];

// ─── THREE.JS SETUP ───
const R = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
R.setSize(innerWidth, innerHeight);
R.setPixelRatio(Math.min(devicePixelRatio, 2));
R.shadowMap.enabled = true;
R.shadowMap.type = THREE.PCFSoftShadowMap;
R.toneMapping = THREE.ACESFilmicToneMapping;
R.toneMappingExposure = 1.0;
dom.canvas.appendChild(R.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.Fog(0x1a1a2e, 60, 120);

const cam = new THREE.PerspectiveCamera(72, innerWidth/innerHeight, 0.1, 200);
cam.position.set(15, PH, 15);
scene.add(cam);

const clock = new THREE.Clock();

// ─── LIGHTS ───
const ambLight = new THREE.AmbientLight(0x8888cc, 0.5); scene.add(ambLight);
const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x443322, 0.6); scene.add(hemiLight);
const sunLight = new THREE.DirectionalLight(0xffddaa, 1.5);
sunLight.position.set(30, 40, -20);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(1024, 1024);
sunLight.shadow.camera.near = 0.5; sunLight.shadow.camera.far = 100;
sunLight.shadow.camera.left = -60; sunLight.shadow.camera.right = 60;
sunLight.shadow.camera.top = 60; sunLight.shadow.camera.bottom = -60;
sunLight.shadow.bias = -0.002;
scene.add(sunLight);
const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3); fillLight.position.set(-20, 10, 30); scene.add(fillLight);

// ─── STARS ───
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(2000 * 3);
for (let i = 0; i < 2000; i++) {
  const t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1), r = 80 + Math.random() * 40;
  starPos[i*3] = r * Math.sin(p) * Math.cos(t);
  starPos[i*3+1] = Math.abs(r * Math.cos(p));
  starPos[i*3+2] = r * Math.sin(p) * Math.sin(t);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0.5, sizeAttenuation: true }));
scene.add(stars);

// ─── GROUND ───
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(MAP_SZ, MAP_SZ),
  new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95, metalness: 0 })
);
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

function addZone(cx, cz, w, d, col) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color: col, roughness: 0.95 }));
  m.rotation.x = -Math.PI / 2; m.position.set(cx, 0.01, cz); scene.add(m);
}
addZone(0, 0, 30, 30, 0x222222);
addZone(-30, -25, 24, 20, 0x1a1f1a);
addZone(30, -25, 20, 20, 0x1a1a1f);
addZone(-28, 30, 20, 16, 0x1f1a1a);
addZone(30, 28, 16, 14, 0x1f1f1a);

// ─── WALL SYSTEM ───
const walls = [];

function seg(x, z, w, h, d, col = 0x2a2a3a) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: col, roughness: 0.75, metalness: 0.1 }));
  m.position.set(x, h / 2, z); m.castShadow = true; m.receiveShadow = true;
  scene.add(m);
  const hw = w / 2, hd = d / 2;
  walls.push({ minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd });
  return m;
}

function room(cx, cz, w, d, h, col, doors) {
  const t = 0.8, dw = 2.8;
  const hw = w / 2, hd = d / 2;
  const has = s => doors.includes(s);
  if (has('n')) { const sw = (w - dw) / 2; if (sw > 0) { seg(cx - hw + sw/2, cz - hd, sw, h, t, col); seg(cx + hw - sw/2, cz - hd, sw, h, t, col); } }
  else seg(cx, cz - hd, w, h, t, col);
  if (has('s')) { const sw = (w - dw) / 2; if (sw > 0) { seg(cx - hw + sw/2, cz + hd, sw, h, t, col); seg(cx + hw - sw/2, cz + hd, sw, h, t, col); } }
  else seg(cx, cz + hd, w, h, t, col);
  if (has('e')) { const sd = (d - dw) / 2; if (sd > 0) { seg(cx + hw, cz - hd + sd/2, t, h, sd, col); seg(cx + hw, cz + hd - sd/2, t, h, sd, col); } }
  else seg(cx + hw, cz, t, h, d, col);
  if (has('w')) { const sd = (d - dw) / 2; if (sd > 0) { seg(cx - hw, cz - hd + sd/2, t, h, sd, col); seg(cx - hw, cz + hd - sd/2, t, h, sd, col); } }
  else seg(cx - hw, cz, t, h, d, col);
}

// Boundary
seg(0, -HALF, MAP_SZ, 5, 0.8, 0x111122);
seg(0, HALF, MAP_SZ, 5, 0.8, 0x111122);
seg(-HALF, 0, 0.8, 5, MAP_SZ, 0x111122);
seg(HALF, 0, 0.8, 5, MAP_SZ, 0x111122);

// Buildings
room(-32, -25, 20, 14, 5, 0x2a2a4a, ['s','e']);
room(32, -25, 14, 12, 5, 0x3a2a4a, ['w']);
room(-28, 30, 16, 10, 4, 0x2a3a4a, ['n']);
room(30, 28, 10, 8, 4, 0x3a3a4a, ['n','s']);

// Fountain
const fp = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 0.5, 12), new THREE.MeshStandardMaterial({ color: 0x444466, roughness: 0.4, metalness: 0.3 }));
fp.position.set(0, 0.25, 0); scene.add(fp);
const fw = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.05, 12), new THREE.MeshStandardMaterial({ color: 0x4488cc, emissive: 0x4488ff, emissiveIntensity: 0.05, transparent: true, opacity: 0.5 }));
fw.position.set(0, 0.5, 0); scene.add(fw);
walls.push({ minX: -1, maxX: 1, minZ: -1, maxZ: 1 });

for (let i = 0; i < 4; i++) {
  const a = i * Math.PI / 2;
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 2.0, 6), new THREE.MeshStandardMaterial({ color: 0x444466, roughness: 0.5 }));
  p.position.set(Math.cos(a) * 3.5, 1, Math.sin(a) * 3.5); p.castShadow = true; scene.add(p);
  const r = 0.15;
  walls.push({ minX: Math.cos(a) * 3.5 - r, maxX: Math.cos(a) * 3.5 + r, minZ: Math.sin(a) * 3.5 - r, maxZ: Math.sin(a) * 3.5 + r });
}

// Cover walls
const COVER = [
  [-8,-8],[8,8],[-8,8],[8,-8],[-15,0],[15,0],[0,-15],[0,15],
  [-22,-12],[22,12],[-22,12],[22,-12],[-35,-5],[35,5],[-35,5],[35,-5],
  [-12,-30],[12,30],[-12,30],[12,-30],[-40,-20],[40,20],[-40,20],[40,-20],
];
for (const [cx, cz] of COVER) seg(cx, cz, 2 + Math.random() * 1.5, 1.0 + Math.random() * 0.5, 0.5, 0x333355);

// Cars
function addCar(x, z, rot) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x443333 + Math.floor(Math.random() * 0x222222), roughness: 0.6, metalness: 0.4 });
  const gmat = new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.4, metalness: 0.6 });
  const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.9), mat); b.position.y = 0.25; b.castShadow = true; g.add(b);
  const t = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.25, 0.8), new THREE.MeshStandardMaterial({ color: 0x334466, transparent: true, opacity: 0.3 }));
  t.position.set(0, 0.55, -0.05); g.add(t);
  for (const sx of [-0.5, 0.5]) {
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.06, 6), gmat);
    wh.rotation.x = Math.PI / 2; wh.position.set(sx, 0.06, -0.25); g.add(wh);
    const wh2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.06, 6), gmat);
    wh2.rotation.x = Math.PI / 2; wh2.position.set(sx, 0.06, 0.25); g.add(wh2);
  }
  g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  walls.push({ minX: x - 1.1, maxX: x + 1.1, minZ: z - 0.6, maxZ: z + 0.6 });
}
addCar(-18, -10, 0.3); addCar(20, -15, -0.8); addCar(-25, 18, 0.5); addCar(22, 20, -0.2);

// Crates
const CRATES = [
  [-6,-6],[6,6],[-6,6],[6,-6],[-12,-15],[15,12],[-15,12],[12,-15],
  [-25,-32],[32,25],[-32,25],[25,-32],[-42,-8],[42,8],[-42,8],[42,-8],
  [-8,-42],[8,42],[-35,-42],[35,42],[-12,35],[35,-12],
];
for (const [cx, cz] of CRATES) {
  const s = 0.4 + Math.random() * 0.5;
  const col = [0x554433, 0x664433, 0x445544, 0x555544][Math.floor(Math.random() * 4)];
  const m = new THREE.Mesh(new THREE.BoxGeometry(s * 0.8, s * 0.4, s * 0.8), new THREE.MeshStandardMaterial({ color: col, roughness: 0.8 }));
  m.position.set(cx, s * 0.2, cz); m.castShadow = true; m.receiveShadow = true; scene.add(m);
  const hw = s * 0.4, hd = s * 0.4;
  walls.push({ minX: cx - hw, maxX: cx + hw, minZ: cz - hd, maxZ: cz + hd });
}

// Barrels
for (const [bx, bz] of [[-12,-12],[12,12],[-12,12],[12,-12],[-5,-30],[5,30],[-30,-5],[30,5],[-38,-15],[38,15],[-15,-38],[15,38]]) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0x664422, roughness: 0.9 }));
  m.position.set(bx, 0.2, bz); m.castShadow = true; scene.add(m);
  walls.push({ minX: bx - 0.25, maxX: bx + 0.25, minZ: bz - 0.25, maxZ: bz + 0.25 });
}

// Lamp posts
for (const [lx, lz] of [[-8,-8],[8,8],[-8,8],[8,-8],[-18,-18],[18,18],[-18,18],[18,-18],[-35,-10],[35,10],[-35,10],[35,-10],[0,-25],[0,25],[-25,0],[25,0],[-40,-18],[40,18],[-40,18],[40,-18],[-18,40],[18,-40]]) {
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 2.0, 6), new THREE.MeshStandardMaterial({ color: 0x333344, metalness: 0.6 }));
  p.position.set(lx, 1, lz); p.castShadow = true; scene.add(p);
  const l = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), new THREE.MeshStandardMaterial({ color: 0xff6633, emissive: 0xff4400, emissiveIntensity: 0.15 }));
  l.position.set(lx, 2.2, lz); scene.add(l);
  walls.push({ minX: lx - 0.08, maxX: lx + 0.08, minZ: lz - 0.08, maxZ: lz + 0.08 });
}

// Fire barrels
for (const [fx, fz] of [[-18,-35],[18,35],[-35,-18],[35,18],[-35,18],[35,-18]]) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0x553322, roughness: 0.9 }));
  m.position.set(fx, 0.2, fz); m.castShadow = true; scene.add(m);
  const f = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.6 }));
  f.position.set(fx, 0.5, fz); scene.add(f);
  const fl = new THREE.PointLight(0xff4400, 0.3, 4); fl.position.set(fx, 0.5, fz); scene.add(fl);
  walls.push({ minX: fx - 0.3, maxX: fx + 0.3, minZ: fz - 0.3, maxZ: fz + 0.3 });
}

// Graves
function addGrave(x, z) {
  const g = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.15), new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 }));
  g.position.set(x, 0.06, z); g.castShadow = true; scene.add(g);
  const cr = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.25, 0.03), new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.3 }));
  cr.position.set(x, 0.2, z); scene.add(cr);
  const cr2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.03), new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.3 }));
  cr2.position.set(x, 0.3, z); scene.add(cr2);
  walls.push({ minX: x - 0.25, maxX: x + 0.25, minZ: z - 0.1, maxZ: z + 0.1 });
}
for (const [gx, gz] of [[-10,-22],[10,22],[-22,10],[22,-10],[-6,35],[35,6],[6,-35],[-35,-6],[-42,-12],[42,12],[-42,12],[42,-12]])
  addGrave(gx, gz);

// Blood pools
for (const [bx, bz] of [[-4,-4],[4,4],[-4,4],[4,-4],[-14,-18],[18,14],[-18,14],[14,-18],[-28,-32],[32,28],[-32,28],[28,-32],[-8,40],[40,-8],[8,-40],[-40,8]]) {
  const r = 0.3 + Math.random() * 0.4;
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 6), new THREE.MeshBasicMaterial({ color: 0x330000, transparent: true, opacity: 0.25 + Math.random() * 0.15 }));
  m.rotation.x = -Math.PI / 2; m.position.set(bx, 0.02, bz); scene.add(m);
}

// Spawn points
const SPAWNS = [];
for (let i = 0; i < 20; i++) {
  const a = i / 20 * Math.PI * 2;
  SPAWNS.push({ x: Math.cos(a) * (HALF - 5), z: Math.sin(a) * (HALF - 5) });
}

// ─── COLLISION ───
function collides(x, z, r) {
  const h = HALF - r;
  if (x < -h || x > h || z < -h || z > h) return true;
  for (const w of walls) {
    if (x + r > w.minX && x - r < w.maxX && z + r > w.minZ && z - r < w.maxZ) return true;
  }
  return false;
}
function spawnClear(x, z) {
  return !collides(x, z, PR);
}

// ─── AUDIO ───
let actx = null;
let soundOn = true;
const sndBtn = dom.menuSnd;
let audioInitialized = false;

function initAudio() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
  if (!audioInitialized) { audioInitialized = true; updateSndUI(); }
}
function tone(type, freq, dur, vol, ramp) {
  if (!soundOn) return;
  try {
    initAudio(); const o = actx.createOscillator(), g = actx.createGain();
    o.connect(g); g.connect(actx.destination); const t = actx.currentTime;
    o.type = type; typeof freq === 'function' ? freq(o, t) : (o.frequency.setValueAtTime(freq, t), ramp && o.frequency.exponentialRampToValueAtTime(ramp, t + dur));
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t); o.stop(t + dur);
  } catch (e) {}
}
function noise(dur, vol) {
  if (!soundOn) return;
  try {
    initAudio(); const len = Math.floor(actx.sampleRate * dur), buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = actx.createBufferSource(); s.buffer = buf;
    const g = actx.createGain(); g.gain.setValueAtTime(vol, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
    s.connect(g); g.connect(actx.destination); s.start();
  } catch (e) {}
}
const SND = {
  pistol() { tone('square', 500, 0.08, 0.1, 150); noise(0.05, 0.06); },
  smg() { tone('sawtooth', 900, 0.04, 0.06, 300); noise(0.04, 0.05); },
  rifle() { tone('sawtooth', 800, 0.06, 0.1, 200); noise(0.06, 0.08); },
  shotgun() { noise(0.15, 0.2); tone('sawtooth', 150, 0.15, 0.12, 50); },
  rocket() { tone('sawtooth', 200, 0.3, 0.15, 80); noise(0.3, 0.12); },
  explosion() { noise(0.4, 0.25); tone('sine', 60, 0.4, 0.2, 20); },
  hit() { tone('square', 400, 0.05, 0.07, 100); },
  kill() { tone('sine', 600, 0.12, 0.1, 1200); tone('sine', 900, 0.08, 0.08, 1400); },
  hurt() { tone('sawtooth', 200, 0.15, 0.12, 50); },
  pickup() { tone('sine', 500, 0.08, 0.06, 1000); tone('sine', 800, 0.06, 0.05, 1200); },
  headshot() { tone('sine', 1000, 0.1, 0.12, 1500); tone('square', 600, 0.08, 0.08, 800); },
  zombieD() { tone('sawtooth', 300, 0.2, 0.08, 50); noise(0.15, 0.06); },
  zombieH() { tone('sawtooth', 500, 0.08, 0.06, 100); },
  spit() { noise(0.1, 0.08); tone('sine', 300, 0.1, 0.06, 100); },
  waveS() { tone('sine', 400, 0.15, 0.1, 800); setTimeout(() => tone('sine', 600, 0.15, 0.1, 1000), 200); setTimeout(() => tone('sawtooth', 800, 0.2, 0.12, 1200), 400); },
  victory() { tone('sine', 523, 0.2, 0.1, 600); setTimeout(() => tone('sine', 659, 0.2, 0.1, 750), 200); setTimeout(() => tone('sine', 784, 0.3, 0.1, 900), 400); },
  empty() { tone('square', 200, 0.05, 0.04, 80); },
  reload() { tone('sine', 600, 0.06, 0.05, 900); setTimeout(() => tone('sine', 800, 0.06, 0.04, 1000), 120); },
  streak() { tone('sine', 523, 0.1, 0.08, 700); setTimeout(() => tone('sine', 659, 0.1, 0.08, 900), 100); setTimeout(() => tone('sine', 784, 0.15, 0.1, 1100), 200); },
};
function snd(name) { if (SND[name]) SND[name](); }

// ─── PARTICLES ───
const particles = [];
function spawnParticles(pos, col, count = 25) {
  for (let i = 0; i < count; i++) {
    const s = 0.03 + Math.random() * 0.12;
    const m = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.2, transparent: true, opacity: 1 }));
    m.position.copy(pos);
    const v = new THREE.Vector3(Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5).normalize().multiplyScalar(2 + Math.random() * 4);
    m.userData = { vel: v, life: 0.4 + Math.random() * 0.6 };
    scene.add(m); particles.push(m);
  }
}
function spawnExplosion(pos, radius = 3) {
  const n = 40 + Math.floor(radius * 10);
  const colors = [0xff4400, 0xff8800, 0xffcc00, 0xff2200];
  for (let i = 0; i < n; i++) {
    const s = 0.05 + Math.random() * 0.18;
    const m = new THREE.Mesh(new THREE.SphereGeometry(s, 4, 4), new THREE.MeshStandardMaterial({ color: colors[Math.floor(Math.random() * 4)], emissive: 0xff4400, emissiveIntensity: 0.4, transparent: true, opacity: 1 }));
    m.position.copy(pos);
    const v = new THREE.Vector3(Math.random() - 0.5, Math.random() * 1.5, Math.random() - 0.5).normalize().multiplyScalar(3 + Math.random() * radius * 2.5);
    m.userData = { vel: v, life: 0.3 + Math.random() * 0.5 };
    scene.add(m); particles.push(m);
  }
  const flash = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.5 }));
  flash.position.copy(pos);
  flash.userData = { vel: new THREE.Vector3(), life: 0.12 };
  particles.push(flash); scene.add(flash);
}
function spawnBlood(pos) {
  for (let i = 0; i < 8; i++) {
    const s = 0.02 + Math.random() * 0.05;
    const m = new THREE.Mesh(new THREE.SphereGeometry(s, 4, 4), new THREE.MeshStandardMaterial({ color: 0xcc2222, emissive: 0x440000, transparent: true, opacity: 0.8 }));
    m.position.copy(pos);
    const v = new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.5 + 0.3, Math.random() - 0.5).normalize().multiplyScalar(1 + Math.random() * 2);
    m.userData = { vel: v, life: 0.4 + Math.random() * 0.4 };
    scene.add(m); particles.push(m);
  }
}
function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.userData.vel.y -= 5 * dt;
    p.position.addScaledVector(p.userData.vel, dt);
    p.userData.life -= dt;
    p.material.opacity = Math.max(0, p.userData.life);
    p.scale.multiplyScalar(0.96);
    if (p.userData.life <= 0) {
      scene.remove(p);
      if (p.geometry) p.geometry.dispose();
      if (p.material) p.material.dispose();
      particles.splice(i, 1);
    }
  }
}

// ─── WEAPON MODEL ───
const wGroup = new THREE.Group();
let curW = WPS.assault;
const wModels = {};
const wAmmo = {};

function buildWModel(def) {
  const g = new THREE.Group();
  const bm = new THREE.MeshStandardMaterial({ color: def.col, roughness: 0.4, metalness: 0.6 });
  const dm = new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.5, metalness: 0.4 });
  const gm = new THREE.MeshStandardMaterial({ color: 0x3a3020, roughness: 0.8 });
  
  if (def.id === 'p') {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.25), bm); b.position.z = -0.12; g.add(b);
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.3, 6), dm); br.rotation.x = Math.PI / 2; br.position.z = -0.3; g.add(br);
    const gr = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.05), gm); gr.position.set(0, -0.09, 0.02); g.add(gr);
  } else if (def.id === 's') {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.35), bm); b.position.z = -0.17; g.add(b);
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.4, 6), dm); br.rotation.x = Math.PI / 2; br.position.z = -0.35; g.add(br);
    const mg = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.06), dm); mg.position.set(0, -0.1, 0.02); g.add(mg);
  } else if (def.id === 'a') {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.45), bm); b.position.z = -0.22; g.add(b);
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.55, 8), dm); br.rotation.x = Math.PI / 2; br.position.z = -0.5; g.add(br);
    const gr = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.06), gm); gr.position.set(0, -0.08, 0.02); g.add(gr);
    const mg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.08), dm); mg.position.set(0, -0.06, 0.04); g.add(mg);
  } else if (def.id === 'sg') {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.5), bm); b.position.z = -0.25; g.add(b);
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.6, 8), dm); br.rotation.x = Math.PI / 2; br.position.z = -0.55; g.add(br);
    const br2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.55, 8), dm); br2.rotation.x = Math.PI / 2; br2.position.set(0.04, 0, -0.52); g.add(br2);
    const gr = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.13, 0.06), gm); gr.position.set(0, -0.08, 0.04); g.add(gr);
  } else if (def.id === 'r') {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.4, 8), bm); b.rotation.x = Math.PI / 2; b.position.z = -0.2; g.add(b);
    const t = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.12, 8), new THREE.MeshStandardMaterial({ color: 0xcc8844, metalness: 0.3 }));
    t.rotation.x = -Math.PI / 2; t.position.z = -0.46; g.add(t);
    const gr = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.08), gm); gr.position.set(0, -0.09, 0.02); g.add(gr);
    const la = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8), dm); la.rotation.x = Math.PI / 2; la.position.set(0, -0.05, -0.15); g.add(la);
  }
  const mf = new THREE.PointLight(0xffaa44, 0, 3); mf.position.set(0, 0, -0.8); g.add(mf); g.userData.mf = mf;
  return g;
}

function switchW(id) {
  if (G.reloading) return;
  if (wModels[G.curW]) wGroup.remove(wModels[G.curW]);
  wAmmo[G.curW] = { a: G.ammo, r: G.reserve };
  G.curW = id; curW = WPS[id];
  const sv = wAmmo[id];
  if (sv) { G.ammo = sv.a; G.reserve = sv.r; }
  else { G.ammo = curW.mag; G.reserve = curW.res; }
  G.shootCD = 0;
  if (!wModels[id]) wModels[id] = buildWModel(curW);
  wGroup.add(wModels[id]); wModels[id].visible = true;
}

// ─── TRACERS ───
const tracers = [];
function addTracer(from, to, col) {
  const g = new THREE.BufferGeometry().setFromPoints([from.clone(), to.clone()]);
  const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.6 }));
  scene.add(l);
  tracers.push({ l, life: 0.1 });
}
function updateTracers(dt) {
  for (let i = tracers.length - 1; i >= 0; i--) {
    const t = tracers[i]; t.life -= dt;
    t.l.material.opacity = t.life / 0.1;
    if (t.life <= 0) { scene.remove(t.l); t.l.geometry.dispose(); t.l.material.dispose(); tracers.splice(i, 1); }
  }
}

// ─── ROCKETS ───
const rockets = [];
function fireRocket(origin, dir) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0x666644, metalness: 0.4 }));
  b.rotation.x = Math.PI / 2; g.add(b);
  const t = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 8), new THREE.MeshStandardMaterial({ color: 0xcc8844, metalness: 0.3 }));
  t.rotation.x = -Math.PI / 2; t.position.z = -0.21; g.add(t);
  for (let i = 0; i < 4; i++) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.06, 0.05), new THREE.MeshStandardMaterial({ color: 0x444422 }));
    f.position.set(Math.cos(i * Math.PI / 2) * 0.08, 0, 0.12); g.add(f);
  }
  g.position.copy(origin);
  const d = dir.clone().normalize();
  g.lookAt(origin.clone().add(d));
  const lt = new THREE.PointLight(0xff6600, 1, 4); g.add(lt);
  scene.add(g);
  rockets.push({ g, d, p: origin.clone(), spd: 30, alive: true, life: 3 });
  snd('rocket');
}
function updateRockets(dt) {
  for (let i = rockets.length - 1; i >= 0; i--) {
    const r = rockets[i];
    if (!r.alive) { scene.remove(r.g); rockets.splice(i, 1); continue; }
    r.life -= dt;
    if (r.life <= 0) { rocketExplode(r.p); r.alive = false; continue; }
    r.p.addScaledVector(r.d, r.spd * dt);
    r.g.position.copy(r.p);
    if (Math.random() < 0.6) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.7 }));
      p.position.copy(r.p);
      p.userData = { vel: new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.3, Math.random() - 0.5).multiplyScalar(1.5), life: 0.3 };
      scene.add(p); particles.push(p);
    }
    const p = r.p; const h = HALF - 0.5;
    if (p.x < -h || p.x > h || p.z < -h || p.z > h) { rocketExplode(p); r.alive = false; continue; }
    let hit = false;
    for (const w of walls) { if (p.x > w.minX && p.x < w.maxX && p.z > w.minZ && p.z < w.maxZ) { hit = true; break; } }
    if (hit) { rocketExplode(p); r.alive = false; continue; }
    for (const z of zombies) { if (!z.alive) continue; if (p.distanceTo(z.getPos()) < 1.0) { rocketExplode(p); z.takeDamage(999, false); r.alive = false; break; } }
  }
}
function rocketExplode(pos) {
  const aoe = 5, dmg = 80;
  for (const z of zombies) { if (!z.alive) continue; const d = z.getPos().distanceTo(pos); if (d < aoe) z.takeDamage(dmg * (1 - d / aoe), false); }
  spawnExplosion(pos, aoe);
  snd('explosion');
  const dist = cam.position.distanceTo(pos);
  if (dist < 15) screenShake = Math.max(screenShake, (1 - dist / 15) * 0.3);
}

// ─── SPIT ───
const spits = [];
function fireSpit(from, to) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshStandardMaterial({ color: 0x44ff44, emissive: 0x44ff44, emissiveIntensity: 0.3 }));
  m.position.copy(from);
  const d = new THREE.Vector3().subVectors(to, from).normalize();
  scene.add(m);
  spits.push({ m, d, spd: 10, alive: true, life: 3 });
  snd('spit');
}
function updateSpits(dt) {
  for (let i = spits.length - 1; i >= 0; i--) {
    const s = spits[i];
    if (!s.alive) { scene.remove(s.m); s.m.geometry.dispose(); s.m.material.dispose(); spits.splice(i, 1); continue; }
    s.life -= dt;
    if (s.life <= 0) { s.alive = false; continue; }
    s.m.position.addScaledVector(s.d, s.spd * dt);
    const p = s.m.position;
    if (p.distanceTo(cam.position) < 0.7) { playerHit(15, new THREE.Vector3().subVectors(p, cam.position).normalize()); spawnParticles(p, 0x44ff44, 6); s.alive = false; continue; }
    for (const w of walls) { if (p.x > w.minX && p.x < w.maxX && p.z > w.minZ && p.z < w.maxZ) { spawnParticles(p, 0x44ff44, 4); s.alive = false; break; } }
  }
}

let screenShake = 0;

// ─── ZOMBIE ───
class Zombie {
  constructor(ti, difficulty) {
    this.t = ZT[ti];
    this.diff = difficulty || DIFFS.normal;
    this.alive = false;
    this.baseHP = this.t.hp;
    this.hp = this.baseHP * this.diff.hpM;
    this.maxHP = this.hp;
    this.g = new THREE.Group();
    this.g.visible = false;
    this.build();
    this.hpEl = this.createHP();
    this.atkCD = 0;
    this.spitCD = 0;
    this.spawnT = 0;
  }
  build() {
    const s = this.t.sc, c = this.t.col;
    const skin = new THREE.MeshStandardMaterial({ color: 0x889977, roughness: 0.7 });
    const cloth = new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x443333, roughness: 0.8 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.45 * s, 0.45 * s, 0.28 * s), cloth);
    body.position.y = 0.45 * s; body.castShadow = true; this.g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18 * s, 7, 7), skin);
    head.position.set(0, 1.0 * s, 0); this.g.add(head);
    const eCol = this.t.id === 'e' ? 0xff4400 : this.t.id === 's' ? 0x44ff44 : 0xffcc88;
    const eMat = new THREE.MeshBasicMaterial({ color: eCol });
    const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.04 * s, 6, 6), eMat);
    e1.position.set(0.07 * s, 1.03 * s, 0.16 * s); this.g.add(e1);
    const e2 = new THREE.Mesh(new THREE.SphereGeometry(0.04 * s, 6, 6), eMat);
    e2.position.set(-0.07 * s, 1.03 * s, 0.16 * s); this.g.add(e2);
    const arm = new THREE.MeshStandardMaterial({ color: 0x778866, roughness: 0.7 });
    for (const side of [-1, 1]) {
      const a = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * s, 0.06 * s, 0.3 * s, 6), arm);
      a.position.set(side * 0.3 * s, 0.65 * s, 0); a.rotation.z = side * 0.3; this.g.add(a);
    }
    for (const side of [-0.1, 0.1]) {
      const l = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * s, 0.07 * s, 0.3 * s, 6), dark);
      l.position.set(side * s, 0.18 * s, 0); this.g.add(l);
    }
    if (this.t.id === 't') {
      const a = new THREE.Mesh(new THREE.BoxGeometry(0.55 * s, 0.25 * s, 0.12 * s), new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.5 }));
      a.position.set(0, 0.55 * s, 0); this.g.add(a);
    }
    if (this.t.id === 'e') {
      const gl = new THREE.Mesh(new THREE.SphereGeometry(0.25 * s, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.12 }));
      gl.position.set(0, 1.0 * s, 0); this.g.add(gl);
    }
    if (this.t.id === 's') {
      const j = new THREE.Mesh(new THREE.BoxGeometry(0.12 * s, 0.06 * s, 0.16 * s), new THREE.MeshStandardMaterial({ color: 0x667755 }));
      j.position.set(0, 0.92 * s, 0.12 * s); this.g.add(j);
    }
  }
  createHP() {
    const bg = document.createElement('div');
    bg.style.cssText = 'position:fixed;width:30px;height:3px;background:rgba(0,0,0,0.6);border-radius:2px;pointer-events:none;z-index:5;display:none';
    const f = document.createElement('div'); f.style.cssText = 'height:100%;border-radius:2px;';
    bg.appendChild(f); document.body.appendChild(bg);
    return { bg, fill: f };
  }
  spawn(pos) {
    this.g.position.copy(pos); this.alive = true;
    this.hp = this.maxHP; this.g.visible = true; this.hpEl.bg.style.display = 'block';
    this.atkCD = 0; this.spitCD = 0; this.spawnT = 0.4;
    this.g.scale.y = 0.01;
  }
  getPos() { return this.g.position; }
  takeDamage(amt, hs) {
    if (!this.alive) return null;
    const d = hs ? amt * 3 : amt;
    this.hp -= d;
    spawnBlood(this.getPos().clone().add(new THREE.Vector3(0, 0.5, 0)));
    if (this.hp <= 0) { this.die(); return { kill: true, hs }; }
    snd('zombieH');
    return { kill: false, hs };
  }
  die() {
    this.alive = false; this.g.visible = false; this.hpEl.bg.style.display = 'none';
    spawnParticles(this.getPos().clone().add(new THREE.Vector3(0, 0.4, 0)), this.t.col, 15);
    if (this.t.id === 'e') {
      const p = this.getPos().clone(), aoe = 3, dmg = 50;
      if (cam.position.distanceTo(p) < aoe) playerHit(dmg * (1 - cam.position.distanceTo(p) / aoe), new THREE.Vector3().subVectors(p, cam.position).normalize());
      for (const z of zombies) { if (!z.alive || z === this) continue; const d = z.getPos().distanceTo(p); if (d < aoe) z.takeDamage(dmg * 0.5 * (1 - d / aoe), false); }
      spawnExplosion(p, aoe); snd('explosion');
    }
    snd('zombieD');
  }
  update(dt, pp, obs) {
    if (!this.alive) return;
    if (this.spawnT > 0) {
      this.spawnT -= dt;
      this.g.scale.y = Math.min(1, 1 - this.spawnT / 0.4);
      if (this.spawnT <= 0) this.g.scale.y = 1;
      if (this.spawnT > 0) return;
    }
    const mp = this.getPos();
    const dist = mp.distanceTo(pp);
    this.atkCD -= dt; this.spitCD -= dt;
    if (dist < this.t.atkR && this.atkCD <= 0) {
      if (this.t.id === 'e') { this.die(); return; }
      this.atkCD = this.t.atkR;
      const dmg = this.t.dmg * this.diff.dmgM;
      playerHit(dmg, new THREE.Vector3().subVectors(mp, pp).normalize());
      screenShake = Math.max(screenShake, 0.04);
      return;
    }
    if (this.t.id === 's' && dist < this.t.atkR && dist > 2 && this.spitCD <= 0) {
      this.spitCD = this.t.atkR;
      fireSpit(mp.clone().add(new THREE.Vector3(0, 0.7, 0)), pp.clone());
      return;
    }
    const dir = new THREE.Vector3().subVectors(pp, mp);
    dir.y = 0;
    if (dir.length() > 0.5) {
      dir.normalize();
      const spd = this.t.spd * this.diff.spdM * dt;
      const nx = mp.x + dir.x * spd;
      const nz = mp.z + dir.z * spd;
      let ox = 0, oz = 0;
      for (const o of obs) {
        const cx = (o.minX + o.maxX) / 2, cz = (o.minZ + o.maxZ) / 2;
        const dx = nx - cx, dz = nz - cz;
        const dd = Math.sqrt(dx * dx + dz * dz);
        if (dd < 1.5 && dd > 0.01) { ox += dx / dd * (1.5 - dd) * 0.5; oz += dz / dd * (1.5 - dd) * 0.5; }
      }
      mp.x = Math.max(-HALF + 0.5, Math.min(HALF - 0.5, nx + ox * dt * 10));
      mp.z = Math.max(-HALF + 0.5, Math.min(HALF - 0.5, nz + oz * dt * 10));
      this.g.position.copy(mp);
    }
    const look = new THREE.Vector3().subVectors(pp, mp);
    look.y = 0;
    if (look.length() > 0.1) this.g.lookAt(mp.clone().add(look.normalize()));
  }
  updateHP() {
    if (!this.alive) { this.hpEl.bg.style.display = 'none'; return; }
    const p = this.getPos().clone(); p.y += 1.4 * this.t.sc;
    p.project(cam);
    const x = (p.x * 0.5 + 0.5) * innerWidth, y = (-p.y * 0.5 + 0.5) * innerHeight;
    this.hpEl.bg.style.left = (x - 15) + 'px'; this.hpEl.bg.style.top = y + 'px';
    const pct = Math.max(0, this.hp / this.maxHP);
    this.hpEl.fill.style.width = (pct * 100) + '%';
    this.hpEl.fill.style.background = this.t.id === 'e' ? '#ff4444' : pct > 0.6 ? '#44ff44' : pct > 0.3 ? '#ffaa44' : '#ff4444';
    this.hpEl.bg.style.display = 'block';
  }
  dispose() {
    this.hpEl.bg.remove();
    this.g.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
    scene.remove(this.g);
  }
}

let zombies = [];
let wave = 0, waveCount = 0, waveDelay = 0, waveActive = false;
let killStreak = 0;

function cleanDeadZombies() {
  for (let i = zombies.length - 1; i >= 0; i--) {
    if (!zombies[i].alive) {
      zombies[i].dispose();
      zombies.splice(i, 1);
    }
  }
}

function availTypes(w) {
  if (w <= 2) return [0];
  if (w <= 4) return [0, 1];
  if (w <= 6) return [0, 1, 2];
  if (w <= 8) return [0, 1, 2, 3];
  return [0, 1, 2, 3, 4];
}
function startWave() {
  for (const z of zombies) if (z.alive) z.die();
  cleanDeadZombies();
  wave++;
  waveActive = true;
  const diff = DIFFS[curDiff];
  waveCount = Math.floor((3 + wave * 2 + Math.floor(wave / 3) * 2) * diff.waveM);
  if (waveCount < 2) waveCount = 2;
  const types = availTypes(wave);
  for (let i = 0; i < waveCount; i++) {
    const ti = types[Math.floor(Math.random() * types.length)];
    const z = new Zombie(ti, diff);
    const sp = SPAWNS[i % SPAWNS.length];
    scene.add(z.g);
    let sx = sp.x + (Math.random() - 0.5) * 6, sz = sp.z + (Math.random() - 0.5) * 6;
    for (let t = 0; t < 5 && collides(sx, sz, 0.3); t++) { sx = sp.x + (Math.random() - 0.5) * 6; sz = sp.z + (Math.random() - 0.5) * 6; }
    z.spawn(new THREE.Vector3(sx, 0, sz));
    zombies.push(z);
  }
  showAnnounce('OLEADA ' + wave, waveCount + ' ZOMBIS');
  snd('waveS');
  waveDelay = 0.5;
}
function checkWave() {
  const alive = zombies.filter(z => z.alive).length;
  if (alive === 0 && waveActive && zombies.length > 0) {
    waveActive = false;
    waveDelay = 4;
    G.score += Math.floor(wave * 50 * DIFFS[curDiff].scoreM);
    showAnnounce('— OLEADA COMPLETA —', 'Siguiente en ' + waveDelay + 's');
    cleanDeadZombies();
  }
}

// ─── PICKUPS ───
const pickups = [];
function createPickups() {
  for (const p of pickups) { scene.remove(p); p.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }); }
  pickups.length = 0;
  const pos = [{ x: -18, z: 0 }, { x: 18, z: 0 }, { x: 0, z: -18 }, { x: 0, z: 18 }, { x: -10, z: -10 }, { x: 10, z: 10 }, { x: -30, z: -12 }, { x: 30, z: 12 }, { x: -12, z: 30 }, { x: 12, z: -30 }, { x: -4, z: -38 }, { x: 4, z: 38 }, { x: -38, z: -4 }, { x: 38, z: 4 }];
  const types = ['health', 'ammo', 'armor', 'health', 'ammo', 'health', 'armor', 'ammo', 'health', 'ammo', 'armor', 'health', 'ammo', 'health'];
  for (let i = 0; i < pos.length; i++) {
    const p = pos[i], type = types[i % types.length];
    const g = new THREE.Group(); g.position.set(p.x, 0.3, p.z);
    g.userData = { type, active: true, respawn: 0, val: type === 'health' ? 25 : type === 'armor' ? 30 : 20 };
    if (type === 'health') {
      const mat = new THREE.MeshStandardMaterial({ color: 0x44ff44, emissive: 0x44ff44, emissiveIntensity: 0.15 });
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.06), mat));
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.06), mat));
      const pl = new THREE.PointLight(0x44ff44, 0.06, 1.2); pl.position.y = 0.18; g.add(pl);
    } else if (type === 'ammo') {
      const mat = new THREE.MeshStandardMaterial({ color: 0x4488ff, emissive: 0x4488ff, emissiveIntensity: 0.15 });
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), mat));
      for (let j = 0; j < 3; j++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.06, 4), new THREE.MeshStandardMaterial({ color: 0xccaa44, metalness: 0.8 })); b.position.set((j - 1) * 0.08, 0.15, 0); b.rotation.x = Math.PI / 2; g.add(b); }
    } else {
      const mat = new THREE.MeshStandardMaterial({ color: 0x4488ff, emissive: 0x4488ff, emissiveIntensity: 0.15 });
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.06), mat); p1.position.z = 0.04; g.add(p1);
      const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.06), mat); p2.position.set(0, 0.04, -0.04); g.add(p2);
      const pl = new THREE.PointLight(0x4488ff, 0.06, 1.2); pl.position.y = 0.18; g.add(pl);
    }
    scene.add(g); pickups.push(g);
  }
}
function updatePickups(dt) {
  const t = Date.now() * 0.001;
  for (const p of pickups) {
    if (p.userData.active) {
      p.rotation.y += dt * 1.2;
      p.position.y = 0.3 + Math.sin(t * 2 + p.position.x * 0.5) * 0.1;
      if (cam.position.distanceTo(p.position) < 1.0) {
        if (p.userData.type === 'health') { G.health = Math.min(G.maxHP, G.health + p.userData.val); showPickup('+' + p.userData.val + ' HP'); }
        else if (p.userData.type === 'armor') { G.armor = Math.min(G.maxArm, G.armor + p.userData.val); showPickup('+' + p.userData.val + ' ARMOR'); }
        else { G.reserve += p.userData.val; if (G.reserve > G.magSize * 6) G.reserve = G.magSize * 6; showPickup('+' + p.userData.val + ' BALAS'); }
        snd('pickup'); p.userData.active = false; p.userData.respawn = 10; p.visible = false;
      }
    } else {
      p.userData.respawn -= dt;
      if (p.userData.respawn <= 0) { p.userData.active = true; p.visible = true; }
    }
  }
}
let pickupT;
function showPickup(msg) {
  const e = $('pickupMsg'); if (e) e.remove();
  const d = document.createElement('div'); d.id = 'pickupMsg'; d.className = 'hud-pickup'; d.textContent = msg;
  dom.hud.appendChild(d);
  clearTimeout(pickupT); pickupT = setTimeout(() => { const x = $('pickupMsg'); if (x) x.remove(); }, 2000);
}

// ─── GAME STATE ───
const G = {
  health: 100, maxHP: 100, armor: 0, maxArm: 100,
  score: 0, kills: 0, dead: false,
  ammo: 15, reserve: 60, magSize: 15,
  reloading: false, reloadT: 0,
  shootCD: 0, curW: 'pistol',
  totalShots: 0, totalHits: 0,
  mDown: false, running: false, paused: false,
};

// ─── SETTINGS ───
const settings = { sound: true, sensitivity: 1.0 };
function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('zs_settings'));
    if (s) { settings.sound = s.sound !== false; settings.sensitivity = s.sensitivity || 1.0; }
  } catch (e) {}
}
function saveSettings() {
  try { localStorage.setItem('zs_settings', JSON.stringify(settings)); } catch (e) {}
}
function updateSndUI() {
  const icon = settings.sound ? '🔊' : '🔇';
  if (dom.menuSnd) dom.menuSnd.textContent = icon;
  if (dom.hudSndBtn) dom.hudSndBtn.textContent = icon;
  const tb = $('sndToggle');
  if (tb) { tb.textContent = settings.sound ? 'ON' : 'OFF'; tb.classList.toggle('off', !settings.sound); }
  soundOn = settings.sound;
}

// ─── HIGH SCORES ───
function loadScores() {
  try { return JSON.parse(localStorage.getItem('zs_scores')) || []; } catch (e) { return []; }
}
function saveScore(score, kills, waveVal, acc, streakVal) {
  const scores = loadScores();
  scores.push({ score, kills, wave: waveVal, acc: (acc * 100).toFixed(0) + '%', streak: streakVal, diff: curDiff, date: Date.now() });
  scores.sort((a, b) => b.score - a.score);
  if (scores.length > 30) scores.length = 30;
  try { localStorage.setItem('zs_scores', JSON.stringify(scores)); } catch (e) {}
  return scores;
}
function buildScoreHTML(scores, limit = 10) {
  if (!scores.length) return '<div class="scores-empty">Aún no hay puntuaciones</div>';
  return scores.slice(0, limit).map((s, i) =>
    '<div class="hs-row"><span>' + (i + 1) + '.</span><span>' + s.score + '</span><span>Ola ' + s.wave + '</span><span>' + (s.diff || 'NORMAL') + '</span></div>'
  ).join('');
}

// ─── HUD ───
function updHUD() {
  const hp = Math.max(0, G.health / G.maxHP * 100);
  dom.healthBar.style.width = hp + '%';
  dom.healthBar.style.background = hp > 60 ? '#44ff44' : hp > 30 ? '#ffaa44' : '#ff4444';
  dom.healthText.textContent = Math.max(0, Math.round(G.health));
  dom.armorBar.style.width = Math.max(0, G.armor / G.maxArm * 100) + '%';
  dom.lowhp.classList.toggle('active', G.health < 30);
  dom.scoreText.textContent = G.score;
  dom.killsText.textContent = G.kills;
  dom.streakText.textContent = killStreak;
  dom.hudRound.textContent = 'OLEADA ' + wave;
  dom.ammoText.textContent = G.ammo;
  dom.ammoReserve.textContent = G.reloading ? '...' : G.reserve;
  dom.weaponName.textContent = curW.name;
  dom.weaponIcon.textContent = WPS[G.curW].icon || '🔫';
  dom.reloadInd.style.display = G.reloading ? 'block' : 'none';
  dom.weaponStrip.innerHTML = '';
  for (const id of WORDER) {
    const el = document.createElement('div');
    el.className = 'ws-item' + (id === G.curW ? ' active' : '');
    el.innerHTML = '<span class="ws-key">' + (WORDER.indexOf(id) + 1) + '</span>' + WPS[id].name.substring(0, 4);
    dom.weaponStrip.appendChild(el);
  }
  const alive = zombies.filter(z => z.alive).length;
  dom.botsAlive.textContent = 'ZOMBIS: ' + alive + ' / ' + waveCount;
  drawMap();
}
function drawMap() {
  const ctx = dom.minimap.getContext('2d'), sz = 140;
  ctx.clearRect(0, 0, sz, sz);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, sz, sz);
  const sc = sz / (HALF * 2);
  const px = (cam.position.x + HALF) * sc, py = (cam.position.z + HALF) * sc;
  ctx.fillStyle = '#44ff44'; ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
  for (const z of zombies) {
    if (!z.alive) continue;
    const zp = z.getPos();
    ctx.fillStyle = '#ff4444'; ctx.beginPath(); ctx.arc((zp.x + HALF) * sc, (zp.z + HALF) * sc, 2, 0, Math.PI * 2); ctx.fill();
  }
}
function showCrosshair() { dom.crosshair.classList.add('shoot'); setTimeout(() => dom.crosshair.classList.remove('shoot'), 100); }
function showHit(hs) {
  dom.hitmarker.classList.add('show');
  dom.hitmarker.style.transform = hs ? 'translate(-50%,-50%) scale(1.4)' : 'translate(-50%,-50%) scale(1)';
  setTimeout(() => { dom.hitmarker.classList.remove('show'); dom.hitmarker.style.transform = 'translate(-50%,-50%) scale(1)'; }, 120);
}
function showDmg(pos, dmg, hs) {
  const v = pos.clone().project(cam);
  const x = (v.x * 0.5 + 0.5) * innerWidth, y = (-v.y * 0.5 + 0.5) * innerHeight;
  const e = document.createElement('div'); e.className = 'dmg-num' + (hs ? ' headshot' : ''); e.textContent = dmg;
  e.style.left = x + 'px'; e.style.top = y + 'px';
  dom.dmgNums.appendChild(e); setTimeout(() => e.remove(), 800);
}
function showDmgInd(dir) {
  if (!dir) return;
  const wa = Math.atan2(dir.x, dir.z), ca = cam.rotation.y + Math.PI;
  let r = wa - ca; while (r > Math.PI) r -= Math.PI * 2; while (r < -Math.PI) r += Math.PI * 2;
  const cls = Math.abs(r) < 1 ? 'hit-front' : Math.abs(r) > 2.5 ? 'hit-back' : r > 0 ? 'hit-left' : 'hit-right';
  dom.dmgOverlay.className = 'hud-dmg ' + cls;
  setTimeout(() => { dom.dmgOverlay.className = 'hud-dmg'; }, 200);
}
function addKill(hs) {
  killStreak++;
  const m = document.createElement('div'); m.className = 'kill-msg';
  m.textContent = (hs ? 'Headshot +' : 'Zombie +') + (hs ? 150 : 100) + ' pts';
  dom.killFeed.appendChild(m);
  while (dom.killFeed.children.length > 6) dom.killFeed.removeChild(dom.killFeed.firstChild);
  setTimeout(() => { if (m.parentNode) m.remove(); }, 3000);
  if (killStreak === 5) showStreakMsg('🔥 RACHA: 5');
  else if (killStreak === 10) showStreakMsg('⚡ RACHA: 10');
  else if (killStreak === 15) showStreakMsg('💀 RACHA: 15');
  else if (killStreak === 20) showStreakMsg('👑 RACHA: 20');
  else if (killStreak % 10 === 0) showStreakMsg('⭐ RACHA: ' + killStreak);
}
function showStreakMsg(msg) {
  dom.streakMsg.textContent = msg;
  dom.streakMsg.classList.add('show');
  snd('streak');
  setTimeout(() => dom.streakMsg.classList.remove('show'), 2000);
}
function showAnnounce(title, sub) {
  dom.roundInfo.innerHTML = '<span>' + title + '</span><span class="round-sub">' + sub + '</span>';
  dom.roundInfo.className = 'hud-round show';
  setTimeout(() => { dom.roundInfo.className = 'hud-round'; dom.roundInfo.innerHTML = ''; }, 3000);
}
function showGO(score, kills, w, acc) {
  dom.finalScore.textContent = score;
  dom.finalKills.textContent = kills;
  dom.finalRounds.textContent = w;
  dom.finalAcc.textContent = (acc * 100).toFixed(0) + '%';
  dom.finalStreak.textContent = killStreak;
  const mvpMsgs = ['💪 SIGUE INTENTANDO', '🔥 ¡BUEN TRABAJO!', '⭐ ¡SUPERVIVIENTE!', '🏆 ¡LEYENDA!'];
  const idx = w >= 15 ? 3 : w >= 10 ? 2 : w >= 5 ? 1 : 0;
  dom.mvp.textContent = mvpMsgs[idx];
  const scores = saveScore(score, kills, w, acc, killStreak);
  dom.goScores.innerHTML = '<div style="font-size:0.5rem;color:#446644;letter-spacing:2px;margin-bottom:4px;">PUNTUACIONES ALTAS</div>' + buildScoreHTML(scores, 5);
  dom.go.style.display = 'flex';
}
function showHeadshot() {
  dom.hsIndicator.classList.add('show');
  setTimeout(() => dom.hsIndicator.classList.remove('show'), 500);
}
function playerHit(amt, dir) {
  if (G.dead) return;
  if (G.armor > 0) { const ab = Math.min(G.armor, amt * 0.5); G.armor -= ab; amt -= ab; }
  G.health -= amt; snd('hurt'); showDmgInd(dir);
  if (G.health <= 0) {
    G.health = 0; G.dead = true; G.running = false;
    setTimeout(() => {
      if (!G.dead) return;
      R.domElement.style.display = 'none'; dom.hud.style.display = 'none';
      showGO(G.score, G.kills, wave, G.totalHits / Math.max(G.totalShots, 1));
      for (const z of zombies) z.hpEl.bg.style.display = 'none';
    }, 1200);
  }
}

// ─── PLAYER ───
const keys = {};
let mx = 0, my = 0, pointerLocked = false;
let velY = 0, onGround = true;

function updPlayer(dt) {
  if (G.dead) return false;
  const sens = 0.002 * settings.sensitivity;
  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  euler.setFromQuaternion(cam.quaternion);
  euler.y -= mx * sens;
  euler.x -= my * sens;
  euler.x = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, euler.x));
  cam.quaternion.setFromEuler(euler);
  mx = 0; my = 0;
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion); fwd.y = 0; fwd.normalize();
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion); right.y = 0; right.normalize();
  const dir = new THREE.Vector3();
  if (keys['KeyW'] || keys['ArrowUp']) dir.add(fwd);
  if (keys['KeyS'] || keys['ArrowDown']) dir.sub(fwd);
  if (keys['KeyA'] || keys['ArrowLeft']) dir.sub(right);
  if (keys['KeyD'] || keys['ArrowRight']) dir.add(right);
  const moving = dir.length() > 0;
  if (moving) dir.normalize();
  const spd = SPD * dt;
  const nx = cam.position.x + dir.x * spd;
  const nz = cam.position.z + dir.z * spd;
  if (!collides(nx, cam.position.z, PR)) cam.position.x = nx;
  if (!collides(cam.position.x, nz, PR)) cam.position.z = nz;
  if ((keys['Space']) && onGround) { velY = JUMP; onGround = false; }
  velY += GRAV * dt;
  cam.position.y += velY * dt;
  if (cam.position.y <= PH) { cam.position.y = PH; velY = 0; onGround = true; }
  // Crosshair move expansion
  dom.crosshair.classList.toggle('move', moving && onGround);
  return moving && onGround;
}

// ─── SHOOT ───
function shoot() {
  if (G.dead || G.paused || !G.running) return;
  if (G.reloading) return;
  if (G.shootCD > 0) return;
  if (G.ammo <= 0) { snd('empty'); reload(); return; }
  G.ammo--; G.shootCD = curW.rate; G.totalShots++;
  snd(curW.id === 'p' ? 'pistol' : curW.id === 's' ? 'smg' : curW.id === 'a' ? 'rifle' : curW.id === 'sg' ? 'shotgun' : 'rocket');
  showCrosshair();
  const mf = wModels[G.curW]?.userData.mf; if (mf) mf.intensity = 3;
  setTimeout(() => { if (mf) mf.intensity = 0; }, 50);
  wGroup.position.z = -0.35 + (WPS[G.curW].spread > 0.05 ? 0.1 : 0.02);

  if (G.curW === 'rocket') {
    const d = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
    fireRocket(cam.position.clone().add(d.clone().multiplyScalar(0.5)), d);
    updHUD(); return;
  }

  const targets = [];
  for (const z of zombies) { if (!z.alive) continue; z.g.traverse(c => { if (c.isMesh) targets.push(c); }); }

  const spread = WPS[G.curW].spread;
  for (let p = 0; p < curW.pellets; p++) {
    const d = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
    d.x += (Math.random() - 0.5) * spread * 2;
    d.y += (Math.random() - 0.5) * spread * 2;
    d.normalize();
    const ray = new THREE.Raycaster(cam.position.clone(), d, 0.3, curW.range);
    const hits = ray.intersectObjects(targets);
    const end = hits.length > 0 ? hits[0].point : cam.position.clone().add(d.clone().multiplyScalar(curW.range));
    addTracer(cam.position.clone().add(d.clone().multiplyScalar(0.5)), end, WPS[G.curW].tc);
    if (hits.length > 0) {
      const hit = hits[0];
      let hitZ = null, hs = false;
      for (const z of zombies) {
        if (!z.alive) continue;
        let found = false;
        z.g.traverse(c => { if (c === hit.object) found = true; });
        if (!found) continue;
        hitZ = z;
        if (hit.point.y > z.getPos().y + 0.85 * z.t.sc) hs = true;
        break;
      }
      if (hitZ) {
        G.totalHits++;
        const res = hitZ.takeDamage(WPS[G.curW].dmg * DIFFS[curDiff].scoreM, hs);
        if (res) {
          showHit(hs);
          showDmg(hit.point, hs ? Math.floor(WPS[G.curW].dmg * 3 * DIFFS[curDiff].scoreM) : Math.floor(WPS[G.curW].dmg * DIFFS[curDiff].scoreM), hs);
          if (hs) { snd('headshot'); showHeadshot(); } else snd('hit');
          if (res.kill) {
            G.score += hs ? Math.floor(150 * DIFFS[curDiff].scoreM) : Math.floor(100 * DIFFS[curDiff].scoreM);
            G.kills++;
            addKill(hs);
            if (hs) snd('kill');
            checkWave();
          }
        }
      }
    }
  }
  updHUD();
}
function reload() {
  if (G.reloading || G.ammo === G.magSize || G.reserve <= 0) return;
  G.reloading = true; G.reloadT = curW.reload;
  snd('reload');
}

// ─── DAY/NIGHT CYCLE ───
let dayTime = 0.3;
function updCycle(dt) {
  dayTime = (dayTime + dt * 0.004) % 1;
  const sinV = Math.sin(dayTime * Math.PI * 2);
  const dayFactor = Math.max(0, Math.min(1, sinV * 0.5 + 0.5));
  const warm = Math.min(1, Math.max(0, (dayFactor - 0.2) * 2));
  const a = dayTime * Math.PI * 2;
  sunLight.position.set(Math.cos(a) * 50, Math.sin(a) * 35 + 10, Math.sin(a * 0.7) * 50);
  sunLight.intensity = 0.4 + dayFactor * 1.2;
  sunLight.color.setRGB(0.5 + warm * 0.4, 0.4 + warm * 0.4, 0.2 + warm * 0.1);
  ambLight.intensity = 0.15 + dayFactor * 0.5;
  ambLight.color.setRGB(0.15 + warm * 0.4, 0.15 + warm * 0.35, 0.3 + (1 - dayFactor) * 0.3);
  hemiLight.intensity = 0.15 + dayFactor * 0.5;
  hemiLight.color.setRGB(0.2 + warm * 0.5, 0.3 + warm * 0.3, 0.4 + (1 - dayFactor) * 0.3);
  const skyR = 0.05 + warm * 0.4, skyG = 0.05 + warm * 0.4, skyB = 0.2 + (1 - dayFactor) * 0.3;
  scene.background.setRGB(skyR, skyG, skyB);
  scene.fog.color.setRGB(skyR * 0.6, skyG * 0.6, skyB * 0.6);
  stars.material.opacity = (1 - dayFactor) * 0.5;
}

// ─── GAME MANAGEMENT ───
function startGame() {
  for (const z of zombies) { z.dispose(); }
  zombies = [];
  cleanDeadZombies();
  Object.assign(G, {
    health: DIFFS[curDiff].ph, armor: DIFFS[curDiff].pa, score: 0, kills: 0, dead: false,
    totalShots: 0, totalHits: 0, maxHP: Math.max(DIFFS[curDiff].ph, 50), maxArm: 100
  });
  const w = WPS[startWeapon];
  G.ammo = w.mag; G.reserve = w.res; G.magSize = w.mag;
  G.reloading = false; G.shootCD = 0; G.curW = startWeapon; curW = w;
  cam.position.set(15, PH, 15);
  cam.quaternion.identity();
  wave = 0; waveActive = false; waveCount = 0;
  killStreak = 0;
  for (const k in wAmmo) delete wAmmo[k];
  for (const r of rockets) { scene.remove(r.g); }
  rockets.length = 0;
  for (const s of spits) { scene.remove(s.m); if (s.m.geometry) s.m.geometry.dispose(); if (s.m.material) s.m.material.dispose(); }
  spits.length = 0;
  createPickups();
  if (!wModels[startWeapon]) {
    for (const id of WORDER) if (!wModels[id]) wModels[id] = buildWModel(WPS[id]);
  }
  if (!wGroup.parent) cam.add(wGroup);
  wGroup.position.set(0.3, -0.12, -0.35);
  switchW(startWeapon);
  waveDelay = 1.5;
  screenShake = 0;
  dayTime = 0.3;
}

// ─── GAME LOOP ───
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (G.running && !G.dead) {
    if (!G.paused) {
      const moving = updPlayer(dt);
      if (G.shootCD > 0) G.shootCD -= dt;
      if (G.reloading) {
        G.reloadT -= dt;
        if (G.reloadT <= 0) {
          const need = G.magSize - G.ammo, avail = Math.min(need, G.reserve);
          G.ammo += avail; G.reserve -= avail; G.reloading = false;
        }
      }
      wGroup.position.z += (-0.35 - wGroup.position.z) * 0.1;
      wGroup.position.y = -0.12 + (moving ? Math.sin(Date.now() * 0.014) * 0.018 : 0);
      if (!waveActive && zombies.every(z => !z.alive)) {
        waveDelay -= dt;
        if (waveDelay <= 0) startWave();
      }
      const pp = cam.position.clone(), obs = walls;
      for (const z of zombies) { if (z.alive) z.update(dt, pp, obs); }
      for (const z of zombies) z.updateHP();
      updateTracers(dt);
      updateRockets(dt);
      updateSpits(dt);
      updatePickups(dt);
      updateParticles(dt);
      if (waveActive) checkWave();
      updHUD();
      if (G.mDown && curW.auto && pointerLocked) shoot();
      if (screenShake > 0) {
        cam.position.x += (Math.random() - 0.5) * screenShake;
        cam.position.y += (Math.random() - 0.5) * screenShake * 0.5;
        screenShake *= 0.9;
        if (screenShake < 0.01) screenShake = 0;
      }
    }
    updCycle(dt);
  }
  R.render(scene, cam);
}

// ─── EVENTS ───
document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (!G.running || G.dead) return;
  if (e.code === 'KeyR') reload();
  const n = parseInt(e.key);
  if (n >= 1 && n <= WORDER.length) switchW(WORDER[n - 1]);
});
document.addEventListener('keyup', e => { keys[e.code] = false; });
document.addEventListener('mousemove', e => {
  if (pointerLocked) { mx += e.movementX; my += e.movementY; }
});
document.addEventListener('mousedown', e => {
  if (e.button === 0) { G.mDown = true; if (pointerLocked && !G.dead && G.running) shoot(); }
});
document.addEventListener('mouseup', e => { if (e.button === 0) G.mDown = false; });
let ptrEverLocked = false;
document.addEventListener('pointerlockchange', () => {
  pointerLocked = document.pointerLockElement === R.domElement;
  if (pointerLocked) {
    ptrEverLocked = true;
    G.paused = false;
    dom.pause.style.display = 'none';
    mx = 0; my = 0;
  } else if (ptrEverLocked && G.running && !G.dead) {
    G.paused = true;
    dom.pause.style.display = 'flex';
  }
});
window.addEventListener('resize', () => {
  cam.aspect = innerWidth / innerHeight;
  cam.updateProjectionMatrix();
  R.setSize(innerWidth, innerHeight);
});
R.domElement.addEventListener('click', () => {
  if (G.running && !G.dead && !pointerLocked) R.domElement.requestPointerLock();
});

// ─── MENU SETUP ───
function initMenu() {
  // Weapon select grid
  dom.wsGrid.innerHTML = '';
  const orderIcons = ['🔫', '🔫', '🔫', '💥', '🚀'];
  WORDER.forEach((id, i) => {
    const w = WPS[id];
    const card = document.createElement('div');
    card.className = 'ws-card' + (id === startWeapon ? ' active' : '');
    card.dataset.w = id;
    card.innerHTML = '<div class="ws-icon">' + orderIcons[i] + '</div><div class="ws-name">' + w.name + '</div><div class="ws-stat">' + w.dmg + ' dmg · ' + w.mag + ' balas' + (w.auto ? ' · Auto' : '') + '</div>';
    card.addEventListener('click', () => {
      dom.wsGrid.querySelectorAll('.ws-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      startWeapon = id;
      dom.menuWeapon.textContent = w.name;
    });
    dom.wsGrid.appendChild(card);
  });

  // Difficulty grid
  dom.diffGrid.innerHTML = '';
  Object.keys(DIFFS).forEach(key => {
    const d = DIFFS[key];
    const card = document.createElement('div');
    card.className = 'diff-card' + (key === curDiff ? ' active' : '');
    card.dataset.d = key;
    card.innerHTML = '<div class="diff-name">' + d.name + '</div><div class="diff-desc">' + d.desc + '</div><div class="diff-bonus">' + d.bonus + '</div>';
    card.addEventListener('click', () => {
      dom.diffGrid.querySelectorAll('.diff-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      curDiff = key;
      dom.menuDifficulty.textContent = d.name;
    });
    dom.diffGrid.appendChild(card);
  });

  // Sound toggle
  updateSndUI();
  const sensSlider = $('sensSlider');
  const sensVal = $('sensVal');
  if (sensSlider) {
    sensSlider.value = (settings.sensitivity * 2).toFixed(1);
    if (sensVal) sensVal.textContent = (settings.sensitivity * 2).toFixed(1);
    sensSlider.addEventListener('input', () => {
      settings.sensitivity = parseFloat(sensSlider.value) / 2;
      if (sensVal) sensVal.textContent = sensSlider.value;
      saveSettings();
    });
  }
}
function hideAllModals() {
  document.querySelectorAll('.overlay').forEach(o => { if (o.id !== 'menu' && o.style) o.style.display = 'none'; });
}

// ─── MENU EVENT HANDLERS ───
$('btnPlay').addEventListener('click', () => {
  initAudio();
  dom.menu.style.display = 'none'; dom.hud.style.display = 'block'; G.running = true; G.paused = false;
  R.domElement.style.display = 'block';
  startGame();
  R.domElement.requestPointerLock();
});
$('btnControls').addEventListener('click', () => { hideAllModals(); dom.controls.style.display = 'flex'; });
$('btnCloseControls').addEventListener('click', () => { dom.controls.style.display = 'none'; });
$('btnRestart').addEventListener('click', () => {
  dom.goTitle.textContent = 'FIN DEL JUEGO';
  dom.go.style.display = 'none'; R.domElement.style.display = 'block'; dom.hud.style.display = 'block';
  startGame(); G.running = true; G.paused = false;
  R.domElement.requestPointerLock();
});
$('btnMenu').addEventListener('click', () => {
  dom.go.style.display = 'none'; dom.menu.style.display = 'flex'; dom.hud.style.display = 'none';
  for (const z of zombies) z.hpEl.bg.style.display = 'none';
});
$('btnResume').addEventListener('click', () => { R.domElement.requestPointerLock(); });
$('btnPauseMenu').addEventListener('click', () => {
  dom.pause.style.display = 'none'; G.running = false;
  dom.menu.style.display = 'flex'; dom.hud.style.display = 'none';
  for (const z of zombies) z.hpEl.bg.style.display = 'none';
});

// New menu buttons
$('btnWeaponSelect').addEventListener('click', () => { hideAllModals(); dom.weaponSelect.style.display = 'flex'; });
$('btnCloseWS').addEventListener('click', () => { dom.weaponSelect.style.display = 'none'; });
$('btnDifficulty').addEventListener('click', () => { hideAllModals(); dom.diffSelect.style.display = 'flex'; });
$('btnCloseDiff').addEventListener('click', () => { dom.diffSelect.style.display = 'none'; });
$('btnSettings').addEventListener('click', () => { hideAllModals(); dom.settingsModal.style.display = 'flex'; updateSndUI(); });
$('btnCloseSettings').addEventListener('click', () => { dom.settingsModal.style.display = 'none'; });
$('btnScores').addEventListener('click', () => {
  hideAllModals();
  dom.scoresBody.innerHTML = buildScoreHTML(loadScores(), 20);
  dom.scoresModal.style.display = 'flex';
});
$('btnCloseScores').addEventListener('click', () => { dom.scoresModal.style.display = 'none'; });

$('sndToggle').addEventListener('click', () => {
  settings.sound = !settings.sound;
  saveSettings();
  updateSndUI();
});
if (dom.hudSndBtn) {
  dom.hudSndBtn.addEventListener('click', () => {
    settings.sound = !settings.sound;
    saveSettings();
    updateSndUI();
  });
}

// ─── START ───
loadSettings();
initMenu();
frame();

import * as THREE from 'three';

const $ = id => document.getElementById(id);
const $c = id => { const e = $(id); if (!e) console.warn('Missing element:', id); return e; };

const dom = {
  canvas: $c('gameCanvas'), menu: $c('menu'), go: $c('gameOver'),
  controls: $c('controlsModal'), hud: $c('hud'), pause: $c('pauseOverlay'),
  crosshair: $c('crosshair'), hitmarker: $c('hitmarker'), dmgOverlay: $c('dmgOverlay'),
  killFeed: $c('killFeed'), roundInfo: $c('roundInfo'), botsAlive: $c('botsAlive'),
  lowhp: $c('lowhpOverlay'), dmgNums: $c('damageNumbers'),
  reloadInd: $c('reloadIndicator'), hsInd: $c('hsIndicator'), streakMsg: $c('streakMsg'),
  healthBar: $c('healthBar'), healthText: $c('healthText'), armorBar: $c('armorBar'),
  scoreText: $c('scoreText'), killsText: $c('killsText'), streakText: $c('streakText'),
  hudRound: $c('hudRound'), bossBar: $c('bossBar'), bossName: $c('bossName'),
  bossHPFill: $c('bossHPFill'), weaponIcon: $c('weaponIcon'), weaponName: $c('weaponName'),
  ammoText: $c('ammoText'), ammoReserve: $c('ammoReserve'), weaponStrip: $c('weaponStrip'),
  hudSndBtn: $c('hudSndBtn'), minimapCanvas: $c('minimapCanvas'),
  wsGrid: $c('wsGrid'), diffGrid: $c('diffGrid'),
  goTitle: $c('goTitle'), finalScore: $c('finalScore'), finalKills: $c('finalKills'),
  finalRounds: $c('finalRounds'), finalAcc: $c('finalAcc'), finalStreak: $c('finalStreak'),
  mvpDisplay: $c('mvpDisplay'), goScores: $c('goScores'), scoresBody: $c('scoresBody'),
  sensSlider: $c('sensSlider'), sensVal: $c('sensVal'), sndToggle: $c('sndToggle'),
  menuWeapon: $c('menuWeapon'), menuDifficulty: $c('menuDifficulty'), menuSnd: $c('menuSnd'),
};

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
dom.canvas.appendChild(renderer.domElement);

const cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
cam.position.set(0, 1.6, 0);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a3a2a);
scene.fog = new THREE.Fog(0x2a3a2a, 60, 120);

const ambientLight = new THREE.AmbientLight(0x446644, 0.5);
scene.add(ambientLight);
const hemiLight = new THREE.HemisphereLight(0x88bb88, 0x223322, 0.4);
scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xffeedd, 0.6);
dirLight.position.set(20, 30, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048; dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5; dirLight.shadow.camera.far = 60;
dirLight.shadow.camera.left = -85; dirLight.shadow.camera.right = 85;
dirLight.shadow.camera.top = 85; dirLight.shadow.camera.bottom = -85;
scene.add(dirLight);
const fillLight = new THREE.DirectionalLight(0x6688aa, 0.2);
fillLight.position.set(-15, 10, -15);
scene.add(fillLight);

const groundGeo = new THREE.PlaneGeometry(170, 170, 34, 34);
const gPos = groundGeo.attributes.position;
for (let i = 0; i < gPos.count; i++) {
  const gx = gPos.getX(i), gy = gPos.getY(i);
  gPos.setZ(i, Math.sin(gx * 0.3) * Math.cos(gy * 0.3) * 0.08 + (Math.random() - 0.5) * 0.04);
}
groundGeo.computeVertexNormals();
const groundMat = new THREE.MeshStandardMaterial({ color: 0x2a5a2a, roughness: 0.95, metalness: 0 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const gridHelper = new THREE.GridHelper(170, 85, 0x3a6a3a, 0x2a5a2a);
gridHelper.position.y = 0.01;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.15;
scene.add(gridHelper);

const walls = [];
const HALF = 80;
function collides(x, z, r) {
  const h = HALF - r;
  if (x < -h || x > h || z < -h || z > h) return true;
  for (const w of walls) {
    if (x + r > w.minX && x - r < w.maxX && z + r > w.minZ && z - r < w.maxZ) return true;
  }
  return false;
}

function addBuilding(x, z, w, d, h, col) {
  const mat = new THREE.MeshStandardMaterial({ color: col || 0x444455, roughness: 0.7, metalness: 0.1 });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, h / 2, z);
  mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
  walls.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, isBuilding: true });
  return mesh;
}
function addBuildingDetail(x, z, w, d, h, col, roofCol) {
  addBuilding(x, z, w, d, h, col);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w * 0.95, 0.1, d * 0.95), new THREE.MeshStandardMaterial({ color: roofCol || 0x333344, roughness: 0.8 }));
  roof.position.set(x, h + 0.05, z); roof.rotation.y = Math.random() * 0.3; roof.receiveShadow = true; scene.add(roof);
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(w * 0.98, 0.12, d * 0.98), new THREE.MeshStandardMaterial({ color: col || 0x555566, roughness: 0.7 }));
  parapet.position.set(x, h + 0.16, z); scene.add(parapet);
  const wMat = new THREE.MeshStandardMaterial({ color: 0xffffcc, emissive: 0xffff88, emissiveIntensity: 0.15 });
  const darkWinMat = new THREE.MeshStandardMaterial({ color: 0x222233, emissive: 0xffff88, emissiveIntensity: 0.05 });
  const numWinX = Math.max(2, Math.floor(w / 1.2));
  const numWinZ = Math.max(2, Math.floor(d / 1.2));
  for (let i = 0; i < numWinX; i++) {
    const wx = x + (i + 0.5) * (w / numWinX) - w / 2;
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), Math.random() > 0.3 ? wMat : darkWinMat);
    win.position.set(wx, h * 0.6, z + d / 2 + 0.01); scene.add(win);
    const winBack = win.clone(); winBack.position.z = z - d / 2 - 0.01; winBack.rotation.y = Math.PI; scene.add(winBack);
  }
  for (let i = 0; i < numWinZ; i++) {
    const wz = z + (i + 0.5) * (d / numWinZ) - d / 2;
    const winL = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), Math.random() > 0.3 ? wMat : darkWinMat);
    winL.position.set(x - w / 2 - 0.01, h * 0.6, wz); winL.rotation.y = -Math.PI / 2; scene.add(winL);
    const winR = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), Math.random() > 0.3 ? wMat : darkWinMat);
    winR.position.set(x + w / 2 + 0.01, h * 0.6, wz); winR.rotation.y = Math.PI / 2; scene.add(winR);
  }
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x443322 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.65, 0.04), doorMat);
  door.position.set(x + w * 0.3, 0.325, z + d / 2 + 0.02); scene.add(door);
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.7, 0.02), new THREE.MeshStandardMaterial({ color: 0x333322 }));
  doorFrame.position.set(x + w * 0.3, 0.35, z + d / 2 + 0.03); scene.add(doorFrame);
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, 0.05, d + 0.08), new THREE.MeshStandardMaterial({ color: 0x555566, roughness: 0.6 }));
  ledge.position.set(x, 0.025, z); scene.add(ledge);
  if (h > 1.5) {
    for (let i = 0; i < 3; i++) {
      const awningCol = [0x664433, 0x336644, 0x443366][i];
      const awning = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.3), new THREE.MeshStandardMaterial({ color: awningCol, roughness: 0.8 }));
      awning.position.set(x + (i - 1) * 0.5, h * 0.35, z + d / 2 + 0.15);
      awning.rotation.x = -0.2; scene.add(awning);
    }
    const acUnit = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.2), new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.4 }));
    acUnit.position.set(x + w * 0.3, h + 0.2, z - d * 0.3); scene.add(acUnit);
  }
  if (h > 2.0 && Math.random() > 0.5) {
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.2), new THREE.MeshStandardMaterial({ color: 0x774433, roughness: 0.9 }));
    chimney.position.set(x + w * 0.3, h + 0.3, z - d * 0.3); chimney.castShadow = true; scene.add(chimney);
  }
  if (Math.random() > 0.6) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, h * 0.7, 4), new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.4 }));
    pipe.position.set(x - w / 2 - 0.05, h * 0.35, z); scene.add(pipe);
  }
}

const BLDGS = [
  [-20,-20,4,4,2.5,0x444455,0x333344],[20,-20,3.5,3.5,2.2,0x554444,0x443333],
  [-20,20,3,5,2.8,0x445544,0x334433],[20,20,4.5,4.5,2.0,0x555544,0x444433],
  [-34,-34,2.5,2.5,1.8,0x445566,0x334455],[34,-34,2.5,2.5,1.8,0x445566,0x334455],
  [-34,34,2.5,2.5,1.8,0x445566,0x334455],[34,34,2.5,2.5,1.8,0x445566,0x334455],
  [-28,-15,2,3,1.5,0x555555,0x444444],[28,-15,2,3,1.5,0x555555,0x444444],
  [-15,-28,3,2,1.5,0x555555,0x444444],[15,-28,3,2,1.5,0x555555,0x444444],
  [-28,15,2,3,1.5,0x555555,0x444444],[28,15,2,3,1.5,0x555555,0x444444],
  [-15,28,3,2,1.5,0x555555,0x444444],[15,28,3,2,1.5,0x555555,0x444444],
  [-42,-14,2,2,1.2,0x666655,0x555544],[42,-14,2,2,1.2,0x666655,0x555544],
  [-14,-42,2,2,1.2,0x666655,0x555544],[14,-42,2,2,1.2,0x666655,0x555544],
  [-42,14,2,2,1.2,0x666655,0x555544],[42,14,2,2,1.2,0x666655,0x555544],
  [-14,42,2,2,1.2,0x666655,0x555544],[14,42,2,2,1.2,0x666655,0x555544],
  [-56,-50,3,3,2.0,0x445566,0x334455],[56,-50,3,3,2.0,0x556644,0x445533],
  [-56,50,3,3,2.0,0x445566,0x334455],[56,50,3,3,2.0,0x556644,0x445533],
  [-60,-30,4,3,2.5,0x554455,0x443344],[60,30,4,3,2.5,0x445555,0x334444],
  [-60,30,3,4,2.2,0x555566,0x444455],[60,-30,3,4,2.2,0x446644,0x335533],
  [-50,-60,5,3,3.0,0x444455,0x333344],[50,-60,5,3,2.8,0x554444,0x443333],
  [-50,60,3,5,3.2,0x445544,0x334433],[50,60,3,5,2.6,0x555544,0x444433],
  [-65,-60,2.5,2.5,1.5,0x666655,0x555544],[65,60,2.5,2.5,1.5,0x666655,0x555544],
  [-65,60,2.5,2.5,1.5,0x666655,0x555544],[65,-60,2.5,2.5,1.5,0x666655,0x555544],
  [-48,-45,2,2,1.4,0x556655,0x445544],[48,45,2,2,1.4,0x556655,0x445544],
  [-48,45,2,2,1.4,0x665555,0x554444],[48,-45,2,2,1.4,0x665555,0x554444],
  [-70,-20,3,2,2.0,0x555544,0x444433],[70,20,3,2,2.0,0x444455,0x333344],
  [-70,20,2,3,1.8,0x446655,0x335544],[70,-20,2,3,1.8,0x556644,0x445533],
  [-40,-65,3,3,2.0,0x554455,0x443344],[40,65,3,3,2.0,0x445555,0x334444],
  [-25,-60,2,2,1.3,0x665544,0x554433],[25,60,2,2,1.3,0x665544,0x554433],
  [-60,-50,2,2,1.3,0x556655,0x445544],[60,50,2,2,1.3,0x556655,0x445544],
  [-60,50,2,2,1.3,0x665555,0x554444],[60,-50,2,2,1.3,0x665555,0x554444],
  [-30,-55,2,3,1.6,0x445566,0x334455],[30,55,2,3,1.6,0x556644,0x445533],
  [-55,-35,3,2,1.6,0x555566,0x444455],[55,35,3,2,1.6,0x446644,0x335533],
];
for (const b of BLDGS) addBuildingDetail(b[0], b[1], b[2], b[3], b[4], b[5], b[6]);

const roadMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
const road1 = new THREE.Mesh(new THREE.BoxGeometry(170, 0.02, 5), roadMat);
road1.position.set(0, 0.02, 0); road1.receiveShadow = true; scene.add(road1);
const road2 = new THREE.Mesh(new THREE.BoxGeometry(5, 0.02, 170), roadMat);
road2.position.set(0, 0.02, 0); road2.receiveShadow = true; scene.add(road2);
const roadX = new THREE.Mesh(new THREE.BoxGeometry(120, 0.02, 3.5), roadMat);
roadX.position.set(0, 0.02, 35); roadX.receiveShadow = true; scene.add(roadX);
const roadY = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.02, 120), roadMat);
roadY.position.set(35, 0.02, 0); roadY.receiveShadow = true; scene.add(roadY);
const roadD = new THREE.Mesh(new THREE.BoxGeometry(100, 0.02, 3), roadMat);
roadD.position.set(0, 0.02, 0); roadD.rotation.y = Math.PI / 4; roadD.receiveShadow = true; scene.add(roadD);
const lineMat = new THREE.MeshBasicMaterial({ color: 0xcccc00 });
const lineMatWhite = new THREE.MeshBasicMaterial({ color: 0x999999 });
for (let i = -80; i < 80; i += 4) {
  const line = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.025, 1.5), lineMat);
  line.position.set(i, 0.03, 0); scene.add(line);
  const line2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.025, 0.08), lineMat);
  line2.position.set(0, 0.03, i); scene.add(line2);
  const line3 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 1.2), lineMatWhite);
  line3.position.set(i, 0.03, 35); scene.add(line3);
  const line4 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.025, 0.06), lineMatWhite);
  line4.position.set(35, 0.03, i); scene.add(line4);
}
for (let i = -50; i < 50; i += 5) {
  const dl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.025, 2.5), lineMatWhite);
  dl.position.set(i * 0.707, 0.03, i * 0.707); dl.rotation.y = Math.PI / 4; scene.add(dl);
}
const curbMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 });
for (const cz of [-2.7, 2.7]) {
  const curb = new THREE.Mesh(new THREE.BoxGeometry(170, 0.06, 0.15), curbMat);
  curb.position.set(0, 0.03, cz); scene.add(curb);
}
for (const cx of [-2.7, 2.7]) {
  const curb = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.06, 170), curbMat);
  curb.position.set(cx, 0.03, 0); scene.add(curb);
}

function addFence(x1, z1, x2, z2) {
  const dx = x2 - x1, dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dx, dz);
  const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
  const g = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({ color: 0x667766, metalness: 0.4, roughness: 0.6 });
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x778877, transparent: true, opacity: 0.4 });
  for (let fi = 0; fi <= len; fi += 1.2) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4), postMat);
    post.position.set((fi - len / 2) * Math.cos(angle), 0.6, (fi - len / 2) * -Math.sin(angle));
    g.add(post);
  }
  for (let h = 0.3; h <= 1.0; h += 0.35) {
    const wire = new THREE.Mesh(new THREE.BoxGeometry(len, 0.01, 0.01), wireMat);
    wire.position.set(0, h, 0);
    wire.rotation.y = angle; g.add(wire);
  }
  g.position.set(cx, 0, cz); scene.add(g);
  const hw = Math.abs(dx) / 2 + 0.05, hd = Math.abs(dz) / 2 + 0.05;
  walls.push({ minX: cx - hw, maxX: cx + hw, minZ: cz - hd, maxZ: cz + hd });
}
addFence(-30, -8, -22, -8); addFence(22, -8, 30, -8);
addFence(-30, 8, -22, 8); addFence(22, 8, 30, 8);
addFence(-55, -8, -45, -8); addFence(45, -8, 55, -8);
addFence(-55, 8, -45, 8); addFence(45, 8, 55, 8);
addFence(-8, -55, -8, -45); addFence(8, 45, 8, 55);
addFence(-60, -40, -50, -40); addFence(50, 40, 60, 40);
addFence(-60, 40, -50, 40); addFence(50, -40, 60, -40);
addFence(-40, -55, -40, -48); addFence(40, 48, 40, 55);
addFence(-70, -10, -62, -10); addFence(62, 10, 70, 10);
addFence(-70, 10, -62, 10); addFence(62, -10, 70, -10);

function addDebris(x, z, count) {
  const g = new THREE.Group();
  const cols = [0x555555, 0x666655, 0x444444, 0x556655, 0x776655];
  for (let i = 0; i < count; i++) {
    const s = 0.05 + Math.random() * 0.2;
    const mat = new THREE.MeshStandardMaterial({ color: cols[Math.floor(Math.random() * cols.length)], roughness: 0.9 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(s, s * 0.4, s * 0.8), mat);
    m.position.set((Math.random() - 0.5) * 0.8, s * 0.2, (Math.random() - 0.5) * 0.8);
    m.rotation.y = Math.random() * Math.PI; m.castShadow = true;
    g.add(m);
  }
  g.position.set(x, 0, z); scene.add(g);
}

function addBarrel(x, z, col) {
  const g = new THREE.Group();
  const bMat = new THREE.MeshStandardMaterial({ color: col || 0x556644, roughness: 0.6, metalness: 0.3 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.7, 8), bMat);
  body.position.y = 0.35; body.castShadow = true; g.add(body);
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.6 });
  const rim1 = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.015, 6, 8), rimMat);
  rim1.rotation.x = Math.PI / 2; rim1.position.y = 0.15; g.add(rim1);
  const rim2 = rim1.clone(); rim2.position.y = 0.55; g.add(rim2);
  g.position.set(x, 0, z); scene.add(g);
  walls.push({ minX: x - 0.25, maxX: x + 0.25, minZ: z - 0.25, maxZ: z + 0.25 });
}

function addCrateStack(x, z, rot) {
  const g = new THREE.Group();
  const cMat = new THREE.MeshStandardMaterial({ color: 0x887755, roughness: 0.85 });
  const crate1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), cMat);
  crate1.position.y = 0.3; crate1.castShadow = true; g.add(crate1);
  const strap = new THREE.MeshStandardMaterial({ color: 0x443322 });
  const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.04, 0.04), strap);
  s1.position.set(0, 0.15, 0.41); g.add(s1);
  const s2 = s1.clone(); s2.position.z = -0.41; g.add(s2);
  if (Math.random() > 0.4) {
    const crate2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), cMat);
    crate2.position.set((Math.random() - 0.5) * 0.2, 0.85, (Math.random() - 0.5) * 0.2);
    crate2.rotation.y = Math.random() * 0.3; crate2.castShadow = true; g.add(crate2);
  }
  g.position.set(x, 0, z); g.rotation.y = rot || 0; scene.add(g);
  walls.push({ minX: x - 0.5, maxX: x + 0.5, minZ: z - 0.5, maxZ: z + 0.5 });
}

function addCar(x, z, rot, col) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: col || 0x334466, roughness: 0.5, metalness: 0.4 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 0.9), bodyMat);
  body.position.y = 0.5; body.castShadow = true; g.add(body);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.45, 0.85), bodyMat);
  roof.position.set(-0.1, 0.95, 0); roof.castShadow = true; g.add(roof);
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x88aacc, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.5 });
  const windshield = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.35), glassMat);
  windshield.position.set(0.46, 0.95, 0); windshield.rotation.y = Math.PI / 2; g.add(windshield);
  const whMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 });
  for (const [wx, wz] of [[-0.6, 0.48], [0.6, 0.48], [-0.6, -0.48], [0.6, -0.48]]) {
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8), whMat);
    wh.rotation.z = Math.PI / 2; wh.position.set(wx, 0.15, wz); g.add(wh);
  }
  const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
  for (const hy of [-0.35, 0.35]) {
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.06, 4, 4), headlightMat);
    hl.position.set(0.92, 0.45, hy); g.add(hl);
  }
  g.position.set(x, 0, z); g.rotation.y = rot || 0; scene.add(g);
  walls.push({ minX: x - 1.0, maxX: x + 1.0, minZ: z - 0.6, maxZ: z + 0.6 });
}

function addLampPost(x, z) {
  const g = new THREE.Group();
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.5, roughness: 0.5 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 3.0, 6), poleMat);
  pole.position.y = 1.5; g.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.03), poleMat);
  arm.position.set(0.2, 2.9, 0); g.add(arm);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffaa }));
  bulb.position.set(0.4, 2.85, 0); g.add(bulb);
  const light = new THREE.PointLight(0xffeeaa, 0.4, 8);
  light.position.set(0.4, 2.8, 0); g.add(light);
  g.position.set(x, 0, z); scene.add(g);
  walls.push({ minX: x - 0.06, maxX: x + 0.06, minZ: z - 0.06, maxZ: z + 0.06 });
}

function addPuddle(x, z, r) {
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(r || 0.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.3 })
  );
  m.rotation.x = -Math.PI / 2; m.position.set(x, 0.015, z); scene.add(m);
}

function addTireStack(x, z) {
  const g = new THREE.Group();
  const tMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
  for (let i = 0; i < 3; i++) {
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.08, 6, 8), tMat);
    tire.rotation.x = Math.PI / 2; tire.position.y = 0.1 + i * 0.16;
    tire.rotation.z = Math.random() * 0.2; g.add(tire);
  }
  g.position.set(x, 0, z); scene.add(g);
  walls.push({ minX: x - 0.25, maxX: x + 0.25, minZ: z - 0.25, maxZ: z + 0.25 });
}

function addSandbagWall(x, z, rot, count) {
  const g = new THREE.Group();
  const sMat = new THREE.MeshStandardMaterial({ color: 0x887755, roughness: 0.9 });
  for (let i = 0; i < (count || 4); i++) {
    for (let j = 0; j < 2; j++) {
      const bag = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.25), sMat);
      bag.position.set(i * 0.52 - (count || 4) * 0.26, j * 0.19 + 0.09, j * 0.05);
      bag.rotation.y = (Math.random() - 0.5) * 0.1; bag.castShadow = true; g.add(bag);
    }
  }
  g.position.set(x, 0, z); g.rotation.y = rot || 0; scene.add(g);
  const hw = (count || 4) * 0.27;
  walls.push({ minX: x - hw, maxX: x + hw, minZ: z - 0.3, maxZ: z + 0.3 });
}

for (const [bx, bz, cnt] of [[-16,-36,8],[16,36,6],[-36,-16,7],[36,16,5],[-40,40,5],[40,-40,6],[-55,-55,10],[55,-55,10],[-55,55,10],[55,55,10],[-65,-25,8],[65,25,8],[-25,-65,8],[25,65,8],[-70,-55,6],[70,55,6],[-55,70,7],[55,-70,7],[-45,-60,9],[45,60,9],[-60,45,6],[60,-45,6],[-35,-45,7],[35,45,7]]) addDebris(bx, bz, cnt);
addBarrel(-25, -35, 0x556644); addBarrel(-24, -35, 0x665533); addBarrel(25, 35, 0x556644);
addBarrel(24, 36, 0x445533); addBarrel(-10, -20, 0x667744); addBarrel(10, 20, 0x557744);
addBarrel(-36, 10, 0x446633); addBarrel(36, -10, 0x556633);
addBarrel(-50, -45, 0x667744); addBarrel(50, -45, 0x556644); addBarrel(-50, 45, 0x446633); addBarrel(50, 45, 0x665533);
addBarrel(-65, -15, 0x557744); addBarrel(65, 15, 0x667744); addBarrel(-65, 15, 0x445533); addBarrel(65, -15, 0x556633);
addBarrel(-15, -55, 0x667744); addBarrel(15, 55, 0x557744); addBarrel(-55, -15, 0x446633); addBarrel(55, 15, 0x665533);
addBarrel(-42, -65, 0x556644); addBarrel(42, 65, 0x667744); addBarrel(-65, -42, 0x445533); addBarrel(65, 42, 0x557744);
addCrateStack(-8, -16, 0.3); addCrateStack(8, 16, -0.4); addCrateStack(-16, 8, 0.7);
addCrateStack(16, -8, -0.2); addCrateStack(-40, -8, 0.1); addCrateStack(40, 8, -0.5);
addCrateStack(-6, 40, 0.8); addCrateStack(6, -40, -0.7);
addCrateStack(-50, -20, 0.4); addCrateStack(50, 20, -0.3); addCrateStack(-20, -50, 0.6); addCrateStack(20, 50, -0.8);
addCrateStack(-55, 55, 0.2); addCrateStack(55, -55, -0.6); addCrateStack(-55, -55, 0.9); addCrateStack(55, 55, -0.1);
addCrateStack(-65, 0, 0.5); addCrateStack(65, 0, -0.4); addCrateStack(0, -65, 0.3); addCrateStack(0, 65, -0.7);
addCrateStack(-45, -45, 0.1); addCrateStack(45, 45, -0.5); addCrateStack(-45, 45, 0.8); addCrateStack(45, -45, -0.2);
addCar(-10, -38, 0.5, 0x334466); addCar(30, 22, 1.2, 0x663333);
addCar(-32, 26, -0.8, 0x335533); addCar(12, -36, 2.1, 0x555544);
addCar(-38, -38, 0.3, 0x444466);
addCar(-60, -10, 1.0, 0x663344); addCar(60, 10, -0.5, 0x336644); addCar(-10, -60, 0.8, 0x446633); addCar(10, 60, -1.2, 0x554466);
addCar(-55, 35, 0.4, 0x664444); addCar(55, -35, -0.7, 0x446655); addCar(-35, -55, 1.5, 0x555566); addCar(35, 55, -1.0, 0x665544);
addCar(-70, 0, 0.2, 0x334455); addCar(70, 0, -0.3, 0x554433); addCar(0, -70, 0.9, 0x445544); addCar(0, 70, -0.6, 0x556655);
addCar(-48, -65, 1.8, 0x666644); addCar(48, 65, -1.4, 0x444466);
addLampPost(-10, -3); addLampPost(10, -3); addLampPost(-10, 3); addLampPost(10, 3);
addLampPost(-24, 0); addLampPost(24, 0); addLampPost(0, -24); addLampPost(0, 24);
addLampPost(-40, 0); addLampPost(40, 0); addLampPost(0, -40); addLampPost(0, 40);
addLampPost(-60, 0); addLampPost(60, 0); addLampPost(0, -60); addLampPost(0, 60);
addLampPost(-40, -40); addLampPost(40, -40); addLampPost(-40, 40); addLampPost(40, 40);
addLampPost(-20, -20); addLampPost(20, -20); addLampPost(-20, 20); addLampPost(20, 20);
addLampPost(-55, -55); addLampPost(55, -55); addLampPost(-55, 55); addLampPost(55, 55);
addLampPost(-70, -35); addLampPost(70, 35); addLampPost(-35, 70); addLampPost(35, -70);
addLampPost(-35, -35); addLampPost(35, -35); addLampPost(-35, 35); addLampPost(35, 35);
addLampPost(-50, -20); addLampPost(50, 20); addLampPost(-20, 50); addLampPost(20, -50);
addPuddle(-14, -4, 0.5); addPuddle(14, 4, 0.4); addPuddle(0, -14, 0.6);
addPuddle(-8, 14, 0.35); addPuddle(18, -18, 0.45); addPuddle(-20, 12, 0.3);
addPuddle(-45, -20, 0.6); addPuddle(45, 20, 0.5); addPuddle(-20, -45, 0.4); addPuddle(20, 45, 0.55);
addPuddle(-55, 10, 0.35); addPuddle(55, -10, 0.4); addPuddle(-10, 55, 0.45); addPuddle(10, -55, 0.5);
addPuddle(-65, -30, 0.6); addPuddle(65, 30, 0.5); addPuddle(-30, 65, 0.4); addPuddle(30, -65, 0.55);
addPuddle(-40, -55, 0.35); addPuddle(40, 55, 0.4); addPuddle(-55, 40, 0.45); addPuddle(55, -40, 0.5);
addTireStack(-22, -38); addTireStack(22, 38); addTireStack(-38, 22); addTireStack(38, -22);
addTireStack(-10, -26); addTireStack(10, 26);
addTireStack(-50, -50); addTireStack(50, -50); addTireStack(-50, 50); addTireStack(50, 50);
addTireStack(-65, -20); addTireStack(65, 20); addTireStack(-20, -65); addTireStack(20, 65);
addTireStack(-42, -10); addTireStack(42, 10); addTireStack(-10, -42); addTireStack(10, 42);
addSandbagWall(-18, -6, 0, 5); addSandbagWall(18, 6, Math.PI, 5);
addSandbagWall(-6, 18, Math.PI / 2, 4); addSandbagWall(6, -18, -Math.PI / 2, 4);
addSandbagWall(-50, -35, 0, 6); addSandbagWall(50, 35, Math.PI, 6);
addSandbagWall(-35, 50, Math.PI / 2, 5); addSandbagWall(35, -50, -Math.PI / 2, 5);
addSandbagWall(-65, -55, 0.3, 5); addSandbagWall(65, 55, -0.3, 5);
addSandbagWall(-65, 55, -0.3, 5); addSandbagWall(65, -55, 0.3, 5);
addSandbagWall(-30, -30, 0.7, 4); addSandbagWall(30, 30, -0.7, 4);
addSandbagWall(-30, 30, 0.7, 4); addSandbagWall(30, -30, -0.7, 4);

function addTree(x, z, sc) {
  const s = sc || (0.5 + Math.random() * 0.3);
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.03*s, 0.05*s, 0.4*s, 5), new THREE.MeshStandardMaterial({ color: 0x554433, roughness: 0.9 }));
  trunk.position.y = 0.2*s; g.add(trunk);
  const cols = [0x226622,0x338833,0x227733,0x336633,0x2a6b2a];
  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.3*s,6,6), new THREE.MeshStandardMaterial({ color: cols[Math.floor(Math.random()*cols.length)], roughness: 0.85 }));
  crown.position.y = 0.5*s+0.1; g.add(crown);
  g.position.set(x,0,z); scene.add(g);
  walls.push({ minX: x-0.15*s, maxX: x+0.15*s, minZ: z-0.15*s, maxZ: z+0.15*s });
}
const TREE_POS = [
  [-25,-15],[-20,-30],[25,-15],[20,-30],[-25,15],[-20,30],[25,15],[20,30],
  [-42,-30],[-35,-40],[42,-30],[35,-40],[-42,30],[-35,40],[42,30],[35,40],
  [-5,-48],[5,-48],[-5,48],[5,48],[-48,-5],[48,-5],[-48,5],[48,5],
  [-55,-65],[-60,-50],[-65,-55],[-50,-60],[-65,-35],[-55,-30],
  [55,65],[60,50],[65,55],[50,60],[65,35],[55,30],
  [-55,65],[-60,50],[-65,55],[-50,60],[-65,35],[-55,30],
  [55,-65],[60,-50],[65,-55],[50,-60],[65,-35],[55,-30],
  [-40,-55],[-45,-60],[-55,-45],[-60,-40],
  [40,55],[45,60],[55,45],[60,40],
  [-40,55],[-45,60],[-55,45],[-60,40],
  [40,-55],[45,-60],[55,-45],[60,-40],
  [-70,-15],[-70,15],[70,-15],[70,15],
  [-15,-70],[15,-70],[-15,70],[15,70],
  [-72,-50],[-72,50],[72,-50],[72,50],
  [-50,-72],[50,-72],[-50,72],[50,72],
  [-60,-25],[-25,-60],[60,25],[25,60],
  [-60,25],[-25,60],[60,-25],[25,-60],
];
for (const [tx, tz] of TREE_POS) {
  const sc = 0.5 + Math.random() * 0.4;
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.03*sc, 0.05*sc, 0.5*sc, 5), new THREE.MeshStandardMaterial({ color: 0x554433, roughness: 0.9 }));
  trunk.position.y = 0.25*sc; trunk.castShadow = true; g.add(trunk);
  const cols = [0x226622,0x338833,0x227733,0x336633,0x2a6b2a];
  for (let li = 0; li < 3; li++) {
    const r = (0.28 - li * 0.06) * sc;
    const crown = new THREE.Mesh(new THREE.SphereGeometry(r, 6, 6), new THREE.MeshStandardMaterial({ color: cols[Math.floor(Math.random() * cols.length)], roughness: 0.85 }));
    crown.position.y = (0.5 + li * 0.22) * sc; crown.castShadow = true;
    g.add(crown);
  }
  g.position.set(tx, 0, tz); scene.add(g);
  walls.push({ minX: tx - 0.15*sc, maxX: tx + 0.15*sc, minZ: tz - 0.15*sc, maxZ: tz + 0.15*sc });
}

const BUSH_POS = [
  [-28,-18],[-22,-22],[28,-18],[22,-22],[-28,22],[-22,18],[28,22],[22,18],
  [-35,-28],[30,-35],[-35,28],[30,35],[-15,-42],[15,-42],[-15,42],[15,42],
  [-10,-10],[10,-10],[-10,10],[10,10],[-38,0],[0,-38],[38,0],[0,38],
  [-45,-20],[45,-20],[-45,20],[45,20],[-20,-45],[20,-45],[-20,45],[20,45],
  [-55,-55],[-60,-45],[-45,-60],[-55,-45],[-65,-30],[-30,-65],
  [55,55],[60,45],[45,60],[55,45],[65,30],[30,65],
  [-55,55],[-60,45],[-45,60],[-55,45],[-65,30],[-30,65],
  [55,-55],[60,-45],[45,-60],[55,-45],[65,-30],[30,-65],
  [-70,-10],[-70,10],[70,-10],[70,10],
  [-10,-70],[10,-70],[-10,70],[10,70],
  [-50,-35],[-35,-50],[50,35],[35,50],
  [-50,35],[-35,50],[50,-35],[35,-50],
  [-65,-60],[-60,-65],[65,60],[60,65],
  [-65,60],[-60,65],[65,-60],[60,-65],
];
for (const [bx,bz] of BUSH_POS) {
  const bg = new THREE.Group();
  const bushCols = [0x2a5a2a,0x3a6a3a,0x2a5a3a,0x3a5a2a];
  for (let i=0;i<3;i++){
    const r=0.08+Math.random()*0.06;
    const c=new THREE.Mesh(new THREE.SphereGeometry(r,5,5),new THREE.MeshStandardMaterial({color:bushCols[Math.floor(Math.random()*bushCols.length)],roughness:0.9}));
    c.position.set((Math.random()-0.5)*0.2,r*0.3,(Math.random()-0.5)*0.2); bg.add(c);
  }
  bg.position.set(bx,0,bz); scene.add(bg);
}

function addBarrier(x,z,rot) {
  const mat=new THREE.MeshStandardMaterial({color:0x555566,roughness:0.8});
  const b=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.6,0.3),mat);
  b.position.set(x,0.3,z); b.rotation.y=rot; b.castShadow=true; scene.add(b);
  const hw=0.6*Math.abs(Math.cos(rot))+0.15*Math.abs(Math.sin(rot));
  const hd=0.15*Math.abs(Math.cos(rot))+0.6*Math.abs(Math.sin(rot));
  walls.push({minX:x-hw,maxX:x+hw,minZ:z-hd,maxZ:z+hd});
}
addBarrier(-38,-15,0); addBarrier(38,-15,0.2); addBarrier(-38,15,-0.2); addBarrier(38,15,0);
addBarrier(-55,-55,0.3); addBarrier(55,-55,-0.3); addBarrier(-55,55,0.3); addBarrier(55,55,-0.3);
addBarrier(-65,-25,0); addBarrier(65,25,0.2); addBarrier(-65,25,-0.2); addBarrier(65,-25,0);
addBarrier(-25,-65,0.5); addBarrier(25,65,-0.5); addBarrier(-25,65,-0.5); addBarrier(25,-65,0.5);
addBarrier(-45,-45,0.1); addBarrier(45,45,-0.1); addBarrier(-45,45,0.1); addBarrier(45,-45,-0.1);
addBarrier(-70,0,0); addBarrier(70,0,0.2); addBarrier(0,-70,0.3); addBarrier(0,70,-0.3);

function addContainer(x,z,rot) {
  const mat=new THREE.MeshStandardMaterial({color:0x775533,roughness:0.7,metalness:0.3});
  const c=new THREE.Mesh(new THREE.BoxGeometry(2.0,0.8,0.8),mat);
  c.position.set(x,0.4,z); c.rotation.y=rot; c.castShadow=true; scene.add(c);
  const hw=1.0*Math.abs(Math.cos(rot))+0.4*Math.abs(Math.sin(rot));
  const hd=0.4*Math.abs(Math.cos(rot))+1.0*Math.abs(Math.sin(rot));
  walls.push({minX:x-hw,maxX:x+hw,minZ:z-hd,maxZ:z+hd});
}
addContainer(-50,-30,0); addContainer(50,-30,0.2); addContainer(-50,30,-0.2); addContainer(50,30,0);
addContainer(-65,-55,0.3); addContainer(65,55,-0.3); addContainer(-65,55,0.3); addContainer(65,-55,-0.3);
addContainer(-30,-55,0); addContainer(30,55,0.4); addContainer(-55,-30,-0.3); addContainer(55,30,0.1);
addContainer(-70,15,0.2); addContainer(70,-15,-0.2); addContainer(15,-70,0); addContainer(-15,70,0.4);

for (const [cx,cz] of [[-22,-42],[22,42],[-42,-22],[42,22],[-55,-55],[55,-55],[-55,55],[55,55],[-70,-15],[70,15],[-15,-70],[15,70]]) {
  const m=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.25,0.1,6),new THREE.MeshStandardMaterial({color:0x553322,roughness:0.9}));
  m.position.set(cx,0.05,cz); scene.add(m);
  const f=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,6),new THREE.MeshBasicMaterial({color:0xff6600,transparent:true,opacity:0.5}));
  f.position.set(cx,0.2,cz); scene.add(f);
  const fl=new THREE.PointLight(0xff4400,0.2,3); fl.position.set(cx,0.2,cz); scene.add(fl);
}

for (const [px,pz] of [[-14,-14],[14,14],[-14,14],[14,-14],[-30,-25],[30,25],[-30,25],[30,-25],[-24,0],[24,0],[0,-24],[0,24],[-50,-50],[50,50],[-50,50],[50,-50],[-65,-30],[65,30],[-30,-65],[30,65],[-70,0],[70,0],[0,-70],[0,70],[-45,-65],[45,65],[-65,-45],[65,45],[-20,-55],[20,55],[-55,-20],[55,20]]) {
  const r=0.3+Math.random()*0.5;
  const m=new THREE.Mesh(new THREE.CircleGeometry(r,8),new THREE.MeshBasicMaterial({color:0x446688,transparent:true,opacity:0.12+Math.random()*0.08}));
  m.rotation.x=-Math.PI/2; m.position.set(px,0.015,pz); scene.add(m);
}

function addWatchTower(x,z) {
  const wood=new THREE.MeshStandardMaterial({color:0x554433,roughness:0.9});
  const g=new THREE.Group();
  for (const s of [-0.2,0.2]){
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.06,2.0,4),wood);
    leg.position.set(s,1.0,s); g.add(leg);
  }
  const plat=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.06,0.5),wood);
  plat.position.y=2.0; g.add(plat);
  g.position.set(x,0,z); scene.add(g);
  walls.push({minX:x-0.3,maxX:x+0.3,minZ:z-0.3,maxZ:z+0.3});
}
addWatchTower(-52,-52); addWatchTower(52,-52); addWatchTower(-52,52); addWatchTower(52,52);
addWatchTower(-70,-70); addWatchTower(70,-70); addWatchTower(-70,70); addWatchTower(70,70);
addWatchTower(-35,0); addWatchTower(35,0); addWatchTower(0,-35); addWatchTower(0,35);
addWatchTower(-60,-25); addWatchTower(60,25); addWatchTower(-25,60); addWatchTower(25,-60);

function addDumpster(x, z, rot) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.8), new THREE.MeshStandardMaterial({ color: 0x2a5a2a, roughness: 0.7, metalness: 0.3 }));
  body.position.y = 0.35; body.castShadow = true; g.add(body);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.8), new THREE.MeshStandardMaterial({ color: 0x224422, roughness: 0.6, metalness: 0.4 }));
  lid.position.set(0, 0.72, -0.2); lid.rotation.x = -0.3; g.add(lid);
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.5 });
  const rim1 = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.04, 0.04), rimMat); rim1.position.set(0, 0.7, 0.4); g.add(rim1);
  const rim2 = rim1.clone(); rim2.position.z = -0.4; g.add(rim2);
  g.position.set(x, 0, z); g.rotation.y = rot || 0; scene.add(g);
  walls.push({ minX: x - 0.65, maxX: x + 0.65, minZ: z - 0.45, maxZ: z + 0.45 });
}
addDumpster(-18, -30, 0); addDumpster(18, 30, 0.5); addDumpster(-48, 15, 0.3); addDumpster(48, -15, -0.2);
addDumpster(-30, 55, 0.7); addDumpster(30, -55, -0.5); addDumpster(-60, 40, 0); addDumpster(60, -40, 0.8);

function addGrave(x, z, rot) {
  const g = new THREE.Group();
  const stone = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.06), new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 }));
  stone.position.y = 0.175; stone.castShadow = true; g.add(stone);
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.125, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 }));
  top.position.y = 0.35; g.add(top);
  const mound = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.08, 6), new THREE.MeshStandardMaterial({ color: 0x443322, roughness: 0.95 }));
  mound.position.set(0, 0.04, 0.3); g.add(mound);
  g.position.set(x, 0, z); g.rotation.y = rot || 0; scene.add(g);
  walls.push({ minX: x - 0.15, maxX: x + 0.15, minZ: z - 0.15, maxZ: z + 0.15 });
}
for (let gi = 0; gi < 8; gi++) {
  addGrave(-62 + gi * 1.2, -65 + (Math.random() - 0.5) * 0.6, Math.PI);
  addGrave(-62 + gi * 1.2, -67 + (Math.random() - 0.5) * 0.6, Math.PI);
}

function addCrater(x, z, r) {
  const craterGeo = new THREE.CircleGeometry(r || 1.0, 10);
  const craterMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 1.0 });
  const crater = new THREE.Mesh(craterGeo, craterMat);
  crater.rotation.x = -Math.PI / 2; crater.position.set(x, 0.012, z); scene.add(crater);
  const rim = new THREE.Mesh(new THREE.RingGeometry((r || 1.0) * 0.85, (r || 1.0) * 1.1, 10), new THREE.MeshStandardMaterial({ color: 0x443322, roughness: 0.9 }));
  rim.rotation.x = -Math.PI / 2; rim.position.set(x, 0.02, z); scene.add(rim);
}
addCrater(-30, 50, 1.2); addCrater(50, -30, 0.9); addCrater(-50, -45, 1.0); addCrater(45, 45, 1.1);
addCrater(-60, 15, 0.8); addCrater(30, -60, 1.3); addCrater(-15, 55, 0.7); addCrater(60, 30, 0.9);

function addSignPost(x, z, rot) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 1.5, 4), new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.5 }));
  pole.position.y = 0.75; g.add(pole);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.02), new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.6, metalness: 0.3 }));
  sign.position.set(0, 1.3, 0); g.add(sign);
  g.position.set(x, 0, z); g.rotation.y = rot || 0; scene.add(g);
  walls.push({ minX: x - 0.04, maxX: x + 0.04, minZ: z - 0.04, maxZ: z + 0.04 });
}
addSignPost(-5, -10, 0.3); addSignPost(5, 10, -0.3); addSignPost(-10, 5, 1.0); addSignPost(10, -5, 2.0);
addSignPost(-45, -10, 0); addSignPost(45, 10, Math.PI); addSignPost(-10, -45, Math.PI / 2); addSignPost(10, 45, -Math.PI / 2);

function addBurntCar(x, z, rot) {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 0.9), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }));
  frame.position.y = 0.35; frame.castShadow = true; g.add(frame);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 0.8), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 }));
  roof.position.set(-0.1, 0.65, 0); roof.rotation.z = 0.1; roof.castShadow = true; g.add(roof);
  const charr = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.01, 1.0), new THREE.MeshBasicMaterial({ color: 0x333300, transparent: true, opacity: 0.15 }));
  charr.position.y = 0.56; g.add(charr);
  for (const [wx, wz] of [[-0.6, 0.48], [0.6, 0.48], [-0.6, -0.48]]) {
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 6), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    wh.rotation.z = Math.PI / 2; wh.position.set(wx, 0.12, wz); g.add(wh);
  }
  g.position.set(x, 0, z); g.rotation.y = rot || 0; scene.add(g);
  walls.push({ minX: x - 1.0, maxX: x + 1.0, minZ: z - 0.6, maxZ: z + 0.6 });
}
addBurntCar(-65, 50, 0.4); addBurntCar(65, -50, -0.6); addBurntCar(50, 65, 1.0); addBurntCar(-50, -65, -1.2);
addBurntCar(-70, -40, 0.2); addBurntCar(70, 40, -0.3);

const BIOMES = {
  city: { center: [0, 0], radius: 30, groundColor: 0x3a3a3a, fogColor: 0x2a3a2a },
  industrial: { center: [-50, -50], radius: 22, groundColor: 0x4a4035, fogColor: 0x3a3025 },
  forest: { center: [50, 50], radius: 25, groundColor: 0x2a5a2a, fogColor: 0x1a3a1a },
  desert: { center: [-50, 50], radius: 20, groundColor: 0x8a7a5a, fogColor: 0x6a5a3a },
  ruins: { center: [50, -50], radius: 22, groundColor: 0x5a4a3a, fogColor: 0x3a2a1a },
};

function getBiomeColor(x, z) {
  let closest = BIOMES.city; let minDist = Infinity;
  for (const key of Object.keys(BIOMES)) {
    const b = BIOMES[key];
    const dx = x - b.center[0], dz = z - b.center[1];
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < minDist) { minDist = dist; closest = b; }
  }
  return closest.groundColor;
}

const biomeGroundMat = new THREE.MeshStandardMaterial({ color: 0x3a4a3a, roughness: 0.95 });
const biomePatches = [];
function addBiomePatch(x, z, r, color) {
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(r, 12),
    new THREE.MeshStandardMaterial({ color, roughness: 0.9, transparent: true, opacity: 0.6 })
  );
  m.rotation.x = -Math.PI / 2; m.position.set(x, 0.008, z); scene.add(m);
  biomePatches.push({ x, z, r, color });
}

for (let i = 0; i < 40; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = 3 + Math.random() * 8;
  const dist = 15 + Math.random() * 55;
  addBiomePatch(Math.cos(a) * dist, Math.sin(a) * dist, r, getBiomeColor(Math.cos(a)*dist, Math.sin(a)*dist));
}

function addIndustrialStructure(x, z) {
  const g = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.6, roughness: 0.4 });
  const corrugated = new THREE.MeshStandardMaterial({ color: 0x667777, metalness: 0.3, roughness: 0.7 });
  const w = 2.5 + Math.random() * 2, h = 2.0 + Math.random() * 2;
  const wall1 = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), corrugated);
  wall1.position.set(0, h/2, 1.2); wall1.castShadow = true; g.add(wall1);
  const wall2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, 2.4), corrugated);
  wall2.position.set(w/2, h/2, 0); wall2.castShadow = true; g.add(wall2);
  const wall3 = wall2.clone(); wall3.position.x = -w/2; g.add(wall3);
  const roofP = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.05, 2.6), new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.4 }));
  roofP.position.y = h + 0.025; g.add(roofP);
  for (let ci = 0; ci < 3; ci++) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, h, 5), frameMat);
    col.position.set((ci - 1) * (w / 2), h / 2, 1.2); g.add(col);
  }
  const pipe1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, h + 1, 6), new THREE.MeshStandardMaterial({ color: 0x884422, roughness: 0.6, metalness: 0.4 }));
  pipe1.position.set(w/2 + 0.3, (h+1)/2, 0); g.add(pipe1);
  const pipe2 = pipe1.clone(); pipe2.position.x = -w/2 - 0.3; g.add(pipe2);
  if (Math.random() > 0.5) {
    const smokeStack = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3, 8), new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.5 }));
    smokeStack.position.set(0, h + 1.5, -0.5); g.add(smokeStack);
    const sTop = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.2, 8), frameMat);
    sTop.position.set(0, h + 3.1, -0.5); g.add(sTop);
  }
  const crane = Math.random() > 0.7;
  if (crane) {
    const craneBase = new THREE.Mesh(new THREE.BoxGeometry(0.3, h + 2, 0.3), frameMat);
    craneBase.position.set(w/2 + 1, (h+2)/2, 0); g.add(craneBase);
    const craneArm = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, 0.15), frameMat);
    craneArm.position.set(w/2 + 1, h + 2, 1.5); craneArm.rotation.z = -0.1; g.add(craneArm);
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 2, 3), new THREE.MeshStandardMaterial({ color: 0x888888 }));
    cable.position.set(w/2 + 3, h + 1, 1.5); g.add(cable);
    const hook = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.15, 4), frameMat);
    hook.position.set(w/2 + 3, h, 1.5); hook.rotation.x = Math.PI; g.add(hook);
  }
  g.position.set(x, 0, z); g.rotation.y = Math.random() * Math.PI * 2; scene.add(g);
  walls.push({ minX: x - w/2 - 0.1, maxX: x + w/2 + 0.1, minZ: z - 1.4, maxZ: z + 1.4 });
}

for (let ii = 0; ii < 6; ii++) {
  const ia = ii / 6 * Math.PI * 2;
  addIndustrialStructure(-50 + Math.cos(ia) * 12, -50 + Math.sin(ia) * 12);
}
addIndustrialStructure(-50, -50);

function addForestCluster(x, z) {
  const g = new THREE.Group();
  const treeCount = 3 + Math.floor(Math.random() * 5);
  for (let ti = 0; ti < treeCount; ti++) {
    const tx = (Math.random() - 0.5) * 4;
    const tz = (Math.random() - 0.5) * 4;
    const sc = 0.6 + Math.random() * 0.6;
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04*sc, 0.07*sc, 0.6*sc, 6),
      new THREE.MeshStandardMaterial({ color: 0x443322, roughness: 0.95 })
    );
    trunk.position.set(tx, 0.3*sc, tz); trunk.castShadow = true; g.add(trunk);
    const leafCols = [0x1a5a1a, 0x2a6a2a, 0x1a7a2a, 0x2a5a1a, 0x337733];
    for (let li = 0; li < 4; li++) {
      const r = (0.35 - li * 0.06) * sc;
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(r, 7, 7),
        new THREE.MeshStandardMaterial({ color: leafCols[Math.floor(Math.random() * leafCols.length)], roughness: 0.85 })
      );
      leaf.position.set(tx, (0.55 + li * 0.2) * sc, tz); leaf.castShadow = true; g.add(leaf);
    }
  }
  for (let fi = 0; fi < 4; fi++) {
    const fern = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.2, 5),
      new THREE.MeshStandardMaterial({ color: 0x226622, roughness: 0.9 })
    );
    fern.position.set((Math.random()-0.5)*5, 0.1, (Math.random()-0.5)*5);
    fern.rotation.set(Math.random()*0.3, Math.random()*Math.PI, Math.random()*0.3);
    g.add(fern);
  }
  const mushroomCount = Math.floor(Math.random() * 3);
  for (let mi = 0; mi < mushroomCount; mi++) {
    const mStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.015, 0.06, 4),
      new THREE.MeshStandardMaterial({ color: 0xccbbaa })
    );
    mStem.position.set((Math.random()-0.5)*3, 0.03, (Math.random()-0.5)*3); g.add(mStem);
    const mCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 5, 3, 0, Math.PI*2, 0, Math.PI/2),
      new THREE.MeshStandardMaterial({ color: Math.random() > 0.5 ? 0xcc3333 : 0xcc8833 })
    );
    mCap.position.set(mStem.position.x, 0.065, mStem.position.z); g.add(mCap);
  }
  for (let lg = 0; lg < 2; lg++) {
    const log = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 1.0 + Math.random(), 5),
      new THREE.MeshStandardMaterial({ color: 0x443322, roughness: 0.95 })
    );
    log.position.set((Math.random()-0.5)*3, 0.05, (Math.random()-0.5)*3);
    log.rotation.z = Math.PI/2; log.rotation.y = Math.random() * Math.PI; g.add(log);
  }
  g.position.set(x, 0, z); scene.add(g);
  for (let wi = -2; wi <= 2; wi++) {
    walls.push({ minX: x + wi*4 - 0.1, maxX: x + wi*4 + 0.1, minZ: z - 2.2, maxZ: z + 2.2 });
  }
}

for (let fi = 0; fi < 8; fi++) {
  const fa = fi / 8 * Math.PI * 2 + Math.random() * 0.5;
  addForestCluster(50 + Math.cos(fa) * (8 + Math.random() * 12), 50 + Math.sin(fa) * (8 + Math.random() * 12));
}

function addDesertRuin(x, z) {
  const g = new THREE.Group();
  const ruinMat = new THREE.MeshStandardMaterial({ color: 0x9a8a6a, roughness: 0.95 });
  const wallCount = 2 + Math.floor(Math.random() * 3);
  for (let wi = 0; wi < wallCount; wi++) {
    const w = 0.8 + Math.random() * 1.5;
    const h = 0.3 + Math.random() * 0.8;
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), ruinMat);
    wall.position.set((wi - wallCount/2) * 0.9, h/2, 0);
    wall.rotation.y = (Math.random() - 0.5) * 0.3;
    wall.rotation.z = (Math.random() - 0.5) * 0.1;
    wall.castShadow = true; g.add(wall);
  }
  const rubbleCount = 4 + Math.floor(Math.random() * 6);
  for (let ri = 0; ri < rubbleCount; ri++) {
    const rs = 0.05 + Math.random() * 0.15;
    const rub = new THREE.Mesh(
      new THREE.BoxGeometry(rs, rs * 0.5, rs * 0.8),
      new THREE.MeshStandardMaterial({ color: 0x8a7a5a + Math.floor(Math.random() * 0x101010), roughness: 0.95 })
    );
    rub.position.set((Math.random()-0.5)*2, rs*0.25, (Math.random()-0.5)*2);
    rub.rotation.y = Math.random() * Math.PI; g.add(rub);
  }
  const pillar = Math.random() > 0.5;
  if (pillar) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.2, 6), ruinMat);
    p.position.set(0.8, 0.6, 0.5); p.castShadow = true; g.add(p);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.08, 6), ruinMat);
    cap.position.set(0.8, 1.24, 0.5); g.add(cap);
  }
  g.position.set(x, 0, z); g.rotation.y = Math.random() * Math.PI; scene.add(g);
  walls.push({ minX: x - 1.2, maxX: x + 1.2, minZ: z - 0.8, maxZ: z + 0.8 });
}

for (let di = 0; di < 8; di++) {
  const da = di / 8 * Math.PI * 2 + Math.random() * 0.4;
  addDesertRuin(-50 + Math.cos(da) * (6 + Math.random() * 10), 50 + Math.sin(da) * (6 + Math.random() * 10));
}

function addRamp(x, z, rot, w, h) {
  const g = new THREE.Group();
  const rampW = w || 2.0, rampH = h || 0.6;
  const rampMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 });
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(rampW, 0.08, rampH * 2), rampMat);
  ramp.position.set(0, rampH / 2, 0); ramp.rotation.x = -0.29; ramp.receiveShadow = true; g.add(ramp);
  const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.08, rampH, rampH * 2), rampMat);
  sideL.position.set(-rampW/2, rampH/2, 0); sideL.rotation.x = -0.29; g.add(sideL);
  const sideR = sideL.clone(); sideR.position.x = rampW/2; g.add(sideR);
  const topPlat = new THREE.Mesh(new THREE.BoxGeometry(rampW, 0.08, 1.5), rampMat);
  topPlat.position.set(0, rampH, rampH); topPlat.receiveShadow = true; g.add(topPlat);
  g.position.set(x, 0, z); g.rotation.y = rot || 0; scene.add(g);
  walls.push({ minX: x - rampW/2 - 0.1, maxX: x + rampW/2 + 0.1, minZ: z - 0.2, maxZ: z + rampH * 3 });
}

function addPlatform(x, z, w, d, h) {
  const g = new THREE.Group();
  const pH = h || 1.2, pW = w || 3, pD = d || 3;
  const platMat = new THREE.MeshStandardMaterial({ color: 0x666655, roughness: 0.7 });
  const top = new THREE.Mesh(new THREE.BoxGeometry(pW, 0.1, pD), platMat);
  top.position.y = pH; top.receiveShadow = true; top.castShadow = true; g.add(top);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x555544, metalness: 0.4 });
  for (const [lx, lz] of [[-pW/2+0.1, -pD/2+0.1], [pW/2-0.1, -pD/2+0.1], [-pW/2+0.1, pD/2-0.1], [pW/2-0.1, pD/2-0.1]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, pH, 5), legMat);
    leg.position.set(lx, pH/2, lz); g.add(leg);
  }
  const bracing = new THREE.Mesh(new THREE.BoxGeometry(pW * 0.8, 0.04, 0.04), legMat);
  bracing.position.set(0, pH * 0.5, 0); g.add(bracing);
  const bracing2 = bracing.clone(); bracing2.rotation.y = Math.PI / 2; g.add(bracing2);
  g.position.set(x, 0, z); scene.add(g);
  walls.push({ minX: x - pW/2 - 0.1, maxX: x + pW/2 + 0.1, minZ: z - pD/2 - 0.1, maxZ: z + pD/2 + 0.1 });
}

function addBridge(x1, z1, x2, z2) {
  const dx = x2 - x1, dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dx, dz);
  const g = new THREE.Group();
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x776655, roughness: 0.7 });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, len), deckMat);
  deck.position.y = 1.5; deck.receiveShadow = true; g.add(deck);
  const railMat = new THREE.MeshStandardMaterial({ color: 0x555544, metalness: 0.3 });
  for (const side of [-0.7, 0.7]) {
    for (let ri = 0; ri <= len; ri += 1.0) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.6, 4), railMat);
      post.position.set(side, 1.8, ri - len/2); g.add(post);
    }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, len), railMat);
    rail.position.set(side, 2.05, 0); g.add(rail);
  }
  const supportMat = new THREE.MeshStandardMaterial({ color: 0x666655, metalness: 0.5 });
  for (let si = 0; si < len; si += 3) {
    const support = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.5, 4), supportMat);
    support.position.set(-0.5, 0.75, si - len/2); g.add(support);
    const support2 = support.clone(); support2.position.x = 0.5; g.add(support2);
  }
  g.position.set((x1+x2)/2, 0, (z1+z2)/2); g.rotation.y = angle; scene.add(g);
}

function addTrench(x, z, rot, len) {
  const g = new THREE.Group();
  const trenchLen = len || 6;
  const dirtMat = new THREE.MeshStandardMaterial({ color: 0x554433, roughness: 0.95 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x665544, roughness: 0.9 });
  for (const side of [-0.5, 0.5]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, trenchLen), wallMat);
    wall.position.set(side, 0.3, 0); g.add(wall);
  }
  const floor = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, trenchLen), dirtMat);
  floor.position.y = 0.025; g.add(floor);
  for (let si = 0; si < trenchLen; si += 1.5) {
    const sandbag = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.4), new THREE.MeshStandardMaterial({ color: 0x887755, roughness: 0.95 }));
    sandbag.position.set(0.58, 0.65, si - trenchLen/2); sandbag.castShadow = true; g.add(sandbag);
  }
  g.position.set(x, 0, z); g.rotation.y = rot || 0; scene.add(g);
  walls.push({ minX: x - 0.6, maxX: x + 0.6, minZ: z - trenchLen/2 - 0.2, maxZ: z + trenchLen/2 + 0.2 });
}

addRamp(-15, 0, 0, 2, 0.6); addRamp(15, 0, Math.PI, 2, 0.6);
addRamp(0, -15, Math.PI/2, 2, 0.6); addRamp(0, 15, -Math.PI/2, 2, 0.6);
addPlatform(-15, -15, 4, 4, 1.0); addPlatform(15, 15, 4, 4, 1.0);
addPlatform(-15, 15, 3, 3, 0.8); addPlatform(15, -15, 3, 3, 0.8);
addRamp(-15, -15, 0.3, 1.5, 1.0); addRamp(15, 15, Math.PI + 0.3, 1.5, 1.0);
addBridge(-40, -40, -20, -20); addBridge(40, 40, 20, 20);
addBridge(-40, 40, -20, 20); addBridge(40, -40, 20, -20);
addPlatform(0, -45, 5, 2, 0.7); addPlatform(0, 45, 5, 2, 0.7);
addPlatform(-45, 0, 2, 5, 0.7); addPlatform(45, 0, 2, 5, 0.7);
addTrench(-35, -10, 0, 5); addTrench(35, 10, Math.PI, 5);
addTrench(-10, -35, Math.PI/2, 5); addTrench(10, 35, -Math.PI/2, 5);
addPlatform(-55, -55, 3, 3, 1.2); addPlatform(55, 55, 3, 3, 1.2);
addPlatform(-55, 55, 3, 3, 1.2); addPlatform(55, -55, 3, 3, 1.2);
addRamp(-55, -55, 0.5, 1.5, 1.2); addRamp(55, 55, Math.PI + 0.5, 1.5, 1.2);

const hazmatBarrels = [];
function addHazmatBarrel(x, z) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.7, 8), new THREE.MeshStandardMaterial({ color: 0xcccc22, roughness: 0.6, metalness: 0.3 }));
  body.position.y = 0.35; body.castShadow = true; g.add(body);
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 8), new THREE.MeshStandardMaterial({ color: 0x222222 }));
  stripe.position.y = 0.35; g.add(stripe);
  const toxicGlow = new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 6), new THREE.MeshBasicMaterial({ color: 0x44ff44, transparent: true, opacity: 0.15 }));
  toxicGlow.position.y = 0.35; g.add(toxicGlow);
  g.position.set(x, 0, z); scene.add(g);
  walls.push({ minX: x - 0.25, maxX: x + 0.25, minZ: z - 0.25, maxZ: z + 0.25 });
  hazmatBarrels.push({ pos: new THREE.Vector3(x, 0.35, z), radius: 2.5, dmg: 25 });
}

function addToxicPool(x, z, r) {
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(r || 1.0, 10),
    new THREE.MeshBasicMaterial({ color: 0x44ff44, transparent: true, opacity: 0.15 })
  );
  m.rotation.x = -Math.PI / 2; m.position.set(x, 0.01, z); scene.add(m);
  const bubbles = new THREE.Group();
  for (let bi = 0; bi < 5; bi++) {
    const bubble = new THREE.Mesh(
      new THREE.SphereGeometry(0.02 + Math.random() * 0.03, 4, 4),
      new THREE.MeshBasicMaterial({ color: 0x66ff66, transparent: true, opacity: 0.3 })
    );
    bubble.position.set(x + (Math.random()-0.5)*r, 0.05, z + (Math.random()-0.5)*r);
    bubble.userData = { baseY: 0.05, speed: 0.5 + Math.random(), phase: Math.random() * Math.PI * 2 };
    scene.add(bubble); bubbles.add(bubble);
  }
}

function addElectricFence(x1, z1, x2, z2) {
  const dx = x2 - x1, dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dx, dz);
  const g = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.7 });
  for (let pi = 0; pi <= len; pi += 2) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.8, 4), postMat);
    post.position.set(0, 0.9, pi - len/2); g.add(post);
    const insul = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 6), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    insul.position.set(0, 1.6, pi - len/2); g.add(insul);
  }
  for (const h of [1.2, 1.5]) {
    const wire = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.005, len), new THREE.MeshBasicMaterial({ color: 0xaaffaa }));
    wire.position.set(0, h, 0); g.add(wire);
  }
  const sparkLight = new THREE.PointLight(0x44ff44, 0.3, 4);
  sparkLight.position.set(0, 1.5, 0); g.add(sparkLight);
  g.position.set((x1+x2)/2, 0, (z1+z2)/2); g.rotation.y = angle; scene.add(g);
  walls.push({ minX: Math.min(x1,x2) - 0.1, maxX: Math.max(x1,x2) + 0.1, minZ: Math.min(z1,z2) - 0.1, maxZ: Math.max(z1,z2) + 0.1 });
}

addHazmatBarrel(-48, -48); addHazmatBarrel(-47, -49); addHazmatBarrel(-49, -47);
addHazmatBarrel(48, 48); addHazmatBarrel(47, 49); addHazmatBarrel(49, 47);
addHazmatBarrel(-48, 48); addHazmatBarrel(48, -48);
addToxicPool(-47, -47, 1.5); addToxicPool(47, 47, 1.2);
addToxicPool(-46, 47, 1.0); addToxicPool(46, -47, 1.3);
addElectricFence(-55, -35, -35, -55); addElectricFence(35, 55, 55, 35);
addElectricFence(-55, 35, -35, 55); addElectricFence(35, -55, 55, -35);
const SPAWNS = [];
for (let i = 0; i < 30; i++) {
  const a = i / 30 * Math.PI * 2;
  SPAWNS.push({ x: Math.cos(a) * (HALF - 5), z: Math.sin(a) * (HALF - 5) });
}
for (let i = 0; i < 15; i++) {
  const a = i / 15 * Math.PI * 2;
  SPAWNS.push({ x: Math.cos(a) * (HALF - 20), z: Math.sin(a) * (HALF - 20) });
}

const WPS = {
  p:  { id:'p',  name:'PISTOLA',     mag:15, res:60,  rof:0.15, spd:40, dmg:15, spread:0.04, reload:1.5, col:0x667788, icon:'🔫', kickBack:0.03, spreadIncrease:0.005, auto:false, pellets:1 },
  s:  { id:'s',  name:'SUBFUSIL',    mag:30, res:120, rof:0.06, spd:35, dmg:10, spread:0.06, reload:2.0, col:0x556677, icon:'⚡', kickBack:0.02, spreadIncrease:0.008, auto:true, pellets:1 },
  a:  { id:'a',  name:'RIFLE',       mag:30, res:90,  rof:0.08, spd:50, dmg:22, spread:0.025, reload:2.2, col:0x445566, icon:'🎯', kickBack:0.04, spreadIncrease:0.004, auto:true, pellets:1 },
  sg: { id:'sg', name:'ESCOPETA',    mag:8,  res:32,  rof:0.45, spd:30, dmg:18, spread:0.12, reload:2.5, col:0x665544, icon:'💥', kickBack:0.08, spreadIncrease:0.02, auto:false, pellets:8 },
  r:  { id:'r',  name:'LANZADOR',    mag:5,  res:15,  rof:0.8,  spd:25, dmg:80, spread:0.01, reload:3.0, col:0x884444, icon:'🚀', kickBack:0.06, spreadIncrease:0.002, auto:false, pellets:1, rocket:true },
  sn: { id:'sn', name:'FRANCOTIRADOR',mag:5,  res:20,  rof:1.2,  spd:70, dmg:120, spread:0.005, reload:2.8, col:0x334433, icon:'🔭', kickBack:0.1, spreadIncrease:0.001, auto:false, pellets:1, piercing:true },
  mg: { id:'mg', name:'MINIGUN',     mag:100,res:200, rof:0.03, spd:30, dmg:8,  spread:0.08, reload:4.0, col:0x555566, icon:'⚙️', kickBack:0.015, spreadIncrease:0.01, auto:true, pellets:1, spinUp:0.5 },
  fl: { id:'fl', name:'LANZALLAMAS', mag:50, res:100, rof:0.02, spd:15, dmg:6,  spread:0.15, reload:3.0, col:0xaa5522, icon:'🔥', kickBack:0.01, spreadIncrease:0.012, auto:true, pellets:1, flamethrower:true, range:8 },
  gl: { id:'gl', name:'LANZAGRANADAS',mag:6, res:18,  rof:0.7,  spd:20, dmg:60, spread:0.02, reload:3.5, col:0x556644, icon:'💣', kickBack:0.07, spreadIncrease:0.003, auto:false, pellets:1, grenade:true },
  lb: { id:'lb', name:'RAYO LASER',  mag:100,res:0,   rof:0.05, spd:80, dmg:5,  spread:0.01, reload:0, col:0x22aaff, icon:'✨', kickBack:0.005, spreadIncrease:0.002, auto:true, pellets:1, laser:true, noAmmoUse:true },
};

const WUNLOCK = {
  p: 1, s: 1, a: 2, sg: 3, r: 5, sn: 7, mg: 10, fl: 12, gl: 15, lb: 20,
};

const weaponModels = {};
function buildSniperModel(w) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334433, roughness: 0.5, metalness: 0.4 });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.6, 6), bodyMat);
  barrel.rotation.x = Math.PI/2; barrel.position.set(0, -0.01, -0.25); g.add(barrel);
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.15), bodyMat);
  stock.position.set(0, -0.02, 0.15); g.add(stock);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.3), bodyMat);
  body.position.set(0, -0.01, 0); g.add(body);
  const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 6), new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.7 }));
  scope.rotation.x = Math.PI/2; scope.position.set(0, 0.03, -0.02); g.add(scope);
  const scopeL = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), new THREE.MeshBasicMaterial({ color: 0x2266aa }));
  scopeL.position.set(0, 0.03, -0.1); g.add(scopeL);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.08, 4), bodyMat);
  grip.position.set(0, -0.06, 0.05); grip.rotation.x = 0.3; g.add(grip);
  const bipodL = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.06, 3), bodyMat);
  bipodL.position.set(-0.03, -0.05, -0.15); bipodL.rotation.z = 0.2; g.add(bipodL);
  const bipodR = bipodL.clone(); bipodR.position.x = 0.03; bipodR.rotation.z = -0.2; g.add(bipodR);
  return g;
}

function buildMinigunModel(w) {
  const g = new THREE.Group();
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.7, roughness: 0.3 });
  for (let bi = 0; bi < 6; bi++) {
    const ang = (bi / 6) * Math.PI * 2;
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.4, 4), metalMat);
    barrel.rotation.x = Math.PI/2;
    barrel.position.set(Math.cos(ang)*0.025, Math.sin(ang)*0.025, -0.2); g.add(barrel);
  }
  const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 8), metalMat);
  housing.rotation.x = Math.PI/2; housing.position.set(0, 0, 0); g.add(housing);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.15), new THREE.MeshStandardMaterial({ color: 0x332211, roughness: 0.8 }));
  handle.position.set(0, -0.03, 0.05); g.add(handle);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.06, 4), new THREE.MeshStandardMaterial({ color: 0x332211 }));
  grip.position.set(0, -0.06, 0.08); g.add(grip);
  const ammoBelt = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.08), new THREE.MeshStandardMaterial({ color: 0x554433, metalness: 0.3 }));
  ammoBelt.position.set(0.04, -0.02, 0.05); g.add(ammoBelt);
  return g;
}

function buildFlamethrowerModel(w) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x885522, roughness: 0.6, metalness: 0.4 });
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.25, 6), bodyMat);
  nozzle.rotation.x = Math.PI/2; nozzle.position.set(0, 0, -0.2); g.add(nozzle);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.2), bodyMat);
  body.position.set(0, -0.01, 0); g.add(body);
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 8), new THREE.MeshStandardMaterial({ color: 0xcc4400, roughness: 0.5, metalness: 0.3 }));
  tank.rotation.x = Math.PI/2; tank.position.set(0, -0.05, 0.05); g.add(tank);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.07, 4), bodyMat);
  grip.position.set(0, -0.06, 0.05); g.add(grip);
  const flameGuard = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.04, 6), new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.6 }));
  flameGuard.rotation.x = Math.PI/2; flameGuard.position.set(0, 0, -0.32); g.add(flameGuard);
  const pilotLight = new THREE.Mesh(new THREE.SphereGeometry(0.008, 4, 4), new THREE.MeshBasicMaterial({ color: 0xff4400 }));
  pilotLight.position.set(0, 0.01, -0.33); g.add(pilotLight);
  return g;
}

function buildGrenadeLauncherModel(w) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x445544, roughness: 0.6, metalness: 0.4 });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8), bodyMat);
  barrel.rotation.x = Math.PI/2; barrel.position.set(0, 0, -0.15); g.add(barrel);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.2), bodyMat);
  body.position.set(0, -0.01, 0); g.add(body);
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.05, 0.12), bodyMat);
  stock.position.set(0, -0.01, 0.12); g.add(stock);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.07, 4), bodyMat);
  grip.position.set(0, -0.06, 0.04); g.add(grip);
  const sight = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.03, 0.01), new THREE.MeshStandardMaterial({ color: 0x222222 }));
  sight.position.set(0, 0.035, -0.05); g.add(sight);
  return g;
}

function buildLaserModel(w) {
  const g = new THREE.Group();
  const sciMat = new THREE.MeshStandardMaterial({ color: 0x223355, roughness: 0.3, metalness: 0.6 });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.35, 8), sciMat);
  barrel.rotation.x = Math.PI/2; barrel.position.set(0, 0, -0.18); g.add(barrel);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.15), sciMat);
  body.position.set(0, -0.005, 0); g.add(body);
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.02, 0), new THREE.MeshBasicMaterial({ color: 0x22aaff }));
  crystal.position.set(0, 0.02, -0.08); g.add(crystal);
  const crystalGlow = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), new THREE.MeshBasicMaterial({ color: 0x2288ff, transparent: true, opacity: 0.15 }));
  crystalGlow.position.set(0, 0.02, -0.08); g.add(crystalGlow);
  const energyCell = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 6), new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.5 }));
  energyCell.position.set(0, -0.04, 0.02); g.add(energyCell);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.06, 4), sciMat);
  grip.position.set(0, -0.05, 0.04); g.add(grip);
  return g;
}

function buildShotgunModel(w) {
  const g = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x664422, roughness: 0.9 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6, roughness: 0.4 });
  const barrel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.35, 6), metalMat);
  barrel1.rotation.x = Math.PI/2; barrel1.position.set(-0.01, 0.005, -0.15); g.add(barrel1);
  const barrel2 = barrel1.clone(); barrel2.position.x = 0.01; g.add(barrel2);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.035, 0.2), metalMat);
  body.position.set(0, -0.01, 0); g.add(body);
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.04, 0.15), woodMat);
  stock.position.set(0, -0.015, 0.12); g.add(stock);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.07, 5), woodMat);
  grip.position.set(0, -0.05, 0.06); grip.rotation.x = 0.3; g.add(grip);
  const pump = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.03, 0.06), woodMat);
  pump.position.set(0, -0.02, -0.08); g.add(pump);
  return g;
}

function buildRifleModel(w) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x445566, roughness: 0.5, metalness: 0.4 });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.4, 6), bodyMat);
  barrel.rotation.x = Math.PI/2; barrel.position.set(0, 0, -0.18); g.add(barrel);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.035, 0.25), bodyMat);
  body.position.set(0, -0.005, 0); g.add(body);
  const magazine = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.06, 0.04), new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 }));
  magazine.position.set(0, -0.045, 0.02); g.add(magazine);
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.04, 0.12), bodyMat);
  stock.position.set(0, -0.005, 0.14); g.add(stock);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.06, 4), bodyMat);
  grip.position.set(0, -0.045, 0.08); grip.rotation.x = 0.3; g.add(grip);
  const sight = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.02, 0.008), new THREE.MeshStandardMaterial({ color: 0x222222 }));
  sight.position.set(0, 0.03, -0.05); g.add(sight);
  const flashGuard = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.02), bodyMat);
  flashGuard.position.set(0, 0.015, -0.35); g.add(flashGuard);
  return g;
}

function buildSMGModel(w) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x445555, roughness: 0.5, metalness: 0.4 });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.2, 6), bodyMat);
  barrel.rotation.x = Math.PI/2; barrel.position.set(0, 0, -0.12); g.add(barrel);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.18), bodyMat);
  body.position.set(0, -0.005, 0); g.add(body);
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.03), new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 }));
  mag.position.set(0, -0.04, 0.01); g.add(mag);
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.025, 0.08), bodyMat);
  stock.position.set(0, -0.005, 0.1); g.add(stock);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.05, 4), bodyMat);
  grip.position.set(0, -0.035, 0.06); grip.rotation.x = 0.3; g.add(grip);
  return g;
}

function buildPistolModel(w) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x556677, roughness: 0.5, metalness: 0.5 });
  const slide = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.02, 0.12), bodyMat);
  slide.position.set(0, 0.015, -0.02); g.add(slide);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.06, 5), bodyMat);
  barrel.rotation.x = Math.PI/2; barrel.position.set(0, 0.015, -0.1); g.add(barrel);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.025, 0.08), new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.6 }));
  frame.position.set(0, -0.005, 0.01); g.add(frame);
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.04, 0.025), new THREE.MeshStandardMaterial({ color: 0x332211, roughness: 0.8 }));
  grip.position.set(0, -0.03, 0.04); grip.rotation.x = 0.2; g.add(grip);
  const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.015, 0.005), bodyMat);
  trigger.position.set(0, -0.015, 0.025); g.add(trigger);
  return g;
}

function buildRocketModel(w) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x664444, roughness: 0.6, metalness: 0.4 });
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.45, 8), bodyMat);
  tube.rotation.x = Math.PI/2; tube.position.set(0, 0, -0.15); g.add(tube);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.2), bodyMat);
  body.position.set(0, -0.01, 0.05); g.add(body);
  const sight = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.04, 4), bodyMat);
  sight.position.set(0, 0.025, -0.05); g.add(sight);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.06, 4), bodyMat);
  grip.position.set(0, -0.05, 0.06); g.add(grip);
  const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.015, 0.005), bodyMat);
  frontSight.position.set(0, 0.03, -0.35); g.add(frontSight);
  return g;
}

const modelBuilders = {
  p: buildPistolModel, s: buildSMGModel, a: buildRifleModel, sg: buildShotgunModel,
  r: buildRocketModel, sn: buildSniperModel, mg: buildMinigunModel,
  fl: buildFlamethrowerModel, gl: buildGrenadeLauncherModel, lb: buildLaserModel,
};

const DIFFICULTIES = [
  { name:'FACIL', desc:'Zombies mas lentos y debiles', bonus:0.8, hpMul:0.7, spdMul:0.7, dmgMul:0.6 },
  { name:'NORMAL', desc:'Dificultad equilibrada', bonus:1.0, hpMul:1.0, spdMul:1.0, dmgMul:1.0 },
  { name:'DIFICIL', desc:'Zombies mas fuertes y rapidos', bonus:1.5, hpMul:1.5, spdMul:1.3, dmgMul:1.3 },
  { name:'INFERNAL', desc:'Zombies extremos + oleadas dobles', bonus:2.5, hpMul:2.2, spdMul:1.6, dmgMul:1.6 },
];
let curDiff = DIFFICULTIES[1];

let actx = null; let soundOn = true; let audioInit = false; let ambientSrc = null;

function initAudio() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
  if (!audioInit) { audioInit = true; updateSndUI(); startAmbient(); }
}
function tone(type, freq, dur, vol, ramp) {
  if (!soundOn || !actx) return;
  try {
    const o = actx.createOscillator(), g = actx.createGain();
    o.connect(g); g.connect(actx.destination);
    const t = actx.currentTime;
    o.type = type;
    if (typeof freq === 'function') { freq(o, t); }
    else { o.frequency.setValueAtTime(freq, t); if (ramp) o.frequency.exponentialRampToValueAtTime(Math.max(ramp, 1), t + dur); }
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t); o.stop(t + dur);
  } catch(e) {}
}
function noise(dur, vol) {
  if (!soundOn || !actx) return;
  try {
    const len = Math.floor(actx.sampleRate * dur), buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = actx.createBufferSource(); s.buffer = buf;
    const g = actx.createGain(); g.gain.setValueAtTime(vol, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
    s.connect(g); g.connect(actx.destination); s.start();
  } catch(e) {}
}
function startAmbient() {
  if (!soundOn || !actx || ambientSrc) return;
  try {
    const len = Math.floor(actx.sampleRate * 4), buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.08;
    ambientSrc = actx.createBufferSource(); ambientSrc.buffer = buf; ambientSrc.loop = true;
    const g = actx.createGain(); g.gain.setValueAtTime(0.02, actx.currentTime);
    const f = actx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(400, actx.currentTime);
    ambientSrc.connect(f); f.connect(g); g.connect(actx.destination); ambientSrc.start();
  } catch(e) {}
}
function stopAmbient() { try { if(ambientSrc){ambientSrc.stop();ambientSrc.disconnect();ambientSrc=null;} } catch(e) {} }

const SND = {
  pistol()   { tone('square',500,0.08,0.1,150); noise(0.05,0.06); },
  smg()      { tone('sawtooth',900,0.04,0.06,300); noise(0.04,0.05); },
  rifle()    { tone('sawtooth',800,0.06,0.1,200); noise(0.06,0.08); },
  shotgun()  { noise(0.15,0.2); tone('sawtooth',150,0.15,0.12,50); },
  rocket()   { tone('sawtooth',200,0.3,0.15,80); noise(0.3,0.12); },
  explosion(){ noise(0.4,0.25); tone('sine',60,0.4,0.2,20); },
  hit()      { tone('square',400,0.05,0.07,100); },
  kill()     { tone('sine',600,0.12,0.1,1200); tone('sine',900,0.08,0.08,1400); },
  hurt()     { tone('sawtooth',200,0.15,0.12,50); },
  pickup()   { tone('sine',500,0.08,0.06,1000); tone('sine',800,0.06,0.05,1200); },
  headshot() { tone('sine',1000,0.1,0.12,1500); tone('square',600,0.08,0.08,800); },
  zombieD()  { tone('sawtooth',300,0.2,0.08,50); noise(0.15,0.06); },
  zombieH()  { tone('sawtooth',500,0.08,0.06,100); },
  spit()     { noise(0.1,0.08); tone('sine',300,0.1,0.06,100); },
  waveS()    { tone('sine',400,0.15,0.1,800); setTimeout(()=>tone('sine',600,0.15,0.1,1000),200); setTimeout(()=>tone('sawtooth',800,0.2,0.12,1200),400); },
  victory()  { tone('sine',523,0.2,0.1,600); setTimeout(()=>tone('sine',659,0.2,0.1,750),200); setTimeout(()=>tone('sine',784,0.3,0.1,900),400); },
  empty()    { tone('square',200,0.05,0.04,80); },
  reload()   { tone('sine',600,0.06,0.05,900); setTimeout(()=>tone('sine',800,0.06,0.04,1000),120); },
  streak()   { tone('sine',523,0.1,0.08,700); setTimeout(()=>tone('sine',659,0.1,0.08,900),100); setTimeout(()=>tone('sine',784,0.15,0.1,1100),200); },
  zombieIdle()  { tone('sawtooth',120,0.4,0.025,60); },
  zombieAggro() { tone('sawtooth',400,0.2,0.07,100); tone('sawtooth',500,0.15,0.05,120); },
  bossRoar()    { tone('sawtooth',80,0.8,0.18,30); tone('sine',60,0.6,0.12,20); noise(0.5,0.08); },
  bossSlam()    { noise(0.3,0.18); tone('sine',40,0.4,0.12,15); },
  bossCharge()  { tone('sawtooth',200,0.5,0.08,40); noise(0.4,0.06); },
  bossDeath()   { noise(0.6,0.25); tone('sine',30,0.8,0.15,5); },
  bossSpawn()   { tone('sine',80,0.3,0.12,200); setTimeout(()=>tone('sawtooth',120,0.5,0.15,60),200); noise(0.6,0.1); },
  footstep()    { tone('sine',80,0.04,0.02,60); noise(0.03,0.02); },
  scream()      { tone('sawtooth',600,0.3,0.1,1200); tone('sawtooth',900,0.2,0.08,1500); },
  leaper()      { tone('sine',300,0.15,0.08,600); noise(0.1,0.06); },
  necroSpawn()  { tone('sawtooth',150,0.4,0.1,40); tone('sine',100,0.3,0.08,80); },
  sniper()     { tone('sine',1200,0.2,0.15,2000); tone('square',800,0.15,0.1,1500); noise(0.1,0.12); },
  minigun()    { tone('sawtooth',700,0.03,0.05,250); noise(0.04,0.04); },
  flame()      { noise(0.08,0.06); tone('sawtooth',100,0.12,0.04,30); },
  laser()      { tone('sine',1400,0.08,0.06,2500); tone('sine',1800,0.06,0.04,2800); },
};
function snd(name) { if (SND[name]) SND[name](); }

const _tmpV3 = new THREE.Vector3();
const _tmpV3b = new THREE.Vector3();

let screenShake = 0;
const _shakeBase = new THREE.Vector3();

const particleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.2, transparent: true, opacity: 1 });
const particleGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
const bloodMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, emissive: 0x440000, transparent: true, opacity: 0.8 });
const bloodGeo = new THREE.SphereGeometry(0.04, 4, 4);

const particles = [];
function spawnParticles(pos, col, count) {
  count = count || 25;
  for (let i = 0; i < count; i++) {
    const s = 0.03 + Math.random() * 0.12;
    const mat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.2, transparent: true, opacity: 1 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), mat);
    m.position.copy(pos);
    const v = new THREE.Vector3(Math.random()-0.5, Math.random()*2, Math.random()-0.5).normalize().multiplyScalar(2 + Math.random() * 4);
    m.userData = { vel: v, life: 0.4 + Math.random() * 0.6, mat, isParticle: true };
    scene.add(m); particles.push(m);
  }
}
function spawnExplosion(pos, radius) {
  radius = radius || 3;
  const n = 40 + Math.floor(radius * 10);
  const colors = [0xff4400, 0xff8800, 0xffcc00, 0xff2200];
  for (let i = 0; i < n; i++) {
    const s = 0.05 + Math.random() * 0.18;
    const col = colors[Math.floor(Math.random() * 4)];
    const mat = new THREE.MeshStandardMaterial({ color: col, emissive: 0xff4400, emissiveIntensity: 0.4, transparent: true, opacity: 1 });
    const m = new THREE.Mesh(new THREE.SphereGeometry(s, 4, 4), mat);
    m.position.copy(pos);
    const v = new THREE.Vector3(Math.random()-0.5, Math.random()*1.5, Math.random()-0.5).normalize().multiplyScalar(3 + Math.random() * radius * 2.5);
    m.userData = { vel: v, life: 0.3 + Math.random() * 0.5, mat, isParticle: true };
    scene.add(m); particles.push(m);
  }
  const flash = new THREE.Mesh(new THREE.SphereGeometry(radius*0.4,8,8), new THREE.MeshBasicMaterial({ color:0xff8800, transparent:true, opacity:0.5 }));
  flash.position.copy(pos);
  flash.userData = { vel: new THREE.Vector3(), life: 0.12, isParticle: true };
  particles.push(flash); scene.add(flash);
  const d = cam.position.distanceTo(pos);
  if (d < 15) screenShake = Math.max(screenShake, (1 - d / 15) * 0.3);
}
function spawnBlood(pos) {
  for (let i = 0; i < 8; i++) {
    const s = 0.02 + Math.random() * 0.05;
    const mat = new THREE.MeshStandardMaterial({ color: 0xcc2222, emissive: 0x440000, transparent: true, opacity: 0.8 });
    const m = new THREE.Mesh(new THREE.SphereGeometry(s, 4, 4), mat);
    m.position.copy(pos);
    const v = new THREE.Vector3(Math.random()-0.5, Math.random()*0.5+0.3, Math.random()-0.5).normalize().multiplyScalar(1 + Math.random() * 2);
    m.userData = { vel: v, life: 0.4 + Math.random() * 0.4, mat, isParticle: true };
    scene.add(m); particles.push(m);
  }
}
function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    const ud = p.userData;
    ud.vel.y -= 5 * dt;
    p.position.addScaledVector(ud.vel, dt);
    ud.life -= dt;
    p.material.opacity = Math.max(0, ud.life);
    p.scale.multiplyScalar(0.96);
    if (ud.life <= 0) {
      scene.remove(p);
      if (p.geometry && !p.geometry._shared) p.geometry.dispose();
      if (ud.mat) ud.mat.dispose();
      particles.splice(i, 1);
    }
  }
}

const wGroup = new THREE.Group(); wGroup.position.set(0, 1.6, -0.3); scene.add(wGroup);
let curW = WPS.a;
const wModels = {}, wAmmo = {};

function buildWModel(def) {
  const g = new THREE.Group();
  const bm = new THREE.MeshStandardMaterial({ color: def.col, roughness: 0.4, metalness: 0.6 });
  const dm = new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.5, metalness: 0.4 });
  const gm = new THREE.MeshStandardMaterial({ color: 0x3a3020, roughness: 0.8 });
  if (def.id === 'p') {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.06,0.1,0.25),bm); b.position.z=-0.12; g.add(b);
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.02,0.3,6),dm); br.rotation.x=Math.PI/2; br.position.z=-0.3; g.add(br);
    const gr = new THREE.Mesh(new THREE.BoxGeometry(0.04,0.12,0.05),gm); gr.position.set(0,-0.09,0.02); g.add(gr);
  } else if (def.id === 's') {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.06,0.1,0.35),bm); b.position.z=-0.17; g.add(b);
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.025,0.4,6),dm); br.rotation.x=Math.PI/2; br.position.z=-0.35; g.add(br);
    const mg = new THREE.Mesh(new THREE.BoxGeometry(0.03,0.14,0.06),dm); mg.position.set(0,-0.1,0.02); g.add(mg);
  } else if (def.id === 'a') {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.08,0.12,0.45),bm); b.position.z=-0.22; g.add(b);
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.03,0.55,8),dm); br.rotation.x=Math.PI/2; br.position.z=-0.5; g.add(br);
    const gr = new THREE.Mesh(new THREE.BoxGeometry(0.05,0.15,0.06),gm); gr.position.set(0,-0.08,0.02); g.add(gr);
    const mg = new THREE.Mesh(new THREE.BoxGeometry(0.04,0.1,0.08),dm); mg.position.set(0,-0.06,0.04); g.add(mg);
  } else if (def.id === 'sg') {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.14,0.5),bm); b.position.z=-0.25; g.add(b);
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.045,0.6,8),dm); br.rotation.x=Math.PI/2; br.position.z=-0.55; g.add(br);
    const br2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.035,0.55,8),dm); br2.rotation.x=Math.PI/2; br2.position.set(0.04,0,-0.52); g.add(br2);
    const gr = new THREE.Mesh(new THREE.BoxGeometry(0.06,0.13,0.06),gm); gr.position.set(0,-0.08,0.04); g.add(gr);
  } else if (def.id === 'r') {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.09,0.4,8),bm); b.rotation.x=Math.PI/2; b.position.z=-0.2; g.add(b);
    const t = new THREE.Mesh(new THREE.ConeGeometry(0.07,0.12,8), new THREE.MeshStandardMaterial({ color:0xcc8844, metalness:0.3 }));
    t.rotation.x=-Math.PI/2; t.position.z=-0.46; g.add(t);
    const gr = new THREE.Mesh(new THREE.BoxGeometry(0.06,0.16,0.08),gm); gr.position.set(0,-0.09,0.02); g.add(gr);
    const la = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.2,8),dm); la.rotation.x=Math.PI/2; la.position.set(0,-0.05,-0.15); g.add(la);
  }
  const mf = new THREE.PointLight(0xffaa44, 0, 3); mf.position.set(0, 0, -0.8); g.add(mf); g.userData.mf = mf;
  return g;
}

function switchW(id) {
  if (G.reloading && G.curW !== id) { G.reloading = false; G.reloadT = 0; dom.reloadInd.style.display = 'none'; }
  if (wModels[G.curW]) wGroup.remove(wModels[G.curW]);
  wAmmo[G.curW] = { a: G.ammo, r: G.reserve };
  G.curW = id; curW = WPS[id];
  const sv = wAmmo[id];
  if (sv) { G.ammo = sv.a; G.reserve = sv.r; }
  else { G.ammo = curW.mag; G.reserve = curW.res; }
  G.shootCD = 0; G.currentSpread = curW.spread;
  if (!wModels[id]) wModels[id] = buildWModel(curW);
  wGroup.add(wModels[id]); wModels[id].visible = true;
  updateWStrip(); hudDirty = true;
}

// Old tracers system removed — now using BULLET_TRACERS with spawnTracer()

const rockets = [];
function fireRocket(origin, dir) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,0.3,8), new THREE.MeshStandardMaterial({ color:0x666644, metalness:0.4 }));
  b.rotation.x=Math.PI/2; g.add(b);
  const t = new THREE.Mesh(new THREE.ConeGeometry(0.06,0.12,8), new THREE.MeshStandardMaterial({ color:0xcc8844, metalness:0.3 }));
  t.rotation.x=-Math.PI/2; t.position.z=-0.21; g.add(t);
  for (let i=0;i<4;i++) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.015,0.06,0.05), new THREE.MeshStandardMaterial({ color:0x444422 }));
    f.position.set(Math.cos(i*Math.PI/2)*0.08, 0, 0.12); g.add(f);
  }
  g.position.copy(origin);
  const d = dir.clone().normalize();
  g.lookAt(origin.clone().add(d));
  const lt = new THREE.PointLight(0xff6600,1,4); g.add(lt);
  scene.add(g);
  rockets.push({ g, d, p: origin.clone(), spd: 30, alive: true, life: 3 });
}
function rocketExplode(pos) {
  const aoe = 5, dmg = 80;
  for (const z of zombies) { if (!z.alive) continue; const d = z.getPos().distanceTo(pos); if (d < aoe) z.takeDamage(dmg * (1 - d / aoe), false); }
  if (boss && boss.alive) { const d = boss.getPos().distanceTo(pos); if (d < aoe) boss.takeDamage(dmg * (1 - d / aoe), false); }
  spawnExplosion(pos, aoe);
  snd('explosion');
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
      const mat = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.7 });
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.03,4,4), mat);
      p.position.copy(r.p);
      p.userData = { vel: new THREE.Vector3(Math.random()-0.5, Math.random()*0.3, Math.random()-0.5).multiplyScalar(1.5), life: 0.3, mat, isParticle: true };
      scene.add(p); particles.push(p);
    }
    const h = HALF - 0.5;
    if (r.p.x < -h || r.p.x > h || r.p.z < -h || r.p.z > h) { rocketExplode(r.p); r.alive = false; continue; }
    let hit = false;
    for (const w of walls) { if (r.p.x > w.minX && r.p.x < w.maxX && r.p.z > w.minZ && r.p.z < w.maxZ) { hit = true; break; } }
    if (hit) { rocketExplode(r.p); r.alive = false; continue; }
    for (const z of zombies) { if (!z.alive) continue; if (r.p.distanceTo(z.getPos()) < 1.0) { rocketExplode(r.p); z.takeDamage(999, false); r.alive = false; break; } }
    if (r.alive && boss && boss.alive && r.p.distanceTo(boss.getPos()) < 2.0) { rocketExplode(r.p); boss.takeDamage(999, false); r.alive = false; }
  }
}

const spits = [];
function fireSpit(from, to) {
  const mat = new THREE.MeshStandardMaterial({ color: 0x44ff44, emissive: 0x44ff44, emissiveIntensity: 0.3 });
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.08,8,8), mat);
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
    if (p.distanceTo(cam.position) < 0.7) {
      _tmpV3.subVectors(p, cam.position).normalize();
      playerHit(15, _tmpV3); spawnParticles(p, 0x44ff44, 6); s.alive = false; continue;
    }
    for (const w of walls) { if (p.x > w.minX && p.x < w.maxX && p.z > w.minZ && p.z < w.maxZ) { spawnParticles(p, 0x44ff44, 4); s.alive = false; break; } }
  }
}

const ZOMBIE_TYPES = {
  walk:     { spd:1.2, hp:100, dmg:8,  color:0x44aa44, size:1.1, scoreVal:2, name:'Zombie', unlockWave:1 },
  runner:   { spd:2.8, hp:60,  dmg:10, color:0xcc8822, size:0.95, scoreVal:3, name:'Corredor', unlockWave:2 },
  brute:    { spd:0.6, hp:400, dmg:25, color:0x883333, size:1.7, scoreVal:5, name:'Bruto', unlockWave:3 },
  exploder: { spd:1.0, hp:80,  dmg:0,  color:0xcc4444, size:1.2, scoreVal:4, name:'Explosivo', unlockWave:2, explode:true },
  spitter:  { spd:0.9, hp:120, dmg:12, color:0x55dd55, size:1.1, scoreVal:4, name:'Escupidor', unlockWave:3, spit:true },
  crawler:  { spd:1.6, hp:50,  dmg:6,  color:0x777744, size:0.7, scoreVal:3, name:'Rastrero', unlockWave:4 },
  screamer: { spd:2.2, hp:40,  dmg:5,  color:0xdd44dd, size:1.05, scoreVal:4, name:'Gritador', unlockWave:5 },
  leaper:   { spd:1.8, hp:90,  dmg:14, color:0x44aadd, size:1.0, scoreVal:5, name:'Saltarin', unlockWave:6 },
  tank:     { spd:0.4, hp:800, dmg:35, color:0x555555, size:2.2, scoreVal:10, name:'Tanque', unlockWave:8 },
  necro:    { spd:0.7, hp:150, dmg:10, color:0x6622aa, size:1.2, scoreVal:8, name:'Necromante', unlockWave:10 },
  stalker:  { spd:1.5, hp:200, dmg:18, color:0x334433, size:1.0, scoreVal:6, name:'Acechador', unlockWave:12, stealth:true },
  bomber:   { spd:1.1, hp:150, dmg:0,  color:0xcc6600, size:1.3, scoreVal:6, name:'Bombardero', unlockWave:14, bomb:true },
  shielder: { spd:0.8, hp:300, dmg:15, color:0x336699, size:1.2, scoreVal:7, name:'Escudero', unlockWave:16, shield:true },
  mutant:   { spd:2.0, hp:250, dmg:20, color:0x993366, size:1.4, scoreVal:9, name:'Mutante', unlockWave:18, acid:true },
};

const zombies = [];

function createZombie(type, pos, waveScale) {
  const def = ZOMBIE_TYPES[type] || ZOMBIE_TYPES.walk;
  const s = def.size;
  const g = new THREE.Group();
  const bMat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.8, emissive: def.color, emissiveIntensity: 0.1 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xccbbaa, roughness: 0.7, emissive: def.color, emissiveIntensity: 0.05 });
  const darkSkin = new THREE.MeshStandardMaterial({ color: 0x998877, roughness: 0.8 });
  const boneMat = new THREE.MeshStandardMaterial({ color: 0xddccaa, roughness: 0.6 });
  const woundMat = new THREE.MeshStandardMaterial({ color: 0x662222, roughness: 0.9 });

  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.2*s, 0.08*s, 0.15*s), bMat);
  pelvis.position.y = 0.15*s; g.add(pelvis);

  const lleg = new THREE.Mesh(new THREE.CylinderGeometry(0.035*s, 0.04*s, 0.3*s, 5), skinMat);
  lleg.position.set(-0.06*s, 0.0, 0); lleg.rotation.z = 0.05; g.add(lleg);
  const rleg = new THREE.Mesh(new THREE.CylinderGeometry(0.035*s, 0.04*s, 0.3*s, 5), skinMat);
  rleg.position.set(0.06*s, 0.0, 0); rleg.rotation.z = -0.05; g.add(rleg);
  const lshin = new THREE.Mesh(new THREE.CylinderGeometry(0.03*s, 0.035*s, 0.25*s, 5), skinMat);
  lshin.position.set(-0.06*s, -0.25*s, 0); g.add(lshin);
  const rshin = new THREE.Mesh(new THREE.CylinderGeometry(0.03*s, 0.035*s, 0.25*s, 5), skinMat);
  rshin.position.set(0.06*s, -0.25*s, 0); g.add(rshin);

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.22*s, 0.3*s, 0.14*s), bMat);
  chest.position.y = 0.32*s; g.add(chest);
  for (let ri = 0; ri < 3; ri++) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.2*s, 0.015*s, 0.02*s), boneMat);
    rib.position.set(0, (0.25 + ri * 0.08)*s, 0.07*s); g.add(rib);
  }
  const wound = new THREE.Mesh(new THREE.SphereGeometry(0.04*s, 4, 4), woundMat);
  wound.position.set(0.08*s, 0.3*s, 0.07*s); g.add(wound);

  const lShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.05*s, 5, 5), bMat);
  lShoulder.position.set(-0.17*s, 0.42*s, 0); g.add(lShoulder);
  const rShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.05*s, 5, 5), bMat);
  rShoulder.position.set(0.17*s, 0.42*s, 0); g.add(rShoulder);
  const lUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03*s, 0.035*s, 0.22*s, 5), skinMat);
  lUpperArm.position.set(-0.2*s, 0.35*s, 0); lUpperArm.rotation.z = 0.5; g.add(lUpperArm);
  const rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03*s, 0.035*s, 0.22*s, 5), skinMat);
  rUpperArm.position.set(0.2*s, 0.35*s, 0); rUpperArm.rotation.z = -0.5; g.add(rUpperArm);
  const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.025*s, 0.03*s, 0.2*s, 5), skinMat);
  lForearm.position.set(-0.28*s, 0.22*s, 0); lForearm.rotation.z = 0.3; g.add(lForearm);
  const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.025*s, 0.03*s, 0.2*s, 5), skinMat);
  rForearm.position.set(0.28*s, 0.22*s, 0); rForearm.rotation.z = -0.3; g.add(rForearm);
  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.03*s, 4, 4), darkSkin);
  lHand.position.set(-0.32*s, 0.12*s, 0); g.add(lHand);
  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.03*s, 4, 4), darkSkin);
  rHand.position.set(0.32*s, 0.12*s, 0); g.add(rHand);
  for (let fi = 0; fi < 3; fi++) {
    const clawL = new THREE.Mesh(new THREE.ConeGeometry(0.008*s, 0.04*s, 3), new THREE.MeshStandardMaterial({ color: 0x333322 }));
    clawL.position.set(-0.34*s, 0.1*s, (fi-1)*0.015*s); clawL.rotation.z = 0.3; g.add(clawL);
    const clawR = clawL.clone(); clawR.position.x = 0.34*s; clawR.rotation.z = -0.3; g.add(clawR);
  }

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.03*s, 0.04*s, 0.06*s, 5), skinMat);
  neck.position.y = 0.5*s; g.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1*s, 7, 7), skinMat);
  head.position.y = 0.58*s; g.add(head);
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.08*s, 0.04*s, 0.06*s), darkSkin);
  jaw.position.set(0, 0.52*s, 0.04*s); g.add(jaw);
  for (let ti = 0; ti < 4; ti++) {
    const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.005*s, 0.02*s, 3), boneMat);
    tooth.position.set((ti-1.5)*0.018*s, 0.51*s, 0.07*s); g.add(tooth);
  }
  const lEye = new THREE.Mesh(new THREE.SphereGeometry(0.018*s, 5, 5), new THREE.MeshBasicMaterial({ color: 0xff3300 }));
  lEye.position.set(-0.035*s, 0.6*s, 0.07*s); g.add(lEye);
  const rEye = lEye.clone(); rEye.position.x = 0.035*s; g.add(rEye);
  const lEyeSocket = new THREE.Mesh(new THREE.SphereGeometry(0.022*s, 5, 5), new THREE.MeshStandardMaterial({ color: 0x442222, roughness: 0.9 }));
  lEyeSocket.position.set(-0.035*s, 0.6*s, 0.065*s); g.add(lEyeSocket);
  const rEyeSocket = lEyeSocket.clone(); rEyeSocket.position.x = 0.035*s; g.add(rEyeSocket);

  if (type === 'brute' || type === 'tank') {
    const armS = type === 'tank' ? 1.4 : 1.1;
    const bruteBody = new THREE.Mesh(new THREE.BoxGeometry(0.3*s*armS, 0.35*s, 0.2*s), bMat);
    bruteBody.position.y = 0.3*s; g.add(bruteBody);
    const lBruteArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05*s*armS, 0.07*s*armS, 0.35*s*armS, 6), bMat);
    lBruteArm.position.set(-0.28*s, 0.25*s, 0); lBruteArm.rotation.z = 0.6; g.add(lBruteArm);
    const rBruteArm = lBruteArm.clone(); rBruteArm.position.x = 0.28*s; rBruteArm.rotation.z = -0.6; g.add(rBruteArm);
    const lBruteFore = new THREE.Mesh(new THREE.CylinderGeometry(0.06*s*armS, 0.05*s*armS, 0.3*s*armS, 6), bMat);
    lBruteFore.position.set(-0.38*s, 0.08*s, 0); lBruteFore.rotation.z = 0.2; g.add(lBruteFore);
    const rBruteFore = lBruteFore.clone(); rBruteFore.position.x = 0.38*s; rBruteFore.rotation.z = -0.2; g.add(rBruteFore);
    const lBruteFist = new THREE.Mesh(new THREE.BoxGeometry(0.08*s*armS, 0.06*s*armS, 0.08*s*armS), darkSkin);
    lBruteFist.position.set(-0.4*s, -0.04*s, 0); g.add(lBruteFist);
    const rBruteFist = lBruteFist.clone(); rBruteFist.position.x = 0.4*s; g.add(rBruteFist);
    const armorPlate = new THREE.Mesh(new THREE.BoxGeometry(0.35*s, 0.3*s, 0.05*s), new THREE.MeshStandardMaterial({ color: type === 'tank' ? 0x333333 : 0x555555, metalness: 0.4, roughness: 0.5 }));
    armorPlate.position.set(0, 0.3*s, 0.1*s); g.add(armorPlate);
    const backPlate = armorPlate.clone(); backPlate.position.z = -0.1*s; g.add(backPlate);
    const shoulderPadL = new THREE.Mesh(new THREE.SphereGeometry(0.07*s, 5, 5), new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.3 }));
    shoulderPadL.position.set(-0.22*s, 0.45*s, 0); g.add(shoulderPadL);
    const shoulderPadR = shoulderPadL.clone(); shoulderPadR.position.x = 0.22*s; g.add(shoulderPadR);
    if (type === 'tank') {
      for (let hi = 0; hi < 2; hi++) {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.04*s, 0.2*s, 5), new THREE.MeshStandardMaterial({ color: 0x666677, roughness: 0.4 }));
        horn.position.set((hi === 0 ? -1 : 1)*0.1*s, 0.7*s, 0.1*s);
        horn.rotation.z = (hi === 0 ? 0.3 : -0.3); horn.rotation.x = 0.2; g.add(horn);
      }
      const tankPlate = new THREE.Mesh(new THREE.BoxGeometry(0.45*s, 0.45*s, 0.06*s), new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.5 }));
      tankPlate.position.set(0, 0.3*s, 0.12*s); g.add(tankPlate);
      const bellyChain = new THREE.Mesh(new THREE.BoxGeometry(0.1*s, 0.25*s, 0.02*s), new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.6 }));
      bellyChain.position.set(0, 0.2*s, 0.1*s); g.add(bellyChain);
      for (let bi = 0; bi < 3; bi++) {
        const br = new THREE.Mesh(new THREE.TorusGeometry(0.04*s, 0.01*s, 4, 6), new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.5 }));
        br.position.set(0, (0.12 + bi*0.07)*s, 0.11*s); g.add(br);
      }
    } else {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.035*s, 0.15*s, 5), new THREE.MeshStandardMaterial({ color: 0x666677, roughness: 0.4 }));
      horn.position.set(0, 0.68*s, 0.1*s); horn.rotation.x = 0.2; g.add(horn);
    }
  } else if (type === 'exploder') {
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.18*s, 7, 7), new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.7, transparent: true, opacity: 0.8 }));
    belly.position.y = 0.25*s; g.add(belly);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.22*s, 7, 7), new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.25 }));
    glow.position.y = 0.2*s; g.add(glow);
    const veins = new THREE.Mesh(new THREE.SphereGeometry(0.19*s, 5, 5), new THREE.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.15 }));
    veins.position.y = 0.3*s; g.add(veins);
    for (let vi = 0; vi < 4; vi++) {
      const vein = new THREE.Mesh(new THREE.CylinderGeometry(0.005*s, 0.005*s, 0.2*s, 3), new THREE.MeshBasicMaterial({ color: 0xff3300, transparent: true, opacity: 0.3 }));
      vein.position.set((vi-1.5)*0.06*s, 0.25*s, 0.08*s); vein.rotation.z = (vi-1.5)*0.2; g.add(vein);
    }
  } else if (type === 'spitter') {
    const spitterBody = new THREE.Mesh(new THREE.SphereGeometry(0.12*s, 6, 6), new THREE.MeshStandardMaterial({ color: 0x44aa44, roughness: 0.6 }));
    spitterBody.position.set(0, 0.35*s, 0.05*s); g.add(spitterBody);
    const sac = new THREE.Mesh(new THREE.SphereGeometry(0.1*s, 6, 6), new THREE.MeshBasicMaterial({ color: 0x44ff44, transparent: true, opacity: 0.5 }));
    sac.position.set(0.15*s, 0.38*s, 0); g.add(sac);
    const sac2 = new THREE.Mesh(new THREE.SphereGeometry(0.07*s, 5, 5), new THREE.MeshBasicMaterial({ color: 0x22ff22, transparent: true, opacity: 0.4 }));
    sac2.position.set(-0.1*s, 0.42*s, 0.05*s); g.add(sac2);
    const drool = new THREE.Mesh(new THREE.CylinderGeometry(0.005*s, 0.003*s, 0.08*s, 3), new THREE.MeshBasicMaterial({ color: 0x44ff44, transparent: true, opacity: 0.4 }));
    drool.position.set(0, 0.5*s, 0.08*s); drool.rotation.x = 0.5; g.add(drool);
  } else if (type === 'crawler') {
    const crawlerBody = new THREE.Mesh(new THREE.BoxGeometry(0.2*s, 0.08*s, 0.12*s), bMat);
    crawlerBody.position.y = 0.08*s; g.add(crawlerBody);
    for (let li = 0; li < 4; li++) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.012*s, 0.018*s, 0.2*s, 4), skinMat);
      leg.position.set((li < 2 ? -1 : 1)*0.1*s, 0.04, (li % 2 === 0 ? -1 : 1)*0.06*s);
      leg.rotation.z = 0.9; g.add(leg);
      const foot = new THREE.Mesh(new THREE.SphereGeometry(0.015*s, 3, 3), darkSkin);
      foot.position.set((li < 2 ? -1 : 1)*0.14*s, 0.01, (li % 2 === 0 ? -1 : 1)*0.08*s); g.add(foot);
    }
    const headC = new THREE.Mesh(new THREE.SphereGeometry(0.08*s, 6, 6), skinMat);
    headC.position.set(0, 0.1*s, 0.08*s); g.add(headC);
    head.position.y = 0.12*s;
    chest.position.y = 0.1*s; chest.scale.y = 0.4;
    pelvis.position.y = 0.05*s;
    for (let fi = 0; fi < 2; fi++) {
      const fClaw = new THREE.Mesh(new THREE.ConeGeometry(0.006*s, 0.03*s, 3), boneMat);
      fClaw.position.set((fi === 0 ? -1 : 1)*0.05*s, 0.08*s, 0.12*s); g.add(fClaw);
    }
  } else if (type === 'screamer') {
    const mouth = new THREE.Mesh(new THREE.ConeGeometry(0.06*s, 0.1*s, 6), new THREE.MeshStandardMaterial({ color: 0xff4488, emissive: 0xff2244, emissiveIntensity: 0.3 }));
    mouth.rotation.x = Math.PI / 2; mouth.position.set(0, 0.52*s, 0.1*s); g.add(mouth);
    const openMouth = new THREE.Mesh(new THREE.RingGeometry(0.03*s, 0.05*s, 6), new THREE.MeshBasicMaterial({ color: 0x220000, side: THREE.DoubleSide }));
    openMouth.position.set(0, 0.52*s, 0.12*s); g.add(openMouth);
    for (let mi = 0; mi < 6; mi++) {
      const mTooth = new THREE.Mesh(new THREE.ConeGeometry(0.004*s, 0.015*s, 3), boneMat);
      const ang = (mi / 6) * Math.PI * 2;
      mTooth.position.set(Math.cos(ang)*0.04*s, 0.52*s + Math.sin(ang)*0.04*s, 0.12*s); g.add(mTooth);
    }
    const aura = new THREE.Mesh(new THREE.SphereGeometry(0.5*s, 10, 10), new THREE.MeshBasicMaterial({ color: 0xdd44dd, transparent: true, opacity: 0.06 }));
    aura.position.y = 0.35*s; g.add(aura);
    const aura2 = new THREE.Mesh(new THREE.SphereGeometry(0.35*s, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff66ff, transparent: true, opacity: 0.04 }));
    aura2.position.y = 0.4*s; g.add(aura2);
  } else if (type === 'leaper') {
    const lLegL = new THREE.Mesh(new THREE.CylinderGeometry(0.03*s, 0.04*s, 0.35*s, 5), bMat);
    lLegL.position.set(-0.08*s, -0.1*s, 0); lLegL.rotation.z = 0.25; g.add(lLegL);
    const lLegR = lLegL.clone(); lLegR.position.x = 0.08*s; lLegR.rotation.z = -0.25; g.add(lLegR);
    const lFootL = new THREE.Mesh(new THREE.BoxGeometry(0.04*s, 0.02*s, 0.06*s), darkSkin);
    lFootL.position.set(-0.1*s, -0.28*s, 0.02*s); g.add(lFootL);
    const lFootR = lFootL.clone(); lFootR.position.x = 0.1*s; g.add(lFootR);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.015*s, 0.005*s, 0.3*s, 4), skinMat);
    tail.position.set(0, 0.3*s, -0.15*s); tail.rotation.x = 0.6; g.add(tail);
    const tailTip = new THREE.Mesh(new THREE.ConeGeometry(0.015*s, 0.04*s, 4), woundMat);
    tailTip.position.set(0, 0.42*s, -0.25*s); tailTip.rotation.x = 0.4; g.add(tailTip);
    const earL = new THREE.Mesh(new THREE.ConeGeometry(0.015*s, 0.05*s, 4), skinMat);
    earL.position.set(-0.06*s, 0.68*s, 0); earL.rotation.z = 0.4; g.add(earL);
    const earR = earL.clone(); earR.position.x = 0.06*s; earR.rotation.z = -0.4; g.add(earR);
  } else if (type === 'necro') {
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.22*s, 0.32*s, 0.55*s, 7), new THREE.MeshStandardMaterial({ color: 0x331155, roughness: 0.9 }));
    robe.position.y = 0.28*s; g.add(robe);
    const robeHood = new THREE.Mesh(new THREE.SphereGeometry(0.12*s, 7, 7), new THREE.MeshStandardMaterial({ color: 0x221144, roughness: 0.9 }));
    robeHood.position.y = 0.56*s; robeHood.position.z = 0.02*s; g.add(robeHood);
    const robeSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.32*s, 0.38*s, 0.15*s, 7), new THREE.MeshStandardMaterial({ color: 0x2a0f44, roughness: 0.9 }));
    robeSkirt.position.y = 0.08*s; g.add(robeSkirt);
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.012*s, 0.015*s, 0.9*s, 5), new THREE.MeshStandardMaterial({ color: 0x553322, roughness: 0.7 }));
    staff.position.set(0.22*s, 0.45*s, 0); g.add(staff);
    const staffTop = new THREE.Mesh(new THREE.TorusGeometry(0.04*s, 0.01*s, 5, 6), new THREE.MeshStandardMaterial({ color: 0x774433, metalness: 0.4 }));
    staffTop.position.set(0.22*s, 0.9*s, 0); staffTop.rotation.x = Math.PI / 2; g.add(staffTop);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.04*s, 8, 8), new THREE.MeshBasicMaterial({ color: 0xaa44ff }));
    orb.position.set(0.22*s, 0.92*s, 0); g.add(orb);
    const orbGlow = new THREE.Mesh(new THREE.SphereGeometry(0.09*s, 8, 8), new THREE.MeshBasicMaterial({ color: 0x8822ff, transparent: true, opacity: 0.2 }));
    orbGlow.position.copy(orb.position); g.add(orbGlow);
    const orbGlow2 = new THREE.Mesh(new THREE.SphereGeometry(0.14*s, 8, 8), new THREE.MeshBasicMaterial({ color: 0x6600cc, transparent: true, opacity: 0.08 }));
    orbGlow2.position.copy(orb.position); g.add(orbGlow2);
    const runeL = new THREE.Mesh(new THREE.RingGeometry(0.02*s, 0.03*s, 5), new THREE.MeshBasicMaterial({ color: 0xaa44ff, transparent: true, opacity: 0.3, side: THREE.DoubleSide }));
    runeL.position.set(-0.1*s, 0.1*s, 0.1*s); g.add(runeL);
    const runeR = runeL.clone(); runeR.position.set(0.1*s, 0.1*s, -0.1*s); g.add(runeR);
  } else if (type === 'stalker') {
    const cloak = new THREE.Mesh(new THREE.CylinderGeometry(0.2*s, 0.35*s, 0.5*s, 7), new THREE.MeshStandardMaterial({ color: 0x223322, roughness: 0.9, transparent: true, opacity: 0.7 }));
    cloak.position.y = 0.25*s; g.add(cloak);
    const hood = new THREE.Mesh(new THREE.SphereGeometry(0.12*s, 6, 6), new THREE.MeshStandardMaterial({ color: 0x1a2a1a, roughness: 0.9 }));
    hood.position.set(0, 0.6*s, 0.03*s); g.add(hood);
    const bladeL = new THREE.Mesh(new THREE.BoxGeometry(0.01*s, 0.2*s, 0.02*s), new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 }));
    bladeL.position.set(-0.3*s, 0.15*s, 0); bladeL.rotation.z = 0.4; g.add(bladeL);
    const bladeR = bladeL.clone(); bladeR.position.x = 0.3*s; bladeR.rotation.z = -0.4; g.add(bladeR);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.3*s, 6, 6), new THREE.MeshBasicMaterial({ color: 0x224422, transparent: true, opacity: 0.06 }));
    glow.position.y = 0.3*s; g.add(glow);
  } else if (type === 'bomber') {
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.3*s, 0.25*s, 0.2*s), new THREE.MeshStandardMaterial({ color: 0x885522, roughness: 0.8 }));
    vest.position.y = 0.3*s; g.add(vest);
    for (let bi = 0; bi < 3; bi++) {
      const bomb = new THREE.Mesh(new THREE.SphereGeometry(0.04*s, 5, 5), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 }));
      bomb.position.set((bi-1)*0.08*s, 0.35*s, 0.1*s); g.add(bomb);
      const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.005*s, 0.005*s, 0.04*s, 3), new THREE.MeshBasicMaterial({ color: 0xff6600 }));
      fuse.position.set(bomb.position.x, 0.4*s, 0.1*s); g.add(fuse);
    }
    const timer = new THREE.Mesh(new THREE.BoxGeometry(0.06*s, 0.03*s, 0.02*s), new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.6 }));
    timer.position.set(0, 0.4*s, 0.12*s); g.add(timer);
    const backPack = new THREE.Mesh(new THREE.BoxGeometry(0.2*s, 0.2*s, 0.15*s), new THREE.MeshStandardMaterial({ color: 0x664422, roughness: 0.8 }));
    backPack.position.set(0, 0.3*s, -0.12*s); g.add(backPack);
  } else if (type === 'shielder') {
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.35*s, 0.45*s, 0.04*s), new THREE.MeshStandardMaterial({ color: 0x446688, metalness: 0.6, roughness: 0.3 }));
    shield.position.set(0, 0.3*s, 0.18*s); g.add(shield);
    const shieldRim = new THREE.Mesh(new THREE.BoxGeometry(0.37*s, 0.47*s, 0.01*s), new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7 }));
    shieldRim.position.set(0, 0.3*s, 0.2*s); g.add(shieldRim);
    const shieldGlow = new THREE.Mesh(new THREE.BoxGeometry(0.38*s, 0.48*s, 0.005*s), new THREE.MeshBasicMaterial({ color: 0x4488cc, transparent: true, opacity: 0.1 }));
    shieldGlow.position.set(0, 0.3*s, 0.22*s); g.add(shieldGlow);
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.1*s, 6, 6), new THREE.MeshStandardMaterial({ color: 0x446688, metalness: 0.5, roughness: 0.4 }));
    helmet.position.set(0, 0.6*s, 0.05*s); g.add(helmet);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.1*s, 0.03*s, 0.02*s), new THREE.MeshBasicMaterial({ color: 0x224466, transparent: true, opacity: 0.6 }));
    visor.position.set(0, 0.6*s, 0.1*s); g.add(visor);
  } else if (type === 'mutant') {
    const extraArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03*s, 0.04*s, 0.3*s, 4), new THREE.MeshStandardMaterial({ color: 0x772255 }));
    extraArm.position.set(0, 0.4*s, -0.15*s); extraArm.rotation.x = 0.8; g.add(extraArm);
    const extraArm2 = extraArm.clone(); extraArm2.position.z = 0.15*s; extraArm2.rotation.x = -0.8; g.add(extraArm2);
    for (let mi = 0; mi < 4; mi++) {
      const mutBump = new THREE.Mesh(new THREE.SphereGeometry(0.04*s + Math.random()*0.03*s, 4, 4), new THREE.MeshStandardMaterial({ color: 0xaa4477, emissive: 0x440022, emissiveIntensity: 0.2 }));
      mutBump.position.set((Math.random()-0.5)*0.25*s, (0.2+Math.random()*0.3)*s, (Math.random()-0.5)*0.2*s); g.add(mutBump);
    }
    const acidSack = new THREE.Mesh(new THREE.SphereGeometry(0.08*s, 5, 5), new THREE.MeshBasicMaterial({ color: 0x88ff44, transparent: true, opacity: 0.4 }));
    acidSack.position.set(0.15*s, 0.35*s, 0.05*s); g.add(acidSack);
    const acidGlow = new THREE.Mesh(new THREE.SphereGeometry(0.12*s, 6, 6), new THREE.MeshBasicMaterial({ color: 0x44ff22, transparent: true, opacity: 0.08 }));
    acidGlow.position.copy(acidSack.position); g.add(acidGlow);
  }

  const hpBar = new THREE.Mesh(new THREE.PlaneGeometry(0.3*s, 0.03), new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, depthTest: false }));
  hpBar.position.y = 0.8*s; g.add(hpBar);
  const hpBack = new THREE.Mesh(new THREE.PlaneGeometry(0.3*s, 0.03), new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, depthTest: false }));
  hpBack.position.set(0, 0.8*s, -0.001); g.add(hpBack);

  g.position.set(pos.x, 0, pos.z);
  scene.add(g);

  const z = {
    g, type, def,
    hp: def.hp * curDiff.hpMul * (waveScale || 1),
    maxHp: def.hp * curDiff.hpMul * (waveScale || 1),
    alive: true,
    spd: def.spd * curDiff.spdMul * (0.8 + Math.random() * 0.4),
    target: cam.position.clone(),
    aggro: false,
    attackCD: 0,
    spitCD: 0,
    shieldHP: type === 'shielder' ? 100 : 0,
    bombCD: 2 + Math.random() * 2,
    acidCD: 1 + Math.random() * 2,
    animTime: Math.random() * 10,
    headshot: false,
    dmgMul: curDiff.dmgMul,
    vel: new THREE.Vector3(),
    _avoidVec: new THREE.Vector3(),

    getPos() { return this.g.position; },

    takeDamage(dmg, hs) {
      if (!this.alive) return;
      this.aggro = true;
      this.target.copy(cam.position);
      if (hs) { dmg *= 3; this.headshot = true; showHS(); snd('headshot'); }
      if (dmg >= this.hp) {
        G.kills++; G.totalKills++; G.score += Math.round((hs ? 5 : 2) * curDiff.bonus);
        G.streaks++; G.maxStreak = Math.max(G.maxStreak, G.streaks);
        if (G.streaks >= 3) showStreak(G.streaks);
        addKillMsg(this.type, hs);
        trackKill(this.type, hs);
        checkKillStreakBonus();
        spawnCorpse(this.g.position, this.type);
        const loot = rollLoot();
        if (loot && Math.random() < 0.15) spawnPickup(this.g.position, loot.type);
        else {
          if (Math.random() < 0.25) spawnPickup(this.g.position, 0);
          if (Math.random() < 0.08) spawnPickup(this.g.position, 1);
          if (Math.random() < 0.04) spawnPickup(this.g.position, 2);
        }
        if (G.kills >= G.zombiesNeeded && !G.bossActive && !boss) startBoss();
        this.alive = false;
        spawnBlood(this.g.position);
        spawnParticles(this.g.position, 0x44aa44, 10);
        snd('zombieD');
        if (this.type === 'exploder') this.explode();
        else {
          scene.remove(this.g);
          if (Math.random() < 0.3) spawnPickup(this.g.position, 0);
          if (Math.random() < 0.1) spawnPickup(this.g.position, 1);
          if (Math.random() < 0.05) spawnPickup(this.g.position, 2);
        }
      } else {
        this.hp -= dmg;
        snd('zombieH');
        spawnParticles(this.g.position, 0x44aa44, 5);
        showDmgNum(dmg, this.g.position, hs);
        ZOMBIE_DMG_NUMBERS.spawn(this.g.position, dmg, hs, false);
        const bloodHitPos = this.g.position.clone();
        bloodHitPos.y += 1.2;
        BLOOD_POOLS.spawn(bloodHitPos, 0.2 + Math.random() * 0.3);
        ZOMBIE_TRAILS.spawn(this.g.position.clone(), 0x440000);
        const knockDir = _tmpV3b.subVectors(this.g.position, cam.position).normalize();
        this.g.position.addScaledVector(knockDir, Math.min(0.3, dmg * 0.003));
        if (hs) { G.totalHeadshots++; }
      }
      showHitmarker();
    },

    explode() {
      if (!this.alive) return;
      spawnExplosion(this.g.position, 2.5);
      const p = this.g.position;
      for (const z2 of zombies) { if (z2 === this || !z2.alive) continue; if (z2.getPos().distanceTo(p) < 2.5) z2.takeDamage(200, false); }
      if (boss && boss.alive && boss.getPos().distanceTo(p) < 2.5) boss.takeDamage(80, false);
      if (p.distanceTo(cam.position) < 2.5) {
        _tmpV3.subVectors(p, cam.position).normalize();
        playerHit(30, _tmpV3);
      }
      scene.remove(this.g);
    },

    dealDmg() {
      snd('hit');
      _tmpV3.subVectors(this.g.position, cam.position).normalize();
      playerHit(Math.round(this.def.dmg * this.dmgMul), _tmpV3);
    },

    avoidWalls(dt) {
      this._avoidVec.set(0, 0, 0);
      const p = this.g.position;
      const margin = 1.0;
      for (const w of walls) {
        const cx = Math.max(w.minX, Math.min(p.x, w.maxX));
        const cz = Math.max(w.minZ, Math.min(p.z, w.maxZ));
        const dx = p.x - cx, dz = p.z - cz;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < margin && dist > 0.01) {
          const force = (margin - dist) / margin;
          this._avoidVec.x += (dx / dist) * force * 3;
          this._avoidVec.z += (dz / dist) * force * 3;
        }
      }
      const bnd = HALF - 1;
      if (p.x < -bnd) this._avoidVec.x += (-bnd - p.x) * 2;
      if (p.x > bnd) this._avoidVec.x += (bnd - p.x) * 2;
      if (p.z < -bnd) this._avoidVec.z += (-bnd - p.z) * 2;
      if (p.z > bnd) this._avoidVec.z += (bnd - p.z) * 2;
      this.g.position.x += this._avoidVec.x * dt;
      this.g.position.z += this._avoidVec.z * dt;
    },

    separate(dt) {
      for (const other of zombies) {
        if (other === this || !other.alive) continue;
        const dist = this.g.position.distanceTo(other.g.position);
        if (dist < 1.0 && dist > 0.01) {
          _tmpV3.subVectors(this.g.position, other.g.position).normalize();
          const force = (1.0 - dist) * 0.5;
          this.g.position.x += _tmpV3.x * force * dt;
          this.g.position.z += _tmpV3.z * force * dt;
        }
      }
    },
  };
  return z;
}

function spawnZombieAt(pos, type, waveScale) {
  const zom = createZombie(type || 'walk', pos, waveScale || 1);
  if (zom) zombies.push(zom);
  return zom;
}

function spawnZombie(type, waveScale) {
  for (let i = 0; i < 20; i++) {
    const sp = SPAWNS[Math.floor(Math.random() * SPAWNS.length)];
    const x = sp.x + (Math.random() - 0.5) * 10, z = sp.z + (Math.random() - 0.5) * 10;
    if (collides(x, z, 0.5) || new THREE.Vector2(x, z).distanceTo(new THREE.Vector2(0, 0)) < 8) continue;
    const zom = createZombie(type, new THREE.Vector3(x, 0, z), waveScale);
    zombies.push(zom);
    return zom;
  }
  return null;
}

function getWaveTypes(wave) {
  const types = ['walk'];
  for (const key of Object.keys(ZOMBIE_TYPES)) {
    if (key === 'walk') continue;
    if (wave >= ZOMBIE_TYPES[key].unlockWave) types.push(key);
  }
  return types;
}
function getWaveCount(wave) { return Math.min(5 + wave * 4, 80); }
function getWaveScale(wave) { return 1 + (wave - 1) * 0.12; }
function getBossScale(wave) { return 1 + Math.floor(wave / 5) * 0.35; }

const BOSS_TYPES = [
  { name: 'ABOMINACION', hp: 1500, color: 0x332211, size: 3.0, armor: 0x444433 },
  { name: 'COLOSOS', hp: 2500, color: 0x223311, size: 3.5, armor: 0x555544 },
  { name: 'TITAN OSCURO', hp: 4000, color: 0x1a1a2e, size: 4.0, armor: 0x333355 },
  { name: 'DEVORADOR', hp: 6000, color: 0x3d0000, size: 4.5, armor: 0x552222 },
];
function getBossType(wave) {
  const idx = Math.min(Math.floor(wave / 5) - 1, BOSS_TYPES.length - 1);
  return BOSS_TYPES[Math.max(0, idx)];
}

function spawnWave(count) {
  G.wave++; G.kills = 0; G.zombiesNeeded = count; G.waveActive = true; G.waveSpawnDone = false;
  const types = getWaveTypes(G.wave);
  const waveScale = getWaveScale(G.wave);
  const isBossWave = G.wave % 5 === 0 && G.wave > 0;
  const isHordeWave = G.wave % 7 === 0 && G.wave > 0;
  const isFastWave = G.wave % 3 === 0 && G.wave > 1;
  let subtitle = `Zombies: ${count}`;
  if (isBossWave) subtitle = '!JEFE! + zombies';
  else if (isHordeWave) subtitle = '!HORDA! x2 zombies';
  else if (isFastWave) subtitle = '!Rapidos!';
  showRoundMsg(`OLEADA ${G.wave}`, subtitle);
  checkWaveAnnouncements(G.wave);
  if (isBossWave) startBoss();
  const total = isHordeWave ? count * 2 : count;
  G._waveQueue = total;
  G._waveTotal = total;
  G._waveTypeList = types;
  G._waveSpawnTimer = 0;
  G._waveScale = waveScale;
  G._isFastWave = isFastWave;
  GAME_STATS.waveStartTime = performance.now();
  resetWaveStats();
  MILESTONE_SYSTEM.check();
  WEAPON_CHALLENGES.checkWave(G.wave);
  if (G.wave % 5 === 0 && G.wave >= 10) {
    AMBIENT_DRONES.spawnDrone(new THREE.Vector3((Math.random() - 0.5) * 40, 0, (Math.random() - 0.5) * 40));
  }
}

function processWaveSpawning(dt) {
  if (!G.waveActive || G._waveQueue <= 0 || !G.playing) return;
  G._waveSpawnTimer -= dt;
  if (G._waveSpawnTimer <= 0) {
    const types = G._waveTypeList;
    let type = types[Math.floor(Math.random() * types.length)];
    if (G._isFastWave && Math.random() < 0.5) type = 'runner';
    spawnZombie(type, G._waveScale);
    G._waveQueue--;
    let interval = Math.max(0.2, 2.0 / (1 + G.wave * 0.08));
    if (type === 'brute' || type === 'tank') interval *= 2;
    else if (type === 'runner' || type === 'crawler') interval *= 0.6;
    else if (type === 'necro') interval *= 1.5;
    G._waveSpawnTimer = interval;
    if (G._waveQueue <= 0) G.waveSpawnDone = true;
    const totalZombies = G._waveTotal || 1;
    const pct = ((totalZombies - G._waveQueue) / totalZombies) * 100;
    WAVE_PROGRESS.show(pct);
  }
  const aliveCount = zombies.filter(z => z.alive).length;
  if (G.waveSpawnDone && aliveCount <= 3 && !boss) {
    WAVE_PROGRESS.hide();
  }
}

let boss = null;

function startBoss() {
  if (boss) return;
  G.bossActive = true;
  const bt = getBossType(G.wave);
  showRoundMsg(`!${bt.name} EN CAMINO!`, 'Preparate');
  setTimeout(() => {
    if (!G.playing) return;
    const a = Math.random() * Math.PI * 2;
    const bp = new THREE.Vector3(Math.cos(a) * (HALF - 10), 0, Math.sin(a) * (HALF - 10));
    boss = createBoss(bp);
    snd('bossSpawn');
    showRoundMsg(`!${bt.name}!`, '!Mata al jefe!');
    dom.bossBar.style.display = 'block';
    dom.bossName.textContent = bt.name;
  }, 3000);
}

function createBoss(pos) {
  const bt = getBossType(G.wave);
  const g = new THREE.Group(); const s = bt.size;
  const bossMat = new THREE.MeshStandardMaterial({ color: bt.color, roughness: 0.4, metalness: 0.3, emissive: bt.color, emissiveIntensity: 0.05 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xcc8855, roughness: 0.6 });
  const armorMat = new THREE.MeshStandardMaterial({ color: bt.armor || 0x444433, roughness: 0.3, metalness: 0.5 });
  const boneMat = new THREE.MeshStandardMaterial({ color: 0xddccaa, roughness: 0.5 });
  const woundMat = new THREE.MeshStandardMaterial({ color: 0x882222, roughness: 0.8, emissive: 0x440000, emissiveIntensity: 0.1 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x221111, roughness: 0.7 });

  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.5*s, 0.2*s, 0.4*s), bossMat);
  pelvis.position.y = 0.5*s; g.add(pelvis);

  for (let li = 0; li < 2; li++) {
    const lx = (li === 0 ? -1 : 1) * 0.15*s;
    const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1*s, 0.12*s, 0.6*s, 7), bossMat);
    upperLeg.position.set(lx, 0.15*s, 0); upperLeg.rotation.z = li === 0 ? 0.05 : -0.05; g.add(upperLeg);
    const lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08*s, 0.1*s, 0.5*s, 7), bossMat);
    lowerLeg.position.set(lx, -0.25*s, 0); g.add(lowerLeg);
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.09*s, 5, 5), boneMat);
    knee.position.set(lx, -0.02*s, 0.04*s); g.add(knee);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.15*s, 0.06*s, 0.2*s), darkMat);
    foot.position.set(lx, -0.5*s, 0.04*s); g.add(foot);
    for (let ti = 0; ti < 3; ti++) {
      const toe = new THREE.Mesh(new THREE.ConeGeometry(0.025*s, 0.08*s, 4), boneMat);
      toe.position.set(lx + (ti-1)*0.05*s, -0.5*s, 0.12*s); toe.rotation.x = 0.3; g.add(toe);
    }
  }

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7*s, 0.8*s, 0.5*s), bossMat);
  torso.position.y = 1.0*s; g.add(torso);
  const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.6*s, 0.5*s, 0.08*s), armorMat);
  chestPlate.position.set(0, 1.1*s, 0.25*s); g.add(chestPlate);
  const backPlate = new THREE.Mesh(new THREE.BoxGeometry(0.55*s, 0.45*s, 0.08*s), armorMat);
  backPlate.position.set(0, 1.1*s, -0.25*s); g.add(backPlate);
  for (let ri = 0; ri < 5; ri++) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.6*s, 0.025*s, 0.04*s), boneMat);
    rib.position.set(0, (0.75 + ri*0.12)*s, 0.26*s); g.add(rib);
  }
  const sternum = new THREE.Mesh(new THREE.BoxGeometry(0.06*s, 0.5*s, 0.03*s), boneMat);
  sternum.position.set(0, 1.0*s, 0.28*s); g.add(sternum);
  for (let wi = 0; wi < 3; wi++) {
    const wound = new THREE.Mesh(new THREE.SphereGeometry(0.04*s, 4, 4), woundMat);
    wound.position.set((wi-1)*0.2*s, (0.9 + wi*0.1)*s, 0.26*s); g.add(wound);
  }
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.25*s, 7, 7), new THREE.MeshStandardMaterial({ color: bt.color, roughness: 0.6 }));
  belly.position.set(0, 0.75*s, 0); g.add(belly);
  const bellyScar = new THREE.Mesh(new THREE.BoxGeometry(0.2*s, 0.02*s, 0.01*s), woundMat);
  bellyScar.position.set(0, 0.7*s, 0.25*s); g.add(bellyScar);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1*s, 0.12*s, 0.12*s, 6), bossMat);
  neck.position.y = 1.5*s; g.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18*s, 8, 8), skinMat);
  head.position.y = 1.65*s; head.name = 'bossHead'; g.add(head);
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.18*s, 0.08*s, 0.12*s), darkMat);
  jaw.position.set(0, 1.55*s, 0.1*s); g.add(jaw);
  for (let ti = 0; ti < 6; ti++) {
    const tTooth = new THREE.Mesh(new THREE.ConeGeometry(0.012*s, 0.05*s, 4), boneMat);
    tTooth.position.set((ti-2.5)*0.03*s, 1.55*s, 0.16*s); g.add(tTooth);
    const bTooth = tTooth.clone(); bTooth.rotation.x = Math.PI; bTooth.position.y = 1.52*s; g.add(bTooth);
  }
  const lEye = new THREE.Mesh(new THREE.SphereGeometry(0.035*s, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff2200 }));
  lEye.position.set(-0.07*s, 1.68*s, 0.14*s); g.add(lEye);
  const rEye = lEye.clone(); rEye.position.x = 0.07*s; g.add(rEye);
  const eyeGlow = new THREE.Mesh(new THREE.SphereGeometry(0.06*s, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff1100, transparent: true, opacity: 0.15 }));
  eyeGlow.position.set(0, 1.68*s, 0.14*s); g.add(eyeGlow);

  for (let hi = 0; hi < 3; hi++) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.03*s, 0.25*s, 5), boneMat);
    horn.position.set((hi-1)*0.12*s, 1.82*s, -0.05*s);
    horn.rotation.z = (hi-1)*0.15; horn.rotation.x = -0.2; g.add(horn);
  }
  const crownHornL = new THREE.Mesh(new THREE.ConeGeometry(0.025*s, 0.35*s, 5), boneMat);
  crownHornL.position.set(-0.14*s, 1.85*s, -0.02*s); crownHornL.rotation.z = 0.3; crownHornL.rotation.x = -0.1; g.add(crownHornL);
  const crownHornR = crownHornL.clone(); crownHornR.position.x = 0.14*s; crownHornR.rotation.z = -0.3; g.add(crownHornR);

  for (let ai = 0; ai < 2; ai++) {
    const ax = (ai === 0 ? -1 : 1);
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.12*s, 6, 6), bossMat);
    shoulder.position.set(ax*0.45*s, 1.35*s, 0); g.add(shoulder);
    const shoulderPad = new THREE.Mesh(new THREE.BoxGeometry(0.18*s, 0.08*s, 0.15*s), armorMat);
    shoulderPad.position.set(ax*0.48*s, 1.4*s, 0); g.add(shoulderPad);
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08*s, 0.1*s, 0.5*s, 7), bossMat);
    upperArm.position.set(ax*0.5*s, 1.1*s, 0); upperArm.rotation.z = ax*0.4; g.add(upperArm);
    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.08*s, 5, 5), boneMat);
    elbow.position.set(ax*0.6*s, 0.9*s, 0); g.add(elbow);
    const foreArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07*s, 0.08*s, 0.45*s, 7), bossMat);
    foreArm.position.set(ax*0.65*s, 0.7*s, 0); foreArm.rotation.z = ax*0.2; g.add(foreArm);
    const fist = new THREE.Mesh(new THREE.BoxGeometry(0.12*s, 0.1*s, 0.12*s), darkMat);
    fist.position.set(ax*0.7*s, 0.45*s, 0); g.add(fist);
    for (let fi = 0; fi < 4; fi++) {
      const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.01*s, 0.015*s, 0.1*s, 4), darkMat);
      finger.position.set(ax*0.7*s + (fi-1.5)*0.025*s, 0.4*s, 0.05*s); finger.rotation.x = 0.3; g.add(finger);
    }
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.03*s, 0.5*s, 0.06*s), new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.7, roughness: 0.3 }));
    blade.position.set(ax*0.75*s, 0.6*s, -0.05*s); blade.rotation.z = ax*0.1; g.add(blade);
  }

  for (let si = 0; si < 8; si++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.03*s, 0.15*s, 5), boneMat);
    const ang = si / 8 * Math.PI * 2;
    spike.position.set(Math.cos(ang)*0.38*s, 0.02, Math.sin(ang)*0.38*s);
    spike.rotation.x = Math.sin(ang)*0.3; spike.rotation.z = -Math.cos(ang)*0.3; g.add(spike);
  }

  const cape = new THREE.Mesh(new THREE.BoxGeometry(0.5*s, 0.8*s, 0.03*s), new THREE.MeshStandardMaterial({ color: 0x220011, roughness: 0.9, side: THREE.DoubleSide }));
  cape.position.set(0, 1.1*s, -0.3*s); g.add(cape);

  const aura = new THREE.Mesh(new THREE.SphereGeometry(0.8*s, 10, 10), new THREE.MeshBasicMaterial({ color: bt.color, transparent: true, opacity: 0.04 }));
  aura.position.y = 1.0*s; g.add(aura);

  g.position.copy(pos);
  scene.add(g);
  const hpMul = curDiff.hpMul;
  const bScale = getBossScale(G.wave);
  const b = {
    g, hp: bt.hp * hpMul * bScale, maxHp: bt.hp * hpMul * bScale, alive: true, spd: 0.5 + G.wave * 0.05,
    baseSpd: 0.5 + G.wave * 0.05,
    attackCD: 0, phase: 1, chargeCD: 2, chargeTarget: null, isCharging: false,
    slamCD: 0, spitCD: 0,
    enrage: false, animTime: 0, phase2done: false,
    getPos() { return this.g.position; },
    takeDamage(dmg, hs) {
      if (!this.alive) return;
      this.hp -= dmg;
      const pct = this.hp / this.maxHp;
      if (pct < 0.6 && this.phase === 1) {
        this.phase = 2; this.spd = this.baseSpd * 1.8; this.enrage = true;
        showRoundMsg(`!${bt.name} ENFURECIDO!`, 'Velocidad aumentada'); snd('bossRoar');
        for (const child of this.g.children) {
          if (child.material && child.material.emissive) {
            child.material.emissive.set(0x440000);
            child.material.emissiveIntensity = 0.3;
          }
        }
      }
      if (pct < 0.2 && !this.phase2done) {
        this.phase2done = true; this.phase = 3; this.spd = this.baseSpd * 2.5;
        showRoundMsg(`!${bt.name} RABIA!`, 'Aceleracion extrema'); snd('bossRoar');
        for (const child of this.g.children) {
          if (child.material && child.material.emissive) {
            child.material.emissive.set(0x660000);
            child.material.emissiveIntensity = 0.5;
          }
        }
      }
      if (this.hp <= 0) {
        this.alive = false; G.bossActive = false; G.score += Math.round(100 * curDiff.bonus * bScale);
        G.kills += 5;
        snd('bossDeath');
        spawnExplosion(this.g.position, 6);
        spawnParticles(this.g.position, 0x444444, 50);
        for (let i=0;i<8;i++) spawnPickup(this.g.position, i % 3);
        scene.remove(this.g); dom.bossBar.style.display = 'none';
        boss = null;
        showRoundMsg('!JEFE DERROTADO!', `+${Math.round(100 * curDiff.bonus * bScale)} puntos`);
        G.waveActive = false; waveCompleteCooldown = 2;
        setTimeout(() => {
          if (G.playing) {
            const nextCount = getWaveCount(G.wave + 1);
            showRoundMsg(`OLEADA ${G.wave + 1}`, `Zombies: ${nextCount}`);
            setTimeout(() => { if (G.playing) spawnWave(nextCount); }, 2000);
          }
        }, 3000);
      }
      showHitmarker(); showDmgNum(dmg, this.g.position, hs);
      dom.bossHPFill.style.width = `${Math.max(0, (this.hp / this.maxHp) * 100)}%`;
    },
    dealDmg() {
      _tmpV3.subVectors(this.g.position, cam.position).normalize();
      playerHit(Math.round(30 * curDiff.dmgMul * bScale), _tmpV3);
      snd('hit');
    },
  };
  return b;
}

function updateBoss(dt) {
  if (!boss || !boss.alive) return;
  const p = boss.getPos();
  boss.animTime += dt;
  const dir = new THREE.Vector3().subVectors(cam.position, p); dir.y = 0;
  const dist = dir.length();
  if (dist > 0.5) { dir.normalize(); const look = p.clone().add(dir); boss.g.lookAt(look); }
  const sway = Math.sin(boss.animTime * 2) * 0.1;
  const headObj = boss.g.getObjectByName('bossHead');
  if (headObj) headObj.position.y = 1.65 + sway;
  if (boss.enrage) {
    const pul = 1 + Math.sin(boss.animTime * 8) * 0.03;
    boss.g.scale.set(pul, pul, pul);
  }
  if (boss.phase === 3) {
    const flash = 0.5 + Math.sin(boss.animTime * 12) * 0.5;
    for (const child of boss.g.children) {
      if (child.material && child.material.emissive && child.material.emissiveIntensity < 0.6) {
        child.material.emissiveIntensity = flash * 0.5;
      }
    }
  }
  boss.attackCD -= dt; boss.slamCD -= dt; boss.chargeCD -= dt; boss.spitCD -= dt;
  boss.summonCD = (boss.summonCD || 0) - dt;
  boss.tornadoCD = (boss.tornadoCD || 0) - dt;
  boss.shockwaveCD = (boss.shockwaveCD || 0) - dt;

  if (dist < 2.5 && boss.attackCD <= 0 && !boss.isCharging) {
    boss.attackCD = 0.8;
    boss.dealDmg();
  }
  if (dist < 5 && boss.slamCD <= 0 && !boss.isCharging) {
    boss.slamCD = 4 + Math.random();
    snd('bossSlam');
    screenShake = Math.max(screenShake, 0.15);
    for (const z of zombies) { if (!z.alive) continue; if (z.getPos().distanceTo(p) < 5) z.takeDamage(60, false); }
    for (let si = 0; si < 8; si++) {
      const sa = si / 8 * Math.PI * 2;
      const shockPos = p.clone().add(new THREE.Vector3(Math.cos(sa) * 3, 0.5, Math.sin(sa) * 3));
      spawnParticles(shockPos, 0x884422, 6);
    }
  }
  if (boss.chargeCD <= 0 && dist > 5 && dist < 25 && !boss.isCharging) {
    boss.chargeCD = 3 + Math.random() * 2;
    boss.isCharging = true;
    boss.spd = 8;
    snd('bossCharge');
    boss.chargeTarget = cam.position.clone();
    setTimeout(() => { if (boss) { boss.spd = boss.baseSpd; boss.isCharging = false; } }, 800);
  }
  if (boss.spitCD <= 0 && dist < 15 && !boss.isCharging) {
    boss.spitCD = 2 + Math.random();
    const spitsToFire = boss.phase >= 2 ? 3 : 1;
    for (let i = 0; i < spitsToFire; i++) {
      setTimeout(() => {
        if (!boss || !boss.alive) return;
        const bp = boss.getPos(); bp.y = 1;
        const tp = cam.position.clone(); tp.y = 0.5;
        tp.x += (Math.random() - 0.5) * 2;
        tp.z += (Math.random() - 0.5) * 2;
        fireSpit(bp, tp);
      }, i * 200);
    }
  }

  if (boss.phase >= 2 && boss.summonCD <= 0) {
    boss.summonCD = 12 + Math.random() * 5;
    const summonCount = boss.phase >= 3 ? 4 : 2;
    for (let si = 0; si < summonCount; si++) {
      const sa = Math.random() * Math.PI * 2;
      const sx = p.x + Math.cos(sa) * 3;
      const sz = p.z + Math.sin(sa) * 3;
      const types = ['walk', 'runner', 'exploder'];
      spawnZombie(types[Math.floor(Math.random() * types.length)], G._waveScale || 1);
    }
    snd('necroSpawn');
    spawnParticles(p.clone().add(new THREE.Vector3(0, 1, 0)), 0xaa44ff, 12);
  }

  if (boss.phase >= 2 && boss.tornadoCD <= 0 && dist > 8) {
    boss.tornadoCD = 8 + Math.random() * 4;
    const tornadoPos = new THREE.Vector3(
      cam.position.x + (Math.random()-0.5) * 10,
      0,
      cam.position.z + (Math.random()-0.5) * 10
    );
    const tornadoGroup = new THREE.Group();
    for (let ti = 0; ti < 8; ti++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.5 + ti * 0.2, 0.05, 4, 8),
        new THREE.MeshBasicMaterial({ color: 0x884422, transparent: true, opacity: 0.3 - ti * 0.03 })
      );
      ring.position.y = ti * 0.3; ring.rotation.x = Math.PI / 2; tornadoGroup.add(ring);
    }
    tornadoGroup.position.copy(tornadoPos);
    scene.add(tornadoGroup);
    let tornadoLife = 3;
    const tornadoInterval = setInterval(() => {
      tornadoLife -= 0.1;
      tornadoGroup.rotation.y += 0.2;
      tornadoGroup.position.x += (Math.random()-0.5) * 0.3;
      tornadoGroup.position.z += (Math.random()-0.5) * 0.3;
      if (cam.position.distanceTo(tornadoGroup.position) < 2) {
        _tmpV3.set((Math.random()-0.5)*2, 1, (Math.random()-0.5)*2);
        playerHit(5, _tmpV3);
      }
      for (const z of zombies) {
        if (!z.alive || z.getPos().distanceTo(tornadoGroup.position) > 3) continue;
        z.g.position.y += 0.1;
        z.takeDamage(30, false);
      }
      if (tornadoLife <= 0) {
        scene.remove(tornadoGroup);
        clearInterval(tornadoInterval);
      }
    }, 100);
  }

  if (boss.phase >= 3 && boss.shockwaveCD <= 0) {
    boss.shockwaveCD = 6 + Math.random() * 3;
    const shockwaveRadius = 0;
    const maxRadius = 12;
    const shockwaveRing = new THREE.Mesh(
      new THREE.RingGeometry(0, 0.3, 32),
      new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    );
    shockwaveRing.rotation.x = -Math.PI / 2;
    shockwaveRing.position.set(p.x, 0.1, p.z);
    scene.add(shockwaveRing);
    let swRadius = 0;
    const swInterval = setInterval(() => {
      swRadius += 0.3;
      shockwaveRing.scale.set(swRadius, swRadius, swRadius);
      shockwaveRing.material.opacity = 0.5 * (1 - swRadius / maxRadius);
      if (cam.position.distanceTo(new THREE.Vector3(p.x, 0, p.z)) < swRadius + 0.5 && cam.position.distanceTo(new THREE.Vector3(p.x, 0, p.z)) > swRadius - 1) {
        _tmpV3.subVectors(cam.position, p).normalize();
        playerHit(20, _tmpV3);
        screenShake = Math.max(screenShake, 0.2);
      }
      if (swRadius >= maxRadius) {
        scene.remove(shockwaveRing);
        clearInterval(swInterval);
      }
    }, 30);
  }

  const moveTarget = boss.isCharging && boss.chargeTarget ? boss.chargeTarget : cam.position;
  _tmpV3.subVectors(moveTarget, p); _tmpV3.y = 0;
  const ml = _tmpV3.length();
  if (ml > 1) {
    _tmpV3.normalize();
    p.addScaledVector(_tmpV3, boss.spd * dt);
    const bnd = HALF - 2;
    p.x = Math.max(-bnd, Math.min(bnd, p.x));
    p.z = Math.max(-bnd, Math.min(bnd, p.z));
    boss.g.position.copy(p);
  }
}

const pickups = [];
const ITEMS = [
  { name: 'Salud', color: 0x44ff44, icon: '+' },
  { name: 'Municion', color: 0xffaa00, icon: 'A' },
  { name: 'Armadura', color: 0x4488ff, icon: '#' }
];

function spawnPickup(pos, type) {
  const t = type !== undefined ? type : Math.floor(Math.random() * 3);
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: ITEMS[t].color, emissive: ITEMS[t].color, emissiveIntensity: 0.15 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2), mat);
  g.add(box);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.15,6,6), new THREE.MeshBasicMaterial({ color: ITEMS[t].color, transparent: true, opacity: 0.15 }));
  g.add(glow);
  g.position.set(pos.x, 0.1, pos.z); scene.add(g);
  pickups.push({ g, type: t, pos: new THREE.Vector3(pos.x, 0.1, pos.z), life: 15 });
}

function crateReward() {
  for (let i = 0; i < 4; i++) {
    const a = Math.random() * Math.PI * 2, d = 2 + Math.random() * 3;
    spawnPickup(new THREE.Vector3(Math.cos(a) * d, 0.1, Math.sin(a) * d), Math.floor(Math.random() * 3));
  }
}

let G = {
  playing: false, paused: false, victory: false,
  hp: 100, maxHp: 100, armor: 0,
  ammo: 30, reserve: 90, curW: 'a', shootCD: 0,
  reloading: false, reloadT: 0, reloadCD: 0,
  currentSpread: 0.025, weaponKick: 0,
  wave: 0, kills: 0, zombiesNeeded: 3, bossActive: false,
  score: 0, streaks: 0, maxStreak: 0,
  totalKills: 0, totalShots: 0, totalHits: 0,
  totalHeadshots: 0, bossesKilled: 0,
  noHitStreak: 0, noDamageWave: false, speedKills: 0,
  explosiveChains: 0, survivedNight: false,
  wsad: [false, false, false, false],
  waveActive: false, waveSpawnDone: false,
  _waveQueue: 0, _waveTypeList: [], _waveSpawnTimer: 0, _waveTotal: 0,
  speedBoost: 0, rageTimer: 0, spinning: false, spinTimer: 0,
  waveStartTime: 0, lastDamageTime: 0,
  zombiesThisWave: 0, bossTotalHP: 0,
  currentBiome: 'city', visitedBiomes: new Set(),
  weaponKills: {}, headshotStreak: 0, longestHeadshotStreak: 0,
  survivalTime: 0, fastestWave: 999, slowestWave: 0,
  avgWaveTime: 0, totalWaveTime: 0, wavesCompleted: 0,
  highestComboMultiplier: 1, totalComboKills: 0,
};

let hudDirty = true;

function resetGame(diff) {
  if (diff) curDiff = diff;
  G.playing = true; G.paused = false; G.victory = false;
  G.hp = 100; G.maxHp = 100; G.armor = 0;
  G.ammo = curW.mag; G.reserve = curW.res;
  if (G.curW !== 'a') { G.curW = 'a'; curW = WPS.a; }
  G.shootCD = 0; G.reloading = false; G.reloadT = 0; G.reloadCD = 0;
  G.currentSpread = curW.spread; G.weaponKick = 0;
  G.wave = 0; G.kills = 0; G.zombiesNeeded = 3; G.bossActive = false;
  G.score = 0; G.streaks = 0; G.maxStreak = 0;
  G.totalKills = 0; G.totalShots = 0; G.totalHits = 0;
  G.totalHeadshots = 0; G.bossesKilled = 0;
  G.noHitStreak = 0; G.noDamageWave = false; G.speedKills = 0;
  G.explosiveChains = 0; G.survivedNight = false;
  G.speedBoost = 0; G.rageTimer = 0; G.spinning = false; G.spinTimer = 0;
  G.waveStartTime = 0; G.lastDamageTime = 0;
  G.zombiesThisWave = 0; G.bossTotalHP = 0;
  G.currentBiome = 'city'; G.visitedBiomes = new Set();
  G.weaponKills = {}; G.headshotStreak = 0; G.longestHeadshotStreak = 0;
  G.survivalTime = 0; G.fastestWave = 999; G.slowestWave = 0;
  G.avgWaveTime = 0; G.totalWaveTime = 0; G.wavesCompleted = 0;
  G.highestComboMultiplier = 1; G.totalComboKills = 0;
  G.wsad = [false, false, false, false];
  G.waveActive = false; G.waveSpawnDone = false;
  resetCombo();
  resetWeaponUpgrades();
  COMBO.totalMedals = 0;
  ACHIEVEMENTS.list = JSON.parse(localStorage.getItem('zombieAchievements') || '[]');
  DAYNIGHT.time = 0.3;
  WEATHER.current = 'clear'; WEATHER.timer = 30;
  WEATHER.targetFogDensity = 0.006;
  POWERUPS.shield.timer = 0; POWERUPS.doubleScore.timer = 0;
  for (const key of Object.keys(ENV_HAZARDS)) ENV_HAZARDS[key] = [];
  for (const ft of FLOATING_TEXTS) { scene.remove(ft.sprite); }
  FLOATING_TEXTS.length = 0;
  for (const cc of ZOMBIE_CORPSES) scene.remove(cc.mesh);
  ZOMBIE_CORPSES.length = 0;
  for (const dc of EXPLOSION_DECALS) scene.remove(dc.mesh);
  EXPLOSION_DECALS.length = 0;
  for (const bt of BULLET_TRACERS) scene.remove(bt.mesh);
  BULLET_TRACERS.length = 0;
  for (const mf of MUZZLE_FLASHES.pool) { if (mf.mesh.parent) mf.mesh.parent.remove(mf.mesh); if (mf.light.parent) mf.light.parent.remove(mf.light); }
  MUZZLE_FLASHES.pool.length = 0;
  for (const ap of AMBIENT_PARTICLES) scene.remove(ap);
  AMBIENT_PARTICLES.length = 0;
  for (const rd of WEATHER.rainDrops) scene.remove(rd);
  WEATHER.rainDrops.length = 0;
  cleanupScene();
  cam.position.set(0, 1.6, 0); cam.rotation.set(0, 0, 0);
  cam.rotation.order = 'YXZ';
  playerVel.set(0, 0, 0); onGround = true;
  screenShake = 0; _shakeBase.set(0, 0, 0);

  if (!wModels['a']) wModels['a'] = buildWModel(WPS.a);
  if (wModels[G.curW]) wGroup.remove(wModels[G.curW]);
  G.curW = 'a'; curW = WPS.a;
  G.ammo = curW.mag; G.reserve = curW.res;
  wGroup.add(wModels['a']);

  dom.bossBar.style.display = 'none';
  dom.menu.style.display = 'none'; dom.go.style.display = 'none';
  dom.pause.style.display = 'none'; dom.controls.style.display = 'none';
  dom.hud.style.display = 'block';
  dom.hudSndBtn.textContent = soundOn ? '🔊' : '🔇';
  dom.goTitle.style.color = '';
  updateWStrip(); hudDirty = true;
  snd('waveS');
  showRoundMsg('OLEADA 1', '!Preparate!');
  setTimeout(() => { if (G.playing) { G.wave = 0; spawnWave(getWaveCount(1)); } }, 1000);
}

function cleanupScene() {
  for (const z of zombies) { if (z.g && z.g.parent) scene.remove(z.g); }
  zombies.length = 0;
  for (const r of rockets) { if (r.g) scene.remove(r.g); }
  rockets.length = 0;
  for (const s of spits) { if (s.m) { scene.remove(s.m); s.m.geometry.dispose(); s.m.material.dispose(); } }
  spits.length = 0;
  for (const p of pickups) { if (p.g && p.g.parent) scene.remove(p.g); }
  pickups.length = 0;
  for (const p of particles) { if (p.parent) scene.remove(p); }
  particles.length = 0;
  for (const t of BULLET_TRACERS) { if (t.mesh) { scene.remove(t.mesh); t.mesh.geometry.dispose(); t.mesh.material.dispose(); } }
  BULLET_TRACERS.length = 0;
  if (boss) { if (boss.g && boss.g.parent) scene.remove(boss.g); boss = null; }
}

let onGround = true;
const playerVel = new THREE.Vector3();
let headBob = 0;

function jump() {
  if (onGround && G.playing && !G.paused) { playerVel.y = 4.5; onGround = false; }
}

function updatePlayer(dt) {
  if (!G.playing || G.paused) return;
  playerVel.y -= 9.8 * dt;
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion); fwd.y = 0; fwd.normalize();
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion); right.y = 0; right.normalize();
  const move = new THREE.Vector3();
  if (G.wsad[0]) move.add(fwd);
  if (G.wsad[1]) move.sub(fwd);
  if (G.wsad[2]) move.sub(right);
  if (G.wsad[3]) move.add(right);
  const isMoving = move.lengthSq() > 0;
  const spd = G.curW === 'sg' ? 5 : 7;
  if (isMoving) {
    move.normalize();
    headBob += dt * move.length() * 8;
    footstepT += dt * move.length() * 5;
    if (footstepT > 0.5) { footstepT = 0; snd('footstep'); }
  }
  const m = move.multiplyScalar(spd * dt);
  const nx = cam.position.x + m.x, nz = cam.position.z + m.z, mr = 0.3;
  let blocked = false;
  for (const w of walls) { if (nx + mr > w.minX && nx - mr < w.maxX && nz + mr > w.minZ && nz - mr < w.maxZ) { blocked = true; break; } }
  const hh = HALF - mr;
  if (!blocked && nx > -hh && nx < hh && nz > -hh && nz < hh) { cam.position.x = nx; cam.position.z = nz; }
  cam.position.y += playerVel.y * dt;
  if (cam.position.y < 1.6) { cam.position.y = 1.6; playerVel.y = 0; onGround = true; }

  const wBobY = isMoving ? Math.sin(headBob) * 0.01 : 0;
  const wBobX = isMoving ? Math.sin(headBob * 0.5) * 0.005 : 0;
  const wOff = new THREE.Vector3(0.3 + wBobX, -0.25 + wBobY, -0.5);

  G.weaponKick *= 0.85;
  wOff.z += G.weaponKick * 0.1;
  wOff.y += G.weaponKick * 0.05;

  wOff.applyQuaternion(cam.quaternion);
  wGroup.position.copy(cam.position).add(wOff);
  wGroup.quaternion.copy(cam.quaternion);

  G.currentSpread = THREE.MathUtils.lerp(G.currentSpread, curW.spread, dt * 5);
}

let footstepT = 0;

function playerHit(dmg, dir) {
  if (G.reloading) { G.reloading = false; G.reloadT = 0; dom.reloadInd.style.display = 'none'; }
  if (G.armor > 0) { const absorb = Math.min(G.armor, dmg * 0.5); G.armor -= absorb; dmg -= absorb; }
  G.hp -= dmg; screenShake = Math.max(screenShake, 0.1 + dmg * 0.005); snd('hurt');
  showDmgDir(dir);
  if (G.hp <= 0) { G.hp = 0; G.playing = false; showGameOver(); }
  hudDirty = true;
}

function shoot() {
  if (!G.playing || G.paused || G.shootCD > 0 || G.reloading) return;
  if (WEAPON_HEAT.isOverheated) { snd('empty'); return; }
  if (!curW.noAmmoUse && G.ammo <= 0) { snd('empty'); G.reloading = true; G.reloadT = 0; G.reloadCD = curW.reload || 2; dom.reloadInd.style.display = 'block'; return; }
  if (!curW.noAmmoUse) G.ammo--;
  if (curW.auto || curW.spinUp || curW.laser || curW.flamethrower) WEAPON_HEAT.add(2 + G.wave * 0.05);
  const ugd = getWeaponUpgrade(G.curW);
  G.shootCD = curW.rof * ugd.rofMul;
  G.totalShots++;
  G.currentSpread = Math.min(curW.spread * 3, G.currentSpread + curW.spreadIncrease);
  G.weaponKick = curW.kickBack;
  const dmg = Math.round(curW.dmg * ugd.dmgMul);
  const pellets = curW.pellets || 1;
  const origin = cam.position.clone();

  if (curW.spinUp && !G.spinning) {
    G.spinning = true;
    G.spinTimer = curW.spinUp;
    setTimeout(() => { G.spinning = false; }, curW.spinUp * 1000);
  }

  if (curW.laser) {
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
    dir.x += (Math.random() - 0.5) * G.currentSpread;
    dir.y += (Math.random() - 0.5) * G.currentSpread;
    dir.normalize();
    const laserEnd = origin.clone().add(dir.clone().multiplyScalar(60));
    spawnTracer(origin, laserEnd, 0x22aaff);
    spawnTracer(origin.clone().add(new THREE.Vector3(0.01,0,0)), laserEnd.clone().add(new THREE.Vector3(0.01,0,0)), 0x44ccff);
    const rc = new THREE.Raycaster(origin, dir, 0, 60);
    const objs = [];
    for (const z of zombies) if (z.alive) { z.g.userData.zRef = z; objs.push(z.g); }
    if (boss && boss.alive) { boss.g.userData.bRef = boss; objs.push(boss.g); }
    const hits = rc.intersectObjects(objs, true);
    if (hits.length > 0) {
      let hitObj = hits[0].object;
      while (hitObj.parent && !hitObj.userData.zRef && !hitObj.userData.bRef) hitObj = hitObj.parent;
      if (hitObj.userData.zRef) { hitObj.userData.zRef.takeDamage(dmg, false); }
      else if (hitObj.userData.bRef) { hitObj.userData.bRef.takeDamage(dmg, false); }
      spawnParticles(hits[0].point, 0x22aaff, 4);
    }
    snd('laser');
    return;
  }

  if (curW.flamethrower) {
    for (let fi = 0; fi < 3; fi++) {
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
      dir.x += (Math.random() - 0.5) * curW.spread;
      dir.y += (Math.random() - 0.5) * curW.spread;
      dir.z += (Math.random() - 0.5) * curW.spread * 0.3;
      dir.normalize();
      const fireEnd = origin.clone().add(dir.clone().multiplyScalar(curW.range || 8));
      spawnTracer(origin, fireEnd, 0xff6600);
      const rc = new THREE.Raycaster(origin, dir, 0, curW.range || 8);
      const objs = [];
      for (const z of zombies) if (z.alive) { z.g.userData.zRef = z; objs.push(z.g); }
      if (boss && boss.alive) { boss.g.userData.bRef = boss; objs.push(boss.g); }
      const hits = rc.intersectObjects(objs, true);
      if (hits.length > 0) {
        let hitObj = hits[0].object;
        while (hitObj.parent && !hitObj.userData.zRef && !hitObj.userData.bRef) hitObj = hitObj.parent;
        const fdmg = Math.round(dmg * (1 - hits[0].distance / (curW.range || 8) * 0.5));
        if (hitObj.userData.zRef) { hitObj.userData.zRef.takeDamage(fdmg, false); }
        else if (hitObj.userData.bRef) { hitObj.userData.bRef.takeDamage(fdmg, false); }
        spawnParticles(hits[0].point, 0xff4400, 3);
      }
    }
    snd('flame');
    return;
  }

  if (curW.grenade) {
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
    dir.normalize();
    fireRocket(origin, dir);
    snd('rocket');
    return;
  }

  if (curW.rocket) {
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
    dir.normalize();
    fireRocket(origin, dir);
    snd('rocket');
    return;
  }

  for (let i = 0; i < pellets; i++) {
    const spread = curW.id === 'sg' ? curW.spread : G.currentSpread;
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
    dir.x += (Math.random() - 0.5) * spread;
    dir.y += (Math.random() - 0.5) * spread;
    dir.z += (Math.random() - 0.5) * spread * 0.2;
    dir.normalize();
    const rc = new THREE.Raycaster(origin, dir, 0, 80);
    const objs = [];
    for (const z of zombies) if (z.alive) { z.g.userData.zRef = z; objs.push(z.g); }
    if (boss && boss.alive) { boss.g.userData.bRef = boss; objs.push(boss.g); }
    const hits = rc.intersectObjects(objs, true);
    if (hits.length > 0) {
      let hitObj = hits[0].object;
      while (hitObj.parent && !hitObj.userData.zRef && !hitObj.userData.bRef) hitObj = hitObj.parent;
      const hp = hits[0].point; spawnTracer(origin, hp, 0xffff88); G.totalHits++;
      IMPACT_DECALS.spawn(hp, hits[0].face ? hits[0].face.normal : null, 0x660000, 0.15);
      if (hitObj.userData.zRef) {
        const z = hitObj.userData.zRef;
        const hs = hits[0].object === z.g.children[1];
        z.takeDamage(dmg, hs);
        GAME_STATS.trackDamage(G.curW, dmg);
        addKill();
      } else if (hitObj.userData.bRef) {
        const b = hitObj.userData.bRef;
        const hs = hits[0].object === b.g.children[2];
        b.takeDamage(dmg, hs);
        GAME_STATS.trackDamage(G.curW, dmg);
      }
      if (curW.piercing) {
        const remainingZombies = zombies.filter(z2 => z2.alive && z2 !== (hitObj.userData.zRef || null));
        for (const pz of remainingZombies) {
          const pzPos = pz.getPos();
          const toPZ = new THREE.Vector3().subVectors(pzPos, hp);
          if (toPZ.length() < 3 && toPZ.dot(dir) > 0) {
            pz.takeDamage(Math.round(dmg * 0.5), false);
          }
        }
      }
    } else {
      const end = origin.clone().add(dir.clone().multiplyScalar(80));
      spawnTracer(origin, end, 0xffff88);
    }
  }

  if (curW.id === 'mg') {
    if (!G.spinning || G.spinTimer > 0) return;
  }

  const sndName = curW.id === 'p' ? 'pistol' : curW.id === 's' ? 'smg' : curW.id === 'sg' ? 'shotgun' : curW.id === 'r' || curW.id === 'gl' ? 'rocket' : curW.id === 'sn' ? 'sniper' : curW.id === 'mg' ? 'minigun' : curW.id === 'fl' ? 'flame' : curW.id === 'lb' ? 'laser' : 'rifle';
  snd(sndName);
  if (wModels[G.curW] && wModels[G.curW].userData.mf) wModels[G.curW].userData.mf.intensity = 1.5;
  const muzzlePos = cam.position.clone().add(cam.getWorldDirection(new THREE.Vector3()).multiplyScalar(1.5));
  MUZZLE_FLASHES.spawn(muzzlePos, 0xffaa33, 0.1);
  dom.crosshair.classList.add('shoot');
  setTimeout(() => dom.crosshair.classList.remove('shoot'), 80);
  hudDirty = true;
}

function updateShootCD(dt) {
  const w = wModels[G.curW];
  if (w && w.userData.mf) w.userData.mf.intensity = Math.max(0, w.userData.mf.intensity - dt * 5);
  if (G.shootCD > 0) G.shootCD -= dt;
  if (G.reloading) {
    G.reloadT += dt;
    if (G.reloadT >= G.reloadCD) {
      G.reloading = false; G.reloadT = 0;
      const fill = Math.min(curW.mag, G.reserve);
      G.ammo = fill; G.reserve -= fill;
      snd('reload'); dom.reloadInd.style.display = 'none';
      hudDirty = true;
    }
  }
}

let dayTime = 0;
const DAY_LEN = 120;
const diffColor = new THREE.Color();
function updateLighting(dt) {
  dayTime += dt;
  const t = (Math.sin(dayTime / DAY_LEN * Math.PI * 2) + 1) / 2;
  if (t > 0.5) {
    const p = (t - 0.5) * 2;
    diffColor.setHSL(0.08, 0.2, 0.6 + p * 0.35);
    ambientLight.intensity = 0.3 + p * 0.4; dirLight.intensity = 0.3 + p * 0.7;
    scene.background.setHSL(0.08, 0.2, 0.4 + p * 0.4);
  } else {
    const p = 1 - t * 2;
    diffColor.setHSL(0.08, 0.2, 0.6 - p * 0.3);
    ambientLight.intensity = 0.3 - p * 0.2; dirLight.intensity = 0.3 - p * 0.2;
    scene.background.setHSL(0.08, 0.2, 0.4 - p * 0.2);
  }
  ground.material.color.copy(diffColor);
}

function autoCollect(dt) {
  if (!G.playing) return;
  const ppos = cam.position;
  for (let i = pickups.length - 1; i >= 0; i--) {
    const pk = pickups[i];
    pk.life -= dt;
    pk.g.position.y = 0.1 + Math.sin(Date.now() / 300 + i) * 0.05;
    pk.g.rotation.y += dt * 3;
    if (pk.life <= 0) { scene.remove(pk.g); pickups.splice(i, 1); continue; }
    const dist = ppos.distanceTo(pk.pos);
    if (dist < 1.5) {
      if (pk.type === 0) { G.hp = Math.min(G.maxHp, G.hp + 25); showPickupMsg('+25 SALUD'); }
      else if (pk.type === 1) { G.reserve += 20; showPickupMsg('+20 MUNICION'); }
      else if (pk.type === 2) { G.armor = Math.min(100, G.armor + 25); showPickupMsg('+25 ARMADURA'); }
      snd('pickup'); spawnParticles(pk.pos, ITEMS[pk.type].color, 5);
      scene.remove(pk.g); pickups.splice(i, 1);
      hudDirty = true;
    }
  }
}

function updateZombies(dt) {
  const ppos = cam.position;
  for (let i = zombies.length - 1; i >= 0; i--) {
    const z = zombies[i];
    if (!z.alive) { if (z.g && z.g.parent) scene.remove(z.g); zombies.splice(i, 1); continue; }
    z.animTime += dt; z.attackCD -= dt; z.spitCD -= dt;
    const zp = z.getPos();
    const dir = new THREE.Vector3().subVectors(ppos, zp); dir.y = 0;
    const dist = dir.length();
    if (dist > 0.5) {
      dir.normalize();
      zp.addScaledVector(dir, z.spd * dt);
      z.g.position.copy(zp);
    }
    z.avoidWalls(dt);
    z.separate(dt);
    z.g.lookAt(ppos);
    const isMoving = dist > 0.5;
    ZOMBIE_ANIM.updateAnimation(z, dt, isMoving, z.spd);
    const bob = Math.sin(z.animTime * 5) * 0.02 * Math.min(1, z.spd);
    z.g.position.y = bob;
    z.g.children.forEach(c => {
      if (c.material && c.material.color && c.material.color.getHex() === 0xff0000) {
        const bw = (z.hp / z.maxHp);
        c.scale.x = Math.max(0, bw);
      }
    });
    if (dist < 20) z.aggro = true;
    if (dist < 1.2 && z.attackCD <= 0) {
      z.attackCD = 0.5 + Math.random() * 0.3;
      z.dealDmg();
      if (z.type === 'exploder') { z.explode(); z.alive = false; scene.remove(z.g); }
    }
    if (z.type === 'spitter' && z.spitCD <= 0 && dist < 12 && dist > 2) {
      z.spitCD = 2 + Math.random();
      const sp = zp.clone(); sp.y = 0.5;
      const tp = ppos.clone(); tp.y = 0.5;
      fireSpit(sp, tp);
    }
    if (z.type === 'screamer') {
      z.screamCD = (z.screamCD || 0) - dt;
      if (z.screamCD <= 0 && dist < 15) {
        z.screamCD = 5 + Math.random() * 3;
        snd('scream');
        for (const other of zombies) {
          if (other === z || !other.alive) continue;
          if (other.getPos().distanceTo(zp) < 10) {
            other.spd *= 1.15; other.aggro = true; other.target.copy(ppos);
            spawnParticles(other.g.position, 0xdd44dd, 3);
          }
        }
      }
    }
    if (z.type === 'leaper') {
      z.jumpCD = (z.jumpCD || 0) - dt;
      if (z.jumpCD <= 0 && dist > 3 && dist < 15) {
        z.jumpCD = 3 + Math.random() * 2;
        snd('leaper');
        const jumpDir = dir.clone().multiplyScalar(z.spd * 2);
        z.g.position.addScaledVector(jumpDir, 0.5);
        spawnParticles(z.g.position, 0x44aadd, 4);
      }
    }
    if (z.type === 'necro') {
      z.necroSpawnCD = (z.necroSpawnCD || 0) - dt;
      if (z.necroSpawnCD <= 0 && zombies.length < 50) {
        z.necroSpawnCD = 8 + Math.random() * 4;
        snd('necroSpawn');
        for (let ni = 0; ni < 2; ni++) {
          const offset = new THREE.Vector3((Math.random() - 0.5) * 3, 0, (Math.random() - 0.5) * 3);
          const spawnPos = zp.clone().add(offset);
          spawnPos.x = Math.max(-HALF + 2, Math.min(HALF - 2, spawnPos.x));
          spawnPos.z = Math.max(-HALF + 2, Math.min(HALF - 2, spawnPos.z));
          spawnZombie('walk', (G._waveScale || 1) * 0.5);
        }
      }
    }
    if (z.type === 'stalker') {
      if (dist > 8) {
        z.g.traverse(c => { if (c.material && c.material.transparent !== undefined && c !== z.g.children[0]) c.material.opacity = 0.3; });
      } else {
        z.g.traverse(c => { if (c.material && c.material.transparent !== undefined && c !== z.g.children[0]) c.material.opacity = 1.0; });
        if (z.attackCD <= 0) {
          z.attackCD = 0.6;
          _tmpV3.subVectors(zp, cam.position).normalize();
          playerHit(Math.round(z.def.dmg * z.dmgMul * 1.5), _tmpV3);
          snd('hit');
          spawnParticles(zp, 0x44aa44, 6);
        }
      }
    }
    if (z.type === 'bomber') {
      z.bombCD = (z.bombCD || 0) - dt;
      if (z.bombCD <= 0 && dist < 10) {
        z.bombCD = 4 + Math.random() * 2;
        const bombDir = dir.clone().normalize().multiplyScalar(5);
        spawnExplosion(zp, 3);
        for (const z2 of zombies) {
          if (z2 === z || !z2.alive) continue;
          if (z2.getPos().distanceTo(zp) < 3) z2.takeDamage(100, false);
        }
        if (boss && boss.alive && boss.getPos().distanceTo(zp) < 3) boss.takeDamage(50, false);
        if (zp.distanceTo(cam.position) < 3) {
          _tmpV3.subVectors(zp, cam.position).normalize();
          playerHit(25, _tmpV3);
        }
        snd('explosion');
        z.alive = false;
        scene.remove(z.g);
      }
    }
    if (z.type === 'shielder') {
      const angleToPlayer = Math.atan2(cam.position.x - zp.x, cam.position.z - zp.z);
      const angleToDir = Math.atan2(dir.x, dir.z);
      const facingPlayer = Math.abs(angleToPlayer - angleToDir) < 0.8;
      if (facingPlayer && z.shieldHP > 0) {
        const sz = ZOMBIE_TYPES[z.type] ? ZOMBIE_TYPES[z.type].size : 1;
        z.g.children.forEach(c => {
          if (c.position && c.position.z > 0.15*sz && c.material) {
            c.material.emissive = c.material.emissive || new THREE.Color();
            c.material.emissive.set(0x224466);
            c.material.emissiveIntensity = 0.2;
          }
        });
      }
    }
    if (z.type === 'mutant') {
      z.acidCD = (z.acidCD || 0) - dt;
      if (z.acidCD <= 0 && dist < 12 && dist > 3) {
        z.acidCD = 2 + Math.random();
        const tp = cam.position.clone();
        tp.x += (Math.random()-0.5)*2; tp.z += (Math.random()-0.5)*2;
        fireSpit(zp.clone().add(new THREE.Vector3(0, 1, 0)), tp);
        snd('spit');
      }
      const pulse = 1 + Math.sin(z.animTime * 4) * 0.03;
      z.g.scale.set(pulse, pulse, pulse);
    }
  }
  updateBotsAlive();
}

let hudUpdateTimer = 0;
function updateHUDThrottled(dt) {
  hudUpdateTimer += dt;
  if (hudDirty || hudUpdateTimer > 0.1) {
    hudUpdateTimer = 0;
    hudDirty = false;
    updateHUD();
  }
}

function updateHUD() {
  const hpPct = Math.max(0, G.hp / G.maxHp);
  dom.healthBar.style.width = `${hpPct * 100}%`;
  dom.healthBar.style.background = hpPct > 0.5 ? '#44cc44' : hpPct > 0.25 ? '#cccc44' : '#cc4444';
  dom.healthText.textContent = `${Math.ceil(G.hp)}`;
  dom.armorBar.style.width = `${G.armor}%`;
  dom.scoreText.textContent = `${G.score}`;
  dom.killsText.textContent = `${G.totalKills}`;
  dom.streakText.textContent = `${G.streaks}`;
  dom.hudRound.textContent = `OLEADA ${G.wave}`;
  dom.weaponName.textContent = curW.name;
  dom.weaponIcon.textContent = curW.icon;
  dom.ammoText.textContent = G.reloading ? '...' : `${G.ammo}`;
  dom.ammoReserve.textContent = G.reloading ? 'RECARGANDO' : `${G.reserve}`;
  dom.lowhp.classList.toggle('active', G.hp < 30);
}

function updateWStrip() {
  dom.weaponStrip.innerHTML = '';
  const keys = Object.keys(WPS);
  keys.forEach((k, i) => {
    const el = document.createElement('div');
    el.className = `ws-item${k === G.curW ? ' active' : ''}`;
    el.innerHTML = `<span class="ws-key">${i+1}</span> ${WPS[k].name}`;
    dom.weaponStrip.appendChild(el);
  });
}

function showRoundMsg(title, sub) {
  dom.roundInfo.innerHTML = `${title}<span class="round-sub">${sub || ''}</span>`;
  dom.roundInfo.classList.add('show');
  clearTimeout(dom.roundInfo._timer);
  dom.roundInfo._timer = setTimeout(() => dom.roundInfo.classList.remove('show'), 3000);
}

function updateBotsAlive() {
  const alive = zombies.filter(z => z.alive).length;
  dom.botsAlive.textContent = alive > 0 ? `Zombies: ${alive}` : '';
}

function addKillMsg(type, hs) {
  const names = { walk:'Zombie', runner:'Corredor', brute:'Bruto', exploder:'Explosivo', spitter:'Escupidor', crawler:'Rastrero', screamer:'Gritador', leaper:'Saltarin', tank:'Tanque', necro:'Necromante' };
  const el = document.createElement('div');
  el.className = 'kill-msg';
  el.textContent = hs ? `¡${names[type]||'Zombie'} eliminado! (CABEZA)` : `${names[type]||'Zombie'} eliminado`;
  dom.killFeed.appendChild(el);
  setTimeout(() => el.remove(), 3000);
  hudDirty = true;
}

function showHitmarker() {
  dom.hitmarker.classList.add('show');
  clearTimeout(dom.hitmarker._t);
  dom.hitmarker._t = setTimeout(() => dom.hitmarker.classList.remove('show'), 120);
}

function showHS() {
  dom.hsInd.classList.add('show');
  clearTimeout(dom.hsInd._t);
  dom.hsInd._t = setTimeout(() => dom.hsInd.classList.remove('show'), 500);
}

function showStreak(n) {
  const msgs = ['', '', '', '3x RACHA', '4x RACHA', '5x RACHA', '!IMPARABLE', '!DEVASTADOR', '!ANIQUILACION'];
  dom.streakMsg.textContent = msgs[Math.min(n, msgs.length - 1)] || `${n}x`;
  dom.streakMsg.classList.add('show');
  clearTimeout(dom.streakMsg._t);
  dom.streakMsg._t = setTimeout(() => dom.streakMsg.classList.remove('show'), 1500);
  snd('streak');
}

function showDmgNum(dmg, pos, hs) {
  const el = document.createElement('div');
  el.className = `dmg-num${hs ? ' headshot' : ''}`;
  el.textContent = Math.round(dmg);
  const p = pos.clone();
  p.y += 1.5;
  p.project(cam);
  const x = (p.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-p.y * 0.5 + 0.5) * window.innerHeight;
  el.style.left = `${x + Math.random() * 40 - 20}px`;
  el.style.top = `${y + Math.random() * 20 - 10}px`;
  dom.dmgNums.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

function showDmgDir(dir) {
  dom.dmgOverlay.className = 'hud-dmg';
  const angle = Math.atan2(dir.x, dir.z) - cam.rotation.y;
  if (angle > -Math.PI/4 && angle < Math.PI/4) dom.dmgOverlay.classList.add('hit-front');
  else if (angle > Math.PI/4 && angle < 3*Math.PI/4) dom.dmgOverlay.classList.add('hit-right');
  else if (angle < -Math.PI/4 && angle > -3*Math.PI/4) dom.dmgOverlay.classList.add('hit-left');
  else dom.dmgOverlay.classList.add('hit-back');
  clearTimeout(dom.dmgOverlay._t);
  dom.dmgOverlay._t = setTimeout(() => { dom.dmgOverlay.className = 'hud-dmg'; }, 200);
}

function showPickupMsg(text) {
  const el = document.createElement('div');
  el.className = 'hud-pickup';
  el.textContent = text;
  dom.hud.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

function showGameOver() {
  G.playing = false; stopAmbient();
  dom.hud.style.display = 'none';
  dom.go.style.display = 'flex';
  dom.goTitle.textContent = 'MUERTO';
  dom.goTitle.style.color = '#ff4444';
  const acc = G.totalShots > 0 ? Math.round(G.totalShots > 0 ? G.totalHits / G.totalShots * 100 : 0) : 0;
  dom.finalScore.textContent = G.score;
  dom.finalKills.textContent = G.totalKills;
  dom.finalRounds.textContent = G.wave;
  dom.finalAcc.textContent = `${acc}%`;
  dom.finalStreak.textContent = G.maxStreak;
  let mvpText = '';
  if (G.maxStreak >= 20) mvpText = 'RACHA LEGENDARIA!';
  else if (G.maxStreak >= 10) mvpText = 'RACHA IMPRESIONANTE!';
  else if (G.maxStreak >= 5) mvpText = 'Buena racha';
  if (G.totalHeadshots > 50) mvpText += ' | Ojo de halcon';
  if (G.bossesKilled > 0) mvpText += ` | ${G.bossesKilled} jefes eliminados`;
  if (G.wave >= 10) mvpText += ` | Oleada ${G.wave}`;
  dom.mvpDisplay.textContent = mvpText;
  localStorage.setItem('zombieAchievements', JSON.stringify(ACHIEVEMENTS.list));
  saveScore(G.score, G.wave, G.totalKills, acc, G.maxStreak);
  showTopScores(dom.goScores, 5);
}

function showVictory() {
  if (G.victory) return;
  G.victory = true; G.playing = false; stopAmbient();
  dom.hud.style.display = 'none';
  dom.go.style.display = 'flex';
  dom.goTitle.textContent = '!VICTORIA!';
  dom.goTitle.style.color = '#44ff44';
  const acc = G.totalShots > 0 ? Math.round(G.totalHits / G.totalShots * 100) : 0;
  dom.finalScore.textContent = G.score;
  dom.finalKills.textContent = G.totalKills;
  dom.finalRounds.textContent = G.wave;
  dom.finalAcc.textContent = `${acc}%`;
  dom.finalStreak.textContent = G.maxStreak;
  dom.mvpDisplay.textContent = '¡Sobreviviste!';
  saveScore(G.score, G.wave, G.totalKills, acc, G.maxStreak);
  showTopScores(dom.goScores, 5);
}

function saveScore(score, wave, kills, acc, streak) {
  let scores = JSON.parse(localStorage.getItem('zombieScores') || '[]');
  scores.push({ score, wave, kills, acc, streak, date: new Date().toLocaleDateString() });
  scores.sort((a, b) => b.score - a.score);
  if (scores.length > 20) scores = scores.slice(0, 20);
  localStorage.setItem('zombieScores', JSON.stringify(scores));
}
function showTopScores(container, limit) {
  const scores = JSON.parse(localStorage.getItem('zombieScores') || '[]');
  if (scores.length === 0) { container.innerHTML = '<div class="scores-empty">Aun no hay puntuaciones</div>'; return; }
  container.innerHTML = '<div class="hs-row"><span>#</span><span>Puntos</span><span>Oleada</span><span>Bajas</span></div>';
  const n = Math.min(limit || 10, scores.length);
  for (let i = 0; i < n; i++) {
    const s = scores[i];
    const row = document.createElement('div'); row.className = 'hs-row';
    row.innerHTML = `<span>${i+1}</span><span>${s.score}</span><span>${s.wave}</span><span>${s.kills||0}</span>`;
    container.appendChild(row);
  }
}

const WEATHER = {
  current: 'clear', timer: 0, nextChange: 60, intensity: 0,
  rainDrops: [], lightning: { timer: 5, flash: 0, light: null },
  wind: { x: 0, z: 0, strength: 0 },
  fogDensity: 0.008, targetFogDensity: 0.008,
};

function initWeather() {
  WEATHER.lightning.light = new THREE.PointLight(0xffffff, 0, 200);
  WEATHER.lightning.light.position.set(0, 50, 0);
  scene.add(WEATHER.lightning.light);
}

function spawnRainDrop() {
  const drop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.003, 0.003, 0.3, 3),
    new THREE.MeshBasicMaterial({ color: 0x8899bb, transparent: true, opacity: 0.4 })
  );
  drop.position.set(
    cam.position.x + (Math.random() - 0.5) * 40,
    cam.position.y + 15 + Math.random() * 10,
    cam.position.z + (Math.random() - 0.5) * 40
  );
  drop.userData.vy = -15 - Math.random() * 10;
  drop.userData.vx = WEATHER.wind.x * 2;
  drop.userData.vz = WEATHER.wind.z * 2;
  drop.userData.life = 2;
  scene.add(drop);
  WEATHER.rainDrops.push(drop);
}

function updateWeather(dt) {
  WEATHER.timer -= dt;
  if (WEATHER.timer <= 0) {
    WEATHER.timer = WEATHER.nextChange;
    const weathers = ['clear', 'overcast', 'rain', 'storm', 'fog'];
    const weights = [30, 25, 20, 10, 15];
    let total = 0, r = Math.random() * weights.reduce((a,b)=>a+b, 0);
    for (let i = 0; i < weathers.length; i++) {
      total += weights[i];
      if (r < total) { WEATHER.current = weathers[i]; break; }
    }
    switch (WEATHER.current) {
      case 'clear':
        WEATHER.targetFogDensity = 0.006; WEATHER.wind.x = (Math.random()-0.5)*0.5; WEATHER.wind.z = (Math.random()-0.5)*0.5;
        break;
      case 'overcast':
        WEATHER.targetFogDensity = 0.012; WEATHER.wind.x = (Math.random()-0.5)*1; WEATHER.wind.z = (Math.random()-0.5)*1;
        break;
      case 'rain':
        WEATHER.targetFogDensity = 0.015; WEATHER.wind.x = (Math.random()-0.5)*2; WEATHER.wind.z = (Math.random()-0.5)*2;
        break;
      case 'storm':
        WEATHER.targetFogDensity = 0.02; WEATHER.wind.x = (Math.random()-0.5)*3; WEATHER.wind.z = (Math.random()-0.5)*3;
        break;
      case 'fog':
        WEATHER.targetFogDensity = 0.035; WEATHER.wind.x = (Math.random()-0.5)*0.3; WEATHER.wind.z = (Math.random()-0.5)*0.3;
        break;
    }
  }
  WEATHER.fogDensity += (WEATHER.targetFogDensity - WEATHER.fogDensity) * dt * 0.5;
  scene.fog.near = Math.max(10, 40 - WEATHER.fogDensity * 1500);
  scene.fog.far = Math.max(30, 80 - WEATHER.fogDensity * 1000);
  if (WEATHER.current === 'rain' || WEATHER.current === 'storm') {
    const maxDrops = WEATHER.current === 'storm' ? 300 : 150;
    if (WEATHER.rainDrops.length < maxDrops) {
      for (let i = 0; i < 3; i++) spawnRainDrop();
    }
    for (let i = WEATHER.rainDrops.length - 1; i >= 0; i--) {
      const drop = WEATHER.rainDrops[i];
      drop.position.y += drop.userData.vy * dt;
      drop.position.x += drop.userData.vx * dt;
      drop.position.z += drop.userData.vz * dt;
      drop.userData.life -= dt;
      if (drop.position.y < 0 || drop.userData.life <= 0) {
        scene.remove(drop);
        WEATHER.rainDrops.splice(i, 1);
      }
    }
  } else {
    for (let i = WEATHER.rainDrops.length - 1; i >= 0; i--) {
      scene.remove(WEATHER.rainDrops[i]);
      WEATHER.rainDrops.splice(i, 1);
    }
  }
  if (WEATHER.current === 'storm') {
    WEATHER.lightning.timer -= dt;
    if (WEATHER.lightning.timer <= 0) {
      WEATHER.lightning.timer = 3 + Math.random() * 8;
      WEATHER.lightning.flash = 0.3;
      WEATHER.lightning.light.position.set(
        cam.position.x + (Math.random()-0.5) * 100,
        50,
        cam.position.z + (Math.random()-0.5) * 100
      );
    }
    if (WEATHER.lightning.flash > 0) {
      WEATHER.lightning.flash -= dt * 2;
      WEATHER.lightning.light.intensity = WEATHER.lightning.flash * 15;
      if (WEATHER.lightning.flash <= 0) WEATHER.lightning.light.intensity = 0;
    }
  }
}

const DAYNIGHT = {
  time: 0.3, speed: 0.003, sunLight: null, ambientLight: null,
  phases: [
    { name: 'amanecer', start: 0, sky: 0xff8844, ambient: 0x664422, fog: 0x443322, sunIntensity: 0.3, ambIntensity: 0.2 },
    { name: 'manana', start: 0.15, sky: 0x88aacc, ambient: 0x667788, fog: 0x2a3a2a, sunIntensity: 0.6, ambIntensity: 0.4 },
    { name: 'mediodia', start: 0.3, sky: 0xaabbdd, ambient: 0x889999, fog: 0x334433, sunIntensity: 0.9, ambIntensity: 0.5 },
    { name: 'tarde', start: 0.5, sky: 0xddaa66, ambient: 0x887744, fog: 0x443322, sunIntensity: 0.7, ambIntensity: 0.4 },
    { name: 'atardecer', start: 0.65, sky: 0xff6633, ambient: 0x663311, fog: 0x332211, sunIntensity: 0.4, ambIntensity: 0.25 },
    { name: 'noche', start: 0.75, sky: 0x111122, ambient: 0x111122, fog: 0x0a0a15, sunIntensity: 0.1, ambIntensity: 0.08 },
  ]
};

function initDayNight() {
  DAYNIGHT.sunLight = dirLight;
  DAYNIGHT.ambientLight = ambientLight;
}

function updateDayNight(dt) {
  DAYNIGHT.time = (DAYNIGHT.time + DAYNIGHT.speed * dt) % 1;
  const t = DAYNIGHT.time;
  let p1 = DAYNIGHT.phases[DAYNIGHT.phases.length - 1];
  let p2 = DAYNIGHT.phases[0];
  for (let i = 0; i < DAYNIGHT.phases.length; i++) {
    const next = (i + 1) % DAYNIGHT.phases.length;
    if (t >= DAYNIGHT.phases[i].start && (next === 0 || t < DAYNIGHT.phases[next].start)) {
      p1 = DAYNIGHT.phases[i];
      p2 = DAYNIGHT.phases[next];
      break;
    }
  }
  const range = p2.start > p1.start ? p2.start - p1.start : 1 - p1.start + p2.start;
  const elapsed = t >= p1.start ? t - p1.start : 1 - p1.start + t;
  const blend = Math.min(1, elapsed / range);
  if (DAYNIGHT.sunLight) {
    DAYNIGHT.sunLight.intensity += (p1.sunIntensity + (p2.sunIntensity - p1.sunIntensity) * blend - DAYNIGHT.sunLight.intensity) * dt * 2;
    const sunAngle = t * Math.PI * 2;
    DAYNIGHT.sunLight.position.set(Math.cos(sunAngle) * 50, Math.sin(sunAngle) * 30 + 20, 10);
  }
  if (DAYNIGHT.ambientLight) {
    DAYNIGHT.ambientLight.intensity += (p1.ambIntensity + (p2.ambIntensity - p1.ambIntensity) * blend - DAYNIGHT.ambientLight.intensity) * dt * 2;
    const r1 = (p1.ambient >> 16) & 0xff, g1 = (p1.ambient >> 8) & 0xff, b1 = p1.ambient & 0xff;
    const r2 = (p2.ambient >> 16) & 0xff, g2 = (p2.ambient >> 8) & 0xff, b2 = p2.ambient & 0xff;
    const r = Math.round(r1 + (r2 - r1) * blend);
    const g = Math.round(g1 + (g2 - g1) * blend);
    const b = Math.round(b1 + (b2 - b1) * blend);
    DAYNIGHT.ambientLight.color.setRGB(r / 255, g / 255, b / 255);
  }
}

const COMBO = {
  kills: 0, timer: 0, multiplier: 1, maxMultiplier: 10,
  medals: [], totalMedals: 0,
  definitions: {
    double: { name: 'DOBLE BAJA', desc: '2 kills seguidos', threshold: 2, score: 50, color: 0xffff00 },
    triple: { name: 'TRIPLE BAJA', desc: '3 kills seguidos', threshold: 3, score: 150, color: 0xff8800 },
    multi:  { name: 'MULTI-KILL', desc: '5 kills seguidos', threshold: 5, score: 500, color: 0xff0000 },
    mega:   { name: 'MEGA-KILL', desc: '8 kills seguidos', threshold: 8, score: 1000, color: 0xcc00ff },
    ultra:  { name: 'ULTRA-KILL', desc: '12 kills seguidos', threshold: 12, score: 2500, color: 0x00ffff },
    godlike:{ name: 'GODLIKE', desc: '20 kills seguidos', threshold: 20, score: 5000, color: 0xff00ff },
  },
};

function resetCombo() {
  COMBO.kills = 0; COMBO.timer = 0; COMBO.multiplier = 1;
}

function addKill() {
  COMBO.kills++; COMBO.timer = 3.0;
  COMBO.multiplier = Math.min(COMBO.maxMultiplier, 1 + Math.floor(COMBO.kills / 2));
  for (const key of Object.keys(COMBO.definitions)) {
    const medal = COMBO.definitions[key];
    if (COMBO.kills === medal.threshold) {
      G.score += Math.round(medal.score * curDiff.bonus);
      showStreakMsg(medal.name, medal.desc, medal.color);
      COMBO.totalMedals++;
      break;
    }
  }
}

function updateCombo(dt) {
  if (COMBO.timer > 0) {
    COMBO.timer -= dt;
    if (COMBO.timer <= 0) resetCombo();
  }
}

const COMBO_STREAKS = [];
function showStreakMsg(name, desc, color) {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;top:30%;left:50%;transform:translateX(-50%);color:#${color.toString(16).padStart(6,'0')};font-size:28px;font-weight:900;text-shadow:0 0 10px #${color.toString(16).padStart(6,'0')},0 0 20px #000;z-index:100;pointer-events:none;font-family:'Orbitron',sans-serif;text-align:center;animation:streakAnim 2s forwards;`;
  el.innerHTML = `${name}<br><span style="font-size:14px;color:#fff">${desc}</span>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

// AMBIENT_SOUNDS now defined later in enhanced systems section

const ENV_HAZARDS = {
  firePits: [],
  toxicClouds: [],
  electricZones: [],
};

function addFirePit(x, z, r) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(r || 0.5, (r||0.5)*1.1, 0.1, 8), new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 }));
  base.position.y = 0.05; g.add(base);
  const fireLight = new THREE.PointLight(0xff4400, 0.5, 5);
  fireLight.position.y = 0.5; g.add(fireLight);
  const fireMat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.6 });
  for (let fi = 0; fi < 5; fi++) {
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.05 + Math.random()*0.05, 0.3 + Math.random()*0.2, 5), fireMat);
    flame.position.set((Math.random()-0.5)*(r||0.5)*0.5, 0.2, (Math.random()-0.5)*(r||0.5)*0.5);
    flame.userData = { baseY: 0.2, flickerSpeed: 3 + Math.random()*3, phase: Math.random()*Math.PI*2 };
    g.add(flame);
  }
  g.position.set(x, 0, z); scene.add(g);
  ENV_HAZARDS.firePits.push({ pos: new THREE.Vector3(x, 0, z), radius: r || 0.5, dmg: 15, timer: 0 });
}

function addToxicCloud(x, z, r) {
  const g = new THREE.Group();
  const cloud = new THREE.Mesh(
    new THREE.SphereGeometry(r || 1.0, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x44ff44, transparent: true, opacity: 0.08 })
  );
  cloud.position.y = 0.5; g.add(cloud);
  const light = new THREE.PointLight(0x44ff44, 0.2, 4);
  light.position.y = 0.5; g.add(light);
  g.position.set(x, 0, z); scene.add(g);
  ENV_HAZARDS.toxicClouds.push({ pos: new THREE.Vector3(x, 0, z), radius: r || 1.0, dmg: 5, timer: 0 });
}

function addElectricZone(x, z, r) {
  const g = new THREE.Group();
  const zone = new THREE.Mesh(
    new THREE.RingGeometry((r||1)*0.3, r||1, 8),
    new THREE.MeshBasicMaterial({ color: 0x44aaff, transparent: true, opacity: 0.06, side: THREE.DoubleSide })
  );
  zone.rotation.x = -Math.PI/2; zone.position.y = 0.02; g.add(zone);
  const light = new THREE.PointLight(0x44aaff, 0.3, 5);
  light.position.y = 1; g.add(light);
  g.position.set(x, 0, z); scene.add(g);
  ENV_HAZARDS.electricZones.push({ pos: new THREE.Vector3(x, 0, z), radius: r || 1.0, dmg: 10, timer: 0 });
}

function updateHazards(dt) {
  for (const fp of ENV_HAZARDS.firePits) {
    fp.timer += dt;
    if (fp.timer >= 0.5) {
      fp.timer = 0;
      if (cam.position.distanceTo(fp.pos) < fp.radius) {
        _tmpV3.set(0, 1, 0);
        playerHit(fp.dmg, _tmpV3);
      }
    }
  }
  for (const tc of ENV_HAZARDS.toxicClouds) {
    tc.timer += dt;
    if (tc.timer >= 1.0) {
      tc.timer = 0;
      if (cam.position.distanceTo(tc.pos) < tc.radius) {
        _tmpV3.set(0, 1, 0);
        playerHit(tc.dmg, _tmpV3);
      }
    }
  }
  for (const ez of ENV_HAZARDS.electricZones) {
    ez.timer += dt;
    if (ez.timer >= 0.3) {
      ez.timer = 0;
      if (cam.position.distanceTo(ez.pos) < ez.radius) {
        _tmpV3.set(0, 1, 0);
        playerHit(ez.dmg, _tmpV3);
        if (Math.random() < 0.3) spawnParticles(cam.position, 0x44aaff, 5);
      }
    }
  }
}

addFirePit(-30, -45, 0.6); addFirePit(30, 45, 0.5); addFirePit(-45, 30, 0.7);
addFirePit(45, -30, 0.5); addFirePit(0, 0, 0.4);
addToxicCloud(-46, -46, 2.0); addToxicCloud(46, 46, 1.8);
addToxicCloud(-44, 46, 1.5); addToxicCloud(44, -46, 1.7);
addElectricZone(-50, 50, 2.0); addElectricZone(50, -50, 2.0);
addElectricZone(-35, -55, 1.5); addElectricZone(35, 55, 1.5);

const SCORE_MULTIPLIER = {
  base: 1, headshotBonus: 2, comboBonus: 0, waveBonus: 0,
  distanceBonus: 0, noDamageBonus: 0, accuracyBonus: 0,
};

function calcScore(basePoints, options) {
  let total = basePoints;
  SCORE_MULTIPLIER.headshotBonus = options.headshot ? 2 : 1;
  SCORE_MULTIPLIER.comboBonus = COMBO.multiplier;
  SCORE_MULTIPLIER.waveBonus = 1 + G.wave * 0.05;
  SCORE_MULTIPLIER.distanceBonus = options.distance > 30 ? 1.5 : options.distance > 15 ? 1.2 : 1;
  SCORE_MULTIPLIER.noDamageBonus = G.noHitStreak > 5 ? 1.3 : G.noHitStreak > 10 ? 1.5 : 1;
  total *= SCORE_MULTIPLIER.headshotBonus;
  total *= SCORE_MULTIPLIER.comboBonus;
  total *= SCORE_MULTIPLIER.waveBonus;
  total *= SCORE_MULTIPLIER.distanceBonus;
  total *= SCORE_MULTIPLIER.noDamageBonus;
  return Math.round(total * curDiff.bonus);
}

const PICKUP_TYPES = [
  { name: 'Vida', color: 0x44ff44, icon: '+', effect: (p) => { G.hp = Math.min(G.maxHp, G.hp + 25); } },
  { name: 'Armadura', color: 0x4488ff, icon: 'A', effect: (p) => { G.armor = Math.min(100, G.armor + 30); } },
  { name: 'Municion', color: 0xffff44, icon: 'R', effect: (p) => { G.reserve += Math.round(curW.res * 0.3); } },
  { name: 'Velocidad', color: 0xff44ff, icon: 'S', effect: (p) => { G.speedBoost = 5; } },
  { name: 'Rage', color: 0xff4444, icon: '!', effect: (p) => { G.rageTimer = 8; } },
];

const POWERUPS = {
  speedBoost: { timer: 0, duration: 5 },
  rageTimer: 0,
  shield: { timer: 0, duration: 10 },
  doubleScore: { timer: 0, duration: 15 },
};

function updatePowerups(dt) {
  if (G.speedBoost > 0) G.speedBoost -= dt;
  if (G.rageTimer > 0) G.rageTimer -= dt;
  if (POWERUPS.shield.timer > 0) {
    POWERUPS.shield.timer -= dt;
    G.armor = 100;
  }
  if (POWERUPS.doubleScore.timer > 0) POWERUPS.doubleScore.timer -= dt;
}

const VEHICLE_OBSTACLES = [];
function addAbandonedSemi(x, z, rot) {
  const g = new THREE.Group();
  const cabMat = new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.7, metalness: 0.3 });
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 1.0), cabMat);
  cab.position.set(0, 0.5, 0); cab.castShadow = true; g.add(cab);
  const windshield = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), new THREE.MeshStandardMaterial({ color: 0x88aacc, transparent: true, opacity: 0.4 }));
  windshield.position.set(0, 0.7, 0.51); g.add(windshield);
  const trailer = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.2, 1.1), new THREE.MeshStandardMaterial({ color: 0x556666, roughness: 0.8 }));
  trailer.position.set(-2.2, 0.6, 0); trailer.castShadow = true; g.add(trailer);
  for (const [wx, wz] of [[-0.5, 0.52], [0.5, 0.52], [-0.5, -0.52], [0.5, -0.52], [-2.5, 0.55], [-1.9, 0.55], [-2.5, -0.55], [-1.9, -0.55]]) {
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 8), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    wh.rotation.z = Math.PI/2; wh.position.set(wx, 0.18, wz); g.add(wh);
  }
  g.position.set(x, 0, z); g.rotation.y = rot || 0; scene.add(g);
  walls.push({ minX: x - 3.5, maxX: x + 1.5, minZ: z - 0.7, maxZ: z + 0.7 });
}

addAbandonedSemi(-60, 0, 0.3); addAbandonedSemi(60, 0, Math.PI + 0.2);
addAbandonedSemi(0, -60, Math.PI/2); addAbandonedSemi(0, 60, -Math.PI/2);

const GRAFFITI_MARKS = [];
function addBloodTrail(x1, z1, x2, z2) {
  const dx = x2 - x1, dz = z2 - z1;
  const len = Math.sqrt(dx*dx + dz*dz);
  const steps = Math.floor(len / 0.3);
  for (let si = 0; si < steps; si++) {
    const t = si / steps;
    const px = x1 + dx * t + (Math.random()-0.5)*0.2;
    const pz = z1 + dz * t + (Math.random()-0.5)*0.2;
    const drop = new THREE.Mesh(
      new THREE.CircleGeometry(0.03 + Math.random()*0.04, 5),
      new THREE.MeshBasicMaterial({ color: 0x661111, transparent: true, opacity: 0.3 + Math.random()*0.3 })
    );
    drop.rotation.x = -Math.PI/2; drop.position.set(px, 0.005, pz); scene.add(drop);
  }
}

for (let bi = 0; bi < 12; bi++) {
  const ba = bi / 12 * Math.PI * 2;
  const br = 20 + Math.random() * 40;
  const bx = Math.cos(ba) * br, bz = Math.sin(ba) * br;
  addBloodTrail(bx, bz, bx + (Math.random()-0.5)*8, bz + (Math.random()-0.5)*8);
}

const BARBED_WIRE = [];
function addBarbedWire(x1, z1, x2, z2) {
  const dx = x2 - x1, dz = z2 - z1;
  const len = Math.sqrt(dx*dx + dz*dz);
  const angle = Math.atan2(dx, dz);
  const g = new THREE.Group();
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.6 });
  const mainWire = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.005, len), wireMat);
  mainWire.position.set(0, 0.3, 0); g.add(mainWire);
  const wire2 = mainWire.clone(); wire2.position.y = 0.5; g.add(wire2);
  for (let ti = 0; ti < len; ti += 0.2) {
    const barb = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.02, 3), wireMat);
    barb.position.set(0, 0.3 + Math.random()*0.2, ti - len/2);
    barb.rotation.set(Math.random(), Math.random(), Math.random());
    g.add(barb);
  }
  g.position.set((x1+x2)/2, 0, (z1+z2)/2); g.rotation.y = angle; scene.add(g);
  walls.push({ minX: Math.min(x1,x2)-0.1, maxX: Math.max(x1,x2)+0.1, minZ: Math.min(z1,z2)-0.1, maxZ: Math.max(z1,z2)+0.1 });
}

addBarbedWire(-20, -45, -10, -45); addBarbedWire(10, 45, 20, 45);
addBarbedWire(-45, -20, -45, -10); addBarbedWire(45, 10, 45, 20);

let lastTime = 0;
let waveCompleteCooldown = 0;

function gameLoop(time) {
  requestAnimationFrame(gameLoop);
  const dt = Math.min((time - lastTime) / 1000, 0.05); lastTime = time;
  if (!G.playing) { renderer.render(scene, cam); return; }
  updateLighting(dt);
  updatePlayer(dt);
  updateDayNight(dt);
  updateWeather(dt);
  updateWeatherEffects(dt);
  processWaveSpawning(dt);
  updateZombies(dt);
  // Zombie animation now handled inside updateZombies via ZOMBIE_ANIM.updateAnimation
  if (boss) updateBoss(dt);
  updateRockets(dt);
  updateSpits(dt);
  updateParticles(dt);
  updateTracers(dt);
  // updateMuzzleFlashes removed — MUZZLE_FLASHES.update(dt) called below
  updateShootCD(dt);
  updateCombo(dt);
  updatePowerups(dt);
  updateHazards(dt);
  updateCorpses(dt);
  updateDecals(dt);
  updateAmbientParticles(dt);
  updateDynamicLights(dt);
  updateFloatingTexts(dt);
  autoCollect(dt);
  updatePerformance(dt);
  applyScreenEffects(dt);
  checkAchievements();
  MILESTONE_SYSTEM.check();
  MILESTONE_VICTORY.check(G.wave);
  updateSurvivalBonus(dt);
  updateEliteEffects(dt);
  updateHeadshotTracker(dt);
  updatePerks(dt);
  updateDamageFeedback(dt);
  updateCameraEffects(dt);
  updateWeatherAmbient(dt);
  updateGroundMarks(dt);
  updateParticleEmitters(dt);
  updateZombieSounds(dt);
  SLOW_MO.update(dt);
  WEAPON_HEAT.update(dt);
  DYNAMIC_EVENTS.update(dt);
  ZOMBIE_TRAILS.update(dt);
  IMPACT_DECALS.update(dt);
  ZOMBIE_DMG_NUMBERS.update(dt);
  BLOOD_POOLS.update(dt);
  MUZZLE_FLASHES.update(dt);
  PROJECTILE_TRAILS.update(dt);
  ZOMBIE_INTIMIDATION.update(dt);
  AMBIENT_DRONES.update(dt);
  AMBIENT_SOUNDS.update(dt);
  GAME_STATS.totalPlayTime += dt;
  WEAPON_CHALLENGES.checkSurvivalTime(GAME_STATS.totalPlayTime);
  // updateAmbientSounds removed — AMBIENT_SOUNDS.update(dt) called above
  if (screenShake > 0) {
    _shakeBase.set(
      (Math.random() - 0.5) * screenShake * 0.5,
      (Math.random() - 0.5) * screenShake * 0.3,
      0
    );
    cam.position.add(_shakeBase);
    screenShake *= 0.9;
    if (screenShake < 0.001) screenShake = 0;
  }
  renderer.render(scene, cam);
  updateHUDThrottled(dt);
  drawMinimap();

  waveCompleteCooldown -= dt;
  if (G.playing && G.wave > 0 && G.waveActive && G.waveSpawnDone && !G.bossActive && (!boss || !boss.alive) && G.kills >= G.zombiesNeeded && zombies.length === 0 && waveCompleteCooldown <= 0) {
    G.waveActive = false;
    waveCompleteCooldown = 2;
    const nextCount = getWaveCount(G.wave + 1);
    crateReward(); snd('waveS');
    showRoundMsg(`OLEADA ${G.wave + 1}`, `Zombies: ${nextCount}`);
    setTimeout(() => { if (G.playing) spawnWave(nextCount); }, 3000);
  }
}

function drawMinimap() {
  const canvas = dom.minimapCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(0,20,0,0.4)'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(68,106,68,0.3)'; ctx.lineWidth = 1;
  ctx.strokeRect(2, 2, W - 4, H - 4);
  const sc = W / (HALF * 2);
  const cx = W / 2 - cam.position.x * sc, cy = H / 2 - cam.position.z * sc;

  for (const bp of biomePatches) {
    ctx.fillStyle = `#${bp.color.toString(16).padStart(6, '0')}44`;
    ctx.beginPath();
    ctx.arc(cx + bp.x * sc, cy + bp.z * sc, bp.r * sc, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(68,68,85,0.5)'; ctx.strokeStyle = 'rgba(68,68,85,0.7)'; ctx.lineWidth = 0.5;
  for (const w of walls) {
    const ww = (w.maxX - w.minX) * sc, wh = (w.maxZ - w.minZ) * sc;
    if (ww > 0 && wh > 0 && ww < 15 && wh < 15) ctx.fillRect(cx + w.minX * sc, cy + w.minZ * sc, ww, wh);
  }

  for (const fp of ENV_HAZARDS.firePits) {
    ctx.fillStyle = 'rgba(255,68,0,0.4)';
    ctx.beginPath(); ctx.arc(cx + fp.pos.x * sc, cy + fp.pos.z * sc, fp.radius * sc, 0, Math.PI * 2); ctx.fill();
  }
  for (const tc of ENV_HAZARDS.toxicClouds) {
    ctx.fillStyle = 'rgba(68,255,68,0.3)';
    ctx.beginPath(); ctx.arc(cx + tc.pos.x * sc, cy + tc.pos.z * sc, tc.radius * sc, 0, Math.PI * 2); ctx.fill();
  }
  for (const ez of ENV_HAZARDS.electricZones) {
    ctx.fillStyle = 'rgba(68,170,255,0.3)';
    ctx.beginPath(); ctx.arc(cx + ez.pos.x * sc, cy + ez.pos.z * sc, ez.radius * sc, 0, Math.PI * 2); ctx.fill();
  }
  for (const hb of hazmatBarrels) {
    ctx.fillStyle = '#cccc22';
    ctx.fillRect(cx + hb.pos.x * sc - 1, cy + hb.pos.z * sc - 1, 2, 2);
  }

  ctx.fillStyle = '#44aa44';
  for (const z of zombies) { if (!z.alive) continue; const p = z.getPos(); ctx.fillRect(cx + p.x * sc - 1, cy + p.z * sc - 1, 2, 2); }
  if (boss && boss.alive) {
    const p = boss.getPos();
    ctx.fillStyle = '#ff4444';
    ctx.beginPath(); ctx.arc(cx + p.x * sc, cy + p.z * sc, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ff8888'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx + p.x * sc, cy + p.z * sc, 6, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.fillStyle = '#ffaa00';
  for (const pk of pickups) { ctx.fillRect(cx + pk.pos.x * sc - 1, cy + pk.pos.z * sc - 1, 2, 2); }
  for (const cc of CARGO_CRATES) {
    if (!cc.active) continue;
    ctx.fillStyle = '#ff8844';
    ctx.fillRect(cx + cc.pos.x * sc - 2, cy + cc.pos.z * sc - 2, 4, 4);
  }
  ctx.fillStyle = '#44ff44'; ctx.beginPath(); ctx.arc(W / 2, H / 2, 3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#44ff44'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(W / 2, H / 2); ctx.lineTo(W / 2 - Math.sin(cam.rotation.y) * 8, H / 2 - Math.cos(cam.rotation.y) * 8); ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, H - 16, W, 16);
  ctx.fillStyle = '#aabbcc'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
  const biomeNames = [];
  for (const key of Object.keys(BIOMES)) {
    const b = BIOMES[key];
    const dx = cam.position.x - b.center[0], dz = cam.position.z - b.center[1];
    if (Math.sqrt(dx*dx + dz*dz) < b.radius) biomeNames.push(key.toUpperCase());
  }
  ctx.fillText(`Bioma: ${biomeNames.join(', ') || 'CIUDAD'}  |  FPS: ${PERFORMANCE.fps}  |  Zombies: ${zombies.length}  |  Oleada: ${G.wave}`, 4, H - 5);
  ctx.textAlign = 'right';
  ctx.fillText(`Clima: ${WEATHER.current.toUpperCase()}  |  Hora: ${DAYNIGHT.phases.find(p => { const t = DAYNIGHT.time; return t >= p.start; })?.name || 'noche'}`, W - 4, H - 5);
}

const keyMap = { 'w':'w', 'W':'w', 'ArrowUp':'w', 's':'s', 'S':'s', 'ArrowDown':'s', 'a':'a', 'A':'a', 'ArrowLeft':'a', 'd':'d', 'D':'d', 'ArrowRight':'d' };
const wsadIdx = { w: 0, s: 1, a: 2, d: 3 };

document.addEventListener('keydown', e => {
  const mapped = keyMap[e.key];
  if (mapped) G.wsad[wsadIdx[mapped]] = true;
  if (e.key === ' ') { e.preventDefault(); jump(); }
  if (e.key === 'r' || e.key === 'R') {
    if (G.playing && !G.reloading && G.ammo < curW.mag && G.reserve > 0) {
      G.reloading = true; G.reloadT = 0; G.reloadCD = curW.reload || 2; dom.reloadInd.style.display = 'block';
    }
  }
  if (e.key >= '1' && e.key <= '5') {
    const map = { '1':'p', '2':'s', '3':'a', '4':'sg', '5':'r' };
    const nk = map[e.key];
    if (nk && WPS[nk] && nk !== G.curW && G.playing) switchW(nk);
  }
  if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
    if (G.playing) {
      G.paused = !G.paused;
      dom.pause.style.display = G.paused ? 'flex' : 'none';
      if (G.paused) renderer.domElement.exitPointerLock();
      else renderer.domElement.requestPointerLock();
    }
  }
  if (e.key === 'm' || e.key === 'M') {
    soundOn = !soundOn;
    if (!soundOn) stopAmbient(); else startAmbient();
    updateSndUI();
  }
});

document.addEventListener('keyup', e => {
  const mapped = keyMap[e.key];
  if (mapped) G.wsad[wsadIdx[mapped]] = false;
});

document.addEventListener('mousedown', e => {
  if (e.button === 0) {
    mouseDown = true;
    if (G.playing && !G.paused) {
      if (!audioInit) initAudio();
      shoot();
    }
  }
});

document.addEventListener('mouseup', e => { if (e.button === 0) mouseDown = false; });

document.addEventListener('mousemove', e => {
  if (document.pointerLockElement === renderer.domElement) {
    const sens = parseFloat(dom.sensSlider.value) || 2;
    cam.rotation.y -= e.movementX * 0.001 * sens;
    cam.rotation.x -= e.movementY * 0.001 * sens;
    cam.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, cam.rotation.x));
  }
});

renderer.domElement.addEventListener('click', () => { if (G.playing && !G.paused) renderer.domElement.requestPointerLock(); });

let mouseDown = false;


function updateSndUI() {
  const icon = soundOn ? '🔊' : '🔇';
  dom.menuSnd.textContent = icon;
  dom.hudSndBtn.textContent = icon;
  dom.sndToggle.textContent = soundOn ? 'ON' : 'OFF';
  dom.sndToggle.classList.toggle('off', !soundOn);
}

dom.sensSlider.addEventListener('input', () => {
  dom.sensVal.textContent = parseFloat(dom.sensSlider.value).toFixed(1);
});

function populateWSGrid() {
  dom.wsGrid.innerHTML = '';
  Object.keys(WPS).forEach(k => {
    const w = WPS[k];
    const card = document.createElement('div'); card.className = 'ws-card';
    if (k === G.curW) card.classList.add('active');
    card.innerHTML = `<div class="ws-icon">${w.icon}</div><div class="ws-name">${w.name}</div><div class="ws-stat">DANO: ${w.dmg} · CADENCIA: ${(1/w.rof).toFixed(0)}/s</div>`;
    card.addEventListener('click', () => {
      dom.wsGrid.querySelectorAll('.ws-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
    dom.wsGrid.appendChild(card);
  });
}

function populateDiffGrid() {
  dom.diffGrid.innerHTML = '';
  DIFFICULTIES.forEach((d, i) => {
    const card = document.createElement('div');
    card.className = `diff-card${d === curDiff ? ' active' : ''}`;
    card.innerHTML = `<div class="diff-name">${d.name}</div><div class="diff-desc">${d.desc}</div><div class="diff-bonus">Puntos x${d.bonus}</div>`;
    card.addEventListener('click', () => {
      dom.diffGrid.querySelectorAll('.diff-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      curDiff = d;
      dom.menuDifficulty.textContent = d.name;
    });
    dom.diffGrid.appendChild(card);
  });
}

$('btnPlay').addEventListener('click', () => { initAudio(); resetGame(curDiff); });
$('btnWeaponSelect').addEventListener('click', () => { dom.menu.style.display = 'none'; $('weaponSelect').style.display = 'flex'; populateWSGrid(); });
$('btnCloseWS').addEventListener('click', () => { $('weaponSelect').style.display = 'none'; dom.menu.style.display = 'flex'; });
$('btnDifficulty').addEventListener('click', () => { dom.menu.style.display = 'none'; $('diffSelect').style.display = 'flex'; populateDiffGrid(); });
$('btnCloseDiff').addEventListener('click', () => { $('diffSelect').style.display = 'none'; dom.menu.style.display = 'flex'; });
$('btnSettings').addEventListener('click', () => { dom.menu.style.display = 'none'; $('settingsModal').style.display = 'flex'; });
$('btnCloseSettings').addEventListener('click', () => { $('settingsModal').style.display = 'none'; dom.menu.style.display = 'flex'; });
dom.sndToggle.addEventListener('click', () => { soundOn = !soundOn; if (!soundOn) stopAmbient(); else startAmbient(); updateSndUI(); });
$('btnScores').addEventListener('click', () => { dom.menu.style.display = 'none'; $('scoresModal').style.display = 'flex'; showTopScores(dom.scoresBody, 10); });
$('btnCloseScores').addEventListener('click', () => { $('scoresModal').style.display = 'none'; dom.menu.style.display = 'flex'; });
$('btnControls').addEventListener('click', () => { dom.menu.style.display = 'none'; dom.controls.style.display = 'flex'; });
$('btnCloseControls').addEventListener('click', () => { dom.controls.style.display = 'none'; dom.menu.style.display = 'flex'; });
dom.hudSndBtn.addEventListener('click', () => { soundOn = !soundOn; if (!soundOn) stopAmbient(); else startAmbient(); updateSndUI(); });
$('btnRestart').addEventListener('click', () => { dom.go.style.display = 'none'; resetGame(curDiff); });
$('btnMenu').addEventListener('click', () => { dom.go.style.display = 'none'; dom.menu.style.display = 'flex'; });
$('btnResume').addEventListener('click', () => { G.paused = false; dom.pause.style.display = 'none'; renderer.domElement.requestPointerLock(); });
$('btnPauseMenu').addEventListener('click', () => {
  G.playing = false; G.paused = false;
  dom.pause.style.display = 'none'; dom.hud.style.display = 'none';
  dom.menu.style.display = 'flex';
  cleanupScene();
});

window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight;
  cam.aspect = w / h; cam.updateProjectionMatrix();
  renderer.setSize(w, h);
});

const WEAPON_UPGRADES = {
  p: { level: 1, maxLevel: 5, costs: [0, 200, 500, 1000, 2000], bonuses: [
    { dmgMul: 1, spreadMul: 1, rofMul: 1, magMul: 1 },
    { dmgMul: 1.2, spreadMul: 0.9, rofMul: 0.95, magMul: 1.2 },
    { dmgMul: 1.4, spreadMul: 0.8, rofMul: 0.9, magMul: 1.4 },
    { dmgMul: 1.7, spreadMul: 0.7, rofMul: 0.85, magMul: 1.6 },
    { dmgMul: 2.0, spreadMul: 0.6, rofMul: 0.8, magMul: 2.0 },
  ]},
  s: { level: 1, maxLevel: 5, costs: [0, 250, 600, 1200, 2500], bonuses: [
    { dmgMul: 1, spreadMul: 1, rofMul: 1, magMul: 1 },
    { dmgMul: 1.15, spreadMul: 0.9, rofMul: 0.95, magMul: 1.15 },
    { dmgMul: 1.3, spreadMul: 0.8, rofMul: 0.9, magMul: 1.3 },
    { dmgMul: 1.5, spreadMul: 0.7, rofMul: 0.85, magMul: 1.5 },
    { dmgMul: 1.8, spreadMul: 0.6, rofMul: 0.8, magMul: 1.8 },
  ]},
  a: { level: 1, maxLevel: 5, costs: [0, 300, 700, 1400, 3000], bonuses: [
    { dmgMul: 1, spreadMul: 1, rofMul: 1, magMul: 1 },
    { dmgMul: 1.2, spreadMul: 0.85, rofMul: 0.95, magMul: 1.15 },
    { dmgMul: 1.4, spreadMul: 0.75, rofMul: 0.9, magMul: 1.3 },
    { dmgMul: 1.6, spreadMul: 0.65, rofMul: 0.85, magMul: 1.5 },
    { dmgMul: 2.0, spreadMul: 0.55, rofMul: 0.8, magMul: 2.0 },
  ]},
  sg: { level: 1, maxLevel: 5, costs: [0, 250, 600, 1200, 2500], bonuses: [
    { dmgMul: 1, spreadMul: 1, rofMul: 1, magMul: 1 },
    { dmgMul: 1.2, spreadMul: 0.9, rofMul: 0.95, magMul: 1.15 },
    { dmgMul: 1.4, spreadMul: 0.85, rofMul: 0.9, magMul: 1.3 },
    { dmgMul: 1.6, spreadMul: 0.8, rofMul: 0.85, magMul: 1.5 },
    { dmgMul: 2.0, spreadMul: 0.7, rofMul: 0.8, magMul: 2.0 },
  ]},
  r: { level: 1, maxLevel: 5, costs: [0, 400, 900, 1800, 4000], bonuses: [
    { dmgMul: 1, spreadMul: 1, rofMul: 1, magMul: 1 },
    { dmgMul: 1.3, spreadMul: 0.9, rofMul: 0.95, magMul: 1.2 },
    { dmgMul: 1.6, spreadMul: 0.8, rofMul: 0.9, magMul: 1.4 },
    { dmgMul: 2.0, spreadMul: 0.7, rofMul: 0.85, magMul: 1.6 },
    { dmgMul: 2.5, spreadMul: 0.6, rofMul: 0.8, magMul: 2.0 },
  ]},
  sn: { level: 1, maxLevel: 5, costs: [0, 400, 1000, 2000, 4500], bonuses: [
    { dmgMul: 1, spreadMul: 1, rofMul: 1, magMul: 1 },
    { dmgMul: 1.3, spreadMul: 0.8, rofMul: 0.95, magMul: 1.2 },
    { dmgMul: 1.6, spreadMul: 0.7, rofMul: 0.9, magMul: 1.4 },
    { dmgMul: 2.0, spreadMul: 0.6, rofMul: 0.85, magMul: 1.6 },
    { dmgMul: 2.5, spreadMul: 0.5, rofMul: 0.8, magMul: 2.0 },
  ]},
  mg: { level: 1, maxLevel: 5, costs: [0, 500, 1200, 2500, 5000], bonuses: [
    { dmgMul: 1, spreadMul: 1, rofMul: 1, magMul: 1 },
    { dmgMul: 1.15, spreadMul: 0.9, rofMul: 0.95, magMul: 1.2 },
    { dmgMul: 1.3, spreadMul: 0.8, rofMul: 0.9, magMul: 1.4 },
    { dmgMul: 1.5, spreadMul: 0.7, rofMul: 0.85, magMul: 1.6 },
    { dmgMul: 1.8, spreadMul: 0.6, rofMul: 0.8, magMul: 2.0 },
  ]},
  fl: { level: 1, maxLevel: 5, costs: [0, 350, 800, 1600, 3500], bonuses: [
    { dmgMul: 1, spreadMul: 1, rofMul: 1, magMul: 1 },
    { dmgMul: 1.2, spreadMul: 1.1, rofMul: 0.95, magMul: 1.2 },
    { dmgMul: 1.4, spreadMul: 1.2, rofMul: 0.9, magMul: 1.4 },
    { dmgMul: 1.7, spreadMul: 1.3, rofMul: 0.85, magMul: 1.6 },
    { dmgMul: 2.0, spreadMul: 1.5, rofMul: 0.8, magMul: 2.0 },
  ]},
  gl: { level: 1, maxLevel: 5, costs: [0, 450, 1100, 2200, 4800], bonuses: [
    { dmgMul: 1, spreadMul: 1, rofMul: 1, magMul: 1 },
    { dmgMul: 1.3, spreadMul: 0.9, rofMul: 0.95, magMul: 1.2 },
    { dmgMul: 1.6, spreadMul: 0.8, rofMul: 0.9, magMul: 1.4 },
    { dmgMul: 2.0, spreadMul: 0.7, rofMul: 0.85, magMul: 1.6 },
    { dmgMul: 2.5, spreadMul: 0.6, rofMul: 0.8, magMul: 2.0 },
  ]},
  lb: { level: 1, maxLevel: 5, costs: [0, 600, 1500, 3000, 6000], bonuses: [
    { dmgMul: 1, spreadMul: 1, rofMul: 1, magMul: 1 },
    { dmgMul: 1.2, spreadMul: 0.9, rofMul: 0.95, magMul: 1.2 },
    { dmgMul: 1.5, spreadMul: 0.8, rofMul: 0.9, magMul: 1.4 },
    { dmgMul: 1.8, spreadMul: 0.7, rofMul: 0.85, magMul: 1.6 },
    { dmgMul: 2.2, spreadMul: 0.6, rofMul: 0.8, magMul: 2.0 },
  ]},
};

function getWeaponUpgrade(id) {
  const u = WEAPON_UPGRADES[id];
  if (!u) return { dmgMul: 1, spreadMul: 1, rofMul: 1, magMul: 1 };
  return u.bonuses[Math.min(u.level - 1, u.bonuses.length - 1)];
}

function upgradeWeapon(id) {
  const u = WEAPON_UPGRADES[id];
  if (!u || u.level >= u.maxLevel) return false;
  const cost = u.costs[u.level];
  if (G.score < cost) return false;
  G.score -= cost;
  u.level++;
  return true;
}

function resetWeaponUpgrades() {
  for (const key of Object.keys(WEAPON_UPGRADES)) {
    WEAPON_UPGRADES[key].level = 1;
  }
}

const ACHIEVEMENTS = {
  list: [],
  definitions: [
    { id: 'first_kill', name: 'PRIMERA BAJA', desc: 'Mata tu primer zombie', check: () => G.totalKills >= 1, reward: 100, icon: '💀' },
    { id: 'kill_100', name: 'CARNICERO', desc: 'Mata 100 zombies', check: () => G.totalKills >= 100, reward: 500, icon: '🔪' },
    { id: 'kill_500', name: 'MATAFANATAS', desc: 'Mata 500 zombies', check: () => G.totalKills >= 500, reward: 2000, icon: '☠️' },
    { id: 'kill_1000', name: 'LEYENDA', desc: 'Mata 1000 zombies', check: () => G.totalKills >= 1000, reward: 5000, icon: '👑' },
    { id: 'wave_5', name: 'SUPERVIVIENTE', desc: 'Alcanza oleada 5', check: () => G.wave >= 5, reward: 300, icon: '🌊' },
    { id: 'wave_10', name: 'VETERANO', desc: 'Alcanza oleada 10', check: () => G.wave >= 10, reward: 800, icon: '⚔️' },
    { id: 'wave_20', name: 'INMORTAL', desc: 'Alcanza oleada 20', check: () => G.wave >= 20, reward: 2500, icon: '🛡️' },
    { id: 'wave_50', name: 'DIOS DE LA GUERRA', desc: 'Alcanza oleada 50', check: () => G.wave >= 50, reward: 10000, icon: '⚡' },
    { id: 'boss_1', name: 'CAZADOR DE JEFES', desc: 'Derrota tu primer jefe', check: () => (G.bossesKilled || 0) >= 1, reward: 500, icon: '🏆' },
    { id: 'boss_5', name: 'DESTROZAJEFES', desc: 'Derrota 5 jefes', check: () => (G.bossesKilled || 0) >= 5, reward: 3000, icon: '🏅' },
    { id: 'boss_10', name: 'ASESINO DE TITANES', desc: 'Derrota 10 jefes', check: () => (G.bossesKilled || 0) >= 10, reward: 8000, icon: '💎' },
    { id: 'streak_10', name: 'RACHA FEROZ', desc: 'Consigue racha de 10', check: () => G.maxStreak >= 10, reward: 500, icon: '🔥' },
    { id: 'streak_25', name: 'INCONTENIBLE', desc: 'Consigue racha de 25', check: () => G.maxStreak >= 25, reward: 2000, icon: '💥' },
    { id: 'streak_50', name: 'MAQUINA DE MATAR', desc: 'Consigue racha de 50', check: () => G.maxStreak >= 50, reward: 5000, icon: '🌟' },
    { id: 'score_10k', name: 'ACUMULADOR', desc: 'Consigue 10000 puntos', check: () => G.score >= 10000, reward: 1000, icon: '💰' },
    { id: 'score_50k', name: 'MILLONARIO', desc: 'Consigue 50000 puntos', check: () => G.score >= 50000, reward: 5000, icon: '💎' },
    { id: 'score_100k', name: 'IMPERIO', desc: 'Consigue 100000 puntos', check: () => G.score >= 100000, reward: 15000, icon: '👑' },
    { id: 'hs_50', name: 'TIRO AL BLANCO', desc: 'Consigue 50 headshots', check: () => (G.totalHeadshots || 0) >= 50, reward: 800, icon: '🎯' },
    { id: 'hs_200', name: 'OJOS DE HAWK', desc: 'Consigue 200 headshots', check: () => (G.totalHeadshots || 0) >= 200, reward: 3000, icon: '🦅' },
    { id: 'all_weapons', name: 'ARSENAL COMPLETO', desc: 'Desbloquea todas las armas', check: () => { for (const key of Object.keys(WUNLOCK)) { if (G.wave < WUNLOCK[key]) return false; } return true; }, reward: 5000, icon: '🔫' },
    { id: 'no_damage_wave', name: 'INTOCABLE', desc: 'Completa una oleada sin recibir daño', check: () => G.noDamageWave, reward: 1000, icon: '✨' },
    { id: 'speed_demon', name: 'DEMONIO DE VELOCIDAD', desc: 'Mata 10 zombies en 5 segundos', check: () => (G.speedKills || 0) >= 10, reward: 1500, icon: '⚡' },
    { id: 'explosive_chain', name: 'CADENA EXPLOSIVA', desc: 'Explota 5 explosivos en cadena', check: () => (G.explosiveChains || 0) >= 5, reward: 2000, icon: '💣' },
    { id: 'survive_night', name: 'NOCHE DE TERROR', desc: 'Sobrevive a la noche', check: () => G.survivedNight, reward: 800, icon: '🌙' },
  ],
};

function checkAchievements() {
  for (const ach of ACHIEVEMENTS.definitions) {
    if (ACHIEVEMENTS.list.includes(ach.id)) continue;
    if (ach.check()) {
      ACHIEVEMENTS.list.push(ach.id);
      G.score += ach.reward;
      showStreakMsg(`LOGRO: ${ach.name}`, `${ach.desc} (+${ach.reward})`, 0xffd700);
    }
  }
}

const BULLET_TRACERS = [];
const MAX_TRACERS = 30;

function spawnTracer(from, to, color) {
  if (BULLET_TRACERS.length >= MAX_TRACERS) {
    const old = BULLET_TRACERS.shift();
    scene.remove(old.mesh);
  }
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = dir.length();
  dir.normalize();
  const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), dir.multiplyScalar(len)]);
  const mat = new THREE.LineBasicMaterial({ color: color || 0xffff88, transparent: true, opacity: 0.6 });
  const line = new THREE.Line(geo, mat);
  line.position.copy(from);
  scene.add(line);
  BULLET_TRACERS.push({ mesh: line, life: 0.1 });
}

function updateTracers(dt) {
  for (let i = BULLET_TRACERS.length - 1; i >= 0; i--) {
    BULLET_TRACERS[i].life -= dt;
    BULLET_TRACERS[i].mesh.material.opacity = BULLET_TRACERS[i].life * 6;
    if (BULLET_TRACERS[i].life <= 0) {
      scene.remove(BULLET_TRACERS[i].mesh);
      BULLET_TRACERS.splice(i, 1);
    }
  }
}

// MUZZLE_FLASHES now defined later in enhanced systems section

const SCREEN_EFFECTS = {
  chromatic: 0,
  vignette: 0,
  speedLines: 0,
  radialBlur: 0,
};

function applyScreenEffects(dt) {
  if (G.hp < G.maxHp * 0.3) {
    SCREEN_EFFECTS.vignette = Math.min(1, SCREEN_EFFECTS.vignette + dt * 2);
  } else {
    SCREEN_EFFECTS.vignette = Math.max(0, SCREEN_EFFECTS.vignette - dt * 3);
  }
  if (G.speedBoost > 0) {
    SCREEN_EFFECTS.speedLines = Math.min(1, SCREEN_EFFECTS.speedLines + dt * 4);
  } else {
    SCREEN_EFFECTS.speedLines = Math.max(0, SCREEN_EFFECTS.speedLines - dt * 3);
  }
  if (G.rageTimer > 0) {
    SCREEN_EFFECTS.chromatic = Math.min(1, SCREEN_EFFECTS.chromatic + dt * 3);
  } else {
    SCREEN_EFFECTS.chromatic = Math.max(0, SCREEN_EFFECTS.chromatic - dt * 4);
  }
  if (dom.dmgOverlay) {
    dom.dmgOverlay.style.opacity = SCREEN_EFFECTS.vignette * 0.4;
  }
}

// ZOMBIE_ANIM and updateZombieAnimations replaced by ZOMBIE_ANIM.updateAnimation in enhanced systems



const CARGO_CRATES = [];
function spawnCargoCrate(x, z) {
  const g = new THREE.Group();
  const crate = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.6, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x887755, roughness: 0.8 })
  );
  crate.position.y = 0.3; crate.castShadow = true; g.add(crate);
  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.06, 0.62),
    new THREE.MeshStandardMaterial({ color: 0xcc4444 })
  );
  stripe.position.y = 0.3; g.add(stripe);
  g.position.set(x, 0, z); scene.add(g);
  CARGO_CRATES.push({ pos: new THREE.Vector3(x, 0, z), radius: 1.5, active: true });
}

function updateCargoCrates(dt) {
  for (const c of CARGO_CRATES) {
    if (!c.active) continue;
    if (cam.position.distanceTo(c.pos) < c.radius) {
      c.active = false;
      scene.remove(c);
      G.score += 50;
      const bonus = Math.floor(Math.random() * 3);
      spawnPickup(c.pos, bonus);
      spawnParticles(c.pos, 0x887755, 8);
      snd('pickup');
    }
  }
}

for (let ci = 0; ci < 8; ci++) {
  const ca = ci / 8 * Math.PI * 2 + 0.3;
  spawnCargoCrate(Math.cos(ca) * 25 + (Math.random()-0.5)*10, Math.sin(ca) * 25 + (Math.random()-0.5)*10);
}

const DYNAMIC_LIGHTS = [];
function addDynamicLight(x, y, z, color, intensity, range) {
  const light = new THREE.PointLight(color || 0xffffff, intensity || 0.5, range || 5);
  light.position.set(x, y || 1, z);
  scene.add(light);
  DYNAMIC_LIGHTS.push({ light, timer: 5 + Math.random() * 10 });
}

for (let di = 0; di < 12; di++) {
  const da = di / 12 * Math.PI * 2;
  const dr = 20 + Math.random() * 40;
  addDynamicLight(Math.cos(da) * dr, 0.5 + Math.random(), Math.sin(da) * dr, 0xff4400, 0.3, 4);
}

function updateDynamicLights(dt) {
  for (const dl of DYNAMIC_LIGHTS) {
    dl.timer -= dt;
    if (dl.timer <= 0) {
      dl.light.intensity = dl.light.intensity > 0.1 ? 0 : 0.3 + Math.random() * 0.3;
      dl.timer = 2 + Math.random() * 8;
    }
  }
}

const FLOATING_TEXTS = [];
function spawnFloatingText(pos, text, color, size) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.font = `bold ${size || 24}px Orbitron, sans-serif`;
  ctx.fillStyle = `#${(color || 0xffffff).toString(16).padStart(6, '0')}`;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.textAlign = 'center';
  ctx.strokeText(text, 128, 40);
  ctx.fillText(text, 128, 40);
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.position.copy(pos); sprite.position.y += 1;
  sprite.scale.set(1.5, 0.4, 1);
  scene.add(sprite);
  FLOATING_TEXTS.push({ sprite, vel: new THREE.Vector3(0, 2, 0), life: 1.5, maxLife: 1.5 });
}

function updateFloatingTexts(dt) {
  for (let i = FLOATING_TEXTS.length - 1; i >= 0; i--) {
    const ft = FLOATING_TEXTS[i];
    ft.life -= dt;
    ft.sprite.position.addScaledVector(ft.vel, dt);
    ft.vel.y -= dt * 2;
    ft.sprite.material.opacity = Math.max(0, ft.life / ft.maxLife);
    ft.sprite.scale.x += dt * 0.5;
    if (ft.life <= 0) {
      scene.remove(ft.sprite);
      ft.sprite.material.map.dispose();
      ft.sprite.material.dispose();
      FLOATING_TEXTS.splice(i, 1);
    }
  }
}

const ZOMBIE_CORPSES = [];
const MAX_CORPSES = 50;

function spawnCorpse(pos, type) {
  if (ZOMBIE_CORPSES.length >= MAX_CORPSES) {
    const old = ZOMBIE_CORPSES.shift();
    scene.remove(old.mesh);
  }
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.1, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x333322, roughness: 0.95 })
  );
  body.position.y = 0.05; body.rotation.z = Math.PI / 2; g.add(body);
  const blood = new THREE.Mesh(
    new THREE.CircleGeometry(0.3, 6),
    new THREE.MeshBasicMaterial({ color: 0x441111, transparent: true, opacity: 0.4 })
  );
  blood.rotation.x = -Math.PI / 2; blood.position.y = 0.01; g.add(blood);
  g.position.copy(pos);
  g.rotation.y = Math.random() * Math.PI * 2;
  scene.add(g);
  ZOMBIE_CORPSES.push({ mesh: g, life: 15 + Math.random() * 10 });
}

function updateCorpses(dt) {
  for (let i = ZOMBIE_CORPSES.length - 1; i >= 0; i--) {
    ZOMBIE_CORPSES[i].life -= dt;
    if (ZOMBIE_CORPSES[i].life < 5) {
      ZOMBIE_CORPSES[i].mesh.children.forEach(c => {
        if (c.material) c.material.opacity = Math.max(0, ZOMBIE_CORPSES[i].life / 5);
      });
    }
    if (ZOMBIE_CORPSES[i].life <= 0) {
      scene.remove(ZOMBIE_CORPSES[i].mesh);
      ZOMBIE_CORPSES.splice(i, 1);
    }
  }
}

const EXPLOSION_DECALS = [];
function spawnExplosionDecal(pos) {
  const decal = new THREE.Mesh(
    new THREE.CircleGeometry(1.5 + Math.random(), 8),
    new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
  );
  decal.rotation.x = -Math.PI / 2;
  decal.position.set(pos.x, 0.006, pos.z);
  scene.add(decal);
  EXPLOSION_DECALS.push({ mesh: decal, life: 20 + Math.random() * 15 });
}

function updateDecals(dt) {
  for (let i = EXPLOSION_DECALS.length - 1; i >= 0; i--) {
    EXPLOSION_DECALS[i].life -= dt;
    if (EXPLOSION_DECALS[i].life < 5) {
      EXPLOSION_DECALS[i].mesh.material.opacity = Math.max(0, EXPLOSION_DECALS[i].life / 5) * 0.3;
    }
    if (EXPLOSION_DECALS[i].life <= 0) {
      scene.remove(EXPLOSION_DECALS[i].mesh);
      EXPLOSION_DECALS.splice(i, 1);
    }
  }
}

const WAVE_EVENTS = {
  bonusWaves: [10, 20, 30, 50, 75, 100],
  specialWaves: [],
};

function checkWaveEvents() {
  if (WAVE_EVENTS.bonusWaves.includes(G.wave)) {
    G.score += G.wave * 100;
    showStreakMsg(`OLEADA ESPECIAL ${G.wave}!`, `+${G.wave * 100} bonus`, 0xffd700);
    for (let bi = 0; bi < 5; bi++) {
      spawnPickup(cam.position.clone().add(new THREE.Vector3((Math.random()-0.5)*4, 0, (Math.random()-0.5)*4)), bi % 3);
    }
  }
  if (G.wave % 10 === 0 && G.wave > 0) {
    POWERUPS.doubleScore.timer = 15;
    showStreakMsg('DOUBLE SCORE!', 'x2 puntos por 15 segundos', 0xff8800);
  }
}

const WAVE_BONUS_TYPES = [
  { name: 'HORDA', chance: 0.15, modifier: (count) => count * 2, desc: 'x2 zombies' },
  { name: 'RAPIDOS', chance: 0.1, modifier: (count) => count, desc: 'Zombies mas rapidos', fast: true },
  { name: 'TANQUES', chance: 0.08, modifier: (count) => Math.ceil(count * 0.7), desc: 'Mas tanques', tanky: true },
  { name: 'MIXTA', chance: 0.12, modifier: (count) => count, desc: 'Todos los tipos' },
  { name: 'ASESINOS', chance: 0.07, modifier: (count) => Math.ceil(count * 0.6), desc: 'Stalkers + Runners', assassin: true },
  { name: 'EXPLOSIVA', chance: 0.06, modifier: (count) => count, desc: 'Muchos explosivos', explosive: true },
];

function rollWaveModifier() {
  let r = Math.random();
  for (const event of WAVE_BONUS_TYPES) {
    r -= event.chance;
    if (r <= 0) return event;
  }
  return null;
}

const ZOMBIE_LOOT_TABLE = [
  { chance: 0.02, type: 2, name: 'Municion Premium', color: 0xffff44 },
  { chance: 0.05, type: 1, name: 'Armadura', color: 0x4488ff },
  { chance: 0.10, type: 0, name: 'Salud', color: 0x44ff44 },
];

function rollLoot() {
  let r = Math.random();
  for (const loot of ZOMBIE_LOOT_TABLE) {
    r -= loot.chance;
    if (r <= 0) return loot;
  }
  return null;
}

const AMBIENT_PARTICLES = [];
function spawnAmbientParticle() {
  if (AMBIENT_PARTICLES.length > 30) return;
  const particle = new THREE.Mesh(
    new THREE.SphereGeometry(0.01, 3, 3),
    new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.2 })
  );
  particle.position.set(
    cam.position.x + (Math.random()-0.5) * 20,
    cam.position.y + Math.random() * 5,
    cam.position.z + (Math.random()-0.5) * 20
  );
  particle.userData = {
    vel: new THREE.Vector3((Math.random()-0.5)*0.5, Math.random()*0.3, (Math.random()-0.5)*0.5),
    life: 3 + Math.random() * 3
  };
  scene.add(particle);
  AMBIENT_PARTICLES.push(particle);
}

function updateAmbientParticles(dt) {
  for (let i = AMBIENT_PARTICLES.length - 1; i >= 0; i--) {
    const p = AMBIENT_PARTICLES[i];
    p.userData.life -= dt;
    p.position.addScaledVector(p.userData.vel, dt);
    p.material.opacity = Math.max(0, p.userData.life / 6) * 0.2;
    if (p.userData.life <= 0) {
      scene.remove(p);
      AMBIENT_PARTICLES.splice(i, 1);
    }
  }
}

const DRONE_CAMERA = {
  active: false,
  pos: new THREE.Vector3(0, 20, 0),
  target: new THREE.Vector3(0, 0, 0),
  timer: 0,
};

function activateDroneView() {
  DRONE_CAMERA.active = true;
  DRONE_CAMERA.pos.set(cam.position.x, 25, cam.position.z + 10);
  DRONE_CAMERA.timer = 5;
}

function updateDroneCamera(dt) {
  if (!DRONE_CAMERA.active) return;
  DRONE_CAMERA.timer -= dt;
  DRONE_CAMERA.pos.x += Math.sin(DRONE_CAMERA.timer * 0.5) * dt * 3;
  DRONE_CAMERA.pos.z += Math.cos(DRONE_CAMERA.timer * 0.5) * dt * 3;
  if (DRONE_CAMERA.timer <= 0) {
    DRONE_CAMERA.active = false;
  }
}

const WEATHER_EFFECTS = {
  thunderShake: 0,
  rainIntensity: 0,
  windGust: 0,
};

function updateWeatherEffects(dt) {
  if (WEATHER.current === 'storm') {
    WEATHER_EFFECTS.thunderShake *= 0.95;
    WEATHER_EFFECTS.windGust = Math.sin(Date.now() * 0.001) * 2;
    if (Math.random() < 0.001) {
      WEATHER_EFFECTS.thunderShake = 0.3;
    }
    screenShake = Math.max(screenShake, WEATHER_EFFECTS.thunderShake);
  }
  WEATHER_EFFECTS.rainIntensity = (WEATHER.current === 'rain' || WEATHER.current === 'storm') ? 1 : 0;
}

const PERFORMANCE = {
  drawCalls: 0,
  fps: 60,
  frameTime: 0,
  maxZombies: 50,
  lodDistance: 40,
};

function updatePerformance(dt) {
  PERFORMANCE.frameTime = dt;
  PERFORMANCE.fps = Math.round(1 / Math.max(dt, 0.001));
  PERFORMANCE.maxZombies = PERFORMANCE.fps < 30 ? 30 : PERFORMANCE.fps < 45 ? 40 : 50;
  for (const z of zombies) {
    if (!z.alive) continue;
    const dist = cam.position.distanceTo(z.g.position);
    if (dist > PERFORMANCE.lodDistance) {
      z.g.visible = false;
    } else {
      z.g.visible = true;
      if (dist > PERFORMANCE.lodDistance * 0.6) {
        z.g.children.forEach(c => { if (c.geometry) c.geometry.dispose; });
      }
    }
  }
}

const WAVE_ANNOUNCEMENTS = [
  { wave: 1, title: 'EL COMIENZO', sub: 'La horda se despierta...' },
  { wave: 5, title: 'PRIMER JEFE', sub: 'Algo grande se acerca...' },
  { wave: 10, title: 'PUNTO DE NO RETORNO', sub: 'No hay vuelta atras' },
  { wave: 15, title: 'OSCURIDAD TOTAL', sub: 'La noche se alarga...' },
  { wave: 20, title: 'APOCALIPSIS', sub: 'El mundo se desmorona' },
  { wave: 25, title: 'INFIERNO VERDE', sub: 'Las calles sangran' },
  { wave: 30, title: 'REINO DE LOS MUERTOS', sub: 'Nadie escapa' },
  { wave: 40, title: 'DESTRUCCION TOTAL', sub: 'Solo queda destruccion' },
  { wave: 50, title: 'LEGENDA ETERNA', sub: 'Sobrevives a todo...' },
  { wave: 75, title: 'INMORTAL', sub: 'Eres indestructible' },
  { wave: 100, title: 'DIOS DEL APOCALIPSIS', sub: 'Has trascendido la muerte' },
];

function checkWaveAnnouncements() {
  for (const ann of WAVE_ANNOUNCEMENTS) {
    if (G.wave === ann.wave) {
      showStreakMsg(ann.title, ann.sub, 0xff4444);
    }
  }
}

const KILL_STREAK_BONUSES = [
  { streak: 5, bonus: 100, msg: 'RACHA x5! +100' },
  { streak: 10, bonus: 250, msg: 'RACHA x10! +250' },
  { streak: 15, bonus: 500, msg: 'RACHA x15! +500' },
  { streak: 20, bonus: 1000, msg: 'RACHA x20! +1000' },
  { streak: 30, bonus: 2000, msg: 'RACHA x30! +2000' },
  { streak: 50, bonus: 5000, msg: 'RACHA x50! LEGENDARIO! +5000' },
];

function checkKillStreakBonus() {
  for (const ks of KILL_STREAK_BONUSES) {
    if (G.streaks === ks.streak) {
      G.score += ks.bonus;
      showStreakMsg(ks.msg, '', 0xffd700);
    }
  }
}

const HEADSHOT_TRACKER = {
  sessionHeadshots: 0,
  consecutive: 0,
  longestSession: 0,
  accuracy: 0,
  bestAccuracy: 0,
  damageDealt: 0,
  damageTaken: 0,
  healingReceived: 0,
  distanceTraveled: 0,
  lastPosition: new THREE.Vector3(),
  zombiesKilledByType: {},
  fastestKill: 999,
  slowestKill: 0,
  killTimes: [],
  multiKillWindow: [],
  multiKillThreshold: 3,
};

function updateHeadshotTracker(dt) {
  if (!G.playing) return;
  const currentPos = cam.position.clone();
  if (HEADSHOT_TRACKER.lastPosition.length() > 0) {
    HEADSHOT_TRACKER.distanceTraveled += currentPos.distanceTo(HEADSHOT_TRACKER.lastPosition);
  }
  HEADSHOT_TRACKER.lastPosition.copy(currentPos);
  if (G.totalShots > 0) {
    HEADSHOT_TRACKER.accuracy = Math.round((G.totalHits / G.totalShots) * 100);
  }
  HEADSHOT_TRACKER.multiKillWindow = HEADSHOT_TRACKER.multiKillWindow.filter(t => t > 0);
  for (let i = 0; i < HEADSHOT_TRACKER.multiKillWindow.length; i++) {
    HEADSHOT_TRACKER.multiKillWindow[i] -= dt;
  }
}

function trackKill(type, isHeadshot) {
  HEADSHOT_TRACKER.sessionHeadshots += isHeadshot ? 1 : 0;
  if (isHeadshot) {
    HEADSHOT_TRACKER.consecutive++;
    G.headshotStreak++;
    if (G.headshotStreak > G.longestHeadshotStreak) G.longestHeadshotStreak = G.headshotStreak;
    WEAPON_CHALLENGES.checkWeaponHeadshot(G.curW);
    GAME_STATS.trackHeadshot(G.curW);
  } else {
    HEADSHOT_TRACKER.consecutive = 0;
    G.headshotStreak = 0;
  }
  if (!HEADSHOT_TRACKER.zombiesKilledByType[type]) HEADSHOT_TRACKER.zombiesKilledByType[type] = 0;
  HEADSHOT_TRACKER.zombiesKilledByType[type]++;
  if (!G.weaponKills[G.curW]) G.weaponKills[G.curW] = 0;
  G.weaponKills[G.curW]++;
  WEAPON_CHALLENGES.checkWeaponKill(G.curW);
  GAME_STATS.trackZombieKill(type);
  ZOMBIE_LORE.discover(type);
  HEADSHOT_TRACKER.multiKillWindow.push(2.0);
  if (WEAPON_PERK_SYSTEM.perks.vampiric && WEAPON_PERK_SYSTEM.perks.vampiric.active) {
    const heal = 5 + Math.floor(G.wave * 0.5);
    G.hp = Math.min(G.hp + heal, G.maxHp);
  }
  const bloodPos = new THREE.Vector3().copy(cam.position).add(cam.getWorldDirection(new THREE.Vector3()).multiplyScalar(3));
  BLOOD_POOLS.spawn(bloodPos, 0.3 + Math.random() * 0.4);
}

const WEAPON_PERK_SYSTEM = {
  perks: {
    piercing: { name: 'PERFORANTE', desc: 'Balas atraviesan enemigos', active: false },
    explosive: { name: 'EXPLOSIVO', desc: 'Balas explotan al impacto', active: false },
    burning: { name: 'ARDIENTE', desc: 'Balas queman al enemigo', active: false },
    freezing: { name: 'CONGELANTE', desc: 'Balas ralentizan enemigos', active: false },
    vampiric: { name: 'VAMPIRICO', desc: 'Roba vida al matar', active: false },
  },
  timer: 0,
  duration: 15,
};

function activateRandomPerk() {
  const keys = Object.keys(WEAPON_PERK_SYSTEM.perks);
  const key = keys[Math.floor(Math.random() * keys.length)];
  WEAPON_PERK_SYSTEM.perks[key].active = true;
  WEAPON_PERK_SYSTEM.timer = WEAPON_PERK_SYSTEM.duration;
  showStreakMsg(`PERK: ${WEAPON_PERK_SYSTEM.perks[key].name}`, WEAPON_PERK_SYSTEM.perks[key].desc, 0x44ff88);
}

function updatePerks(dt) {
  if (WEAPON_PERK_SYSTEM.timer > 0) {
    WEAPON_PERK_SYSTEM.timer -= dt;
    if (WEAPON_PERK_SYSTEM.timer <= 0) {
      for (const key of Object.keys(WEAPON_PERK_SYSTEM.perks)) {
        WEAPON_PERK_SYSTEM.perks[key].active = false;
      }
    }
  }
}

const ZOMBIE_SPAWN_PATTERNS = [
  { name: 'circle', desc: 'Anillo de zombies', check: (wave) => wave % 4 === 0 },
  { name: 'line', desc: 'Linea de zombies', check: (wave) => wave % 6 === 0 },
  { name: 'swarm', desc: 'Enjambre caotico', check: (wave) => wave % 8 === 0 },
  { name: 'pincer', desc: 'Ataque de pinzas', check: (wave) => wave % 10 === 0 },
  { name: 'tide', desc: 'Marea de zombies', check: (wave) => wave % 12 === 0 },
];

function getSpawnPattern(wave) {
  for (const pat of ZOMBIE_SPAWN_PATTERNS) {
    if (pat.check(wave)) return pat;
  }
  return null;
}

function getPatternSpawnPos(pattern, index, total) {
  const angle = (index / total) * Math.PI * 2;
  switch (pattern) {
    case 'circle':
      return new THREE.Vector3(Math.cos(angle) * 30, 0, Math.sin(angle) * 30);
    case 'line':
      return new THREE.Vector3(-40 + (index / total) * 80, 0, (Math.random() - 0.5) * 5);
    case 'swarm':
      return new THREE.Vector3(cam.position.x + (Math.random() - 0.5) * 40, 0, cam.position.z + (Math.random() - 0.5) * 40);
    case 'pincer': {
      const side = index % 2 === 0 ? -1 : 1;
      return new THREE.Vector3(cam.position.x + side * 30, 0, cam.position.z + (index / total) * 20 - 10);
    }
    case 'tide':
      return new THREE.Vector3(cam.position.x + (Math.random() - 0.5) * 50, 0, cam.position.z + 40 + Math.random() * 10);
    default:
      return new THREE.Vector3(cam.position.x + (Math.random() - 0.5) * 40, 0, cam.position.z + (Math.random() - 0.5) * 40);
  }
}

const WAVE_REWARDS = {
  healthRestore: { base: 10, perWave: 1 },
  armorRestore: { base: 5, perWave: 0.5 },
  ammoRestore: { base: 5, perWave: 1 },
  scoreBonus: { base: 50, perWave: 10 },
};

function getWaveReward(wave) {
  return {
    health: Math.min(30, WAVE_REWARDS.healthRestore.base + wave * WAVE_REWARDS.healthRestore.perWave),
    armor: Math.min(20, WAVE_REWARDS.armorRestore.base + Math.floor(wave * WAVE_REWARDS.armorRestore.perWave)),
    ammo: Math.min(30, WAVE_REWARDS.ammoRestore.base + wave * WAVE_REWARDS.ammoRestore.perWave),
    score: WAVE_REWARDS.scoreBonus.base + wave * WAVE_REWARDS.scoreBonus.perWave,
  };
}

function applyWaveReward(wave) {
  const reward = getWaveReward(wave);
  G.hp = Math.min(G.maxHp, G.hp + reward.health);
  G.armor = Math.min(100, G.armor + reward.armor);
  G.reserve += reward.ammo;
  G.score += reward.score;
  G.wavesCompleted++;
  G.totalWaveTime += wave * 15;
  G.avgWaveTime = G.totalWaveTime / G.wavesCompleted;
  if (wave < G.fastestWave) G.fastestWave = wave;
  if (wave > G.slowestWave) G.slowestWave = wave;
}

const DIFFICULTY_SCALING = {
  zombieSpeedMultiplier(wave) { return 1 + wave * 0.015; },
  zombieHPMultiplier(wave) { return 1 + wave * 0.02; },
  zombieDmgMultiplier(wave) { return 1 + wave * 0.01; },
  spawnRateMultiplier(wave) { return 1 + wave * 0.025; },
  maxZombies(wave) { return Math.min(60, 10 + wave * 2); },
  bossHPMultiplier(wave) { return 1 + Math.floor(wave / 5) * 0.4; },
  bossSpeedMultiplier(wave) { return 1 + Math.floor(wave / 5) * 0.15; },
  specialZombieChance(wave) { return Math.min(0.6, 0.05 + wave * 0.02); },
  eliteZombieChance(wave) { return Math.min(0.3, wave * 0.01); },
};

const ZOMBIE_ELITE_TYPES = ['brute', 'tank', 'shielder'];
function spawnEliteZombie(wave) {
  if (Math.random() < DIFFICULTY_SCALING.eliteZombieChance(wave)) {
    const eliteType = ZOMBIE_ELITE_TYPES[Math.floor(Math.random() * ZOMBIE_ELITE_TYPES.length)];
    const pos = new THREE.Vector3(
      cam.position.x + (Math.random() - 0.5) * 60,
      0,
      cam.position.z + (Math.random() - 0.5) * 60
    );
    pos.x = Math.max(-HALF + 5, Math.min(HALF - 5, pos.x));
    pos.z = Math.max(-HALF + 5, Math.min(HALF - 5, pos.z));
    const z = createZombie(eliteType, pos, (G._waveScale || 1) * 1.5);
    z.hp *= 2; z.maxHp *= 2; z.spd *= 1.2;
    z.g.traverse(c => {
      if (c.material && c.material.emissive) {
        c.material.emissive.set(0xff8800);
        c.material.emissiveIntensity = 0.3;
      }
    });
    zombies.push(z);
  }
}

const ENVIRONMENTAL_INTERACTIONS = {
  explosiveBarrels: true,
  firePits: true,
  toxicPools: true,
  electricFences: true,
  carExplosions: true,
  craneDrops: true,
};

function checkExplosiveChain(x, z, radius) {
  let chainCount = 0;
  for (const hb of hazmatBarrels) {
    const dist = new THREE.Vector2(x, z).distanceTo(new THREE.Vector2(hb.pos.x, hb.pos.z));
    if (dist < radius + hb.radius && dist > 0.1) {
      chainCount++;
      spawnExplosion(hb.pos.clone(), 3);
      hb.pos.y = -100;
      for (const z2 of zombies) {
        if (!z2.alive) continue;
        if (z2.getPos().distanceTo(hb.pos) < 3) {
          z2.takeDamage(300, false);
        }
      }
      if (boss && boss.alive && boss.getPos().distanceTo(hb.pos) < 3) {
        boss.takeDamage(200, false);
      }
    }
  }
  if (chainCount > 0) {
    G.explosiveChains = (G.explosiveChains || 0) + chainCount;
    if (chainCount >= 3) {
      showStreakMsg('CADENA EXPLOSIVA!', `${chainCount} barriles!`, 0xff4400);
    }
  }
}

const WEATHER_AMBIENT = {
  rainVolume: 0,
  windVolume: 0,
  thunderTimer: 0,
  fogParticles: [],
};

function updateWeatherAmbient(dt) {
  if (WEATHER.current === 'rain' || WEATHER.current === 'storm') {
    WEATHER_AMBIENT.rainVolume = Math.min(1, WEATHER_AMBIENT.rainVolume + dt * 2);
  } else {
    WEATHER_AMBIENT.rainVolume = Math.max(0, WEATHER_AMBIENT.rainVolume - dt);
  }
  WEATHER_AMBIENT.windVolume = WEATHER.wind.strength;
  if (WEATHER.current === 'fog' || WEATHER.current === 'storm') {
    if (WEATHER_AMBIENT.fogParticles.length < 20) {
      const fogP = new THREE.Mesh(
        new THREE.SphereGeometry(0.5 + Math.random() * 1.0, 5, 5),
        new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.05 })
      );
      fogP.position.set(
        cam.position.x + (Math.random() - 0.5) * 30,
        0.5 + Math.random() * 2,
        cam.position.z + (Math.random() - 0.5) * 30
      );
      fogP.userData = { vel: new THREE.Vector3((Math.random()-0.5)*0.5, 0, (Math.random()-0.5)*0.5), life: 5 + Math.random() * 5 };
      scene.add(fogP);
      WEATHER_AMBIENT.fogParticles.push(fogP);
    }
  }
  for (let i = WEATHER_AMBIENT.fogParticles.length - 1; i >= 0; i--) {
    const fp = WEATHER_AMBIENT.fogParticles[i];
    fp.userData.life -= dt;
    fp.position.addScaledVector(fp.userData.vel, dt);
    if (WEATHER.current !== 'fog' && WEATHER.current !== 'storm') {
      fp.material.opacity = Math.max(0, fp.material.opacity - dt * 0.1);
    }
    if (fp.userData.life <= 0 || fp.material.opacity <= 0) {
      scene.remove(fp);
      WEATHER_AMBIENT.fogParticles.splice(i, 1);
    }
  }
}

const GROUND_MARKS = [];
function spawnBulletHole(pos) {
  if (GROUND_MARKS.length > 40) {
    const old = GROUND_MARKS.shift();
    scene.remove(old.mesh);
  }
  const mark = new THREE.Mesh(
    new THREE.CircleGeometry(0.03 + Math.random() * 0.02, 5),
    new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  );
  mark.rotation.x = -Math.PI / 2;
  mark.position.set(pos.x, 0.007, pos.z);
  scene.add(mark);
  GROUND_MARKS.push({ mesh: mark, life: 30 });
}

function updateGroundMarks(dt) {
  for (let i = GROUND_MARKS.length - 1; i >= 0; i--) {
    GROUND_MARKS[i].life -= dt;
    if (GROUND_MARKS[i].life < 5) {
      GROUND_MARKS[i].mesh.material.opacity = (GROUND_MARKS[i].life / 5) * 0.5;
    }
    if (GROUND_MARKS[i].life <= 0) {
      scene.remove(GROUND_MARKS[i].mesh);
      GROUND_MARKS.splice(i, 1);
    }
  }
}

const CAMERA_EFFECTS = {
  bobTimer: 0,
  bobAmount: 0,
  tiltTarget: 0,
  tiltCurrent: 0,
  fovTarget: 75,
  fovCurrent: 75,
  swayX: 0,
  swayY: 0,
};

function updateCameraEffects(dt) {
  if (G.playing && !G.paused) {
    const isMoving = G.wsad.some(v => v);
    if (isMoving && onGround) {
      CAMERA_EFFECTS.bobTimer += dt * 8;
      CAMERA_EFFECTS.bobAmount = Math.min(0.03, CAMERA_EFFECTS.bobAmount + dt * 0.1);
    } else {
      CAMERA_EFFECTS.bobAmount = Math.max(0, CAMERA_EFFECTS.bobAmount - dt * 0.2);
    }
    const bobX = Math.sin(CAMERA_EFFECTS.bobTimer) * CAMERA_EFFECTS.bobAmount;
    const bobY = Math.abs(Math.cos(CAMERA_EFFECTS.bobTimer)) * CAMERA_EFFECTS.bobAmount * 0.5;
    cam.position.x += bobX * dt * 10;
    cam.position.y += bobY * dt * 5;
    CAMERA_EFFECTS.tiltTarget = G.weaponKick * 10;
    CAMERA_EFFECTS.tiltCurrent += (CAMERA_EFFECTS.tiltTarget - CAMERA_EFFECTS.tiltCurrent) * dt * 15;
    cam.rotation.z = CAMERA_EFFECTS.tiltCurrent;
    if (G.speedBoost > 0) {
      CAMERA_EFFECTS.fovTarget = 85;
    } else if (boss && boss.alive && boss.isCharging) {
      CAMERA_EFFECTS.fovTarget = 80;
    } else {
      CAMERA_EFFECTS.fovTarget = 75;
    }
    CAMERA_EFFECTS.fovCurrent += (CAMERA_EFFECTS.fovTarget - CAMERA_EFFECTS.fovCurrent) * dt * 3;
    cam.fov = CAMERA_EFFECTS.fovCurrent;
    cam.updateProjectionMatrix();
  }
}

const ZOMBIE_NAVIGATION = {
  avoidRadius: 1.5,
  separationRadius: 1.0,
  playerAvoidRadius: 0.8,
  wallAvoidRadius: 2.0,
};

function calculateZombieSteering(zombie, dt) {
  const steer = new THREE.Vector3();
  const zPos = zombie.g.position;
  for (const other of zombies) {
    if (other === zombie || !other.alive) continue;
    const dist = zPos.distanceTo(other.g.position);
    if (dist < ZOMBIE_NAVIGATION.separationRadius && dist > 0.01) {
      const push = new THREE.Vector3().subVectors(zPos, other.g.position).normalize();
      push.multiplyScalar((ZOMBIE_NAVIGATION.separationRadius - dist) * 0.5);
      steer.add(push);
    }
  }
  const playerDist = zPos.distanceTo(cam.position);
  if (playerDist < ZOMBIE_NAVIGATION.playerAvoidRadius && playerDist > 0.01) {
    const pushAway = new THREE.Vector3().subVectors(zPos, cam.position).normalize();
    pushAway.multiplyScalar((ZOMBIE_NAVIGATION.playerAvoidRadius - playerDist) * 2);
    steer.add(pushAway);
  }
  for (const w of walls) {
    const cx = Math.max(w.minX, Math.min(zPos.x, w.maxX));
    const cz = Math.max(w.minZ, Math.min(zPos.z, w.maxZ));
    const dx = zPos.x - cx, dz = zPos.z - cz;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < ZOMBIE_NAVIGATION.wallAvoidRadius && dist > 0.01) {
      const push = new THREE.Vector3(dx / dist, 0, dz / dist);
      push.multiplyScalar((ZOMBIE_NAVIGATION.wallAvoidRadius - dist) * 2);
      steer.add(push);
    }
  }
  return steer;
}

const PARTICLE_EMITTERS = [];
function createParticleEmitter(pos, color, rate, duration, spread) {
  const emitter = {
    pos: pos.clone(), color, rate, duration, spread: spread || 1,
    timer: 0, life: duration, active: true,
  };
  PARTICLE_EMITTERS.push(emitter);
  return emitter;
}

function updateParticleEmitters(dt) {
  for (let i = PARTICLE_EMITTERS.length - 1; i >= 0; i--) {
    const em = PARTICLE_EMITTERS[i];
    em.life -= dt;
    em.timer -= dt;
    if (em.timer <= 0 && em.active) {
      em.timer = 1 / em.rate;
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * em.spread,
        Math.random() * em.spread,
        (Math.random() - 0.5) * em.spread
      );
      spawnParticles(em.pos.clone().add(offset), em.color, 1);
    }
    if (em.life <= 0) {
      PARTICLE_EMITTERS.splice(i, 1);
    }
  }
}

const DAMAGE_FEEDBACK = {
  hitMarkers: [],
  screenFlash: 0,
  directionalDamage: [],
};

function addDirectionalDamage(from) {
  const angle = Math.atan2(from.x - cam.position.x, from.z - cam.position.z);
  DAMAGE_FEEDBACK.directionalDamage.push({ angle, life: 1.0 });
}

function updateDamageFeedback(dt) {
  for (let i = DAMAGE_FEEDBACK.directionalDamage.length - 1; i >= 0; i--) {
    DAMAGE_FEEDBACK.directionalDamage[i].life -= dt;
    if (DAMAGE_FEEDBACK.directionalDamage[i].life <= 0) {
      DAMAGE_FEEDBACK.directionalDamage.splice(i, 1);
    }
  }
  if (DAMAGE_FEEDBACK.screenFlash > 0) {
    DAMAGE_FEEDBACK.screenFlash = Math.max(0, DAMAGE_FEEDBACK.screenFlash - dt * 3);
  }
}

const WAVE统计数据 = {
  waveStartTime: 0,
  waveDamageDealt: 0,
  waveDamageTaken: 0,
  waveKillsByType: {},
  waveHeadshots: 0,
  wavePickupsCollected: 0,
  waveScore: 0,
};

function resetWaveStats() {
  WAVE统计数据.waveStartTime = performance.now();
  WAVE统计数据.waveDamageDealt = 0;
  WAVE统计数据.waveDamageTaken = 0;
  WAVE统计数据.waveKillsByType = {};
  WAVE统计数据.waveHeadshots = 0;
  WAVE统计数据.wavePickupsCollected = 0;
  WAVE统计数据.waveScore = 0;
}

const ZOMBIE_ANIMATION_SYSTEM = {
  walkPhase: 0,
  attackPhase: 0,
  deathPhase: 0,
  idlePhase: 0,
};

function animateZombieWalk(zombie, dt) {
  const speed = zombie.spd;
  const phase = zombie.animTime * speed * 3;
  const g = zombie.g;
  const swing = Math.sin(phase) * 0.2;
  for (let i = 0; i < Math.min(g.children.length, 6); i++) {
    const child = g.children[i];
    if (child.position && child.position.y < 0.2) {
      child.rotation.x = swing * (i % 2 === 0 ? 1 : -1);
    }
  }
}

function animateZombieAttack(zombie, dt) {
  const g = zombie.g;
  const phase = zombie.animTime * 8;
  const lunge = Math.sin(phase) * 0.1;
  for (let i = 4; i < Math.min(g.children.length, 8); i++) {
    const child = g.children[i];
    if (child.position && child.position.y > 0.1) {
      child.rotation.x = lunge;
    }
  }
}

const SCORE_POPUP_SYSTEM = {
  lastPopup: 0,
  popupInterval: 0.3,
  currentPopup: null,
};

function showScorePopup(points, pos) {
  SCORE_POPUP_SYSTEM.lastPopup = performance.now();
  const text = points > 0 ? `+${points}` : `${points}`;
  const color = points > 100 ? 0xffd700 : points > 50 ? 0xff8800 : 0xffffff;
  spawnFloatingText(pos, text, color, 20);
}

const ZOMBIE_SOUNDS = {
  idle: { interval: 5, timer: 0 },
  aggro: { interval: 2, timer: 0 },
  death: { lastPlayed: 0 },
  attack: { lastPlayed: 0 },
};

function updateZombieSounds(dt) {
  ZOMBIE_SOUNDS.idle.timer -= dt;
  ZOMBIE_SOUNDS.aggro.timer -= dt;
  if (ZOMBIE_SOUNDS.idle.timer <= 0) {
    ZOMBIE_SOUNDS.idle.timer = ZOMBIE_SOUNDS.idle.interval + Math.random() * 3;
    const nearbyZombies = zombies.filter(z => z.alive && z.g.position.distanceTo(cam.position) < 15);
    if (nearbyZombies.length > 0 && Math.random() < 0.3) {
      snd('zombieH');
    }
  }
}

const MILESTONE_SYSTEM = {
  milestones: [
    { id: 'firstBlood', name: 'PRIMERA SANGRE', condition: () => G.totalKills >= 1, achieved: false },
    { id: 'killStreak5', name: 'ASESINO SERIE', condition: () => G.maxStreak >= 5, achieved: false },
    { id: 'wave5', name: 'OLEADA 5', condition: () => G.wave >= 5, achieved: false },
    { id: 'boss1', name: 'CAZADOR', condition: () => G.bossesKilled >= 1, achieved: false },
    { id: 'headshot50', name: 'TIRO PRECISO', condition: () => G.totalHeadshots >= 50, achieved: false },
    { id: 'score10k', name: 'ACUMULADOR', condition: () => G.score >= 10000, achieved: false },
    { id: 'wave10', name: 'VETERANO', condition: () => G.wave >= 10, achieved: false },
    { id: 'wave20', name: 'IMPERTURBABLE', condition: () => G.wave >= 20, achieved: false },
    { id: 'wave50', name: 'INMORTAL', condition: () => G.wave >= 50, achieved: false },
    { id: 'kill500', name: 'MATAFANATAS', condition: () => G.totalKills >= 500, achieved: false },
  ],
  check() {
    for (const m of this.milestones) {
      if (!m.achieved && m.condition()) {
        m.achieved = true;
        showStreakMsg(`MILESTONE: ${m.name}`, '', 0xffd700);
        G.score += 200;
      }
    }
  },
  reset() {
    for (const m of this.milestones) m.achieved = false;
  },
};

const SURVIVAL_BONUS = {
  timer: 0,
  interval: 30,
  bonus: 100,
};

function updateSurvivalBonus(dt) {
  if (!G.playing) return;
  SURVIVAL_BONUS.timer += dt;
  if (SURVIVAL_BONUS.timer >= SURVIVAL_BONUS.interval) {
    SURVIVAL_BONUS.timer = 0;
    const bonus = SURVIVAL_BONUS.bonus + G.wave * 10;
    G.score += bonus;
    showStreakMsg(`BONUS SUPERVIVENCIA +${bonus}`, `${Math.floor(SURVIVAL_BONUS.timer / 60)} minutos`, 0x44ff44);
  }
  G.survivalTime += dt;
  const nightStart = 0.75, nightEnd = 0.15;
  if ((DAYNIGHT.time >= nightStart || DAYNIGHT.time <= nightEnd) && G.wave > 0) {
    G.survivedNight = true;
  }
}

const ELITE_ZOMBIE_EFFECTS = {
  shieldGlowTimer: 0,
  bombFlashTimer: 0,
  stealthFadeTimer: 0,
  mutantPulseTimer: 0,
};

function updateEliteEffects(dt) {
  ELITE_ZOMBIE_EFFECTS.shieldGlowTimer += dt;
  ELITE_ZOMBIE_EFFECTS.bombFlashTimer += dt;
  ELITE_ZOMBIE_EFFECTS.stealthFadeTimer += dt;
  ELITE_ZOMBIE_EFFECTS.mutantPulseTimer += dt;
  for (const z of zombies) {
    if (!z.alive) continue;
    if (z.type === 'shielder') {
      const glow = Math.sin(ELITE_ZOMBIE_EFFECTS.shieldGlowTimer * 3) * 0.15 + 0.15;
      for (const child of z.g.children) {
        if (child.position && child.position.z > 0.1) {
          if (child.material && child.material.emissiveIntensity !== undefined) {
            child.material.emissiveIntensity = glow;
          }
        }
      }
    }
    if (z.type === 'bomber') {
      const flash = Math.sin(ELITE_ZOMBIE_EFFECTS.bombFlashTimer * 6) > 0.5 ? 0.4 : 0.1;
      for (const child of z.g.children) {
        if (child.material && child.material.color && child.material.color.r > 0.5) {
          child.material.emissiveIntensity = flash;
        }
      }
    }
  }
}

// ===== WEAPON CHALLENGE SYSTEM =====
const WEAPON_CHALLENGES = {
  list: [
    { id: 'wps1_kills', weapon: 'pistol', desc: '50 kills con Pistola', target: 50, score: 1000 },
    { id: 'wps1_head', weapon: 'pistol', desc: '20 headshots con Pistola', target: 20, score: 500 },
    { id: 'wps2_kills', weapon: 'smg', desc: '100 kills con SMG', target: 100, score: 1200 },
    { id: 'wps2_kills2', weapon: 'smg', desc: '300 kills con SMG', target: 300, score: 3000 },
    { id: 'wps3_kills', weapon: 'rifle', desc: '150 kills con Rifle', target: 150, score: 1500 },
    { id: 'wps3_head', weapon: 'rifle', desc: '50 headshots con Rifle', target: 50, score: 2000 },
    { id: 'wps4_kills', weapon: 'shotgun', desc: '75 kills con Escopeta', target: 75, score: 1500 },
    { id: 'wps4_multi', weapon: 'shotgun', desc: '10 multi-kills con Escopeta', target: 10, score: 2500 },
    { id: 'wps5_kills', weapon: 'rocket', desc: '50 kills con Cohete', target: 50, score: 2000 },
    { id: 'wps5_chain', weapon: 'rocket', desc: '5 cadenas explosivas', target: 5, score: 3000 },
    { id: 'wps6_kills', weapon: 'sniper', desc: '60 headshots con Francotirador', target: 60, score: 3000 },
    { id: 'wps6_dist', weapon: 'sniper', desc: '10 kills a mas de 40m', target: 10, score: 2500 },
    { id: 'wps7_kills', weapon: 'minigun', desc: '200 kills con Minigun', target: 200, score: 4000 },
    { id: 'wps8_kills', weapon: 'flamethrower', desc: '100 kills con Lanzallamas', target: 100, score: 2500 },
    { id: 'wps9_kills', weapon: 'gl', desc: '80 kills con Lanzagranadas', target: 80, score: 3000 },
    { id: 'wps10_kills', weapon: 'laser', desc: '120 kills con Laser', target: 120, score: 5000 },
    { id: 'wps_all', weapon: 'any', desc: '500 kills totales', target: 500, score: 5000 },
    { id: 'wps_wave20', weapon: 'any', desc: 'Alcanzar oleada 20', target: 20, score: 8000 },
    { id: 'wps_wave50', weapon: 'any', desc: 'Alcanzar oleada 50', target: 50, score: 20000 },
    { id: 'wps_perfect', weapon: 'any', desc: 'Oleada sin danio', target: 1, score: 5000 },
    { id: 'wps_night', weapon: 'any', desc: 'Sobrevivir 5 minutos', target: 300, score: 6000 },
    { id: 'wps_combo20', weapon: 'any', desc: 'Combo x20', target: 20, score: 10000 },
    { id: 'wps_boss5', weapon: 'any', desc: '5 jefes eliminados', target: 5, score: 15000 },
    { id: 'wps_upgrade3', weapon: 'any', desc: 'Arma nivel 3', target: 3, score: 4000 },
    { id: 'wps_allup', weapon: 'any', desc: 'Todas las armas nivel 5', target: 5, score: 50000 },
  ],
  completed: {},
  progress: {},
  init() {
    try {
      const saved = JSON.parse(localStorage.getItem('zombieWChallenges') || '{}');
      this.completed = saved.completed || {};
      this.progress = saved.progress || {};
    } catch (e) { this.completed = {}; this.progress = {}; }
  },
  save() {
    try {
      localStorage.setItem('zombieWChallenges', JSON.stringify({ completed: this.completed, progress: this.progress }));
    } catch (e) {}
  },
  getProgress(id) {
    return this.progress[id] || 0;
  },
  isComplete(id) {
    return !!this.completed[id];
  },
  updateProgress(id, amount) {
    if (this.completed[id]) return;
    this.progress[id] = (this.progress[id] || 0) + amount;
    const ch = this.list.find(c => c.id === id);
    if (ch && this.progress[id] >= ch.target) {
      this.completed[id] = true;
      G.score += ch.score;
      addKillMsg('DESAFIO: ' + ch.desc + ' | +' + ch.score, false);
      checkAchievements();
    }
    this.save();
  },
  checkWeaponKill(weaponId) {
    this.updateProgress('wps_all', 1);
    for (const ch of this.list) {
      if (ch.weapon === weaponId && ch.id.endsWith('_kills')) {
        this.updateProgress(ch.id, 1);
      }
    }
  },
  checkWeaponHeadshot(weaponId) {
    for (const ch of this.list) {
      if (ch.weapon === weaponId && ch.id.endsWith('_head')) {
        this.updateProgress(ch.id, 1);
      }
    }
  },
  checkWave(wave) {
    if (wave >= 20) this.updateProgress('wps_wave20', 1);
    if (wave >= 50) this.updateProgress('wps_wave50', 1);
  },
  checkDamageTaken(dmg) {
    if (dmg <= 0 && G.wave > 0) {
      this.updateProgress('wps_perfect', 1);
    }
  },
  checkCombo(combo) {
    if (combo >= 20) this.updateProgress('wps_combo20', 1);
  },
  checkBossKill() {
    this.updateProgress('wps_boss5', 1);
  },
  checkUpgrade(level) {
    if (level >= 3) this.updateProgress('wps_upgrade3', 1);
    if (level >= 5) this.updateProgress('wps_allup', 1);
  },
  checkSurvivalTime(time) {
    if (time >= 300) this.updateProgress('wps_night', 1);
  },
  checkMultiKill(count) {
    if (count >= 3) this.updateProgress('wps4_multi', 1);
  },
  checkDistanceShot(dist) {
    if (dist > 40) this.updateProgress('wps6_dist', 1);
  },
  checkChainExplosion() {
    this.updateProgress('wps5_chain', 1);
  }
};
WEAPON_CHALLENGES.init();

// ===== ZOMBIE LORE / BESTIARY =====
const ZOMBIE_LORE = {
  entries: {
    walk: {
      name: 'Caminante',
      desc: 'El zombi basico. Antiguamente eran personas comunes infectadas por el virus. Avanzan lentamente en manada, pero no deben subestimarse.',
      weakness: 'Disparo a la cabeza',
      danger: 1,
      discovered: false
    },
    runner: {
      name: 'Corredor',
      desc: 'Zombies afectados por mutacion acelerada del virus. Su velocidad los hace extremadamente peligrosos en grupos.',
      weakness: 'Armas automaticas',
      danger: 3,
      discovered: false
    },
    brute: {
      name: 'Bruto',
      desc: 'Mutaciones musculares masivas los convierten en tanques de carne. Capaces de derribar barricadas con un solo golpe.',
      weakness: 'Armas pesadas / Cohetes',
      danger: 4,
      discovered: false
    },
    exploder: {
      name: 'Explotador',
      desc: 'Su vientre inflamado contiene gas inflamable. Al morir, explotan danando todo lo cercano. Mantente alla.',
      weakness: 'Mata desde distancia',
      danger: 5,
      discovered: false
    },
    spitter: {
      name: 'Escupidor',
      desc: 'Proyectan acido corrosivo a distancia. El veneno dana continuamente y reduce la armadura.',
      weakness: 'Escudo / Esquivar',
      danger: 3,
      discovered: false
    },
    crawler: {
      name: 'Rastrero',
      desc: 'Se arrastran por el suelo, dificiles de detectar. Sus 4 patas les dan estabilidad y velocidad inusual.',
      weakness: 'Armas de dispersion',
      danger: 2,
      discovered: false
    },
    screamer: {
      name: 'Gritador',
      desc: 'Su grito potenciado por el virus puede buffear a otros zombies cercanos. Prioridad absoluta.',
      weakness: 'Matar primero / Francotirador',
      danger: 6,
      discovered: false
    },
    leaper: {
      name: 'Saltador',
      desc: 'Piernas mutadas les permiten saltar grandes distancias. Atacan desde angulos inesperados.',
      weakness: 'Predecir trayectoria',
      danger: 4,
      discovered: false
    },
    tank: {
      name: 'Tanque',
      desc: 'La evolucion final del Bruto. Armadura natural practicamente impenetrable. Solo vulnerable en puntos debiles.',
      weakness: 'Puntos debiles / Explosivos',
      danger: 8,
      discovered: false
    },
    necro: {
      name: 'Nigromante',
      desc: 'Capacidad unica de resucitar zombies muertos. Su Orbe de Conduccion mantiene el ciclo de vida artificial.',
      weakness: 'Matar primero / Orbe',
      danger: 7,
      discovered: false
    },
    stalker: {
      name: 'Acechador',
      desc: 'Se vuelve invisible cuando esta lejos. Solo es visible a distancias cortas. Ataque sorpresa devastador.',
      weakness: 'Mira constante / Sonar',
      danger: 5,
      discovered: false
    },
    bomber: {
      name: 'Bombardero',
      desc: 'Carga explosivos en su cuerpo. Se acerca y se detona, causando danio masivo en area.',
      weakness: 'Matar a distancia / Escudo',
      danger: 7,
      discovered: false
    },
    shielder: {
      name: 'Escudero',
      desc: 'Equipados con escudo balistico y casco. Solo vulnerable por la espalda o piernas.',
      weakness: 'Flanquear / Granadas',
      danger: 5,
      discovered: false
    },
    mutant: {
      name: 'Mutante',
      desc: 'Cuatro brazos, garras quimicas y capacidad de escupir acido. Su pulso toxico envenena el area.',
      weakness: 'Fuego / Explosivos',
      danger: 6,
      discovered: false
    }
  },
  discover(type) {
    if (this.entries[type] && !this.entries[type].discovered) {
      this.entries[type].discovered = true;
      addKillMsg('NUEVO: ' + this.entries[type].name + ' descubierto!', false);
    }
  },
  getDiscoveredCount() {
    return Object.values(this.entries).filter(e => e.discovered).length;
  },
  getTotalCount() {
    return Object.keys(this.entries).length;
  }
};

// ===== DYNAMIC EVENT SYSTEM =====
const DYNAMIC_EVENTS = {
  active: null,
  timer: 0,
  cooldown: 45,
  events: [
    {
      id: 'horde_assault',
      name: 'ASALTO DE LA HORDA',
      desc: 'Ola masiva de zombies aparece!',
      weight: 3,
      execute() {
        const count = 15 + G.wave * 2;
        for (let i = 0; i < count; i++) {
          const ang = (i / count) * Math.PI * 2;
          const r = 30 + Math.random() * 20;
          spawnZombieAt(new THREE.Vector3(Math.cos(ang) * r, 1, Math.sin(ang) * r));
        }
      }
    },
    {
      id: 'supply_drop',
      name: 'SUMINISTROS AEREOS',
      desc: 'Cajas de suministros caen del cielo!',
      weight: 2,
      execute() {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            const x = (Math.random() - 0.5) * 60;
            const z = (Math.random() - 0.5) * 60;
            const types = [0, 0, 1, 1, 2, 2, 3, 3, 4, 5];
            const type = types[Math.floor(Math.random() * types.length)];
            spawnPickup(new THREE.Vector3(x, 1, z), type);
          }, i * 800);
        }
      }
    },
    {
      id: 'toxic_rain',
      name: 'LLUVIA TOXICA',
      desc: 'La lluvia se vuelve venenosa! Cuidado!',
      weight: 2,
      duration: 20,
      execute() {
        WEATHER.current = 'storm';
        WEATHER.rainDrops.length = 0;
        for (let i = 0; i < 300; i++) {
          WEATHER.rainDrops.push({
            x: (Math.random() - 0.5) * HALF * 2,
            y: 20 + Math.random() * 10,
            z: (Math.random() - 0.5) * HALF * 2,
            speed: 15 + Math.random() * 10,
            toxic: true
          });
        }
      }
    },
    {
      id: 'night_hunt',
      name: 'CAZA NOCTURNA',
      desc: 'Los zombies se vuelven mas agresivos!',
      weight: 2,
      duration: 15,
      execute() {
        for (const z of zombies) {
          if (z.alive) {
            z.speed *= 1.3;
            z.damage *= 1.2;
          }
        }
      }
    },
    {
      id: 'EMP_blast',
      name: 'PULSO EMP',
      desc: 'Armas电子icas fallan temporalmente!',
      weight: 1,
      duration: 8,
      execute() {
        G.empActive = true;
      },
      cleanup() {
        G.empActive = false;
      }
    },
    {
      id: 'frenzy',
      name: 'FRENESI',
      desc: 'Doble de zombies pero mas debiles!',
      weight: 2,
      execute() {
        const count = 10 + G.wave * 3;
        for (let i = 0; i < count; i++) {
          const ang = (i / count) * Math.PI * 2;
          const r = 25 + Math.random() * 30;
          const z = spawnZombieAt(new THREE.Vector3(Math.cos(ang) * r, 1, Math.sin(ang) * r));
          if (z) { z.hp *= 0.5; z.maxHp *= 0.5; }
        }
      }
    },
    {
      id: 'boss_rush',
      name: 'RUSH DEL JEFE',
      desc: 'Mini-boss aparece!',
      weight: 1,
      execute() {
        const types = ['brute', 'tank', 'necromancer'];
        const type = types[Math.floor(Math.random() * types.length)];
        const z = spawnZombieAt(new THREE.Vector3(0, 1, -30));
        if (z) {
          z.type = type;
          z.hp = (type === 'tank' ? 300 : 200) * (1 + G.wave * 0.1);
          z.maxHp = z.hp;
          z.damage = (type === 'tank' ? 30 : 20) * (1 + G.wave * 0.05);
          z.speed = type === 'tank' ? 2 : 3;
          z.score = 500;
          z.isElite = true;
          z.g.scale.setScalar(2);
          z.g.traverse(c => {
            if (c.isMesh && c.material) {
              c.material.emissive = new THREE.Color(0xff4400);
              c.material.emissiveIntensity = 0.3;
            }
          });
        }
      }
    }
  ],
  update(dt) {
    if (this.active) {
      this.active.timer -= dt;
      if (this.active.timer <= 0) {
        if (this.active.cleanup) this.active.cleanup();
        this.active = null;
      }
      return;
    }
    this.timer += dt;
    if (this.timer >= this.cooldown && G.wave >= 3) {
      this.timer = 0;
      this.cooldown = 30 + Math.random() * 40;
      this.trigger();
    }
  },
  trigger() {
    const totalWeight = this.events.reduce((s, e) => s + e.weight, 0);
    let r = Math.random() * totalWeight;
    for (const ev of this.events) {
      r -= ev.weight;
      if (r <= 0) {
        this.active = { ...ev, timer: ev.duration || 0 };
        addKillMsg('EVENTO: ' + ev.name, false);
        if (ev.desc) spawnFloatingText(new THREE.Vector3(0, 8, 0), ev.desc, 0xffff00, 200);
        ev.execute();
        return;
      }
    }
  }
};

// ===== SLOW MOTION SYSTEM =====
const SLOW_MO = {
  active: false,
  factor: 1,
  target: 1,
  timer: 0,
  duration: 0,
  trigger(factor = 0.3, duration = 0.5) {
    this.active = true;
    this.factor = factor;
    this.target = 1;
    this.timer = duration;
    this.duration = duration;
  },
  update(dt) {
    if (!this.active) return;
    this.timer -= dt;
    if (this.timer <= 0) {
      this.active = false;
      this.factor = 1;
    } else {
      this.factor = THREE.MathUtils.lerp(this.factor, this.target, dt * 2);
    }
  }
};

// ===== ZOMBIE TRAIL SYSTEM =====
const ZOMBIE_TRAILS = {
  pools: [],
  maxTrails: 200,
  trailGeo: null,
  init() {
    this.trailGeo = new THREE.PlaneGeometry(0.3, 0.3);
  },
  spawn(pos, color) {
    if (this.pools.length >= this.maxTrails) {
      const oldest = this.pools.shift();
      if (oldest.mesh.parent) oldest.mesh.parent.remove(oldest.mesh);
    }
    const mat = new THREE.MeshBasicMaterial({
      color: color || 0x440000,
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(this.trailGeo, mat);
    mesh.position.copy(pos);
    mesh.position.y = 0.02;
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);
    this.pools.push({ mesh, life: 8, maxLife: 8 });
  },
  update(dt) {
    for (let i = this.pools.length - 1; i >= 0; i--) {
      const t = this.pools[i];
      t.life -= dt;
      if (t.life <= 0) {
        if (t.mesh.parent) t.mesh.parent.remove(t.mesh);
        t.mesh.material.dispose();
        this.pools.splice(i, 1);
      } else {
        t.mesh.material.opacity = (t.life / t.maxLife) * 0.6;
      }
    }
  }
};

// ===== IMPACT DECAL SYSTEM =====
const IMPACT_DECALS = {
  pools: [],
  maxDecals: 100,
  init() {},
  spawn(pos, normal, color, size) {
    if (this.pools.length >= this.maxDecals) {
      const oldest = this.pools.shift();
      if (oldest.mesh.parent) oldest.mesh.parent.remove(oldest.mesh);
    }
    const geo = new THREE.CircleGeometry(size || 0.2, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: color || 0x880000,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    if (normal) {
      mesh.lookAt(pos.clone().add(normal));
    } else {
      mesh.rotation.x = -Math.PI / 2;
    }
    scene.add(mesh);
    this.pools.push({ mesh, life: 20, maxLife: 20 });
  },
  update(dt) {
    for (let i = this.pools.length - 1; i >= 0; i--) {
      const d = this.pools[i];
      d.life -= dt;
      if (d.life <= 0) {
        if (d.mesh.parent) d.mesh.parent.remove(d.mesh);
        d.mesh.geometry.dispose();
        d.mesh.material.dispose();
        this.pools.splice(i, 1);
      } else {
        d.mesh.material.opacity = (d.life / d.maxLife) * 0.8;
      }
    }
  }
};

// ===== ZOMBIE DAMAGE NUMBERS =====
const ZOMBIE_DMG_NUMBERS = {
  pool: [],
  maxNums: 40,
  spawn(pos, amount, isHeadshot, isCrit) {
    if (this.pool.length >= this.maxNums) {
      const oldest = this.pool.shift();
      if (oldest.sprite.parent) oldest.sprite.parent.remove(oldest.sprite);
    }
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.font = isHeadshot ? 'bold 40px Arial' : 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = isHeadshot ? '#ff0000' : isCrit ? '#ffaa00' : '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    const text = isHeadshot ? amount + '!' : '' + amount;
    ctx.strokeText(text, 64, 40);
    ctx.fillText(text, 64, 40);
    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.position.copy(pos);
    sprite.position.y += 2.5;
    sprite.scale.set(1.5, 0.75, 1);
    scene.add(sprite);
    this.pool.push({
      sprite,
      life: 1.0,
      vel: new THREE.Vector3((Math.random() - 0.5) * 2, 3, (Math.random() - 0.5) * 2),
      maxLife: 1.0
    });
  },
  update(dt) {
    for (let i = this.pool.length - 1; i >= 0; i--) {
      const n = this.pool[i];
      n.life -= dt;
      if (n.life <= 0) {
        if (n.sprite.parent) n.sprite.parent.remove(n.sprite);
        n.sprite.material.map.dispose();
        n.sprite.material.dispose();
        this.pool.splice(i, 1);
      } else {
        n.sprite.position.x += n.vel.x * dt;
        n.sprite.position.y += n.vel.y * dt;
        n.sprite.position.z += n.vel.z * dt;
        n.vel.y -= 6 * dt;
        n.sprite.material.opacity = n.life / n.maxLife;
        const s = 1.5 * (n.life / n.maxLife);
        n.sprite.scale.set(s, s * 0.5, 1);
      }
    }
  }
};

// ===== BLOOD POOL SYSTEM =====
const BLOOD_POOLS = {
  pools: [],
  maxPools: 60,
  spawn(pos, size) {
    if (this.pools.length >= this.maxPools) {
      const oldest = this.pools.shift();
      if (oldest.mesh.parent) oldest.mesh.parent.remove(oldest.mesh);
    }
    const radius = size || (0.3 + Math.random() * 0.5);
    const geo = new THREE.CircleGeometry(radius, 8 + Math.floor(Math.random() * 4));
    const shade = 0.2 + Math.random() * 0.3;
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(shade, 0, 0),
      transparent: true,
      opacity: 0.7,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos.x, 0.015, pos.z);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = Math.random() * Math.PI * 2;
    scene.add(mesh);
    this.pools.push({ mesh, life: 30, maxLife: 30 });
  },
  update(dt) {
    for (let i = this.pools.length - 1; i >= 0; i--) {
      const p = this.pools[i];
      p.life -= dt;
      if (p.life <= 0) {
        if (p.mesh.parent) p.mesh.parent.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.pools.splice(i, 1);
      } else if (p.life < 5) {
        p.mesh.material.opacity = (p.life / 5) * 0.7;
      }
    }
  }
};

// ===== MUZZLE FLASH SYSTEM =====
const MUZZLE_FLASHES = {
  pool: [],
  maxFlashes: 20,
  spawn(pos, color, size) {
    if (this.pool.length >= this.maxFlashes) {
      const oldest = this.pool.shift();
      if (oldest.group.parent) oldest.group.parent.remove(oldest.group);
    }
    const group = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: color || 0xffaa33, transparent: true, opacity: 0.9 });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(size || 0.15, 4, 4), mat);
    group.add(mesh);
    const light = new THREE.PointLight(color || 0xffaa33, 2, 8);
    group.add(light);
    group.position.copy(pos);
    scene.add(group);
    this.pool.push({ group, life: 0.05, maxLife: 0.05, light });
  },
  update(dt) {
    for (let i = this.pool.length - 1; i >= 0; i--) {
      const f = this.pool[i];
      f.life -= dt;
      if (f.life <= 0) {
        if (f.group.parent) f.group.parent.remove(f.group);
        f.group.traverse(c => {
          if (c.geometry) c.geometry.dispose();
          if (c.material) c.material.dispose();
        });
        this.pool.splice(i, 1);
      } else {
        const t = f.life / f.maxLife;
        f.light.intensity = t * 2;
        f.group.children[0].scale.setScalar(t);
      }
    }
  }
};

// ===== PROJECTILE TRAIL SYSTEM =====
const PROJECTILE_TRAILS = {
  pool: [],
  maxTrails: 40,
  spawn(from, to, color) {
    if (this.pool.length >= this.maxTrails) {
      const oldest = this.pool.shift();
      if (oldest.mesh.parent) oldest.mesh.parent.remove(oldest.mesh);
    }
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    dir.normalize();
    const geo = new THREE.CylinderGeometry(0.02, 0.02, len, 4);
    const mat = new THREE.MeshBasicMaterial({
      color: color || 0xffff00,
      transparent: true,
      opacity: 0.7,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    mesh.position.copy(mid);
    mesh.lookAt(to);
    mesh.rotateX(Math.PI / 2);
    scene.add(mesh);
    this.pool.push({ mesh, life: 0.15, maxLife: 0.15 });
  },
  update(dt) {
    for (let i = this.pool.length - 1; i >= 0; i--) {
      const t = this.pool[i];
      t.life -= dt;
      if (t.life <= 0) {
        if (t.mesh.parent) t.mesh.parent.remove(t.mesh);
        t.mesh.geometry.dispose();
        t.mesh.material.dispose();
        this.pool.splice(i, 1);
      } else {
        t.mesh.material.opacity = (t.life / t.maxLife) * 0.7;
      }
    }
  }
};

// ===== WAVE PROGRESS BAR =====
const WAVE_PROGRESS = {
  el: null,
  init() {
    this.el = document.createElement('div');
    this.el.id = 'waveProgress';
    this.el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);width:200px;height:6px;background:rgba(0,0,0,0.6);border-radius:3px;z-index:100;display:none;overflow:hidden;';
    const fill = document.createElement('div');
    fill.id = 'waveProgressFill';
    fill.style.cssText = 'height:100%;background:linear-gradient(90deg,#00ff44,#88ff00);border-radius:3px;transition:width 0.3s;width:0%';
    this.el.appendChild(fill);
    document.body.appendChild(this.el);
  },
  show(pct) {
    this.el.style.display = 'block';
    this.el.children[0].style.width = Math.min(100, pct) + '%';
  },
  hide() {
    this.el.style.display = 'none';
  }
};

// ===== TOAST NOTIFICATION SYSTEM =====
const TOAST = {
  queue: [],
  maxToasts: 5,
  el: null,
  init() {
    this.el = document.createElement('div');
    this.el.id = 'toastContainer';
    this.el.style.cssText = 'position:fixed;top:100px;right:20px;z-index:200;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(this.el);
  },
  show(text, color, duration) {
    if (this.el.children.length >= this.maxToasts) {
      this.el.removeChild(this.el.firstChild);
    }
    const toast = document.createElement('div');
    toast.style.cssText = `background:rgba(0,0,0,0.85);color:${color || '#fff'};padding:8px 16px;border-radius:6px;font-size:13px;font-family:'Press Start 2P',monospace;border-left:3px solid ${color || '#00ff44'};opacity:0;transition:opacity 0.3s;max-width:280px;text-align:right;`;
    toast.textContent = text;
    this.el.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
    }, duration || 3000);
  }
};

// ===== VICTORY SCREEN (for testing, disabled by default) =====
function showVictoryDetailed() {
  G.victory = true; G.playing = false; stopAmbient();
  dom.hud.style.display = 'none';
  dom.go.style.display = 'flex';
  dom.goTitle.textContent = '!VICTORIA!';
  dom.goTitle.style.color = '#44ff44';
  const acc = G.totalShots > 0 ? Math.round(G.totalHits / G.totalShots * 100) : 0;
  dom.finalScore.textContent = G.score;
  dom.finalKills.textContent = G.totalKills;
  dom.finalRounds.textContent = G.wave;
  dom.finalAcc.textContent = `${acc}%`;
  dom.finalStreak.textContent = G.maxStreak;
  let mvpText = 'COMPLETADO';
  mvpText += ` | Jefes: ${G.bossesKilled}`;
  mvpText += ` | Headshots: ${G.totalHeadshots}`;
  dom.mvpDisplay.textContent = mvpText;
  localStorage.setItem('zombieAchievements', JSON.stringify(ACHIEVEMENTS.list));
  saveScore(G.score, G.wave, G.totalKills, acc, G.maxStreak);
  showTopScores(dom.goScores, 10);
}

// ===== WAVE SUMMARY SCREEN =====
function showWaveSummary(wave, stats) {
  if (!stats) return;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:250;display:flex;align-items:center;justify-content:center;pointer-events:auto;animation:fadeIn 0.5s';
  const panel = document.createElement('div');
  panel.style.cssText = 'background:rgba(20,10,5,0.95);border:2px solid #ff4444;border-radius:12px;padding:24px 32px;color:#ffddaa;text-align:center;font-family:"Press Start 2P",monospace;max-width:400px;width:90%';
  panel.innerHTML = `
    <h2 style="color:#ff4444;font-size:14px;margin-bottom:16px">OLEADA ${wave} COMPLETADA</h2>
    <div style="font-size:10px;line-height:2;color:#ffaa66">
      Kills: ${stats.kills || 0}<br>
      Danio: ${Math.round(stats.damage || 0)}<br>
      Danio recibido: ${Math.round(stats.damageTaken || 0)}<br>
      Headshots: ${stats.headshots || 0}<br>
      Score: +${stats.score || 0}
    </div>
    <button id="btnCloseWaveSummary" style="margin-top:16px;padding:8px 24px;background:#ff4444;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:'Press Start 2P',monospace;font-size:10px">CONTINUAR</button>
  `;
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  const btn = panel.querySelector('#btnCloseWaveSummary');
  btn.addEventListener('click', () => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s';
    setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
  });
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.5s';
      setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 500);
    }
  }, 8000);
}

// ===== AMBIENT SOUND VARIATIONS =====
const AMBIENT_SOUNDS = {
  layers: {},
  masterVolume: 0.3,
  init() {
    this.layers.wind = { vol: 0, target: 0 };
    this.layers.rain = { vol: 0, target: 0 };
    this.layers.thunder = { vol: 0, target: 0 };
    this.layers.ambient = { vol: 0.1, target: 0.1 };
    this.layers.heart = { vol: 0, target: 0 };
  },
  setLayer(name, target) {
    if (this.layers[name]) this.layers[name].target = target;
  },
  update(dt) {
    for (const name in this.layers) {
      const l = this.layers[name];
      l.vol = THREE.MathUtils.lerp(l.vol, l.target, dt * 2);
    }
    if (G.hp < 30 && G.hp > 0) {
      this.setLayer('heart', 0.3 * (1 - G.hp / 30));
    } else {
      this.setLayer('heart', 0);
    }
  }
};
AMBIENT_SOUNDS.init();

// ===== GAME STATS TRACKER =====
const GAME_STATS = {
  waveStartTime: 0,
  totalPlayTime: 0,
  zombiesKilledPerType: {},
  headshotsPerWeapon: {},
  damagePerWeapon: {},
  fastestWave: Infinity,
  slowestWave: 0,
  perfectWaves: 0,
  wavesWithoutDamage: 0,
  init() {
    this.waveStartTime = 0;
    this.totalPlayTime = 0;
    this.zombiesKilledPerType = {};
    this.headshotsPerWeapon = {};
    this.damagePerWeapon = {};
    this.fastestWave = Infinity;
    this.slowestWave = 0;
    this.perfectWaves = 0;
    this.wavesWithoutDamage = 0;
  },
  trackZombieKill(type) {
    this.zombiesKilledPerType[type] = (this.zombiesKilledPerType[type] || 0) + 1;
  },
  trackHeadshot(weaponId) {
    this.headshotsPerWeapon[weaponId] = (this.headshotsPerWeapon[weaponId] || 0) + 1;
  },
  trackDamage(weaponId, amount) {
    this.damagePerWeapon[weaponId] = (this.damagePerWeapon[weaponId] || 0) + amount;
  },
  endWave(wave, waveTime) {
    if (waveTime < this.fastestWave) this.fastestWave = waveTime;
    if (waveTime > this.slowestWave) this.slowestWave = waveTime;
  }
};

// ===== ENHANCED PICKUP EFFECTS =====
function spawnPickupEffect(pos, type) {
  const colors = [0x00ff00, 0x0088ff, 0xff8800, 0xff0000, 0xffaa00, 0xff00ff, 0xffff00, 0xffffff];
  const color = colors[type] || 0xffffff;
  for (let i = 0; i < 8; i++) {
    const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    scene.add(mesh);
    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 4,
      3 + Math.random() * 3,
      (Math.random() - 0.5) * 4
    );
    const startY = pos.y;
    const startTime = performance.now();
    function animPickup() {
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed > 0.8) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
        return;
      }
      mesh.position.x += vel.x * 0.016;
      mesh.position.z += vel.z * 0.016;
      vel.y -= 9 * 0.016;
      mesh.position.y += vel.y * 0.016;
      mesh.rotation.x += 0.1;
      mesh.rotation.y += 0.15;
      mesh.material.opacity = 0.8 * (1 - elapsed / 0.8);
      requestAnimationFrame(animPickup);
    }
    animPickup();
  }
}

// ===== ZOMBIE INTIMIDATION SYSTEM =====
const ZOMBIE_INTIMIDATION = {
  active: false,
  intensity: 0,
  sources: [],
  addSource(pos, strength) {
    this.sources.push({ pos: pos.clone(), strength, life: 5 });
  },
  update(dt) {
    for (let i = this.sources.length - 1; i >= 0; i--) {
      this.sources[i].life -= dt;
      if (this.sources[i].life <= 0) this.sources.splice(i, 1);
    }
    let total = 0;
    for (const src of this.sources) {
      const dist = cam.position.distanceTo(src.pos);
      if (dist < 20) {
        total += src.strength * (1 - dist / 20);
      }
    }
    for (const z of zombies) {
      if (!z.alive) continue;
      const dist = cam.position.distanceTo(z.g.position);
      if (dist < 8) {
        total += 0.1 * (1 - dist / 8);
      }
    }
    this.intensity = THREE.MathUtils.clamp(total, 0, 1);
    this.active = this.intensity > 0.1;
  }
};

// ===== WEAPON HEAT SYSTEM =====
const WEAPON_HEAT = {
  heat: 0,
  maxHeat: 100,
  cooldownRate: 30,
  overheatThreshold: 85,
  isOverheated: false,
  overheatTimer: 0,
  overheatDuration: 2,
  add(amount) {
    if (this.isOverheated) return;
    this.heat += amount;
    if (this.heat >= this.overheatThreshold) {
      this.isOverheated = true;
      this.overheatTimer = this.overheatDuration;
      addKillMsg('ARMA SOBRECALENTADA', false);
    }
    this.heat = Math.min(this.heat, this.maxHeat);
  },
  update(dt) {
    if (this.isOverheated) {
      this.overheatTimer -= dt;
      if (this.overheatTimer <= 0) {
        this.isOverheated = false;
        this.heat = this.overheatThreshold * 0.5;
      }
    } else {
      this.heat = Math.max(0, this.heat - this.cooldownRate * dt);
    }
  },
  getHeatPct() {
    return this.heat / this.maxHeat;
  }
};

// ===== BIOME WEATHER PATTERNS =====
const BIOME_WEATHER = {
  patterns: {
    city: ['clear', 'overcast', 'rain'],
    industrial: ['overcast', 'rain', 'fog'],
    forest: ['clear', 'overcast', 'fog'],
    desert: ['clear', 'clear', 'overcast'],
    ruins: ['overcast', 'fog', 'storm']
  },
  getForBiome(biome) {
    const patterns = this.patterns[biome] || ['clear'];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }
};

// ===== ZOMBIE ANIMATION BLENDING =====
const ZOMBIE_ANIM = {
  blendTime: 0.2,
  getIdlePhase(zombie) {
    return zombie.g.idlePhase || 0;
  },
  getWalkPhase(zombie) {
    return zombie.g.walkPhase || 0;
  },
  setIdlePhase(zombie, val) {
    zombie.g.idlePhase = val;
  },
  setWalkPhase(zombie, val) {
    zombie.g.walkPhase = val;
  },
  updateAnimation(zombie, dt, isMoving, speed) {
    const phase = zombie.g.animPhase || 0;
    if (isMoving) {
      zombie.g.animPhase = phase + dt * speed * 1.5;
    } else {
      zombie.g.animPhase = phase + dt * 0.5;
    }
    const legSwing = isMoving ? Math.sin(zombie.g.animPhase * 4) * 0.5 : Math.sin(zombie.g.animPhase) * 0.1;
    zombie.g.traverse(c => {
      if (c.name === 'lLeg' || c.name === 'lLowerLeg') {
        c.rotation.x = legSwing;
      }
      if (c.name === 'rLeg' || c.name === 'rLowerLeg') {
        c.rotation.x = -legSwing;
      }
      if (c.name === 'lUpperArm') {
        c.rotation.x = isMoving ? -Math.abs(legSwing) * 0.5 : 0;
      }
      if (c.name === 'rUpperArm') {
        c.rotation.x = isMoving ? -Math.abs(legSwing) * 0.5 : 0;
      }
      if (c.name === 'head') {
        c.rotation.x = isMoving ? Math.abs(legSwing) * 0.2 : Math.sin(zombie.g.animPhase * 0.5) * 0.1;
      }
    });
  }
};

// ===== AMBIENT DRONE SYSTEM =====
const AMBIENT_DRONES = {
  drones: [],
  spawnDrone(pos) {
    const group = new THREE.Group();
    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2;
      const propGeo = new THREE.TorusGeometry(0.15, 0.02, 4, 12);
      const propMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
      const prop = new THREE.Mesh(propGeo, propMat);
      prop.position.set(Math.cos(ang) * 0.4, 0.05, Math.sin(ang) * 0.4);
      prop.rotation.x = Math.PI / 2;
      group.add(prop);
    }
    const lightGeo = new THREE.SphereGeometry(0.05, 4, 4);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.position.y = -0.08;
    group.add(light);
    group.position.copy(pos);
    group.position.y = 5 + Math.random() * 3;
    scene.add(group);
    this.drones.push({
      group,
      basePos: pos.clone(),
      timer: Math.random() * Math.PI * 2,
      radius: 3 + Math.random() * 5,
      speed: 0.3 + Math.random() * 0.5,
      height: group.position.y,
      propPhase: 0
    });
  },
  update(dt) {
    for (const d of this.drones) {
      d.timer += dt * d.speed;
      d.group.position.x = d.basePos.x + Math.cos(d.timer) * d.radius;
      d.group.position.z = d.basePos.z + Math.sin(d.timer) * d.radius;
      d.group.position.y = d.height + Math.sin(d.timer * 2) * 0.5;
      d.group.lookAt(cam.position.x, d.group.position.y, cam.position.z);
      d.propPhase += dt * 30;
      let i = 0;
      d.group.traverse(c => {
        if (c.geometry && c.geometry.type === 'TorusGeometry') {
          c.rotation.z = d.propPhase * (i % 2 === 0 ? 1 : -1);
          i++;
        }
      });
    }
  },
  clear() {
    for (const d of this.drones) {
      if (d.group.parent) d.group.parent.remove(d.group);
      d.group.traverse(c => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
    }
    this.drones = [];
  }
};

// ===== ZOMBIE SPAWN VARIATIONS =====
function getSpawnFormation(wave, count) {
  const formations = ['circle', 'line', 'swarm', 'cluster', 'arc'];
  const idx = wave % formations.length;
  const formation = formations[idx];
  const positions = [];
  const center = new THREE.Vector3(0, 0, 0);
  const baseDist = 25 + Math.random() * 15;
  switch (formation) {
    case 'circle':
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2;
        const r = baseDist + (Math.random() - 0.5) * 5;
        positions.push(new THREE.Vector3(Math.cos(ang) * r, 0, Math.sin(ang) * r));
      }
      break;
    case 'line':
      for (let i = 0; i < count; i++) {
        const offset = (i - count / 2) * 2;
        positions.push(new THREE.Vector3(offset, 0, -baseDist));
      }
      break;
    case 'swarm':
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const r = baseDist * 0.5 + Math.random() * baseDist;
        positions.push(new THREE.Vector3(Math.cos(ang) * r, 0, Math.sin(ang) * r));
      }
      break;
    case 'cluster':
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2;
        const r = 3 + Math.random() * 5;
        const cx = (Math.random() - 0.5) * 40;
        const cz = (Math.random() - 0.5) * 40;
        positions.push(new THREE.Vector3(cx + Math.cos(ang) * r, 0, cz + Math.sin(ang) * r));
      }
      break;
    case 'arc':
      for (let i = 0; i < count; i++) {
        const ang = -Math.PI / 2 + (i / (count - 1) - 0.5) * Math.PI * 0.6;
        const r = baseDist + (Math.random() - 0.5) * 8;
        positions.push(new THREE.Vector3(Math.cos(ang) * r, 0, Math.sin(ang) * r));
      }
      break;
  }
  return positions;
}

// ===== VICTORY CHECK SYSTEM (infinite, but track milestones) =====
const MILESTONE_VICTORY = {
  milestones: [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100],
  achieved: new Set(),
  check(wave) {
    if (this.milestones.includes(wave) && !this.achieved.has(wave)) {
      this.achieved.add(wave);
      addKillMsg(`LOGRO: OLEADA ${wave} ALCANZADA!`, false);
      const bonus = wave * 1000;
      G.score += bonus;
      spawnFloatingText(new THREE.Vector3(0, 10, 0), `+${bonus} BONUS OLEADA ${wave}`, 0xffdd00, 300);
    }
  }
};

// ===== FINAL INITIALIZATION =====
ZOMBIE_TRAILS.init();
IMPACT_DECALS.init();
WAVE_PROGRESS.init();
TOAST.init();
GAME_STATS.init();

dom.hud.style.display = 'none';
dom.go.style.display = 'none';
dom.pause.style.display = 'none';
dom.controls.style.display = 'none';
$('weaponSelect').style.display = 'none';
$('diffSelect').style.display = 'none';
$('settingsModal').style.display = 'none';
$('scoresModal').style.display = 'none';
dom.menu.style.display = 'flex';
updateSndUI();
dom.menuWeapon.textContent = 'RIFLE';
dom.menuDifficulty.textContent = 'NORMAL';
gameLoop(0);

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
scene.fog = new THREE.Fog(0x2a3a2a, 50, 90);

const ambientLight = new THREE.AmbientLight(0x446644, 0.5);
scene.add(ambientLight);
const hemiLight = new THREE.HemisphereLight(0x88bb88, 0x223322, 0.4);
scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xffeedd, 0.6);
dirLight.position.set(20, 30, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048; dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5; dirLight.shadow.camera.far = 60;
dirLight.shadow.camera.left = -60; dirLight.shadow.camera.right = 60;
dirLight.shadow.camera.top = 60; dirLight.shadow.camera.bottom = -60;
scene.add(dirLight);
const fillLight = new THREE.DirectionalLight(0x6688aa, 0.2);
fillLight.position.set(-15, 10, -15);
scene.add(fillLight);

const groundGeo = new THREE.PlaneGeometry(110, 110, 22, 22);
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

const gridHelper = new THREE.GridHelper(110, 55, 0x3a6a3a, 0x2a5a2a);
gridHelper.position.y = 0.01;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.15;
scene.add(gridHelper);

const walls = [];
const HALF = 54;
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
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.08, d * 0.9), new THREE.MeshStandardMaterial({ color: roofCol || 0x333344 }));
  roof.position.set(x, h + 0.04, z); roof.rotation.y = Math.random() * 0.3; scene.add(roof);
  const wMat = new THREE.MeshStandardMaterial({ color: 0xffffcc, emissive: 0xffff88, emissiveIntensity: 0.15 });
  for (let i = 0; i < 2; i++) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), wMat);
    win.position.set(x + (i === 0 ? -0.3 : 0.3), h * 0.6, z + d / 2 + 0.01); scene.add(win);
  }
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x443322 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.04), doorMat);
  door.position.set(x + 0.4, 0.275, z + d / 2 + 0.02); scene.add(door);
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, 0.04, d + 0.06), new THREE.MeshStandardMaterial({ color: 0x555566, roughness: 0.6 }));
  ledge.position.set(x, 0.02, z); scene.add(ledge);
  if (h > 1.5) {
    for (let i = 0; i < 2; i++) {
      const awning = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.25), new THREE.MeshStandardMaterial({ color: [0x664433, 0x336644][i] }));
      awning.position.set(x + (i === 0 ? -0.4 : 0.4), h * 0.35, z + d / 2 + 0.13);
      awning.rotation.x = -0.2; scene.add(awning);
    }
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
];
for (const b of BLDGS) addBuildingDetail(b[0], b[1], b[2], b[3], b[4], b[5], b[6]);

const roadMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
const road1 = new THREE.Mesh(new THREE.BoxGeometry(110, 0.02, 5), roadMat);
road1.position.set(0, 0.02, 0); road1.receiveShadow = true; scene.add(road1);
const road2 = new THREE.Mesh(new THREE.BoxGeometry(5, 0.02, 110), roadMat);
road2.position.set(0, 0.02, 0); road2.receiveShadow = true; scene.add(road2);
const lineMat = new THREE.MeshBasicMaterial({ color: 0xcccc00 });
for (let i = -50; i < 50; i += 4) {
  const line = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.025, 1.5), lineMat);
  line.position.set(i, 0.03, 0); scene.add(line);
  const line2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.025, 0.08), lineMat);
  line2.position.set(0, 0.03, i); scene.add(line2);
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

for (const [bx, bz, cnt] of [[-16,-36,8],[16,36,6],[-36,-16,7],[36,16,5],[-40,40,5],[40,-40,6]]) addDebris(bx, bz, cnt);
addBarrel(-25, -35, 0x556644); addBarrel(-24, -35, 0x665533); addBarrel(25, 35, 0x556644);
addBarrel(24, 36, 0x445533); addBarrel(-10, -20, 0x667744); addBarrel(10, 20, 0x557744);
addBarrel(-36, 10, 0x446633); addBarrel(36, -10, 0x556633);
addCrateStack(-8, -16, 0.3); addCrateStack(8, 16, -0.4); addCrateStack(-16, 8, 0.7);
addCrateStack(16, -8, -0.2); addCrateStack(-40, -8, 0.1); addCrateStack(40, 8, -0.5);
addCrateStack(-6, 40, 0.8); addCrateStack(6, -40, -0.7);
addCar(-10, -38, 0.5, 0x334466); addCar(30, 22, 1.2, 0x663333);
addCar(-32, 26, -0.8, 0x335533); addCar(12, -36, 2.1, 0x555544);
addCar(-38, -38, 0.3, 0x444466);
addLampPost(-10, -3); addLampPost(10, -3); addLampPost(-10, 3); addLampPost(10, 3);
addLampPost(-24, 0); addLampPost(24, 0); addLampPost(0, -24); addLampPost(0, 24);
addPuddle(-14, -4, 0.5); addPuddle(14, 4, 0.4); addPuddle(0, -14, 0.6);
addPuddle(-8, 14, 0.35); addPuddle(18, -18, 0.45); addPuddle(-20, 12, 0.3);
addTireStack(-22, -38); addTireStack(22, 38); addTireStack(-38, 22); addTireStack(38, -22);
addTireStack(-10, -26); addTireStack(10, 26);
addSandbagWall(-18, -6, 0, 5); addSandbagWall(18, 6, Math.PI, 5);
addSandbagWall(-6, 18, Math.PI / 2, 4); addSandbagWall(6, -18, -Math.PI / 2, 4);

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
const TREE_POS = [[-25,-15],[-20,-30],[25,-15],[20,-30],[-25,15],[-20,30],[25,15],[20,30],[-42,-30],[-35,-40],[42,-30],[35,-40],[-42,30],[-35,40],[42,30],[35,40],[-5,-48],[5,-48],[-5,48],[5,48],[-48,-5],[48,-5],[-48,5],[48,5]];
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

const BUSH_POS = [[-28,-18],[-22,-22],[28,-18],[22,-22],[-28,22],[-22,18],[28,22],[22,18],[-35,-28],[30,-35],[-35,28],[30,35],[-15,-42],[15,-42],[-15,42],[15,42],[-10,-10],[10,-10],[-10,10],[10,10],[-38,0],[0,-38],[38,0],[0,38],[-45,-20],[45,-20],[-45,20],[45,20],[-20,-45],[20,-45],[-20,45],[20,45]];
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

function addContainer(x,z,rot) {
  const mat=new THREE.MeshStandardMaterial({color:0x775533,roughness:0.7,metalness:0.3});
  const c=new THREE.Mesh(new THREE.BoxGeometry(2.0,0.8,0.8),mat);
  c.position.set(x,0.4,z); c.rotation.y=rot; c.castShadow=true; scene.add(c);
  const hw=1.0*Math.abs(Math.cos(rot))+0.4*Math.abs(Math.sin(rot));
  const hd=0.4*Math.abs(Math.cos(rot))+1.0*Math.abs(Math.sin(rot));
  walls.push({minX:x-hw,maxX:x+hw,minZ:z-hd,maxZ:z+hd});
}
addContainer(-50,-30,0); addContainer(50,-30,0.2); addContainer(-50,30,-0.2); addContainer(50,30,0);

for (const [cx,cz] of [[-22,-42],[22,42],[-42,-22],[42,22]]) {
  const m=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.25,0.1,6),new THREE.MeshStandardMaterial({color:0x553322,roughness:0.9}));
  m.position.set(cx,0.05,cz); scene.add(m);
  const f=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,6),new THREE.MeshBasicMaterial({color:0xff6600,transparent:true,opacity:0.5}));
  f.position.set(cx,0.2,cz); scene.add(f);
  const fl=new THREE.PointLight(0xff4400,0.2,3); fl.position.set(cx,0.2,cz); scene.add(fl);
}

for (const [px,pz] of [[-14,-14],[14,14],[-14,14],[14,-14],[-30,-25],[30,25],[-30,25],[30,-25],[-24,0],[24,0],[0,-24],[0,24]]) {
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

const SPAWNS = [];
for (let i = 0; i < 20; i++) {
  const a = i / 20 * Math.PI * 2;
  SPAWNS.push({ x: Math.cos(a) * (HALF - 5), z: Math.sin(a) * (HALF - 5) });
}

const WPS = {
  p:  { id:'p',  name:'PISTOLA',   mag:15, res:60,  rof:0.15, spd:40, dmg:15, spread:0.04, reload:1.5, col:0x667788, icon:'🔫', kickBack:0.03, spreadIncrease:0.005 },
  s:  { id:'s',  name:'SUBFUSIL',  mag:30, res:120, rof:0.06, spd:35, dmg:10, spread:0.06, reload:2.0, col:0x556677, icon:'⚡', kickBack:0.02, spreadIncrease:0.008 },
  a:  { id:'a',  name:'RIFLE',     mag:30, res:90,  rof:0.08, spd:50, dmg:22, spread:0.025, reload:2.2, col:0x445566, icon:'🎯', kickBack:0.04, spreadIncrease:0.004 },
  sg: { id:'sg', name:'ESCOPETA',  mag:8,  res:32,  rof:0.45, spd:30, dmg:18, spread:0.12, reload:2.5, col:0x665544, icon:'💥', kickBack:0.08, spreadIncrease:0.02 },
  r:  { id:'r',  name:'LANZADOR',  mag:5,  res:15,  rof:0.8,  spd:25, dmg:80, spread:0.01, reload:3.0, col:0x884444, icon:'🚀', kickBack:0.06, spreadIncrease:0.002 },
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

const tracers = [];
function addTracer(from, to, col) {
  const g = new THREE.BufferGeometry().setFromPoints([from.clone(), to.clone()]);
  const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.6 }));
  scene.add(l); tracers.push({ l, life: 0.1 });
}
function updateTracers(dt) {
  for (let i = tracers.length - 1; i >= 0; i--) {
    const t = tracers[i]; t.life -= dt;
    t.l.material.opacity = Math.max(0, t.life / 0.1);
    if (t.life <= 0) { scene.remove(t.l); t.l.geometry.dispose(); t.l.material.dispose(); tracers.splice(i, 1); }
  }
}

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
  walk:     { spd:1.2, hp:100, dmg:8,  color:0x44aa44, size:0.9, scoreVal:2, name:'Zombie', unlockWave:1 },
  runner:   { spd:2.8, hp:60,  dmg:10, color:0xcc8822, size:0.75, scoreVal:3, name:'Corredor', unlockWave:2 },
  brute:    { spd:0.6, hp:400, dmg:25, color:0x883333, size:1.4, scoreVal:5, name:'Bruto', unlockWave:3 },
  exploder: { spd:1.0, hp:80,  dmg:0,  color:0xcc4444, size:1.0, scoreVal:4, name:'Explosivo', unlockWave:2, explode:true },
  spitter:  { spd:0.9, hp:120, dmg:12, color:0x55dd55, size:0.9, scoreVal:4, name:'Escupidor', unlockWave:3, spit:true },
  crawler:  { spd:1.6, hp:50,  dmg:6,  color:0x777744, size:0.5, scoreVal:3, name:'Rastrero', unlockWave:4 },
  screamer: { spd:2.2, hp:40,  dmg:5,  color:0xdd44dd, size:0.85, scoreVal:4, name:'Gritador', unlockWave:5 },
  leaper:   { spd:1.8, hp:90,  dmg:14, color:0x44aadd, size:0.8, scoreVal:5, name:'Saltarin', unlockWave:6 },
  tank:     { spd:0.4, hp:800, dmg:35, color:0x555555, size:1.8, scoreVal:10, name:'Tanque', unlockWave:8 },
  necro:    { spd:0.7, hp:150, dmg:10, color:0x6622aa, size:1.0, scoreVal:8, name:'Necromante', unlockWave:10 },
};

const zombies = [];

function createZombie(type, pos, waveScale) {
  const def = ZOMBIE_TYPES[type] || ZOMBIE_TYPES.walk;
  const s = def.size;
  const g = new THREE.Group();
  const bMat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.8, emissive: def.color, emissiveIntensity: 0.1 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.15*s,0.2*s,0.5*s,6), bMat);
  body.position.y = 0.25*s; g.add(body);
  const hMat = new THREE.MeshStandardMaterial({ color: 0xccbbaa, roughness: 0.7, emissive: def.color, emissiveIntensity: 0.05 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12*s,6,6), hMat);
  head.position.y = 0.5*s + 0.1*s; g.add(head);
  const aMat = new THREE.MeshStandardMaterial({ color: 0xccbbaa });
  const larm = new THREE.Mesh(new THREE.CylinderGeometry(0.03*s,0.04*s,0.3*s,4), aMat);
  larm.position.set(-0.15*s,0.25*s,0); larm.rotation.z=0.5; g.add(larm);
  const rarm = new THREE.Mesh(new THREE.CylinderGeometry(0.03*s,0.04*s,0.3*s,4), aMat);
  rarm.position.set(0.15*s,0.25*s,0); rarm.rotation.z=-0.5; g.add(rarm);
  if (type === 'brute' || type === 'tank') {
    const armS = type === 'tank' ? 1.3 : 1.0;
    const larmBig = new THREE.Mesh(new THREE.CylinderGeometry(0.06*s*armS,0.08*s*armS,0.4*s*armS,5), bMat);
    larmBig.position.set(-0.25*s,0.2*s,0); larmBig.rotation.z=0.6; g.add(larmBig);
    const rarmBig = new THREE.Mesh(new THREE.CylinderGeometry(0.06*s*armS,0.08*s*armS,0.4*s*armS,5), bMat);
    rarmBig.position.set(0.25*s,0.2*s,0); rarmBig.rotation.z=-0.5; g.add(rarmBig);
    const armor = new THREE.Mesh(new THREE.BoxGeometry(0.4*s,0.35*s,0.35*s), new THREE.MeshStandardMaterial({ color: type === 'tank' ? 0x333333 : 0x555555, metalness: 0.3 }));
    armor.position.y=0.25*s; g.add(armor);
    if (type === 'tank') {
      const horn1 = new THREE.Mesh(new THREE.ConeGeometry(0.05*s,0.15*s,4), new THREE.MeshStandardMaterial({ color:0x666677 }));
      horn1.position.set(-0.1*s,0.7*s,0.12*s); horn1.rotation.z=0.3; g.add(horn1);
      const horn2 = horn1.clone(); horn2.position.x = 0.1*s; horn2.rotation.z = -0.3; g.add(horn2);
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.5*s,0.5*s,0.05*s), new THREE.MeshStandardMaterial({ color:0x444444, metalness:0.5 }));
      plate.position.set(0,0.3*s,0.2*s); g.add(plate);
    } else {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.04*s,0.1*s,4), new THREE.MeshStandardMaterial({ color:0x666677 }));
      horn.position.set(0,0.65*s,0.12*s); g.add(horn);
    }
  } else if (type === 'exploder') {
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.2*s,6,6), new THREE.MeshBasicMaterial({ color:0xff4400, transparent:true, opacity:0.3 }));
    glow.position.y=0.15*s; g.add(glow);
    const veins = new THREE.Mesh(new THREE.SphereGeometry(0.18*s,4,4), new THREE.MeshBasicMaterial({ color:0xff2200, transparent:true, opacity:0.15 }));
    veins.position.y=0.25*s; g.add(veins);
  } else if (type === 'spitter') {
    const sac = new THREE.Mesh(new THREE.SphereGeometry(0.1*s,5,5), new THREE.MeshBasicMaterial({ color:0x44ff44, transparent:true, opacity:0.5 }));
    sac.position.set(0.15*s,0.35*s,0); g.add(sac);
    const sac2 = new THREE.Mesh(new THREE.SphereGeometry(0.07*s,4,4), new THREE.MeshBasicMaterial({ color:0x22ff22, transparent:true, opacity:0.4 }));
    sac2.position.set(-0.1*s,0.4*s,0.05*s); g.add(sac2);
  } else if (type === 'crawler') {
    for (let li = 0; li < 4; li++) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015*s,0.02*s,0.2*s,4), aMat);
      leg.position.set((li < 2 ? -1 : 1) * 0.08*s, 0.05, (li % 2 === 0 ? -1 : 1) * 0.08*s);
      leg.rotation.z = 0.8; g.add(leg);
    }
    body.position.y = 0.1*s; body.scale.y = 0.6;
    head.position.y = 0.2*s;
    larm.position.y = 0.1*s; rarm.position.y = 0.1*s;
  } else if (type === 'screamer') {
    const mouth = new THREE.Mesh(new THREE.ConeGeometry(0.08*s,0.12*s,5), new THREE.MeshStandardMaterial({ color:0xff4488, emissive:0xff2244, emissiveIntensity:0.2 }));
    mouth.rotation.x = Math.PI / 2; mouth.position.set(0, 0.45*s, 0.12*s); g.add(mouth);
    const aura = new THREE.Mesh(new THREE.SphereGeometry(0.4*s,8,8), new THREE.MeshBasicMaterial({ color:0xdd44dd, transparent:true, opacity:0.08 }));
    aura.position.y = 0.3*s; g.add(aura);
  } else if (type === 'leaper') {
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.025*s,0.03*s,0.35*s,4), bMat);
    legL.position.set(-0.1*s,0.05,0); legL.rotation.z=0.3; g.add(legL);
    const legR = legL.clone(); legR.position.x = 0.1*s; legR.rotation.z = -0.3; g.add(legR);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.02*s,0.01*s,0.3*s,4), aMat);
    tail.position.set(0,0.3*s,-0.15*s); tail.rotation.x=0.5; g.add(tail);
  } else if (type === 'necro') {
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.25*s,0.35*s,0.6*s,6), new THREE.MeshStandardMaterial({ color:0x331155, roughness:0.9 }));
    robe.position.y = 0.3*s; g.add(robe);
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.015*s,0.015*s,0.8*s,4), new THREE.MeshStandardMaterial({ color:0x553322, roughness:0.7 }));
    staff.position.set(0.2*s,0.4*s,0); g.add(staff);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.05*s,6,6), new THREE.MeshBasicMaterial({ color:0xaa44ff }));
    orb.position.set(0.2*s,0.82*s,0); g.add(orb);
    const orbGlow = new THREE.Mesh(new THREE.SphereGeometry(0.1*s,6,6), new THREE.MeshBasicMaterial({ color:0x8822ff, transparent:true, opacity:0.2 }));
    orbGlow.position.copy(orb.position); g.add(orbGlow);
  }
  const hpBar = new THREE.Mesh(new THREE.PlaneGeometry(0.3*s,0.03), new THREE.MeshBasicMaterial({ color:0xff0000, transparent:true, depthTest:false }));
  hpBar.position.y=0.7*s; g.add(hpBar);
  const hpBack = new THREE.Mesh(new THREE.PlaneGeometry(0.3*s,0.03), new THREE.MeshBasicMaterial({ color:0x333333, transparent:true, depthTest:false }));
  hpBack.position.set(0,0.7*s,-0.001); g.add(hpBack);
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
        const knockDir = _tmpV3b.subVectors(this.g.position, cam.position).normalize();
        this.g.position.addScaledVector(knockDir, Math.min(0.3, dmg * 0.003));
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
function getWaveCount(wave) { return Math.min(5 + wave * 3, 60); }
function getWaveScale(wave) { return 1 + (wave - 1) * 0.08; }
function getBossScale(wave) { return 1 + Math.floor(wave / 5) * 0.3; }

const BOSS_TYPES = [
  { name: 'ABOMINACION', hp: 1000, color: 0x332211, size: 2.0 },
  { name: 'COLOSOS', hp: 1500, color: 0x223311, size: 2.3 },
  { name: 'TITAN OSCURO', hp: 2000, color: 0x1a1a2e, size: 2.6 },
  { name: 'DEVORADOR', hp: 3000, color: 0x3d0000, size: 3.0 },
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
  if (isBossWave) startBoss();
  G._waveQueue = isHordeWave ? count * 2 : count;
  G._waveTypeList = types;
  G._waveSpawnTimer = 0;
  G._waveScale = waveScale;
  G._isFastWave = isFastWave;
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
  const bossMat = new THREE.MeshStandardMaterial({ color: bt.color, roughness: 0.5, metalness: 0.3 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5*s,0.7*s,1.0*s,8), bossMat);
  body.position.y=0.5*s; g.add(body);
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.8*s,0.5*s,0.4*s), new THREE.MeshStandardMaterial({ color: 0x442222, roughness: 0.6 }));
  chest.position.set(0,0.6*s,0); g.add(chest);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2*s,6,6), new THREE.MeshStandardMaterial({ color:0xcc8855, roughness:0.7 }));
  head.position.y=1.0*s; g.add(head);
  const armMat = new THREE.MeshStandardMaterial({ color:0x442222 });
  const larm = new THREE.Mesh(new THREE.CylinderGeometry(0.1*s,0.14*s,0.5*s,6), armMat);
  larm.position.set(-0.4*s,0.4*s,0); larm.rotation.z=0.6; g.add(larm);
  const rarm = new THREE.Mesh(new THREE.CylinderGeometry(0.1*s,0.14*s,0.5*s,6), armMat);
  rarm.position.set(0.4*s,0.4*s,0); rarm.rotation.z=-0.5; g.add(rarm);
  for (let i=0;i<6;i++) {
    const sp = new THREE.Mesh(new THREE.ConeGeometry(0.06*s,0.12*s,4), new THREE.MeshStandardMaterial({ color:0x555555 }));
    sp.position.set(Math.cos(i*Math.PI/3)*0.35*s, 0.02, Math.sin(i*Math.PI/3)*0.35*s); g.add(sp);
  }
  const eyeG = new THREE.Mesh(new THREE.SphereGeometry(0.05*s,4,4), new THREE.MeshBasicMaterial({ color:0xff2200 }));
  eyeG.position.set(0,1.0*s,0.15*s); g.add(eyeG);
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
        snd('bossDeath'); snd('victory');
        spawnExplosion(this.g.position, 6);
        spawnParticles(this.g.position, 0x444444, 50);
        for (let i=0;i<5;i++) spawnPickup(this.g.position, i % 3);
        scene.remove(this.g); dom.bossBar.style.display = 'none';
        showRoundMsg('!VICTORIA!', '!Has derrotado al jefe!');
        setTimeout(() => { if (!G.victory) showVictory(); }, 2000);
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
  if (boss.g.children[1]) boss.g.children[1].position.y = 1.2 + sway;
  if (boss.enrage) {
    const pul = 1 + Math.sin(boss.animTime * 8) * 0.03;
    boss.g.scale.set(pul, pul, pul);
  }
  if (boss.phase === 3) {
    const flash = 0.5 + Math.sin(boss.animTime * 12) * 0.5;
    if (boss.g.children[8]) boss.g.children[8].material.opacity = flash * 0.8;
  }
  boss.attackCD -= dt; boss.slamCD -= dt; boss.chargeCD -= dt; boss.spitCD -= dt;

  if (dist < 2.5 && boss.attackCD <= 0 && !boss.isCharging) {
    boss.attackCD = 0.8;
    boss.dealDmg();
  }
  if (dist < 5 && boss.slamCD <= 0 && !boss.isCharging) {
    boss.slamCD = 4 + Math.random();
    snd('bossSlam');
    screenShake = Math.max(screenShake, 0.15);
    for (const z of zombies) { if (!z.alive) continue; if (z.getPos().distanceTo(p) < 5) z.takeDamage(60, false); }
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
  wsad: [false, false, false, false],
  waveActive: false, waveSpawnDone: false,
  _waveQueue: 0, _waveTypeList: [], _waveSpawnTimer: 0,
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
  G.wsad = [false, false, false, false];
  G.waveActive = false; G.waveSpawnDone = false;
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
  for (const t of tracers) { if (t.l) { scene.remove(t.l); t.l.geometry.dispose(); t.l.material.dispose(); } }
  tracers.length = 0;
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
  if (G.ammo <= 0) { snd('empty'); G.reloading = true; G.reloadT = 0; G.reloadCD = curW.reload || 2; dom.reloadInd.style.display = 'block'; return; }
  G.ammo--; G.shootCD = curW.rof; G.totalShots++;
  G.currentSpread = Math.min(curW.spread * 3, G.currentSpread + curW.spreadIncrease);
  G.weaponKick = curW.kickBack;
  const dmg = curW.dmg;
  const pellets = curW.id === 'sg' ? 6 : 1;
  const origin = cam.position.clone();
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
      const hp = hits[0].point; addTracer(origin, hp, 0xffff88); G.totalHits++;
      if (hitObj.userData.zRef) {
        const z = hitObj.userData.zRef;
        const hs = hits[0].object === z.g.children[1];
        z.takeDamage(dmg, hs);
      } else if (hitObj.userData.bRef) {
        const b = hitObj.userData.bRef;
        const hs = hits[0].object === b.g.children[2];
        b.takeDamage(dmg, hs);
      }
    } else {
      const end = origin.clone().add(dir.clone().multiplyScalar(80));
      addTracer(origin, end, 0xffff88);
    }
  }
  const sndName = curW.id === 'p' ? 'pistol' : curW.id === 's' ? 'smg' : curW.id === 'sg' ? 'shotgun' : curW.id === 'r' ? 'rocket' : 'rifle';
  snd(sndName);
  if (curW.id === 'r') fireRocket(origin, new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion));
  if (wModels[G.curW] && wModels[G.curW].userData.mf) wModels[G.curW].userData.mf.intensity = 1.5;
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
  const acc = G.totalShots > 0 ? Math.round(G.totalHits / G.totalShots * 100) : 0;
  dom.finalScore.textContent = G.score;
  dom.finalKills.textContent = G.totalKills;
  dom.finalRounds.textContent = G.wave;
  dom.finalAcc.textContent = `${acc}%`;
  dom.finalStreak.textContent = G.maxStreak;
  dom.mvpDisplay.textContent = G.maxStreak >= 5 ? 'RACHA IMPRESIONANTE!' : G.maxStreak >= 3 ? 'Buena racha' : '';
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

let lastTime = 0;
let waveCompleteCooldown = 0;

function gameLoop(time) {
  requestAnimationFrame(gameLoop);
  const dt = Math.min((time - lastTime) / 1000, 0.05); lastTime = time;
  if (!G.playing) { renderer.render(scene, cam); return; }
  updateLighting(dt);
  updatePlayer(dt);
  processWaveSpawning(dt);
  updateZombies(dt);
  if (boss) updateBoss(dt);
  updateRockets(dt);
  updateSpits(dt);
  updateParticles(dt);
  updateTracers(dt);
  updateShootCD(dt);
  autoCollect(dt);
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
  ctx.fillStyle = 'rgba(0,20,0,0.3)'; ctx.fillRect(0, 0, W, H);
  const sc = W / (HALF * 2);
  const cx = W / 2 - cam.position.x * sc, cy = H / 2 - cam.position.z * sc;
  ctx.fillStyle = 'rgba(68,68,85,0.5)'; ctx.strokeStyle = 'rgba(68,68,85,0.7)'; ctx.lineWidth = 0.5;
  for (const w of walls) {
    const ww = (w.maxX - w.minX) * sc, wh = (w.maxZ - w.minZ) * sc;
    if (ww > 0 && wh > 0 && ww < 15 && wh < 15) ctx.fillRect(cx + w.minX * sc, cy + w.minZ * sc, ww, wh);
  }
  ctx.fillStyle = '#44aa44';
  for (const z of zombies) { if (!z.alive) continue; const p = z.getPos(); ctx.fillRect(cx + p.x * sc - 1, cy + p.z * sc - 1, 2, 2); }
  if (boss && boss.alive) { const p = boss.getPos(); ctx.fillStyle = '#ff4444'; ctx.beginPath(); ctx.arc(cx + p.x * sc, cy + p.z * sc, 3, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#ffaa00';
  for (const pk of pickups) { ctx.fillRect(cx + pk.pos.x * sc - 1, cy + pk.pos.z * sc - 1, 2, 2); }
  ctx.fillStyle = '#44ff44'; ctx.beginPath(); ctx.arc(W / 2, H / 2, 3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#44ff44'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(W / 2, H / 2); ctx.lineTo(W / 2 - Math.sin(cam.rotation.y) * 8, H / 2 - Math.cos(cam.rotation.y) * 8); ctx.stroke();
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

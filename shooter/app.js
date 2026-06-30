import * as THREE from 'three';

const $ = id => document.getElementById(id);
const canvasContainer = $('gameCanvas');
const menu = $('menu'), gameOver = $('gameOver'), controlsModal = $('controlsModal');
const hud = $('hud'), crosshair = $('crosshair'), hitmarker = $('hitmarker');
const dmgOverlay = $('dmgOverlay'), killFeed = $('killFeed'), roundInfo = $('roundInfo');
const botsAlive = $('botsAlive'), lowhp = $('lowhpOverlay'), damageNumbers = $('damageNumbers');
const healthBar = $('healthBar'), armorBar = $('armorBar'), healthText = $('healthText');
const ammoText = $('ammoText'), ammoReserve = $('ammoReserve'), scoreText = $('scoreText');
const killsText = $('killsText'), hudRound = $('hudRound'), weaponName = $('weaponName');
const weaponIcon = $('weaponIcon'), weaponStrip = $('weaponStrip'), reloadIndicator = $('reloadIndicator');
const minimapCanvas = $('minimapCanvas');

const MAP_SIZE = 140, HALF_MAP = 70;
const PH = 1.6, PR = 0.35, GRAVITY = -22, RUN_SPEED = 9, JUMP_SPEED = 8.5;

const ZOMBIE_TYPES = [
  { id:'normal',   name:'ZOMBI',     hp:80,  speed:3.0, dmg:10, color:0x557744, scale:1.0,  atkRange:1.5, atkRate:1.0, score:100, exp:1 },
  { id:'fast',     name:'CORREDOR',  hp:50,  speed:6.5, dmg:8,  color:0x667744, scale:0.85, atkRange:1.8, atkRate:0.5, score:150, exp:2 },
  { id:'tank',     name:'TANQUE',    hp:350, speed:1.8, dmg:30, color:0x553333, scale:1.4,  atkRange:1.8, atkRate:1.5, score:300, exp:4 },
  { id:'spitter',  name:'ESCUPIDOR', hp:70,  speed:2.5, dmg:8,  color:0x447744, scale:1.0,  atkRange:12,  atkRate:2.0, score:200, exp:3, spitDmg:15 },
  { id:'exploder', name:'EXPLOSIVO', hp:50,  speed:3.5, dmg:50, color:0x883333, scale:1.1,  atkRange:2.5, atkRate:999, score:250, exp:5 },
];

const WEAPONS = {
  pistol:  { id:'pistol',  name:'PISTOLA',  icon:'🔫', dmg:20, rate:0.18, reload:1.2, mag:15, res:60,  spread:0.015, recoil:0.02, auto:false, pellets:1, range:40, snd:'pistol',  color:0x555555, tc:0xffff88 },
  smg:     { id:'smg',     name:'SUBfusil', icon:'⚡', dmg:10, rate:0.065,reload:1.5, mag:40, res:200, spread:0.03,  recoil:0.015,auto:true,  pellets:1, range:35, snd:'smg',     color:0x446644, tc:0x88ff88 },
  assault: { id:'assault', name:'RIFLE',    icon:'🔫', dmg:25, rate:0.1,  reload:1.8, mag:30, res:120, spread:0.01,  recoil:0.02, auto:true,  pellets:1, range:60, snd:'rifle',   color:0x444466, tc:0x88aaff },
  shotgun: { id:'shotgun', name:'ESCOPETA', icon:'💥', dmg:12, rate:0.55, reload:2.5, mag:8,  res:32,  spread:0.12,  recoil:0.1,  auto:false, pellets:8, range:20, snd:'shotgun', color:0x664444, tc:0xff8844 },
  rocket:  { id:'rocket',  name:'LANZADOR', icon:'🚀', dmg:150,rate:1.2, reload:3.0, mag:1,  res:8,   spread:0.005, recoil:0.2,  auto:false, pellets:1, range:80, snd:'rocket',  color:0x664422, tc:0xff4400, aoe:5, aoeDmg:80 },
};
const WORDER = ['pistol','smg','assault','shotgun','rocket'];

const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
canvasContainer.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);
scene.fog = new THREE.FogExp2(0x0a0a0a, 0.0045);

const camera = new THREE.PerspectiveCamera(72, innerWidth/innerHeight, 0.1, 200);
scene.add(camera);
camera.position.set(0, PH, 0);
const clock = new THREE.Clock();

scene.add(new THREE.AmbientLight(0x442222, 0.3));
scene.add(new THREE.HemisphereLight(0x442222, 0x221111, 0.4));
const sun = new THREE.DirectionalLight(0xff8844, 0.8);
sun.position.set(20, 40, -20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 120;
sun.shadow.camera.left = -80; sun.shadow.camera.right = 80;
sun.shadow.camera.top = 80; sun.shadow.camera.bottom = -80;
sun.shadow.bias = -0.002;
scene.add(sun);
const moon = new THREE.DirectionalLight(0x4444aa, 0.3);
moon.position.set(-30, 20, 30);
scene.add(moon);
const redglow = new THREE.PointLight(0xff2200, 0.5, 50);
redglow.position.set(0, 10, 0);
scene.add(redglow);

const fogParticles = new THREE.Points(
  new THREE.BufferGeometry(),
  new THREE.PointsMaterial({ color:0x442222, size:0.8, transparent:true, opacity:0.15, sizeAttenuation:true })
);
const fp = new Float32Array(500*3);
for (let i=0;i<500;i++) {
  fp[i*3]=(Math.random()-0.5)*150; fp[i*3+1]=Math.random()*8; fp[i*3+2]=(Math.random()-0.5)*150;
}
fogParticles.geometry.setAttribute('position', new THREE.BufferAttribute(fp,3));
scene.add(fogParticles);

const stars = new THREE.Points(
  new THREE.BufferGeometry(),
  new THREE.PointsMaterial({ color:0xffffff, size:0.15, transparent:true, opacity:0.4, sizeAttenuation:true })
);
const sp = new Float32Array(2000*3);
for (let i=0;i<2000;i++) {
  const t=Math.random()*Math.PI*2, p=Math.acos(2*Math.random()-1), r=120+Math.random()*50;
  sp[i*3]=r*Math.sin(p)*Math.cos(t); sp[i*3+1]=Math.abs(r*Math.cos(p)); sp[i*3+2]=r*Math.sin(p)*Math.sin(t);
}
stars.geometry.setAttribute('position', new THREE.BufferAttribute(sp,3));
scene.add(stars);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE),
  new THREE.MeshStandardMaterial({ color:0x1a1a1a, roughness:0.95, metalness:0.02 })
);
ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground);

// Ground zones
function addZone(cx, cz, w, d, color) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color, roughness:0.95, metalness:0.0 }));
  m.rotation.x = -Math.PI/2; m.position.set(cx, 0.01, cz); scene.add(m);
}
addZone(0, 0, 30, 30, 0x222222);
addZone(-35, -30, 26, 20, 0x1a1f1a);
addZone(35, -30, 20, 20, 0x1a1a1f);
addZone(-30, 35, 22, 16, 0x1f1a1a);
addZone(35, 32, 16, 14, 0x1f1f1a);

// Wall system
const walls = [];
function wallSeg(x, z, w, h, d, color=0x2a2a3a) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness:0.75, metalness:0.1 }));
  m.position.set(x, h/2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
  walls.push({ mesh:m, minX:x-w/2, maxX:x+w/2, minZ:z-d/2, maxZ:z+d/2 });
  return m;
}
function addRoom(cx, cz, w, d, h, color, doors) {
  const t=0.8, dw=2.8;
  const hw=w/2, hd=d/2;
  const dn=doors.includes('n'), ds=doors.includes('s'), de=doors.includes('e'), dw_=doors.includes('w');
  if (dn) { const sw=(w-dw)/2; if(sw>0){wallSeg(cx-hw+sw/2, cz-hd, sw, h, t, color);wallSeg(cx+hw-sw/2, cz-hd, sw, h, t, color);} }
  else wallSeg(cx, cz-hd, w, h, t, color);
  if (ds) { const sw=(w-dw)/2; if(sw>0){wallSeg(cx-hw+sw/2, cz+hd, sw, h, t, color);wallSeg(cx+hw-sw/2, cz+hd, sw, h, t, color);} }
  else wallSeg(cx, cz+hd, w, h, t, color);
  if (de) { const sd=(d-dw)/2; if(sd>0){wallSeg(cx+hw, cz-hd+sd/2, t, h, sd, color);wallSeg(cx+hw, cz+hd-sd/2, t, h, sd, color);} }
  else wallSeg(cx+hw, cz, t, h, d, color);
  if (dw_) { const sd=(d-dw)/2; if(sd>0){wallSeg(cx-hw, cz-hd+sd/2, t, h, sd, color);wallSeg(cx-hw, cz+hd-sd/2, t, h, sd, color);} }
  else wallSeg(cx-hw, cz, t, h, d, color);
}

// Boundary
wallSeg(0, -HALF_MAP, MAP_SIZE, 5, 0.8, 0x111122);
wallSeg(0, HALF_MAP, MAP_SIZE, 5, 0.8, 0x111122);
wallSeg(-HALF_MAP, 0, 0.8, 5, MAP_SIZE, 0x111122);
wallSeg(HALF_MAP, 0, 0.8, 5, MAP_SIZE, 0x111122);

// Buildings
addRoom(-35, -28, 24, 16, 5.5, 0x2a2a4a, ['s','e']);
addRoom(35, -28, 16, 14, 5.0, 0x3a2a4a, ['w']);
addRoom(-32, 35, 18, 12, 4.0, 0x2a3a4a, ['n']);
addRoom(35, 32, 12, 10, 4.0, 0x3a3a4a, ['n','s']);

// Internal walls for apartments
wallSeg(30, -28, 0.8, 4.5, 10, 0x3a2a4a);
wallSeg(40, -28, 0.8, 4.5, 10, 0x3a2a4a);

// Central monument
const cp = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2, 0.8, 16), new THREE.MeshStandardMaterial({ color:0x444466, roughness:0.4, metalness:0.3 }));
cp.position.set(0, 0.4, 0); scene.add(cp);
const cw = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.05, 16), new THREE.MeshStandardMaterial({ color:0x4488cc, emissive:0x4488ff, emissiveIntensity:0.05, transparent:true, opacity:0.5 }));
cw.position.set(0, 0.8, 0); scene.add(cw);
const cs = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshStandardMaterial({ color:0x8888bb, metalness:0.5 }));
cs.position.set(0, 1.1, 0); scene.add(cs);
walls.push({ mesh:cp, minX:-2, maxX:2, minZ:-2, maxZ:2 });
for (let i=0;i<4;i++) {
  const a=i*Math.PI/2;
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 2.5, 8), new THREE.MeshStandardMaterial({ color:0x444466, roughness:0.5 }));
  col.position.set(Math.cos(a)*4, 1.25, Math.sin(a)*4); col.castShadow = true; scene.add(col);
  walls.push({ mesh:col, minX:Math.cos(a)*4-0.2, maxX:Math.cos(a)*4+0.2, minZ:Math.sin(a)*4-0.2, maxZ:Math.sin(a)*4+0.2 });
}

// Cover walls
const coverPos = [
  [-10,-10],[10,10],[-10,10],[10,-10],[-18,0],[18,0],[0,-18],[0,18],
  [-25,-15],[25,15],[-25,15],[25,-15],[-40,-5],[40,5],[-40,5],[40,-5],
  [-15,-35],[15,35],[-15,35],[15,-35],[-45,-25],[45,25],[-45,25],[45,-25],
  [-5,-45],[5,45],[-45,-5],[45,5],
];
for (const [cx,cz] of coverPos)
  wallSeg(cx, cz, 2.5+Math.random()*2, 1.2+Math.random()*0.6, 0.6, 0x333355);

// Cars
function car(x,z,rot) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color:0x443333 + Math.floor(Math.random()*0x222222), roughness:0.6, metalness:0.4 });
  const gmat = new THREE.MeshStandardMaterial({ color:0x222233, roughness:0.4, metalness:0.6 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 1.0), mat);
  body.position.y = 0.3; body.castShadow = true; g.add(body);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.9), new THREE.MeshStandardMaterial({ color:0x334466, transparent:true, opacity:0.3 }));
  top.position.set(0, 0.65, -0.1); g.add(top);
  for (let s of [-0.6, 0.6]) {
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.08, 6), gmat);
    wh.rotation.x = Math.PI/2; wh.position.set(s, 0.08, -0.3); wh.castShadow = true; g.add(wh);
    const wh2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.08, 6), gmat);
    wh2.rotation.x = Math.PI/2; wh2.position.set(s, 0.08, 0.3); wh2.castShadow = true; g.add(wh2);
  }
  g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  const h = 0.7;
  walls.push({ mesh:g, minX:x-1.2, maxX:x+1.2, minZ:z-0.7, maxZ:z+0.7 });
  return g;
}
car(-20, -12, 0.3); car(22, -18, -0.8); car(-28, 22, 0.5); car(25, 25, -0.2); car(-5, -40, 0.0);

// Crates
for (const [cx,cz] of [[-8,-8],[8,8],[-8,8],[8,-8],[-15,-18],[18,15],[15,-18],[-18,15],[-28,-38],[38,28],[-28,38],[38,-28],[-48,-10],[48,10],[-48,10],[48,-10],[-10, -48],[10,48],[-38,-48],[38,48],[-15,42],[42,-15],[-42,18],[18,-42],[-8, -32],[32,8],[8,32],[-32,-8]]) {
  const s = 0.5+Math.random()*0.5, color = [0x554433,0x664433,0x445544,0x555544][Math.floor(Math.random()*4)];
  const m = new THREE.Mesh(new THREE.BoxGeometry(s*0.8,s*0.5,s*0.8), new THREE.MeshStandardMaterial({ color, roughness:0.8 }));
  m.position.set(cx, s*0.25, cz); m.castShadow=true; m.receiveShadow=true; scene.add(m);
  const h=s*0.4; walls.push({ mesh:m, minX:cx-h, maxX:cx+h, minZ:cz-h, maxZ:cz+h });
}

// Barrels
for (const [bx,bz] of [[-15,-15],[15,15],[-15,15],[15,-15],[-6,-35],[6,35],[-35,-6],[35,6],[-42,-18],[42,18],[-42,18],[42,-18],[-18,-42],[18,42]]) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.5, 8), new THREE.MeshStandardMaterial({ color:0x664422, roughness:0.9 }));
  m.position.set(bx, 0.25, bz); m.castShadow=true; scene.add(m);
  walls.push({ mesh:m, minX:bx-0.25, maxX:bx+0.25, minZ:bz-0.25, maxZ:bz+0.25 });
}

// Lamp posts
for (const [lx,lz] of [[-10,-10],[10,10],[-10,10],[10,10],[-20,-20],[20,20],[-20,20],[20,-20],[-38,-12],[38,12],[-38,12],[38,-12],[0,-28],[0,28],[-28,0],[28,0],[-45,-20],[45,20],[-45,20],[45,-20],[-20,45],[20,-45]]) {
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 2.5, 6), new THREE.MeshStandardMaterial({ color:0x333344, metalness:0.6 }));
  p.position.set(lx, 1.25, lz); p.castShadow = true; scene.add(p);
  const l = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshStandardMaterial({ color:0xff6633, emissive:0xff4400, emissiveIntensity:0.15 }));
  l.position.set(lx, 2.5, lz); scene.add(l);
  walls.push({ mesh:p, minX:lx-0.1, maxX:lx+0.1, minZ:lz-0.1, maxZ:lz+0.1 });
}

// Barbed wire / barriers
for (const [rx,rz] of [[-30,-5],[-30,5],[30,-5],[30,5],[-5,-30],[5,-30],[-5,30],[5,30],[-40,-25],[40,25],[-40,25],[40,-25]]) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.6, 0.3), new THREE.MeshStandardMaterial({ color:0x444433, roughness:0.8 }));
  m.position.set(rx, 0.3, rz); m.castShadow=true; scene.add(m);
  walls.push({ mesh:m, minX:rx-0.75, maxX:rx+0.75, minZ:rz-0.15, maxZ:rz+0.15 });
}

// Fire barrels (with glow)
for (const [fx,fz] of [[-20,-40],[20,40],[-40,-20],[40,20],[-40,20],[40,-20]]) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.5, 8), new THREE.MeshStandardMaterial({ color:0x553322, roughness:0.9 }));
  m.position.set(fx, 0.25, fz); m.castShadow=true; scene.add(m);
  const f = new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 6), new THREE.MeshBasicMaterial({ color:0xff6600, transparent:true, opacity:0.6 }));
  f.position.set(fx, 0.6, fz); scene.add(f);
  const fl = new THREE.PointLight(0xff4400, 0.4, 5); fl.position.set(fx, 0.6, fz); scene.add(fl);
  walls.push({ mesh:m, minX:fx-0.35, maxX:fx+0.35, minZ:fz-0.35, maxZ:fz+0.35 });
}

// Spawn points
const SPAWNS = [];
for (let i=0;i<24;i++) {
  const a=i/24*Math.PI*2;
  SPAWNS.push({ x:Math.cos(a)*(HALF_MAP-6), z:Math.sin(a)*(HALF_MAP-6) });
}

function getObs() { return walls.map(w=>({minX:w.minX,maxX:w.maxX,minZ:w.minZ,maxZ:w.maxZ})); }
function collides(x,z,r) {
  const h=HALF_MAP-r; if(x<-h||x>h||z<-h||z>h)return true;
  for(const w of walls) if(x+r>w.minX&&x-r<w.maxX&&z+r>w.minZ&&z-r<w.maxZ)return true;
  return false;
}

// Audio
let actx = null;
function initAudio() { if(!actx) actx=new(window.AudioContext||window.webkitAudioContext)(); if(actx.state==='suspended') actx.resume(); }
function tone(type,freq,dur,vol,ramp) {
  try{initAudio();const o=actx.createOscillator(),g=actx.createGain();o.connect(g);g.connect(actx.destination);const t=actx.currentTime;o.type=type;typeof freq==='function'?freq(o,t):(o.frequency.setValueAtTime(freq,t),ramp&&o.frequency.exponentialRampToValueAtTime(ramp,t+dur));g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.start(t);o.stop(t+dur);}catch(e){}
}
function sndNoise(dur,vol){
  try{initAudio();const len=Math.floor(actx.sampleRate*dur),buf=actx.createBuffer(1,len,actx.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const s=actx.createBufferSource();s.buffer=buf;const g=actx.createGain();g.gain.setValueAtTime(vol,actx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,actx.currentTime+dur);s.connect(g);g.connect(actx.destination);s.start();}catch(e){}
}
function snd(t){
  switch(t){
    case'rifle':tone('sawtooth',800,0.06,0.1,200);sndNoise(0.06,0.08);break;
    case'shotgun':sndNoise(0.15,0.2);tone('sawtooth',150,0.15,0.12,50);break;
    case'smg':tone('sawtooth',900,0.04,0.06,300);sndNoise(0.04,0.05);break;
    case'pistol':tone('square',500,0.08,0.1,150);sndNoise(0.05,0.06);break;
    case'rocket':tone('sawtooth',200,0.3,0.15,80);sndNoise(0.3,0.12);break;
    case'explosion':sndNoise(0.4,0.25);tone('sine',60,0.4,0.2,20);break;
    case'hit':tone('square',400,0.05,0.07,100);break;
    case'kill':tone('sine',600,0.12,0.1,1200);tone('sine',900,0.08,0.08,1400);break;
    case'hurt':tone('sawtooth',200,0.15,0.12,50);break;
    case'pickup':tone('sine',500,0.08,0.06,1000);tone('sine',800,0.06,0.05,1200);break;
    case'headshot':tone('sine',1000,0.1,0.12,1500);tone('square',600,0.08,0.08,800);break;
    case'zombieDeath':tone('sawtooth',300,0.2,0.08,50);sndNoise(0.15,0.06);break;
    case'zombieHurt':tone('sawtooth',500,0.08,0.06,100);break;
    case'spit':sndNoise(0.1,0.08);tone('sine',300,0.1,0.06,100);break;
    case'waveStart':tone('sine',400,0.15,0.1,800);setTimeout(()=>tone('sine',600,0.15,0.1,1000),200);setTimeout(()=>tone('sawtooth',800,0.2,0.12,1200),400);break;
    case'victory':tone('sine',523,0.2,0.1,600);setTimeout(()=>tone('sine',659,0.2,0.1,750),200);setTimeout(()=>tone('sine',784,0.3,0.1,900),400);break;
  }
}

// Particles
const particles = [];
function spawnParticles(pos,color,count=30){
  for(let i=0;i<count;i++){
    const s=0.04+Math.random()*0.14;
    const m=new THREE.Mesh(new THREE.BoxGeometry(s,s,s), new THREE.MeshStandardMaterial({ color, emissive:color, emissiveIntensity:0.3, transparent:true, opacity:1 }));
    m.position.copy(pos);
    const d=new THREE.Vector3(Math.random()-0.5,Math.random()*2,Math.random()-0.5).normalize().multiplyScalar(3+Math.random()*5);
    m.userData={vel:d,life:0.5+Math.random()*0.8};scene.add(m);particles.push(m);
  }
}
function spawnExplosion(pos, radius=3) {
  const count = 60 + Math.floor(radius*15);
  for(let i=0;i<count;i++){
    const s=0.05+Math.random()*0.2;
    const colors=[0xff4400,0xff8800,0xffcc00,0xff2200];
    const m=new THREE.Mesh(new THREE.SphereGeometry(s,4,4), new THREE.MeshStandardMaterial({ color:colors[Math.floor(Math.random()*colors.length)], emissive:0xff4400, emissiveIntensity:0.5, transparent:true, opacity:1 }));
    m.position.copy(pos); m.position.add(new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).multiplyScalar(0.5));
    const d=new THREE.Vector3(Math.random()-0.5,Math.random()*1.5,Math.random()-0.5).normalize().multiplyScalar(4+Math.random()*radius*3);
    m.userData={vel:d,life:0.3+Math.random()*0.6};scene.add(m);particles.push(m);
  }
  const flash = new THREE.Mesh(new THREE.SphereGeometry(radius*0.5, 8, 8), new THREE.MeshBasicMaterial({ color:0xff8800, transparent:true, opacity:0.6 }));
  flash.position.copy(pos); scene.add(flash);
  flash.userData = { vel:new THREE.Vector3(0,0,0), life:0.15 };
  particles.push(flash);
}
function spawnBlood(pos, dir) {
  for(let i=0;i<12;i++){
    const s=0.02+Math.random()*0.06;
    const m=new THREE.Mesh(new THREE.SphereGeometry(s,4,4), new THREE.MeshStandardMaterial({ color:0xcc2222, emissive:0x440000, transparent:true, opacity:0.9 }));
    m.position.copy(pos);
    const d=dir.clone().add(new THREE.Vector3(Math.random()-0.5,Math.random()-0.3,Math.random()-0.5)).normalize().multiplyScalar(1+Math.random()*3);
    d.y+=0.5+Math.random()*0.5;
    m.userData={vel:d,life:0.5+Math.random()*0.5};scene.add(m);particles.push(m);
  }
}
function spawnSparks(pos,dir){
  for(let i=0;i<6;i++){
    const m=new THREE.Mesh(new THREE.SphereGeometry(0.03,4,4), new THREE.MeshStandardMaterial({ color:0xffcc44, emissive:0xff8800, emissiveIntensity:0.3 }));
    m.position.copy(pos);
    const d=new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize().add(dir.clone().multiplyScalar(2)).multiplyScalar(2+Math.random()*3);
    m.userData={vel:d,life:0.2+Math.random()*0.3};scene.add(m);particles.push(m);
  }
}
function updateParticles(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];p.userData.vel.y-=6*dt;p.position.addScaledVector(p.userData.vel,dt);
    p.userData.life-=dt;p.material.opacity=Math.max(0,p.userData.life);p.scale.multiplyScalar(0.97);
    if(p.userData.life<=0){scene.remove(p);if(p.geometry)p.geometry.dispose();if(p.material)p.material.dispose();particles.splice(i,1);}
  }
}

// Weapon Model
const weaponGroup = new THREE.Group();
let curWDef = WEAPONS.assault;
function buildWeaponModel(def) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color:def.color, roughness:0.4, metalness:0.6 });
  const darkMat = new THREE.MeshStandardMaterial({ color:0x222233, roughness:0.5, metalness:0.4 });
  const gripMat = new THREE.MeshStandardMaterial({ color:0x3a3020, roughness:0.8 });
  switch(def.id) {
    case'pistol': {
      g.add(new (class extends THREE.Mesh{constructor(){super(new THREE.BoxGeometry(0.06,0.1,0.25),bodyMat);this.position.z=-0.12;}})());
      const b=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.02,0.3,6),darkMat);b.rotation.x=Math.PI/2;b.position.z=-0.3;g.add(b);
      const gr=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.12,0.05),gripMat);gr.position.set(0,-0.09,0.02);g.add(gr);
      break;
    }
    case'smg': {
      g.add(new (class extends THREE.Mesh{constructor(){super(new THREE.BoxGeometry(0.06,0.1,0.35),bodyMat);this.position.z=-0.17;}})());
      const b=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.025,0.4,6),darkMat);b.rotation.x=Math.PI/2;b.position.z=-0.35;g.add(b);
      const mg=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.14,0.06),darkMat);mg.position.set(0,-0.1,0.02);g.add(mg);
      break;
    }
    case'assault': {
      g.add(new (class extends THREE.Mesh{constructor(){super(new THREE.BoxGeometry(0.08,0.12,0.45),bodyMat);this.position.z=-0.22;}})());
      const b=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.03,0.55,8),darkMat);b.rotation.x=Math.PI/2;b.position.z=-0.5;g.add(b);
      const gr=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.15,0.06),gripMat);gr.position.set(0,-0.08,0.02);g.add(gr);
      const mg=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.1,0.08),darkMat);mg.position.set(0,-0.06,0.04);g.add(mg);
      break;
    }
    case'shotgun': {
      g.add(new (class extends THREE.Mesh{constructor(){super(new THREE.BoxGeometry(0.1,0.14,0.5),bodyMat);this.position.z=-0.25;}})());
      const b=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.045,0.6,8),darkMat);b.rotation.x=Math.PI/2;b.position.z=-0.55;g.add(b);
      const b2=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.035,0.55,8),darkMat);b2.rotation.x=Math.PI/2;b2.position.set(0.04,0,-0.52);g.add(b2);
      const gr=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.13,0.06),gripMat);gr.position.set(0,-0.08,0.04);g.add(gr);
      break;
    }
    case'rocket': {
      const b=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.09,0.4,8),bodyMat);b.rotation.x=Math.PI/2;b.position.z=-0.2;g.add(b);
      const t=new THREE.Mesh(new THREE.ConeGeometry(0.07,0.12,8),new THREE.MeshStandardMaterial({color:0xcc8844,metalness:0.3}));t.rotation.x=-Math.PI/2;t.position.z=-0.46;g.add(t);
      const gr=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.16,0.08),gripMat);gr.position.set(0,-0.09,0.02);g.add(gr);
      const launcher = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.2,8),darkMat); launcher.rotation.x=Math.PI/2; launcher.position.set(0,-0.05,-0.15); g.add(launcher);
      break;
    }
  }
  const mf=new THREE.PointLight(0xffaa44,0,3);mf.position.set(0,0,-0.8);g.add(mf);g.userData.muzzleFlash=mf;
  return g;
}
const weaponModels = {};

// Projectiles
const tracers = [];
const rockets = [];
const spitProjectiles = [];

function createTracer(from, to, color) {
  const points = [from.clone(), to.clone()];
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent:true, opacity:0.6 }));
  scene.add(line);
  tracers.push({ line, life:0.12, maxLife:0.12 });
}

function updateTracers(dt) {
  for(let i=tracers.length-1;i>=0;i--){
    const t=tracers[i]; t.life-=dt;
    t.line.material.opacity = t.life/t.maxLife;
    if(t.life<=0){ scene.remove(t.line); t.line.geometry.dispose(); t.line.material.dispose(); tracers.splice(i,1); }
  }
}

function fireRocket(origin, direction) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.35, 8), new THREE.MeshStandardMaterial({ color:0x666644, metalness:0.4 }));
  body.rotation.x = Math.PI/2; g.add(body);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.14, 8), new THREE.MeshStandardMaterial({ color:0xcc8844, metalness:0.3 }));
  tip.rotation.x = -Math.PI/2; tip.position.z = -0.24; g.add(tip);
  for (let i=0;i<4;i++){
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.06), new THREE.MeshStandardMaterial({ color:0x444422 }));
    fin.position.set(Math.cos(i*Math.PI/2)*0.1, 0, 0.14); g.add(fin);
  }
  g.position.copy(origin);
  const dir = direction.clone().normalize();
  g.lookAt(origin.clone().add(dir));
  const light = new THREE.PointLight(0xff6600, 1.5, 5); g.add(light);
  scene.add(g);
  rockets.push({ group:g, dir, pos:origin.clone(), speed:30, alive:true, life:3 });
  snd('rocket');
}

function updateRockets(dt) {
  for(let i=rockets.length-1;i>=0;i--){
    const r=rockets[i];
    if(!r.alive){ scene.remove(r.group); rockets.splice(i,1); continue; }
    r.life-=dt;
    if(r.life<=0){ r.alive=false; rocketExplode(r.pos); continue; }
    r.pos.addScaledVector(r.dir, r.speed*dt);
    r.group.position.copy(r.pos);
    // Trail
    if(Math.random()<0.7){
      const p=new THREE.Mesh(new THREE.SphereGeometry(0.04,4,4), new THREE.MeshBasicMaterial({ color:0xff8800, transparent:true, opacity:0.8 }));
      p.position.copy(r.pos); p.position.add(new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).multiplyScalar(0.1));
      p.userData={vel:new THREE.Vector3(Math.random()-0.5,Math.random()*0.5-0.2,Math.random()-0.5).multiplyScalar(2), life:0.4};
      scene.add(p); particles.push(p);
    }
    // Wall collision
    const p=r.pos; const h=HALF_MAP-0.5;
    if(p.x<-h||p.x>h||p.z<-h||p.z>h){ r.alive=false; rocketExplode(p); continue; }
    let hit=false;
    for(const w of walls){ if(p.x>w.minX&&p.x<w.maxX&&p.z>w.minZ&&p.z<w.maxZ){ hit=true; break; } }
    if(hit){ r.alive=false; rocketExplode(p); continue; }
    // Zombie collision
    for(const z of zombies){ if(!z.alive)continue; if(p.distanceTo(z.getPos())<1.2){ r.alive=false; rocketExplode(p); z.takeDamage(999,false); break; } }
  }
}

function rocketExplode(pos) {
  const aoe=5, dmg=80;
  for(const z of zombies){
    if(!z.alive)continue;
    const d=z.getPos().distanceTo(pos);
    if(d<aoe){ z.takeDamage(dmg*(1-d/aoe), false); }
  }
  spawnExplosion(pos, aoe);
  snd('explosion');
  // Screen shake
  const dist = camera.position.distanceTo(pos);
  if(dist < 15) screenShake = Math.max(screenShake, (1-dist/15) * 0.3);
}

function fireSpit(from, to) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshStandardMaterial({ color:0x44ff44, emissive:0x44ff44, emissiveIntensity:0.3 }));
  m.position.copy(from);
  const dir = new THREE.Vector3().subVectors(to, from).normalize();
  scene.add(m);
  spitProjectiles.push({ mesh:m, from:from.clone(), dir, speed:10, alive:true, life:3 });
  snd('spit');
}

function updateSpitProjectiles(dt) {
  for(let i=spitProjectiles.length-1;i>=0;i--){
    const s=spitProjectiles[i];
    if(!s.alive){ scene.remove(s.mesh); s.mesh.geometry.dispose(); s.mesh.material.dispose(); spitProjectiles.splice(i,1); continue; }
    s.life-=dt;
    if(s.life<=0){ s.alive=false; continue; }
    s.mesh.position.addScaledVector(s.dir, s.speed*dt);
    const p=s.mesh.position;
    // Hit player
    if(p.distanceTo(camera.position)<0.8){
      applyDamage(15, new THREE.Vector3().subVectors(p, camera.position).normalize());
      spawnParticles(p, 0x44ff44, 8);
      s.alive=false; continue;
    }
    // Wall collision
    for(const w of walls){ if(p.x>w.minX&&p.x<w.maxX&&p.z>w.minZ&&p.z<w.maxZ){ spawnParticles(p,0x44ff44,5); s.alive=false; break; } }
  }
}

let screenShake = 0;

// Zombie
class Zombie {
  constructor(typeIdx) {
    this.type = ZOMBIE_TYPES[typeIdx];
    this.alive = false;
    this.health = this.type.hp;
    this.maxHealth = this.type.hp;
    this.group = new THREE.Group();
    this.buildModel();
    this.createHPBar();
    this.reset();
    this.spawnAnimTimer = 0;
    this.attackCD = 0;
  }
  buildModel() {
    const s = this.type.scale, c = this.type.color;
    const skinMat = new THREE.MeshStandardMaterial({ color:0x889977, roughness:0.7 });
    const clothMat = new THREE.MeshStandardMaterial({ color:c, roughness:0.8 });
    const darkMat = new THREE.MeshStandardMaterial({ color:0x443333, roughness:0.8 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5*s, 0.5*s, 0.3*s), clothMat);
    body.position.y = 0.5*s; body.castShadow = true; this.group.add(body);
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.45*s, 0.25*s, 0.25*s), clothMat);
    chest.position.set(0, 0.85*s, -0.05*s); this.group.add(chest);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2*s, 7, 7), skinMat);
    head.position.set(0, 1.15*s, 0); head.castShadow = true; this.group.add(head);
    // Eyes glow
    if (this.type.id === 'exploder') {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06*s, 6, 6), new THREE.MeshBasicMaterial({ color:0xff4400 }));
      eye.position.set(0.08*s, 1.18*s, 0.18*s); this.group.add(eye);
      const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.06*s, 6, 6), new THREE.MeshBasicMaterial({ color:0xff4400 }));
      eye2.position.set(-0.08*s, 1.18*s, 0.18*s); this.group.add(eye2);
    } else if (this.type.id === 'spitter') {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05*s, 6, 6), new THREE.MeshBasicMaterial({ color:0x44ff44 }));
      eye.position.set(0.08*s, 1.18*s, 0.18*s); this.group.add(eye);
      const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.05*s, 6, 6), new THREE.MeshBasicMaterial({ color:0x44ff44 }));
      eye2.position.set(-0.08*s, 1.18*s, 0.18*s); this.group.add(eye2);
    } else {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04*s, 6, 6), new THREE.MeshBasicMaterial({ color:0xffcc88 }));
      eye.position.set(0.08*s, 1.18*s, 0.18*s); this.group.add(eye);
      const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.04*s, 6, 6), new THREE.MeshBasicMaterial({ color:0xffcc88 }));
      eye2.position.set(-0.08*s, 1.18*s, 0.18*s); this.group.add(eye2);
    }
    // Arms
    const armMat = new THREE.MeshStandardMaterial({ color:0x778866, roughness:0.7 });
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05*s, 0.07*s, 0.35*s, 6), armMat);
      arm.position.set(side*0.35*s, 0.7*s, 0); arm.rotation.z = side*0.3; this.group.add(arm);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05*s, 4, 4), skinMat);
      hand.position.set(side*0.4*s, 0.5*s, 0); this.group.add(hand);
    }
    // Legs
    for (const side of [-0.12, 0.12]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06*s, 0.08*s, 0.35*s, 6), darkMat);
      leg.position.set(side*s, 0.2*s, 0); this.group.add(leg);
    }
    // Type-specific features
    if (this.type.id === 'tank') {
      const armor = new THREE.Mesh(new THREE.BoxGeometry(0.6*s, 0.3*s, 0.15*s), new THREE.MeshStandardMaterial({ color:0x444444, metalness:0.5 }));
      armor.position.set(0, 0.6*s, 0); this.group.add(armor);
      const armor2 = new THREE.Mesh(new THREE.BoxGeometry(0.15*s, 0.3*s, 0.4*s), new THREE.MeshStandardMaterial({ color:0x444444, metalness:0.5 }));
      armor2.position.set(0, 0.6*s, -0.15*s); this.group.add(armor2);
    }
    if (this.type.id === 'exploder') {
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.28*s, 6, 6), new THREE.MeshBasicMaterial({ color:0xff2200, transparent:true, opacity:0.15 }));
      glow.position.set(0, 1.15*s, 0); this.group.add(glow);
      const glow2 = new THREE.Mesh(new THREE.SphereGeometry(0.15*s, 6, 6), new THREE.MeshBasicMaterial({ color:0xff4400, transparent:true, opacity:0.2 }));
      glow2.position.set(0, 0.6*s, 0); this.group.add(glow2);
    }
    if (this.type.id === 'spitter') {
      const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.15*s, 0.08*s, 0.2*s), new THREE.MeshStandardMaterial({ color:0x667755 }));
      jaw.position.set(0, 1.05*s, 0.15*s); this.group.add(jaw);
    }
    if (this.type.id === 'fast') {
      // Lean forward on body parts instead
      body.position.z = 0.05;
      chest.position.z = 0.08;
    }
  }
  createHPBar() {
    const bg = document.createElement('div'); bg.style.cssText = 'position:fixed;width:32px;height:3px;background:rgba(0,0,0,0.6);border-radius:2px;pointer-events:none;z-index:5;';
    const f = document.createElement('div'); f.style.cssText = 'height:100%;border-radius:2px;';
    bg.appendChild(f); document.body.appendChild(bg); this.hpBar = { bg, fill: f };
  }
  reset() {
    this.state = 'idle'; this.targetPos = null; this.attackCD = 0; this.spitCD = 0;
  }
  spawn(pos) {
    this.group.position.copy(pos); this.alive = true;
    this.health = this.maxHealth; this.group.visible = true; this.hpBar.bg.style.display = 'block';
    this.reset(); this.spawnAnimTimer = 0.5;
    this.group.scale.y = 0.01;
    this.spawnPos = pos.clone();
  }
  getPos() { return this.group.position; }
  takeDamage(amt, hs) {
    if (!this.alive) return null;
    const e = hs ? amt * 3 : amt;
    this.health -= e;
    spawnBlood(this.getPos().clone().add(new THREE.Vector3(0,0.6,0)), new THREE.Vector3(Math.random()-0.5,0.5,Math.random()-0.5));
    if (this.health <= 0) { this.die(); return { kill: true, headshot: hs }; }
    snd('zombieHurt');
    return { kill: false, headshot: hs };
  }
  die() {
    this.alive = false; this.group.visible = false; this.hpBar.bg.style.display = 'none';
    spawnParticles(this.getPos().clone().add(new THREE.Vector3(0,0.5,0)), this.type.color, 20);
    if (this.type.id === 'exploder') {
      const p = this.getPos().clone();
      const aoe = 3.5, dmg = 50;
      if (camera.position.distanceTo(p) < aoe) {
        applyDamage(dmg * (1 - camera.position.distanceTo(p)/aoe), new THREE.Vector3().subVectors(p, camera.position).normalize());
        screenShake = Math.max(screenShake, 0.2);
      }
      for (const z of zombies) { if (!z.alive || z === this) continue; if (z.getPos().distanceTo(p) < aoe) z.takeDamage(dmg * 0.5 * (1 - z.getPos().distanceTo(p)/aoe), false); }
      spawnExplosion(p, aoe);
      snd('explosion');
    }
    snd('zombieDeath');
  }
  update(dt, playerPos, obs, wave) {
    if (!this.alive) return null;
    // Spawn animation
    if (this.spawnAnimTimer > 0) {
      this.spawnAnimTimer -= dt;
      this.group.scale.y = Math.min(1, 1 - this.spawnAnimTimer/0.5);
      if (this.spawnAnimTimer <= 0) this.group.scale.y = 1;
    }
    const mp = this.getPos();
    const dist = mp.distanceTo(playerPos);
    const speedMult = 1 + (wave-1) * 0.015;
    const spd = this.type.speed * speedMult;
    
    this.attackCD -= dt;
    this.spitCD -= dt;
    
    // Melee attack
    if (dist < this.type.atkRange && this.attackCD <= 0) {
      if (this.type.id === 'exploder') {
        this.die(); // explode on contact
        return null;
      }
      this.attackCD = this.type.atkRate;
      applyDamage(this.type.dmg, new THREE.Vector3().subVectors(mp, playerPos).normalize());
      screenShake = Math.max(screenShake, 0.05);
      return null;
    }
    
    // Spitter ranged attack
    if (this.type.id === 'spitter' && dist < this.type.atkRange && dist > 2 && this.spitCD <= 0) {
      this.spitCD = this.type.atkRate;
      fireSpit(mp.clone().add(new THREE.Vector3(0, 0.8, 0)), playerPos.clone());
      return null;
    }
    
    // Movement
    if (this.spawnAnimTimer > 0) return null;
    
    const dir = new THREE.Vector3().subVectors(playerPos, mp);
    dir.y = 0;
    if (dir.length() > 0.5) {
      dir.normalize();
      mp.x += dir.x * spd * dt;
      mp.z += dir.z * spd * dt;
      
      // Simple wall avoidance
      for (const o of obs) {
        const cx = (o.minX + o.maxX) / 2, cz = (o.minZ + o.maxZ) / 2;
        const dx = mp.x - cx, dz = mp.z - cz;
        const dd = Math.sqrt(dx*dx + dz*dz);
        if (dd < 1.8 && dd > 0.01) {
          mp.x += dx/dd * (1.8-dd) * 0.3 * dt * 10;
          mp.z += dz/dd * (1.8-dd) * 0.3 * dt * 10;
        }
      }
      const h = HALF_MAP - 0.8;
      mp.x = Math.max(-h, Math.min(h, mp.x));
      mp.z = Math.max(-h, Math.min(h, mp.z));
      this.group.position.copy(mp);
    }
    
    // Face player
    const look = new THREE.Vector3().subVectors(playerPos, mp);
    look.y = 0;
    if (look.length() > 0.1) {
      this.group.lookAt(mp.clone().add(look.normalize()));
      // Undo the fast zombie lean rotation if it's a fast zombie
    }
    
    // Idle animation: slight bob
    if (this.type.id !== 'fast') {
      this.group.position.y = Math.sin(Date.now() * 0.003 + this.idx) * 0.03;
    }
    
    return null;
  }
  updateHPBar() {
    if (!this.alive) { this.hpBar.bg.style.display = 'none'; return; }
    const p = this.getPos().clone(); p.y += 1.6 * this.type.scale;
    p.project(camera);
    const x = (p.x*0.5+0.5)*innerWidth, y = (-p.y*0.5+0.5)*innerHeight;
    this.hpBar.bg.style.left = (x-16)+'px'; this.hpBar.bg.style.top = y+'px';
    const pct = Math.max(0, this.health/this.maxHealth);
    this.hpBar.fill.style.width = (pct*100)+'%';
    this.hpBar.fill.style.background = this.type.id === 'exploder' ? '#ff4444' : pct > 0.6 ? '#44ff44' : pct > 0.3 ? '#ffaa44' : '#ff4444';
    this.hpBar.bg.style.display = 'block';
  }
  dispose() { this.hpBar.bg.remove(); }
}

let zombies = [];
let wave = 0;
let waveZombieCount = 0;
let zombiesRemaining = 0;
let waveDelay = 0;
let waveActive = false;
let difficulty = 2;

const G = {
  health: 100, maxHealth: 100, armor: 0, maxArmor: 100,
  score: 0, kills: 0, dead: false,
  ammo: 15, reserve: 60, magSize: 15,
  reloading: false, reloadTimer: 0,
  shootCooldown: 0, curWeapon: 'pistol',
  totalShots: 0, totalHits: 0,
  mouseDown: false, gameRunning: false, paused: false,
};

function getAvailableTypes(w) {
  if (w <= 2) return [0];
  if (w <= 4) return [0, 1];
  if (w <= 6) return [0, 1, 2];
  if (w <= 8) return [0, 1, 2, 3];
  return [0, 1, 2, 3, 4];
}
const weaponAmmo = {};

function startWave() {
  wave++;
  waveActive = true;
  waveZombieCount = 3 + wave * 2 + Math.floor(wave/3) * 2;
  zombiesRemaining = waveZombieCount;
  const types = getAvailableTypes(wave);
  
  for (const z of zombies) { if (z.alive) { z.die(); } }
  
  for (let i = 0; i < waveZombieCount; i++) {
    const typeIdx = types[Math.floor(Math.random() * types.length)];
    const z = new Zombie(typeIdx);
    const hpMult = 1 + (wave - 1) * 0.08;
    z.maxHealth = Math.floor(z.type.hp * hpMult);
    z.health = z.maxHealth;
    const sp = SPAWNS[i % SPAWNS.length];
    const pos = new THREE.Vector3(sp.x + (Math.random()-0.5)*8, 0, sp.z + (Math.random()-0.5)*8);
    z.idx = i;
    scene.add(z.group);
    z.spawn(pos);
    zombies.push(z);
  }
  showWaveAnnouncement('OLEADA ' + wave, waveZombieCount + ' ZOMBIS');
  snd('waveStart');
  waveDelay = 0.5;
}

function checkWaveComplete() {
  const alive = zombies.filter(z => z.alive).length;
  zombiesRemaining = alive;
  if (alive === 0 && waveActive && zombies.length > 0) {
    waveActive = false;
    waveDelay = 4;
    G.score += wave * 50; // wave bonus
    showWaveAnnouncement('— OLEADA COMPLETA —', `Siguiente en ${waveDelay}s`);
  }
}

// Pickups
const pickups = [];
function createPickups() {
  for (const p of pickups) { scene.remove(p); p.traverse(c=>{if(c.geometry)c.geometry.dispose();if(c.material)c.material.dispose();}); }
  pickups.length = 0;
  const positions = [{x:-20,z:0},{x:20,z:0},{x:0,z:-20},{x:0,z:20},{x:-12,z:-12},{x:12,z:12},{x:-35,z:-15},{x:35,z:15},{x:-15,z:35},{x:15,z:-35},{x:-5,z:-42},{x:5,z:42},{x:-42,z:-5},{x:42,z:5},{x:-25,z:-25},{x:25,z:25}];
  const types = ['health','ammo','armor','health','ammo','health','armor','ammo','health','ammo','armor','health','ammo','health','armor','ammo'];
  for(let i=0;i<positions.length;i++){
    const pos=positions[i],type=types[i%types.length];
    const g=new THREE.Group();g.position.set(pos.x,0.3,pos.z);g.userData={type,active:true,respawnTimer:0,value:type==='health'?25:type==='armor'?30:20};
    if(type==='health'){
      const m=new THREE.MeshStandardMaterial({color:0x44ff44,emissive:0x44ff44,emissiveIntensity:0.15});
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.4,0.08,0.08),m));
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.08,0.4,0.08),m));
      const pl=new THREE.PointLight(0x44ff44,0.08,1.5);pl.position.y=0.2;g.add(pl);
    }else if(type==='ammo'){
      const m=new THREE.MeshStandardMaterial({color:0x4488ff,emissive:0x4488ff,emissiveIntensity:0.15});
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.25,0.25,0.25),m));
      for(let j=0;j<3;j++){const b=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.08,4),new THREE.MeshStandardMaterial({color:0xccaa44,metalness:0.8}));b.position.set((j-1)*0.1,0.18,0);b.rotation.x=Math.PI/2;g.add(b);}
    }else if(type==='armor'){
      const m=new THREE.MeshStandardMaterial({color:0x4488ff,emissive:0x4488ff,emissiveIntensity:0.15});
      const p1=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.25,0.08),m);p1.position.z=0.05;g.add(p1);
      const p2=new THREE.Mesh(new THREE.BoxGeometry(0.25,0.15,0.08),m);p2.position.z=-0.05;p2.position.y=0.05;g.add(p2);
      const pl=new THREE.PointLight(0x4488ff,0.08,1.5);pl.position.y=0.2;g.add(pl);
    }
    scene.add(g);pickups.push(g);
  }
}
function updatePickups(dt){
  const t=Date.now()*0.001;
  for(const p of pickups){
    if(p.userData.active){
      p.rotation.y+=dt*1.2;p.position.y=0.3+Math.sin(t*2+p.position.x*0.5)*0.12;
      if(camera.position.distanceTo(p.position)<1.2){
        if(p.userData.type==='health'){G.health=Math.min(G.maxHealth,G.health+p.userData.value);showPickup('+'+p.userData.value+' HP');}
        else if(p.userData.type==='armor'){G.armor=Math.min(G.maxArmor,G.armor+p.userData.value);showPickup('+'+p.userData.value+' ARMOR');}
        else if(p.userData.type==='ammo'){G.reserve+=p.userData.value;if(G.reserve>G.magSize*6)G.reserve=G.magSize*6;showPickup('+'+p.userData.value+' BALAS');}
        snd('pickup');p.userData.active=false;p.userData.respawnTimer=10;p.visible=false;
      }
    }else{p.userData.respawnTimer-=dt;if(p.userData.respawnTimer<=0){p.userData.active=true;p.visible=true;}}
  }
}
let pickupTimeout;
function showPickup(t){
  const e=$('pickupMsg');if(e)e.remove();
  const d=document.createElement('div');d.id='pickupMsg';d.className='hud-pickup';d.textContent=t;document.getElementById('hud').appendChild(d);
  clearTimeout(pickupTimeout);pickupTimeout=setTimeout(()=>{const x=$('pickupMsg');if(x)x.remove();},2000);
}

// Input
const keys={};let mouseDX=0,mouseDY=0,isPointerLocked=false;

// HUD
function updateHUD(){
  const hp=Math.max(0,G.health/G.maxHealth*100);
  healthBar.style.width=hp+'%';healthBar.style.background=hp>60?'#44ff44':hp>30?'#ffaa44':'#ff4444';
  healthText.textContent=Math.max(0,Math.round(G.health));
  armorBar.style.width=Math.max(0,G.armor/G.maxArmor*100)+'%';
  lowhp.classList.toggle('active',G.health<30);
  scoreText.textContent=G.score;killsText.textContent=G.kills;
  hudRound.textContent='OLEADA '+wave;
  ammoText.textContent=G.ammo;ammoReserve.textContent=G.reloading?'...':G.reserve;
  weaponName.textContent=curWDef.name;weaponIcon.textContent=curWDef.icon;
  reloadIndicator.style.display=G.reloading?'block':'none';
  weaponStrip.innerHTML='';
  for(const id of WORDER){
    const def=WEAPONS[id];const el=document.createElement('div');
    el.className='ws-item'+(id===G.curWeapon?' active':'');
    el.innerHTML='<span class="ws-key">'+(WORDER.indexOf(id)+1)+'</span>'+def.name.substring(0,4);
    weaponStrip.appendChild(el);
  }
  const alive=zombies.filter(z=>z.alive).length;
  botsAlive.textContent='ZOMBIS: '+alive+' / '+waveZombieCount;
  drawMinimap();
}
function drawMinimap(){
  const ctx=minimapCanvas.getContext('2d');const size=140;
  ctx.clearRect(0,0,size,size);ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,size,size);
  const sc=size/(HALF_MAP*2);
  const px=(camera.position.x+HALF_MAP)*sc,py=(camera.position.z+HALF_MAP)*sc;
  ctx.fillStyle='#44ff44';ctx.beginPath();ctx.arc(px,py,3,0,Math.PI*2);ctx.fill();
  // Zombies
  for(const z of zombies){if(!z.alive)continue;const zp=z.getPos();ctx.fillStyle='#ff4444';ctx.beginPath();ctx.arc((zp.x+HALF_MAP)*sc,(zp.z+HALF_MAP)*sc,2,0,Math.PI*2);ctx.fill();}
  // Buildings
  ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.strokeRect(0,0,size,size);
}
function showCrosshairShoot(){crosshair.classList.add('shoot');setTimeout(()=>crosshair.classList.remove('shoot'),100);}
function showHitmarker(hs){hitmarker.classList.add('show');hitmarker.style.transform=hs?'translate(-50%,-50%) scale(1.4)':'translate(-50%,-50%) scale(1)';setTimeout(()=>{hitmarker.classList.remove('show');hitmarker.style.transform='translate(-50%,-50%) scale(1)';},120);}
function showDmgNum(pos,dmg,hs){
  const v=pos.clone().project(camera),x=(v.x*0.5+0.5)*innerWidth,y=(-v.y*0.5+0.5)*innerHeight;
  const e=document.createElement('div');e.className='dmg-num'+(hs?' headshot':'');e.textContent=dmg;
  e.style.left=x+'px';e.style.top=y+'px';damageNumbers.appendChild(e);setTimeout(()=>e.remove(),800);
}
function showDmgIndicator(dir){
  if(!dir)return;
  const wa=Math.atan2(dir.x,dir.z),ca=camera.rotation.y+Math.PI;let r=wa-ca;while(r>Math.PI)r-=Math.PI*2;while(r<-Math.PI)r+=Math.PI*2;
  const cls=Math.abs(r)<1?'hit-front':Math.abs(r)>2.5?'hit-back':r>0?'hit-left':'hit-right';
  dmgOverlay.className='hud-dmg '+cls;setTimeout(()=>{dmgOverlay.className='hud-dmg';},200);
}
function addKillFeed(killer,hs){
  const m=document.createElement('div');m.className='kill-msg';
  m.textContent=killer+' eliminó zombie'+(hs?' (cabeza)':'');killFeed.appendChild(m);
  while(killFeed.children.length>6)killFeed.removeChild(killFeed.firstChild);
  setTimeout(()=>{if(m.parentNode)m.remove();},3000);
}
function showWaveAnnouncement(title, sub){
  roundInfo.innerHTML='<span>'+title+'</span><span class="round-sub">'+sub+'</span>';
  roundInfo.className='hud-round show';setTimeout(()=>{roundInfo.className='hud-round';roundInfo.innerHTML='';},3000);
}
function showGameOver(score,kills,w,acc){
  $('finalScore').textContent=score;$('finalKills').textContent=kills;
  $('finalRounds').textContent=w;$('finalAcc').textContent=(acc*100).toFixed(0)+'%';
  const mvp=$('mvpDisplay');
  mvp.textContent=w>=15?'🏆 ¡LEYENDA!':w>=10?'⭐ ¡SUPERVIVIENTE!':w>=5?'🔥 ¡BUEN TRABAJO!':'💪 SIGUE INTENTANDO';
  gameOver.style.display='flex';
}
function applyDamage(amt, dir) {
  if (G.dead) return;
  if (G.armor > 0) { const ab = Math.min(G.armor, amt*0.5); G.armor -= ab; amt -= ab; }
  G.health -= amt; snd('hurt'); showDmgIndicator(dir);
  if (G.health <= 0) {
    G.health = 0; G.dead = true; G.gameRunning = false;
    setTimeout(() => {
      if (!G.dead) return;
      renderer.domElement.style.display = 'none'; hud.style.display = 'none';
      showGameOver(G.score, G.kills, wave, G.totalHits/Math.max(G.totalShots,1));
      for (const z of zombies) z.hpBar.bg.style.display = 'none';
    }, 1200);
  }
}

// Player
let velY=0, onGround=true;
function updatePlayer(dt){
  if(G.dead) return {moving:false,onGround:true};
  const sens=0.002;
  const euler=new THREE.Euler(0,0,0,'YXZ');
  euler.setFromQuaternion(camera.quaternion);
  euler.y-=mouseDX*sens; euler.x-=mouseDY*sens;
  euler.x=Math.max(-Math.PI/2.1,Math.min(Math.PI/2.1,euler.x));
  camera.quaternion.setFromEuler(euler);
  mouseDX=0; mouseDY=0;
  const fwd=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion); fwd.y=0; fwd.normalize();
  const right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion); right.y=0; right.normalize();
  const dir=new THREE.Vector3();
  if(keys['KeyW']||keys['ArrowUp'])dir.add(fwd);
  if(keys['KeyS']||keys['ArrowDown'])dir.sub(fwd);
  if(keys['KeyA']||keys['ArrowLeft'])dir.sub(right);
  if(keys['KeyD']||keys['ArrowRight'])dir.add(right);
  const moving=dir.length()>0; if(moving)dir.normalize();
  const spd=RUN_SPEED*dt;
  const nx=camera.position.x+dir.x*spd, nz=camera.position.z+dir.z*spd;
  if(!collides(nx,camera.position.z,PR))camera.position.x=nx;
  if(!collides(camera.position.x,nz,PR))camera.position.z=nz;
  if((keys['Space'])&&onGround){velY=JUMP_SPEED;onGround=false;}
  velY+=GRAVITY*dt; camera.position.y+=velY*dt;
  if(camera.position.y<=PH){camera.position.y=PH;velY=0;onGround=true;}
  return {moving,onGround};
}

// Weapon switch
function switchWeapon(id){
  if(G.reloading)return;
  if(weaponModels[G.curWeapon]) weaponGroup.remove(weaponModels[G.curWeapon]);
  weaponAmmo[G.curWeapon] = { ammo:G.ammo, reserve:G.reserve };
  G.curWeapon=id; curWDef=WEAPONS[id];
  const saved = weaponAmmo[id];
  if(saved){ G.ammo=saved.ammo; G.reserve=saved.reserve; }
  else { G.ammo=curWDef.mag; G.reserve=curWDef.res; }
  G.magSize=curWDef.mag;
  G.shootCooldown=0;
  if(!weaponModels[id]) weaponModels[id]=buildWeaponModel(curWDef);
  weaponGroup.add(weaponModels[id]); weaponModels[id].visible=true;
}

// Shoot
function shoot(){
  if(G.dead||G.paused||!G.gameRunning) return;
  if(G.reloading) return;
  if(G.shootCooldown>0) return;
  if(G.ammo<=0){ reload(); return; }
  G.ammo--; G.shootCooldown=curWDef.rate; G.totalShots++;
  snd(curWDef.snd);
  showCrosshairShoot();
  const mf=weaponModels[G.curWeapon]?.userData.muzzleFlash; if(mf)mf.intensity=3; setTimeout(()=>{if(mf)mf.intensity=0;},50);
  weaponGroup.position.z=-0.35+curWDef.recoil*0.5;
  
  // Rocket launcher special
  if (G.curWeapon === 'rocket') {
    const d=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
    fireRocket(camera.position.clone().add(d.clone().multiplyScalar(0.5)), d);
    updateHUD();
    return;
  }
  
  // Build target list once
  const targets = [];
  for(const z of zombies){ if(!z.alive)continue; z.group.traverse(c=>{if(c.isMesh)targets.push(c);}); }
  
  for(let p=0;p<curWDef.pellets;p++){
    const d=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
    d.x+=(Math.random()-0.5)*curWDef.spread*2; d.y+=(Math.random()-0.5)*curWDef.spread*2; d.normalize();
    const ray=new THREE.Raycaster(camera.position.clone(), d, 0.3, curWDef.range);
    const hits=ray.intersectObjects(targets);
    
    const endPos = hits.length > 0 ? hits[0].point : camera.position.clone().add(d.clone().multiplyScalar(curWDef.range));
    createTracer(camera.position.clone().add(d.clone().multiplyScalar(0.5)), endPos, curWDef.tc);
    
    if(hits.length>0){
      const hit=hits[0]; let hitZombie=null, isHS=false;
      for(const z of zombies){
        if(!z.alive)continue;
        let found = false;
        z.group.traverse(c=>{if(c===hit.object)found=true;});
        if(!found) continue;
        hitZombie=z;
        if(hit.point.y > z.getPos().y + 0.95*z.type.scale) isHS=true;
        break;
      }
      if(hitZombie){
        G.totalHits++; const res=hitZombie.takeDamage(curWDef.dmg, isHS);
        if (res) {
          showHitmarker(isHS); showDmgNum(hit.point, isHS?curWDef.dmg*3:curWDef.dmg, isHS);
          spawnSparks(hit.point, ray.ray.direction);
          if(isHS) snd('headshot'); else snd('hit');
          if(res.kill){
            G.score+=isHS?150:100; G.kills++; addKillFeed('Tú', isHS);
            if(isHS) snd('kill');
            checkWaveComplete();
          }
        }
      }
    }
  }
  updateHUD();
}
function reload(){
  if(G.reloading||G.ammo===G.magSize||G.reserve<=0) return;
  G.reloading=true; G.reloadTimer=curWDef.reload;
}

function startGame(){
  for(const z of zombies){ z.dispose(); scene.remove(z.group); }
  zombies=[];
  Object.assign(G,{health:100,armor:0,score:0,kills:0,dead:false,totalShots:0,totalHits:0});
  const w=WEAPONS['pistol'];
  G.ammo=w.mag; G.reserve=w.res; G.magSize=w.mag;
  G.reloading=false; G.shootCooldown=0; G.curWeapon='pistol'; curWDef=w;
  camera.position.set(0, PH, 0);
  wave=0; waveActive=false; waveZombieCount=0;
  for (const k in weaponAmmo) delete weaponAmmo[k];
  // Clear rockets and spits from previous game
  for(const r of rockets){ scene.remove(r.group); }
  rockets.length=0;
  for(const s of spitProjectiles){ scene.remove(s.mesh); s.mesh.geometry.dispose(); s.mesh.material.dispose(); }
  spitProjectiles.length=0;
  createPickups();
  if(!weaponModels.pistol){for(const id of WORDER)weaponModels[id]=buildWeaponModel(WEAPONS[id]);camera.add(weaponGroup);weaponGroup.position.set(0.3,-0.12,-0.35);switchWeapon('pistol');}
  waveDelay=1.5;
  screenShake=0;
}

// Check line collision for now just reuse
function checkLineCol(from,to){
  const d=new THREE.Vector3().subVectors(to,from),dist=d.length();if(dist<0.5)return false;
  d.normalize();const steps=Math.floor(dist/0.4),obs=getObs(),h=HALF_MAP-0.2;
  for(let i=1;i<steps;i++){const p=new THREE.Vector3().copy(from).addScaledVector(d,i*0.4);if(p.x<-h||p.x>h||p.z<-h||p.z>h)return true;for(const o of obs)if(p.x>o.minX&&p.x<o.maxX&&p.z>o.minZ&&p.z<o.maxZ)return true;}
  return false;
}

// Game loop
function frame(){
  requestAnimationFrame(frame);
  const dt=Math.min(clock.getDelta(),0.05);
  
  if(G.gameRunning&&!G.dead){
    if(!G.paused){
      const {moving,onGround:og}=updatePlayer(dt);
      
      // Cooldowns
      if(G.shootCooldown>0) G.shootCooldown-=dt;
      if(G.reloading){
        G.reloadTimer-=dt;
        if(G.reloadTimer<=0){const need=G.magSize-G.ammo,avail=Math.min(need,G.reserve);G.ammo+=avail;G.reserve-=avail;G.reloading=false;}
      }
      weaponGroup.position.z+=(-0.35-weaponGroup.position.z)*0.1;
      weaponGroup.position.y=-0.12+(moving&&og?Math.sin(Date.now()*0.014)*0.015:0);
      
      // Wave management
      if(!waveActive&&zombies.every(z=>!z.alive)){
        waveDelay-=dt;
        if(waveDelay<=0){
          startWave();
        }
      }
      
      // Zombies update
      const pPos=camera.position.clone(), obs=getObs();
      for(const z of zombies){
        if(!z.alive) continue;
        z.update(dt, pPos, obs, wave);
      }
      for(const z of zombies) z.updateHPBar();
      
      // Projectiles
      updateTracers(dt);
      updateRockets(dt);
      updateSpitProjectiles(dt);
      
      updatePickups(dt);
      updateParticles(dt);
      
      if(waveActive) checkWaveComplete();
      
      updateHUD();
      
      // Auto-fire
      if(G.mouseDown&&curWDef.auto&&isPointerLocked) shoot();
      
      // Screen shake
      if(screenShake > 0) {
        camera.position.x += (Math.random()-0.5)*screenShake;
        camera.position.y += (Math.random()-0.5)*screenShake * 0.5;
        screenShake *= 0.9;
        if(screenShake < 0.01) screenShake = 0;
      }
      
      // Fog particle drift
      fogParticles.position.z += dt * 0.3;
      if(fogParticles.position.z > 10) fogParticles.position.z = -10;
    }
  }
  renderer.render(scene, camera);
}

// Events
document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (!G.gameRunning || G.dead) return;
  if (e.code === 'KeyR') reload();
  const n = parseInt(e.key);
  if (n >= 1 && n <= WORDER.length) switchWeapon(WORDER[n-1]);
});
document.addEventListener('keyup', e => { keys[e.code] = false; });
document.addEventListener('mousemove', e => { if(isPointerLocked){mouseDX+=e.movementX;mouseDY+=e.movementY;} });
document.addEventListener('mousedown', e => { if(e.button===0){G.mouseDown=true;if(isPointerLocked&&!G.dead&&G.gameRunning)shoot();} });
document.addEventListener('mouseup', e => { if(e.button===0)G.mouseDown=false; });
document.addEventListener('pointerlockchange', () => {
  isPointerLocked = document.pointerLockElement === renderer.domElement;
  if(!isPointerLocked&&G.gameRunning&&!G.dead) G.paused=true;
  else if(isPointerLocked) { G.paused=false; mouseDX=0; mouseDY=0; }
});
window.addEventListener('resize', () => {
  camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight);
});

// Click canvas to resume when paused
renderer.domElement.addEventListener('click', () => {
  if(G.gameRunning && !G.dead && !isPointerLocked) {
    renderer.domElement.requestPointerLock();
  }
});

// Menu
$('btnPlay').addEventListener('click', () => {
  initAudio();
  menu.style.display='none'; hud.style.display='block'; G.gameRunning=true; G.paused=false;
  renderer.domElement.style.display='block';
  startGame();
  renderer.domElement.requestPointerLock();
});
$('btnControls').addEventListener('click', () => { controlsModal.style.display='flex'; });
$('btnCloseControls').addEventListener('click', () => { controlsModal.style.display='none'; });
$('btnRestart').addEventListener('click', () => {
  $('goTitle').textContent='FIN DEL JUEGO';
  gameOver.style.display='none'; renderer.domElement.style.display='block'; hud.style.display='block';
  startGame(); G.gameRunning=true; G.paused=false;
  renderer.domElement.requestPointerLock();
});
$('btnMenu').addEventListener('click', () => {
  gameOver.style.display='none'; menu.style.display='flex'; hud.style.display='none';
  for(const z of zombies) z.hpBar.bg.style.display='none';
});

// Start
frame();

import * as THREE from 'three';

/* ===================================================================
   STRIKE BATTLE — Single-file FPS
   =================================================================== */

// ─── DOM Refs ───
const $ = id => document.getElementById(id);
const canvasContainer = $('gameCanvas');
const menu = $('menu');
const gameOver = $('gameOver');
const controlsModal = $('controlsModal');
const hud = $('hud');
const crosshair = $('crosshair');
const hitmarker = $('hitmarker');
const dmgOverlay = $('dmgOverlay');
const killFeed = $('killFeed');
const roundInfo = $('roundInfo');
const botsAlive = $('botsAlive');
const lowhp = $('lowhpOverlay');
const damageNumbers = $('damageNumbers');
const healthBar = $('healthBar');
const armorBar = $('armorBar');
const healthText = $('healthText');
const ammoText = $('ammoText');
const ammoReserve = $('ammoReserve');
const scoreText = $('scoreText');
const killsText = $('killsText');
const hudRound = $('hudRound');
const weaponName = $('weaponName');
const weaponIcon = $('weaponIcon');
const weaponStrip = $('weaponStrip');
const reloadIndicator = $('reloadIndicator');
const minimapCanvas = $('minimapCanvas');

// ─── Constants ───
const MAP_SIZE = 120, HALF_MAP = 60;
const PH = 1.6, PR = 0.35, GRAVITY = -22, RUN_SPEED = 9, JUMP_SPEED = 8.5;
const BOT_COUNTS = [4,6,8,10,12,15,18,22,26,30];
const DIFF_NAMES = { 1:'FÁCIL', 2:'NORMAL', 3:'DIFÍCIL', 4:'LOCO' };

// ─── Weapon Definitions ───
const WEAPONS = {
  assault: { id:'assault', name:'ASSAULT RIFLE', icon:'🔫', dmg:25, hsm:3.0, rate:0.1, reload:1.8, mag:30, res:120, spread:0.008, recoil:0.02, auto:true, pellets:1, range:60, snd:'rifle', color:0x444466 },
  shotgun:  { id:'shotgun',  name:'SHOTGUN',      icon:'💥', dmg:15, hsm:2.0, rate:0.55,reload:2.5, mag:8,  res:32,  spread:0.1,  recoil:0.1,  auto:false,pellets:8, range:25, snd:'shotgun',  color:0x664444 },
  smg:      { id:'smg',      name:'SMG',           icon:'⚡', dmg:12, hsm:2.5, rate:0.065,reload:1.5, mag:50, res:200, spread:0.025,recoil:0.015,auto:true, pellets:1, range:35, snd:'smg',      color:0x446644 },
  sniper:   { id:'sniper',   name:'SNIPER RIFLE',  icon:'🎯', dmg:80, hsm:4.0, rate:0.8, reload:3.0, mag:5,  res:20,  spread:0.002,recoil:0.12, auto:false,pellets:1, range:80, snd:'sniper',   color:0x444488 },
  pistol:   { id:'pistol',   name:'PISTOL',        icon:'🔫', dmg:20, hsm:3.0, rate:0.18,reload:1.2, mag:12, res:48,  spread:0.012,recoil:0.025,auto:false,pellets:1, range:35, snd:'pistol',   color:0x555555 },
};
const WORDER = ['assault','shotgun','smg','sniper','pistol'];

// ─── Bot Types ───
const BTYPES = [
  { id:'soldier', hp:100, speed:3.5, dmg:8,  color:0xff4444, scale:1.0,  name:'Soldado' },
  { id:'heavy',   hp:180, speed:2.0, dmg:15, color:0xff8800, scale:1.25, name:'Pesado' },
  { id:'sniper',  hp:70,  speed:2.5, dmg:20, color:0x4488ff, scale:1.0,  name:'Francotirador' },
  { id:'scout',   hp:60,  speed:5.0, dmg:5,  color:0x44ff44, scale:0.85, name:'Explorador' },
];

// ─── Game State ───
const G = {
  health:100, maxHealth:100, armor:0, maxArmor:100,
  score:0, kills:0, dead:false,
  ammo:30, reserve:120, magSize:30,
  reloading:false, reloadTimer:0,
  shootCooldown:0, curWeapon:'assault',
  round:0, gameRunning:false, paused:false, roundComplete:false, roundEndTimer:0,
  totalShots:0, totalHits:0,
  mouseDown:false,
};

// ─── Three.js ───
const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
canvasContainer.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080818);
scene.fog = new THREE.FogExp2(0x080818, 0.006);

const camera = new THREE.PerspectiveCamera(72, innerWidth/innerHeight, 0.1, 200);
scene.add(camera);
camera.position.set(0, PH, 0);

const clock = new THREE.Clock();

// ─── Lights ───
scene.add(new THREE.AmbientLight(0x303060, 0.5));
scene.add(new THREE.HemisphereLight(0x6666aa, 0x443322, 0.5));
const sun = new THREE.DirectionalLight(0xffeedd, 1.5);
sun.position.set(40,50,30);
sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 120;
sun.shadow.camera.left = -70; sun.shadow.camera.right = 70;
sun.shadow.camera.top = 70; sun.shadow.camera.bottom = -70;
sun.shadow.bias = -0.002;
scene.add(sun);
const fill = new THREE.DirectionalLight(0x4444ff, 0.25);
fill.position.set(-30,20,-30);
scene.add(fill);

// ─── Stars ───
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(3000*3);
for (let i=0;i<3000;i++) {
  const t=Math.random()*Math.PI*2, p=Math.acos(2*Math.random()-1), r=100+Math.random()*40;
  starPos[i*3]=r*Math.sin(p)*Math.cos(t); starPos[i*3+1]=Math.abs(r*Math.cos(p)); starPos[i*3+2]=r*Math.sin(p)*Math.sin(t);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos,3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color:0xffffff, size:0.25, transparent:true, opacity:0.7, sizeAttenuation:true })));

// ─── Ground ───
const ground = new THREE.Mesh(new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE), new THREE.MeshStandardMaterial({ color:0x16162a, roughness:0.9, metalness:0.05 }));
ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground);
const grid = new THREE.GridHelper(MAP_SIZE, 60, 0x222244, 0x191933);
grid.position.y = 0.05; scene.add(grid);

// ─── Walls System ───
const walls = [];

function addWall(x,z,w,h,d,color=0x2a2a4a) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshStandardMaterial({ color, roughness:0.7-h/20, metalness:0.15+h/30 }));
  m.position.set(x,h/2,z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
  walls.push({ mesh:m, minX:x-w/2, maxX:x+w/2, minZ:z-d/2, maxZ:z+d/2 });
  return m;
}

function building(x,z,w,d,h,color) {
  addWall(x,z,w,h,d,color);
  const r = new THREE.Mesh(new THREE.BoxGeometry(w+0.6,0.08,d+0.6), new THREE.MeshStandardMaterial({ color:0x333355 }));
  r.position.set(x,h+0.04,z); scene.add(r);
}

function crate(x,z,s=0.7,c=0x554433) {
  const m=new THREE.Mesh(new THREE.BoxGeometry(s,s*0.5,s), new THREE.MeshStandardMaterial({ color:c, roughness:0.8 }));
  m.position.set(x,s*0.25,z); m.castShadow=true; m.receiveShadow=true; scene.add(m);
  const h=s/2; walls.push({ mesh:m, minX:x-h, maxX:x+h, minZ:z-h, maxZ:z+h });
}

function barrel(x,z,c=0x664422) {
  const m=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.25,0.5,8), new THREE.MeshStandardMaterial({ color:c, roughness:0.9 }));
  m.position.set(x,0.25,z); m.castShadow=true; scene.add(m);
  walls.push({ mesh:m, minX:x-0.25, maxX:x+0.25, minZ:z-0.25, maxZ:z+0.25 });
}

function lamp(x,z) {
  const p=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.06,2.5,6), new THREE.MeshStandardMaterial({ color:0x333344, metalness:0.6 }));
  p.position.set(x,1.25,z); p.castShadow=true; scene.add(p);
  const l=new THREE.Mesh(new THREE.SphereGeometry(0.12,6,6), new THREE.MeshStandardMaterial({ color:0xffcc66, emissive:0xffaa44, emissiveIntensity:0.2 }));
  l.position.set(x,2.5,z); scene.add(l);
  const pl=new THREE.PointLight(0xffaa66,0.3,6); pl.position.set(x,2.5,z); scene.add(pl);
  walls.push({ mesh:p, minX:x-0.1, maxX:x+0.1, minZ:z-0.1, maxZ:z+0.1 });
}

// ─── Build Map ───
const BW=1.5, BH=4;
addWall(-HALF_MAP,0,BW,BH,MAP_SIZE,0x111122);
addWall(HALF_MAP,0,BW,BH,MAP_SIZE,0x111122);
addWall(0,-HALF_MAP,MAP_SIZE,BH,BW,0x111122);
addWall(0,HALF_MAP,MAP_SIZE,BH,BW,0x111122);

building(22,-20,12,10,5.5,0x3a3a6a);
building(25,22,10,8,4.0,0x4a4a6a);
building(-25,22,14,8,3.0,0x3a3a5a);
building(-24,-22,12,8,4.5,0x4a3a6a);
building(8,-32,6,5,2.2,0x3a3a4a);
building(36,-8,4,6,2.0,0x4a4a5a);
building(36,4,4,6,2.0,0x3a4a5a);

// Fountain
const fb=new THREE.Mesh(new THREE.CylinderGeometry(1.8,2.2,0.6,16), new THREE.MeshStandardMaterial({ color:0x444477, roughness:0.4, metalness:0.3 }));
fb.position.set(0,0.3,0); scene.add(fb);
const fw=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,0.05,16), new THREE.MeshStandardMaterial({ color:0x4488cc, emissive:0x4488ff, emissiveIntensity:0.05, transparent:true, opacity:0.6 }));
fw.position.set(0,0.6,0); scene.add(fw);
const fc=new THREE.Mesh(new THREE.SphereGeometry(0.3,8,8), new THREE.MeshStandardMaterial({ color:0x8888bb, metalness:0.5 }));
fc.position.set(0,1.0,0); scene.add(fc);
walls.push({ mesh:fb, minX:-2.2, maxX:2.2, minZ:-2.2, maxZ:2.2 });

// Cover walls
for (const [cx,cz] of [[-8,-8],[8,8],[-8,8],[8,-8],[-14,0],[14,0],[0,-14],[0,14],[-18,-18],[18,18],[-18,18],[18,-18],[-30,0],[30,0],[0,-30],[0,30],[-30,-10],[30,10],[-30,10],[30,-10]])
  addWall(cx,cz,2+Math.random()*2,1+Math.random()*0.8,0.5,0x3a3a5a);

// Crates
for (const [cx,cz] of [[-5,-5],[5,5],[-5,5],[5,-5],[-10,-12],[12,10],[10,-12],[-12,10],[-20,-25],[20,25],[-20,25],[20,-25],[-35,-5],[35,5],[-35,5],[35,-5],[-2,-20],[2,20],[-20,-2],[20,2]])
  crate(cx,cz,0.5+Math.random()*0.4);

// Barrels
for (const [cx,cz] of [[-15,-15],[15,15],[-15,15],[15,-15],[-6,-30],[6,30],[-30,-6],[30,6]])
  barrel(cx,cz);

// Lamps
for (const [lx,lz] of [[-10,-10],[10,10],[-10,10],[10,10],[-20,-20],[20,20],[-20,20],[20,-20],[-35,-15],[35,15],[-35,15],[35,-15],[0,-25],[0,25],[-25,0],[25,0]])
  lamp(lx,lz);

// Spawn points
const SPAWNS = [];
for (let i=0;i<16;i++) {
  const a=i/16*Math.PI*2;
  SPAWNS.push({ x:Math.cos(a)*40, z:Math.sin(a)*40 });
}

function getObs() { return walls.map(w=>({minX:w.minX,maxX:w.maxX,minZ:w.minZ,maxZ:w.maxZ})); }
function collides(x,z,r) {
  const h=HALF_MAP-r; if(x<-h||x>h||z<-h||z>h)return true;
  for(const w of walls) if(x+r>w.minX&&x-r<w.maxX&&z+r>w.minZ&&z-r<w.maxZ)return true;
  return false;
}

// ─── Audio ───
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
    case'sniper':tone('sawtooth',600,0.2,0.18,80);sndNoise(0.1,0.15);break;
    case'pistol':tone('square',500,0.08,0.1,150);sndNoise(0.05,0.06);break;
    case'hit':tone('square',400,0.05,0.07,100);break;
    case'kill':tone('sine',600,0.12,0.1,1200);tone('sine',900,0.08,0.08,1400);break;
    case'hurt':tone('sawtooth',200,0.15,0.12,50);break;
    case'pickup':tone('sine',500,0.08,0.06,1000);tone('sine',800,0.06,0.05,1200);break;
    case'headshot':tone('sine',1000,0.1,0.12,1500);tone('square',600,0.08,0.08,800);break;
    case'victory':tone('sine',523,0.2,0.1,600);setTimeout(()=>tone('sine',659,0.2,0.1,750),200);setTimeout(()=>tone('sine',784,0.3,0.1,900),400);break;
  }
}

// ─── Particles ───
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
    if(p.userData.life<=0){scene.remove(p);p.geometry.dispose();p.material.dispose();particles.splice(i,1);}
  }
}

// ─── Weapon Model ───
const weaponGroup = new THREE.Group();
let curWDef = WEAPONS.assault;

function buildWeaponModel(def) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color:def.color, roughness:0.4, metalness:0.6 });
  const darkMat = new THREE.MeshStandardMaterial({ color:0x222233, roughness:0.5, metalness:0.4 });
  const gripMat = new THREE.MeshStandardMaterial({ color:0x3a3020, roughness:0.8 });
  switch(def.id) {
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
    case'smg': {
      g.add(new (class extends THREE.Mesh{constructor(){super(new THREE.BoxGeometry(0.06,0.1,0.35),bodyMat);this.position.z=-0.17;}})());
      const b=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.025,0.4,6),darkMat);b.rotation.x=Math.PI/2;b.position.z=-0.35;g.add(b);
      const mg=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.14,0.06),darkMat);mg.position.set(0,-0.1,0.02);g.add(mg);
      break;
    }
    case'sniper': {
      g.add(new (class extends THREE.Mesh{constructor(){super(new THREE.BoxGeometry(0.07,0.1,0.6),bodyMat);this.position.z=-0.3;}})());
      const b=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.025,0.8,8),darkMat);b.rotation.x=Math.PI/2;b.position.z=-0.7;g.add(b);
      const sc=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.04,0.1),new THREE.MeshStandardMaterial({color:0x444466,metalness:0.7}));sc.position.set(0,0.1,-0.2);g.add(sc);
      break;
    }
    case'pistol': {
      g.add(new (class extends THREE.Mesh{constructor(){super(new THREE.BoxGeometry(0.06,0.1,0.25),bodyMat);this.position.z=-0.12;}})());
      const b=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.02,0.3,6),darkMat);b.rotation.x=Math.PI/2;b.position.z=-0.3;g.add(b);
      const gr=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.12,0.05),gripMat);gr.position.set(0,-0.09,0.02);g.add(gr);
      break;
    }
  }
  const mf=new THREE.PointLight(0xffaa44,0,2);mf.position.set(0,0,-0.8);g.add(mf);g.userData.muzzleFlash=mf;
  return g;
}

const weaponModels = {};

// ─── Bot Class ───
class Bot {
  constructor(i,typeIdx){
    this.idx=i;this.type=BTYPES[typeIdx%BTYPES.length];this.alive=false;this.health=this.type.hp;this.maxHealth=this.type.hp;
    this.group=new THREE.Group();this.buildModel();this.createHPBar();this.resetAI();
    this.spawnPos=new THREE.Vector3();
  }
  buildModel(){
    const s=this.type.scale, bc=this.type.color, sc=0xffccaa, pc=0x222244;
    const body=new THREE.Mesh(new THREE.BoxGeometry(0.5*s,0.6*s,0.3*s), new THREE.MeshStandardMaterial({color:bc,roughness:0.5,metalness:0.15}));
    body.position.y=0.5*s;body.castShadow=true;this.group.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.22*s,8,8), new THREE.MeshStandardMaterial({color:sc,roughness:0.4}));
    head.position.y=1.05*s;head.castShadow=true;this.group.add(head);this.headMesh=head;
    this.headHit=new THREE.Mesh(new THREE.SphereGeometry(0.28*s,6,6),new THREE.MeshBasicMaterial({visible:false}));
    this.headHit.position.y=1.05*s;this.group.add(this.headHit);
    if(this.type.id==='heavy'){
      const h=new THREE.Mesh(new THREE.SphereGeometry(0.26*s,6,6),new THREE.MeshStandardMaterial({color:0x444444,metalness:0.6}));
      h.position.y=1.12*s;h.scale.y=0.7;this.group.add(h);
    }
    const am=new THREE.MeshStandardMaterial({color:sc,roughness:0.5});
    for(const side of[-1,1]){const a=new THREE.Mesh(new THREE.CylinderGeometry(0.06*s,0.07*s,0.35*s,6),am);a.position.set(side*0.38*s,0.55*s,0);a.rotation.z=side*0.2;this.group.add(a);}
    const lm=new THREE.MeshStandardMaterial({color:0x222244,roughness:0.7});
    for(const side of[-0.15,0.15]){const l=new THREE.Mesh(new THREE.CylinderGeometry(0.07*s,0.08*s,0.5*s,6),lm);l.position.set(side*s,0.25*s,0);l.castShadow=true;this.group.add(l);}
    const gm=new THREE.MeshStandardMaterial({color:0x333344,metalness:0.5});
    const gl=this.type.id==='sniper'?0.5*s:this.type.id==='shotgun'?0.4*s:0.35*s;
    const gn=new THREE.Mesh(new THREE.CylinderGeometry(0.025*s,0.03*s,gl,6),gm);gn.rotation.x=Math.PI/2;gn.position.set(0.35*s,0.4*s,-0.3*s);this.group.add(gn);
  }
  createHPBar(){
    const bg=document.createElement('div');bg.style.cssText='position:fixed;width:32px;height:3px;background:rgba(0,0,0,0.6);border-radius:2px;pointer-events:none;z-index:5;';
    const f=document.createElement('div');f.style.cssText='height:100%;border-radius:2px;';
    bg.appendChild(f);document.body.appendChild(bg);this.hpBar={bg,fill:f};
  }
  resetAI(){
    this.state='patrol';this.stateTimer=0;this.waypoint=null;this.targetPos=null;
    this.lastSeen=null;this.sightTimer=0;this.shootCD=0;this.strafeDir=1;this.strafeTimer=0;
  }
  spawn(pos){
    this.group.position.copy(pos);this.spawnPos.copy(pos);this.alive=true;
    this.health=this.maxHealth;this.group.visible=true;this.hpBar.bg.style.display='block';
    this.resetAI();this.waypoint=this.rwp();
  }
  rwp(){const m=8,h=HALF_MAP-m;return new THREE.Vector3(-h+Math.random()*h*2,0,-h+Math.random()*h*2);}
  getPos(){return this.group.position;}
  die(){this.alive=false;this.group.visible=false;this.hpBar.bg.style.display='none';this.respawnTimer=5;spawnParticles(this.getPos(),this.type.color);}
  takeDamage(amt,hs){
    if(!this.alive)return null;
    const e=hs?amt*3:amt;this.health-=e;
    if(this.health<=0){this.die();return{kill:true,headshot:hs};}
    return{kill:false,headshot:hs};
  }
  hasLoS(pos,obs){
    const mp=this.getPos(),d=new THREE.Vector3().subVectors(pos,mp),dist=d.length();
    if(dist<1)return true;d.normalize();const steps=Math.floor(dist/0.6);
    for(let i=1;i<steps;i++){const p=new THREE.Vector3().copy(mp).addScaledVector(d,i*0.6);for(const o of obs)if(p.x>o.minX&&p.x<o.maxX&&p.z>o.minZ&&p.z<o.maxZ)return false;}
    return true;
  }
  update(dt,playerPos,obs,difficulty){
    if(!this.alive){this.respawnTimer-=dt;if(this.respawnTimer<=0){this.spawn(this.spawnPos);}return null;}
    const mp=this.getPos(),dist=mp.distanceTo(playerPos),canSee=dist<40&&this.hasLoS(playerPos,obs);
    const dm=1+(difficulty-1)*0.3;
    canSee?(this.sightTimer=Math.min(this.sightTimer+dt,3),this.lastSeen=playerPos.clone()):this.sightTimer=Math.max(this.sightTimer-dt*0.5,0);
    if(canSee&&dist<35)this.state='attack';
    else if(this.sightTimer>0.5&&this.lastSeen)this.state='chase';
    else if(this.state==='attack'||this.state==='chase'){this.state='investigate';this.targetPos=this.lastSeen?this.lastSeen.clone():this.waypoint;this.stateTimer=4;}
    else this.state='patrol';
    let mt=null,spd=this.type.speed*dm;
    switch(this.state){
      case'patrol':{if(!this.waypoint||dist2D(mp,this.waypoint)<3)this.waypoint=this.rwp();mt=this.waypoint;break;}
      case'chase':{mt=this.lastSeen;spd*=1.3;break;}
      case'investigate':{this.stateTimer-=dt;if(this.stateTimer<=0)this.state='patrol';mt=this.targetPos;break;}
      case'attack':{
        this.strafeTimer+=dt;if(this.strafeTimer>0.8+Math.random()*0.7){this.strafeTimer=0;this.strafeDir*=-1;}
        const tp=new THREE.Vector3().subVectors(playerPos,mp).normalize();
        const sv=new THREE.Vector3().crossVectors(tp,new THREE.Vector3(0,1,0)).normalize().multiplyScalar(this.strafeDir*2.5);
        mt=playerPos.clone().add(sv);spd*=0.7;break;
      }
    }
    if(mt){
      const d=new THREE.Vector3().subVectors(mt,mp);d.y=0;
      if(d.length()>1){
        d.normalize();mp.x+=d.x*spd*dt;mp.z+=d.z*spd*dt;
        for(const o of obs){const cx=(o.minX+o.maxX)/2,cz=(o.minZ+o.maxZ)/2,dx=mp.x-cx,dz=mp.z-cz,dd=Math.sqrt(dx*dx+dz*dz);if(dd<1.5&&dd>0.01){mp.x+=dx/dd*(1.5-dd)*0.3;mp.z+=dz/dd*(1.5-dd)*0.3;}}
        const h=HALF_MAP-0.8;mp.x=Math.max(-h,Math.min(h,mp.x));mp.z=Math.max(-h,Math.min(h,mp.z));
        this.group.position.copy(mp);
      }
    }
    const lt=(canSee||this.state==='attack')?playerPos:mt;
    if(lt){const l=lt.clone();l.y=mp.y;this.group.lookAt(l);}
    if(this.state==='attack'&&canSee&&dist<30){
      this.shootCD-=dt;
      if(this.shootCD<=0){
        const fr=this.type.id==='sniper'?0.8:this.type.id==='heavy'?0.6:this.type.id==='scout'?0.15:0.25;
        this.shootCD=fr/dm+Math.random()*0.1;
        const sp=this.type.id==='sniper'?0.01:this.type.id==='heavy'?0.06:this.type.id==='scout'?0.08:0.035;
        return{shoot:true,from:mp.clone(),to:playerPos.clone(),dmg:this.type.dmg};
      }
    }
    return null;
  }
  updateHPBar(){
    if(!this.alive){this.hpBar.bg.style.display='none';return;}
    const p=this.getPos().clone();p.y+=1.6*this.type.scale;p.project(camera);
    const x=(p.x*0.5+0.5)*innerWidth,y=(-p.y*0.5+0.5)*innerHeight;
    this.hpBar.bg.style.left=(x-16)+'px';this.hpBar.bg.style.top=y+'px';
    const pct=Math.max(0,this.health/this.maxHealth);
    this.hpBar.fill.style.width=(pct*100)+'%';
    this.hpBar.fill.style.background=pct>0.6?'#44ff44':pct>0.3?'#ffaa44':'#ff4444';
    this.hpBar.bg.style.display='block';
  }
  dispose(){this.hpBar.bg.remove();}
}
function dist2D(a,b){const dx=a.x-b.x,dz=a.z-b.z;return Math.sqrt(dx*dx+dz*dz);}

// ─── Pickups ───
const pickups=[];
function createPickups(){
  for(const p of pickups){scene.remove(p);p.traverse(c=>{if(c.geometry)c.geometry.dispose();if(c.material)c.material.dispose();});}
  pickups.length=0;
  const positions=[{x:-20,z:0},{x:20,z:0},{x:0,z:-20},{x:0,z:20},{x:-12,z:-12},{x:12,z:12},{x:-30,z:-15},{x:30,z:15},{x:-15,z:30},{x:15,z:-30},{x:-5,z:-35},{x:5,z:35}];
  const types=['health','ammo','armor','health','ammo','health','armor','ammo','health','ammo','armor','health'];
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

// ─── Input ───
const keys={};let mouseDX=0,mouseDY=0,isPointerLocked=false;

// ─── HUD Functions ───
function updateHUD(){
  const hp=Math.max(0,G.health/G.maxHealth*100);
  healthBar.style.width=hp+'%';healthBar.style.background=hp>60?'#44ff44':hp>30?'#ffaa44':'#ff4444';
  healthText.textContent=Math.max(0,Math.round(G.health));
  armorBar.style.width=Math.max(0,G.armor/G.maxArmor*100)+'%';
  lowhp.classList.toggle('active',G.health<30);
  scoreText.textContent=G.score;killsText.textContent=G.kills;
  hudRound.textContent='R'+G.round;
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
  const alive=bots.filter(b=>b.alive).length;
  botsAlive.textContent='ENEMIGOS: '+alive+' / '+BOT_COUNTS[Math.min(G.round-1,BOT_COUNTS.length-1)];
  drawMinimap();
}

function drawMinimap(){
  const ctx=minimapCanvas.getContext('2d');const size=120;
  ctx.clearRect(0,0,size,size);ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,size,size);
  const sc=size/(HALF_MAP*2);
  const px=(camera.position.x+HALF_MAP)*sc,py=(camera.position.z+HALF_MAP)*sc;
  ctx.fillStyle='#ff4444';ctx.beginPath();ctx.arc(px,py,3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffaa44';
  for(const b of bots){if(!b.alive)continue;const bp=b.getPos();ctx.beginPath();ctx.arc((bp.x+HALF_MAP)*sc,(bp.z+HALF_MAP)*sc,2,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.strokeRect(0,0,size,size);
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
  m.textContent=killer+' eliminó a bot'+(hs?' (cabeza)':'');killFeed.appendChild(m);
  while(killFeed.children.length>6)killFeed.removeChild(killFeed.firstChild);
  setTimeout(()=>{if(m.parentNode)m.remove();},3000);
}
function showRoundAnnouncement(r,c){
  roundInfo.innerHTML='<span>RONDA '+r+'</span><span class="round-sub">'+c+' enemigos</span>';
  roundInfo.className='hud-round show';setTimeout(()=>{roundInfo.className='hud-round';roundInfo.innerHTML='';},2500);
}
function showGameOver(score,kills,round,acc){
  $('finalScore').textContent=score;$('finalKills').textContent=kills;
  $('finalRounds').textContent=round;$('finalAcc').textContent=(acc*100).toFixed(0)+'%';
  const mvp=$('mvpDisplay');
  mvp.textContent=kills>=10?'🏆 ¡LEYENDA!':kills>=5?'⭐ ¡ÉLITE!':kills>=3?'🔥 ¡BUEN TRABAJO!':'💪 SIGUE INTENTANDO';
  gameOver.style.display='flex';
}

// ─── Game Objects ───
let bots=[];
let gameDifficulty=2;
let botShootCD=0;

function startGame(){
  for(const b of bots){b.dispose();scene.remove(b.group);}
  bots=[];
  Object.assign(G,{health:100,armor:0,score:0,kills:0,dead:false,round:0,roundComplete:false,roundEndTimer:0,totalShots:0,totalHits:0});
  G.ammo=WEAPONS[G.curWeapon].mag;G.reserve=WEAPONS[G.curWeapon].res;G.magSize=WEAPONS[G.curWeapon].mag;
  G.reloading=false;G.shootCooldown=0;
  camera.position.set(0,PH,0);
  createPickups();
  startRound();
}

function startRound(){
  G.round++;const cnt=BOT_COUNTS[Math.min(G.round-1,BOT_COUNTS.length-1)];
  const existing=bots.length;
  if(existing<cnt){
    for(let i=0;i<cnt-existing;i++){
      const b=new Bot(bots.length, i%BTYPES.length);
      b.difficulty=gameDifficulty;
      scene.add(b.group);bots.push(b);
    }
  }
  const active=bots.slice(0,cnt);
  for(let i=existing;i<bots.length;i++){bots[i].group.visible=false;bots[i].alive=false;bots[i].hpBar.bg.style.display='none';}
  for(const b of active){
    b.difficulty=gameDifficulty;b.maxHealth=b.type.hp*(1+(gameDifficulty-1)*0.15);b.health=b.maxHealth;
    const sp=SPAWNS[b.idx%SPAWNS.length];
    b.spawn(new THREE.Vector3(sp.x+(Math.random()-0.5)*4,0,sp.z+(Math.random()-0.5)*4));
  }
  G.roundComplete=false;showRoundAnnouncement(G.round,cnt);G.gameRunning=true;
}

function checkRoundComplete(){
  const alive=bots.filter(b=>b.alive).length;
  if(alive===0&&bots.length>0&&!G.roundComplete){
    G.roundComplete=true;G.gameRunning=false;G.roundEndTimer=3;
    if(G.round>=BOT_COUNTS.length){
      setTimeout(()=>{if(G.round===0)return;snd('victory');$('goTitle').textContent='VICTORIA';renderer.domElement.style.display='none';hud.style.display='none';showGameOver(G.score,G.kills,G.round,G.totalHits/Math.max(G.totalShots,1));for(const b of bots)b.hpBar.bg.style.display='none';},1500);
    }
  }
}

// ─── Weapon Switching ───
function switchWeapon(id){
  if(G.reloading)return;
  if(weaponModels[G.curWeapon]){weaponGroup.remove(weaponModels[G.curWeapon]);}
  G.curWeapon=id;curWDef=WEAPONS[id];
  G.ammo=G.ammo;G.reserve=G.reserve;G.magSize=curWDef.mag;
  G.shootCooldown=0;
  if(!weaponModels[id])weaponModels[id]=buildWeaponModel(curWDef);
  weaponGroup.add(weaponModels[id]);weaponModels[id].visible=true;
}

// ─── Shooting ───
function shoot(){
  if(G.dead||G.paused||!G.gameRunning)return;
  if(G.reloading)return;
  if(G.shootCooldown>0)return;
  if(G.ammo<=0){reload();return;}
  G.ammo--;G.shootCooldown=curWDef.rate;G.totalShots++;
  snd(curWDef.snd);
  showCrosshairShoot();
  const mf=weaponModels[G.curWeapon]?.userData.muzzleFlash;if(mf)mf.intensity=2.5;setTimeout(()=>{if(mf)mf.intensity=0;},50);
  weaponGroup.position.z=-0.35+curWDef.recoil*0.5;
  for(let p=0;p<curWDef.pellets;p++){
    const d=new THREE.Vector3(0,0,-1);d.applyQuaternion(camera.quaternion);
    d.x+=(Math.random()-0.5)*curWDef.spread*2;d.y+=(Math.random()-0.5)*curWDef.spread*2;d.normalize();
    const ray=new THREE.Raycaster(camera.position.clone(),d,0.3,curWDef.range);
    const targets=[];
    for(const b of bots){if(!b.alive)continue;targets.push(b.headMesh,...b.group.children.filter(c=>c!==b.headMesh&&c!==b.headHit));}
    const hits=ray.intersectObjects(targets);
    if(hits.length>0){
      const hit=hits[0];let hitBot=null,isHS=false;
      for(const b of bots){
        if(!b.alive)continue;
        if(hit.object===b.headMesh){hitBot=b;isHS=true;break;}
        if(b.group.children.includes(hit.object)&&hit.object!==b.headHit){hitBot=b;break;}
      }
      if(hitBot){
        G.totalHits++;const res=hitBot.takeDamage(curWDef.dmg,isHS);
        showHitmarker(isHS);showDmgNum(hit.point,isHS?curWDef.dmg*3:curWDef.dmg,isHS);
        spawnSparks(hit.point,ray.ray.direction);
        if(isHS)snd('headshot');else snd('hit');
        if(res&&res.kill){
          G.score+=isHS?150:100;G.kills++;addKillFeed('Tú',isHS);
          if(isHS)snd('kill');checkRoundComplete();
        }
      }
    }
  }
  updateHUD();
}

function reload(){
  if(G.reloading||G.ammo===G.magSize||G.reserve<=0)return;
  G.reloading=true;G.reloadTimer=curWDef.reload;
}

// ─── Player ───
let velY=0,onGround=true;

function updatePlayer(dt){
  if(G.dead)return {moving:false,onGround:true};
  const sens=0.002,euler=new THREE.Euler(0,0,0,'YXZ');
  euler.setFromQuaternion(camera.quaternion);
  euler.y-=mouseDX*sens;euler.x-=mouseDY*sens;
  euler.x=Math.max(-Math.PI/2.1,Math.min(Math.PI/2.1,euler.x));
  camera.quaternion.setFromEuler(euler);
  mouseDX=0;mouseDY=0;
  const fwd=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);fwd.y=0;fwd.normalize();
  const right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);right.y=0;right.normalize();
  const dir=new THREE.Vector3();
  if(keys['KeyW']||keys['ArrowUp'])dir.add(fwd);
  if(keys['KeyS']||keys['ArrowDown'])dir.sub(fwd);
  if(keys['KeyA']||keys['ArrowLeft'])dir.sub(right);
  if(keys['KeyD']||keys['ArrowRight'])dir.add(right);
  const moving=dir.length()>0;if(moving)dir.normalize();
  const spd=RUN_SPEED*dt;
  const nx=camera.position.x+dir.x*spd,nz=camera.position.z+dir.z*spd;
  if(!collides(nx,camera.position.z,PR))camera.position.x=nx;
  if(!collides(camera.position.x,nz,PR))camera.position.z=nz;
  if((keys['Space'])&&onGround){velY=JUMP_SPEED;onGround=false;}
  velY+=GRAVITY*dt;camera.position.y+=velY*dt;
  if(camera.position.y<=PH){camera.position.y=PH;velY=0;onGround=true;}
  return{moving,onGround};
}

// ─── Bot Damage Player ───
function applyBotDamage(amt,dir){
  if(G.dead)return;
  if(G.armor>0){const ab=Math.min(G.armor,amt*0.5);G.armor-=ab;amt-=ab;}
  G.health-=amt;snd('hurt');showDmgIndicator(dir);
  if(G.health<=0){G.health=0;G.dead=true;G.gameRunning=false;
    setTimeout(()=>{if(!G.dead)return;renderer.domElement.style.display='none';hud.style.display='none';showGameOver(G.score,G.kills,G.round,G.totalHits/Math.max(G.totalShots,1));for(const b of bots)b.hpBar.bg.style.display='none';},1200);
  }
}

function checkLineCol(from,to){
  const d=new THREE.Vector3().subVectors(to,from),dist=d.length();if(dist<0.5)return false;
  d.normalize();const steps=Math.floor(dist/0.4),obs=getObs(),h=HALF_MAP-0.2;
  for(let i=1;i<steps;i++){const p=new THREE.Vector3().copy(from).addScaledVector(d,i*0.4);if(p.x<-h||p.x>h||p.z<-h||p.z>h)return true;for(const o of obs)if(p.x>o.minX&&p.x<o.maxX&&p.z>o.minZ&&p.z<o.maxZ)return true;}
  return false;
}

// ─── Game Loop ───
function frame(){
  requestAnimationFrame(frame);
  const dt=Math.min(clock.getDelta(),0.05),time=clock.elapsedTime;
  if(G.gameRunning&&!G.dead){
    if(!G.paused){
      const {moving,onGround:og}=updatePlayer(dt);
      // Cooldowns
      if(G.shootCooldown>0)G.shootCooldown-=dt;
      if(G.reloading){
        G.reloadTimer-=dt;if(G.reloadTimer<=0){const need=G.magSize-G.ammo,avail=Math.min(need,G.reserve);G.ammo+=avail;G.reserve-=avail;G.reloading=false;}
      }
      weaponGroup.position.z+=(-0.35-weaponGroup.position.z)*0.1;
      weaponGroup.position.y=-0.12+(moving&&og?Math.sin(time*14)*0.015:0);
      // Bots update
      const pPos=camera.position.clone(),obs=getObs();botShootCD-=dt;
      for(const b of bots){
        const res=b.update(dt,pPos,obs,gameDifficulty);
        if(res&&res.shoot&&botShootCD<=0){const hit=!checkLineCol(res.from,res.to);if(hit){const dDir=new THREE.Vector3().subVectors(res.from,pPos).normalize();applyBotDamage(res.dmg,dDir);botShootCD=0.05;}}
      }
      for(const b of bots)b.updateHPBar();
      updatePickups(dt);
      updateParticles(dt);
      // Round timer
      if(G.roundComplete){G.roundEndTimer-=dt;if(G.roundEndTimer<=0&&G.round<BOT_COUNTS.length){startRound();G.gameRunning=true;}}
      updateHUD();
      // Auto-fire
      if(G.mouseDown&&curWDef.auto&&isPointerLocked)shoot();
    }
  }
  renderer.render(scene,camera);
}

// ─── Event Handlers ───
document.addEventListener('keydown',e=>{
  keys[e.code]=true;
  if(!G.gameRunning||G.dead)return;
  if(e.code==='KeyR')reload();
  const n=parseInt(e.key);
  if(n>=1&&n<=WORDER.length)switchWeapon(WORDER[n-1]);
});
document.addEventListener('keyup',e=>{keys[e.code]=false;});

document.addEventListener('mousemove',e=>{if(isPointerLocked){mouseDX+=e.movementX;mouseDY+=e.movementY;}});
document.addEventListener('mousedown',e=>{if(e.button===0){G.mouseDown=true;if(isPointerLocked&&!G.dead&&G.gameRunning)shoot();}});
document.addEventListener('mouseup',e=>{if(e.button===0)G.mouseDown=false;});

document.addEventListener('pointerlockchange',()=>{
  isPointerLocked=document.pointerLockElement===renderer.domElement;
  if(!isPointerLocked&&G.gameRunning&&!G.dead)G.paused=true;else if(isPointerLocked)G.paused=false;
});

window.addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
});

// ─── Menu Buttons ───
$('btnPlay').addEventListener('click',()=>{
  initAudio();
  menu.style.display='none';hud.style.display='block';G.gameRunning=true;G.paused=false;
  renderer.domElement.style.display='block';
  // Init weapon models once
  if(!weaponModels.assault){for(const id of WORDER)weaponModels[id]=buildWeaponModel(WEAPONS[id]);camera.add(weaponGroup);weaponGroup.position.set(0.3,-0.12,-0.35);switchWeapon(G.curWeapon);}
  startGame();
  renderer.domElement.requestPointerLock();
});

$('btnControls').addEventListener('click',()=>{controlsModal.style.display='flex';});
$('btnCloseControls').addEventListener('click',()=>{controlsModal.style.display='none';});

$('btnRestart').addEventListener('click',()=>{
  $('goTitle').textContent='FIN DEL JUEGO';
  gameOver.style.display='none';renderer.domElement.style.display='block';hud.style.display='block';
  startGame();G.gameRunning=true;G.paused=false;
  renderer.domElement.requestPointerLock();
});

$('btnMenu').addEventListener('click',()=>{
  gameOver.style.display='none';menu.style.display='flex';hud.style.display='none';
  for(const b of bots)b.hpBar.bg.style.display='none';
});

// ─── Start ───
frame();

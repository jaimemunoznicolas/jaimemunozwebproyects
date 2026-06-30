import * as THREE from 'three';

/* ============================================================
   IMPROVED STRIKE BATTLE — Full FPS Game
   ============================================================ */

// ── DOM refs ──
const $ = id => document.getElementById(id);
const canvasContainer = $('gameCanvas');
const menu = $('menu');
const gameOver = $('gameOver');
const controlsModal = $('controlsModal');
const hud = $('hud');
const healthBar = $('healthBar');
const healthText = $('healthText');
const ammoText = $('ammoText');
const ammoReserve = $('ammoReserve');
const scoreText = $('scoreText');
const killsText = $('killsText');
const finalScore = $('finalScore');
const finalKills = $('finalKills');
const finalRounds = $('finalRounds');
const roundInfo = $('roundInfo');
const botsAlive = $('botsAlive');
const killFeed = $('killFeed');
const crosshair = $('crosshair');
const hitmarker = $('hitmarker');
const dmgOverlay = $('dmgOverlay');
const damageNumbers = $('damageNumbers');

// ── Game state ──
const MAP_SIZE = 80;
const PLAYER_HEIGHT = 1.6;
const PLAYER_RADIUS = 0.4;
const GRAVITY = -20;
const RUN_SPEED = 8;
const JUMP_SPEED = 8;
const BOT_COUNT = [4, 6, 8, 10, 12];
const BOT_HEIGHT = 1.7;
const BOT_RADIUS = 0.35;
const ROUND_END_DELAY = 3;

const state = {
  health: 100,
  maxHealth: 100,
  ammo: 30,
  maxAmmo: 30,
  reserve: 90,
  score: 0,
  kills: 0,
  round: 0,
  playing: false,
  dead: false,
  paused: false,
  reloading: false,
  shootCooldown: 0,
  lastDir: new THREE.Vector3(),
};

// ── Three.js setup ──
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
canvasContainer.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a1a);
scene.fog = new THREE.Fog(0x0a0a1a, 50, MAP_SIZE * 1.3);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, PLAYER_HEIGHT, 0);

const clock = new THREE.Clock();

// ── Lights ──
const ambientLight = new THREE.AmbientLight(0x404070, 0.4);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0x8888ff, 0x444422, 0.6);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xffeedd, 1.2);
sunLight.position.set(30, 40, 20);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 100;
sunLight.shadow.camera.left = -50;
sunLight.shadow.camera.right = 50;
sunLight.shadow.camera.top = 50;
sunLight.shadow.camera.bottom = -50;
sunLight.shadow.bias = -0.001;
scene.add(sunLight);

const fillLight = new THREE.DirectionalLight(0x4444ff, 0.3);
fillLight.position.set(-30, 10, -20);
scene.add(fillLight);

// ── Sky with stars ──
const starCount = 2000;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);
const starSizes = new Float32Array(starCount);
for (let i = 0; i < starCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = 90 + Math.random() * 30;
  starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  starPos[i * 3 + 1] = Math.abs(r * Math.cos(phi));
  starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  starSizes[i] = 0.5 + Math.random() * 1.5;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
const starMat = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.3,
  transparent: true,
  opacity: 0.8,
  sizeAttenuation: true,
});
scene.add(new THREE.Points(starGeo, starMat));

// ── Ground ──
const groundGeo = new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x1a1a2e,
  roughness: 0.9,
  metalness: 0.1,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grid overlay
const gridHelper = new THREE.GridHelper(MAP_SIZE, 40, 0x333366, 0x222244);
gridHelper.position.y = 0.05;
scene.add(gridHelper);

// ── Walls ──
const walls = [];

function addWall(x, z, w, h, d, color = 0x2a2a4a) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.7,
    metalness: 0.2,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  walls.push({ mesh, minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
  return mesh;
}

function addBuilding(x, z, w, d, h, color) {
  addWall(x, z, w, h, d, color);
  // Decorative trim
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x444477, roughness: 0.5, metalness: 0.3 });
  const trim = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.1, d + 0.2), trimMat);
  trim.position.set(x, h + 0.05, z);
  scene.add(trim);
}

function addCrate(x, z, size = 0.8, color = 0x554433) {
  const geo = new THREE.BoxGeometry(size, size * 0.6, size);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.1 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, size * 0.3, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  walls.push({
    mesh,
    minX: x - size / 2, maxX: x + size / 2,
    minZ: z - size / 2, maxZ: z + size / 2,
  });
}

// Border walls
const BW = 1.2, BH = 4;
addWall(-MAP_SIZE / 2, 0, BW, BH, MAP_SIZE, 0x1a1a3a);
addWall(MAP_SIZE / 2, 0, BW, BH, MAP_SIZE, 0x1a1a3a);
addWall(0, -MAP_SIZE / 2, MAP_SIZE, BH, BW, 0x1a1a3a);
addWall(0, MAP_SIZE / 2, MAP_SIZE, BH, BW, 0x1a1a3a);

// Central buildings
addBuilding(-10, -8, 10, 6, 3, 0x3a3a6a);
addBuilding(10, 8, 10, 6, 3.5, 0x4a3a6a);
addBuilding(-12, 10, 7, 7, 2.5, 0x3a4a6a);
addBuilding(12, -10, 7, 7, 2.8, 0x4a4a6a);

// Cover walls
addWall(0, -18, 4, 1.6, 0.6, 0x444477);
addWall(0, 18, 4, 1.6, 0.6, 0x444477);
addWall(-18, 0, 0.6, 1.6, 4, 0x444477);
addWall(18, 0, 0.6, 1.6, 4, 0x444477);
addWall(-22, -12, 3, 1.4, 0.5, 0x3a3a5a);
addWall(22, 12, 3, 1.4, 0.5, 0x3a3a5a);
addWall(-22, 12, 3, 1.4, 0.5, 0x3a3a5a);
addWall(22, -12, 3, 1.4, 0.5, 0x3a3a5a);

// Crates
addCrate(5, 5, 0.8);
addCrate(-5, -5, 0.8);
addCrate(-5, 5, 0.7, 0x664422);
addCrate(5, -5, 0.7, 0x664422);
addCrate(-15, -15, 0.9, 0x555533);
addCrate(15, 15, 0.9, 0x555533);
addCrate(0, 0, 1.0, 0x444466);
addCrate(-8, 18, 0.7);
addCrate(8, -18, 0.7);

// ── Pickup spawn points ──
const pickupSpawns = [
  { x: -15, z: 0 }, { x: 15, z: 0 },
  { x: 0, z: -15 }, { x: 0, z: 15 },
  { x: -8, z: -8 }, { x: 8, z: 8 },
];

// ── Bot spawn points ──
const botSpawns = [
  { x: -25, z: -25 }, { x: 25, z: -25 },
  { x: -25, z: 25 }, { x: 25, z: 25 },
  { x: 0, z: -28 }, { x: 0, z: 28 },
  { x: -28, z: 0 }, { x: 28, z: 0 },
  { x: -20, z: -20 }, { x: 20, z: 20 },
  { x: -20, z: 20 }, { x: 20, z: -20 },
];

// ── BOT class ──
const botColors = [0xff4444, 0x44ff44, 0x4488ff, 0xffaa44, 0xff44ff, 0x44ffff, 0xffff44, 0xff6644];

class Bot {
  constructor(index) {
    this.index = index;
    this.alive = true;
    this.health = 100;
    this.color = botColors[index % botColors.length];

    this.group = new THREE.Group();

    // Body
    const bodyMat = new THREE.MeshStandardMaterial({ color: this.color, roughness: 0.6, metalness: 0.2 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.4), bodyMat);
    body.position.y = 0.4;
    body.castShadow = true;
    this.group.add(body);

    // Head
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffccaa, roughness: 0.4 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), headMat);
    head.position.y = 1.1;
    head.castShadow = true;
    this.headMesh = head;
    this.group.add(head);

    // Head hitbox (invisible)
    this.headHitbox = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 6, 6),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.headHitbox.position.y = 1.1;
    this.group.add(this.headHitbox);

    // Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x222244, roughness: 0.8 });
    for (let side of [-0.2, 0.2]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), legMat);
      leg.position.set(side, 0.3, 0);
      leg.castShadow = true;
      this.group.add(leg);
    }

    // Arms
    const armMat = new THREE.MeshStandardMaterial({ color: 0xccaa88, roughness: 0.6 });
    for (let side of [-0.5, 0.5]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), armMat);
      arm.position.set(side, 0.55, 0);
      this.group.add(arm);
    }

    // Gun
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6, roughness: 0.3 });
    const gun = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.5), gunMat);
    gun.position.set(0.3, 0.5, -0.3);
    this.group.add(gun);
    this.gunMesh = gun;

    // Health bar
    this.hpBarBg = document.createElement('div');
    this.hpBarBg.style.cssText = 'position:fixed;width:40px;height:4px;background:rgba(0,0,0,0.5);border-radius:2px;pointer-events:none;z-index:5;';
    this.hpBarFill = document.createElement('div');
    this.hpBarFill.style.cssText = 'height:100%;border-radius:2px;transition:width 0.2s;';
    this.hpBarBg.appendChild(this.hpBarFill);
    document.body.appendChild(this.hpBarBg);

    this.spawn();
  }

  spawn() {
    const sp = botSpawns[this.index % botSpawns.length];
    this.group.position.set(sp.x + (Math.random() - 0.5) * 3, 0, sp.z + (Math.random() - 0.5) * 3);
    this.alive = true;
    this.health = 100;
    this.group.visible = true;

    this.state = 'patrol';
    this.stateTimer = 0;
    this.target = null;
    this.waypoint = this.randomWaypoint();
    this.shootCooldown = 0;
    this.strafeDir = 1;
    this.strafeTimer = 0;
    this.sightTimer = 0;
    this.respawnTimer = 0;
    this.lastKnownPlayerPos = null;
  }

  randomWaypoint() {
    const margin = 5;
    const half = MAP_SIZE / 2 - margin;
    return new THREE.Vector3(
      (Math.random() - 0.5) * half * 2,
      0,
      (Math.random() - 0.5) * half * 2
    );
  }

  getPos() { return this.group.position; }

  distanceTo(pos) { return this.getPos().distanceTo(pos); }

  getHeadWorldPos() {
    const p = new THREE.Vector3();
    this.headHitbox.getWorldPosition(p);
    return p;
  }

  takeDamage(amount, isHeadshot) {
    if (!this.alive) return;
    this.health -= amount;
    if (this.health <= 0) {
      this.die(isHeadshot);
      return 'kill';
    }
    return 'hit';
  }

  die(headshot) {
    this.alive = false;
    this.group.visible = false;
    this.hpBarBg.style.display = 'none';
    this.respawnTimer = 3;
    state.score += headshot ? 150 : 100;
    state.kills++;
    spawnParticles(this.getPos(), this.color);
  }

  update(dt, playerPos, playerLookingAt, obstacles) {
    if (!this.alive) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.spawn();
        this.hpBarBg.style.display = 'block';
      }
      return;
    }

    const myPos = this.getPos();
    const dist = this.distanceTo(playerPos);
    const canSee = dist < 35 && this.hasLineOfSight(playerPos, obstacles);

    this.sightTimer = canSee ? Math.min(this.sightTimer + dt, 2) : Math.max(this.sightTimer - dt, 0);
    const hasSeen = this.sightTimer > 0.3;

    // State machine
    if (canSee && dist < 30) {
      this.state = 'attack';
    } else if (hasSeen && dist < 40) {
      this.state = 'chase';
      if (canSee) this.lastKnownPlayerPos = playerPos.clone();
    } else {
      this.state = 'patrol';
    }

    const speed = this.state === 'attack' ? 4 : this.state === 'chase' ? 6 : 2.5;
    let targetPos = null;

    if (this.state === 'patrol') {
      if (this.distanceTo(this.waypoint) < 2) {
        this.waypoint = this.randomWaypoint();
      }
      targetPos = this.waypoint;
    } else if (this.state === 'chase') {
      targetPos = this.lastKnownPlayerPos || playerPos;
    } else {
      this.strafeTimer += dt;
      if (this.strafeTimer > 1.5) {
        this.strafeTimer = 0;
        this.strafeDir *= -1;
      }
      const strafeOffset = new THREE.Vector3();
      const toPlayer = new THREE.Vector3().subVectors(playerPos, myPos).normalize();
      strafeOffset.crossVectors(toPlayer, new THREE.Vector3(0, 1, 0)).normalize();
      strafeOffset.multiplyScalar(this.strafeDir * 3);
      targetPos = playerPos.clone().add(strafeOffset);
    }

    // Move toward target
    if (targetPos) {
      const dir = new THREE.Vector3().subVectors(targetPos, myPos);
      dir.y = 0;
      if (dir.length() > 0.5) {
        dir.normalize();
        myPos.x += dir.x * speed * dt;
        myPos.z += dir.z * speed * dt;

        // Avoid obstacles (simple push)
        for (const obs of obstacles) {
          const cx = (obs.minX + obs.maxX) / 2;
          const cz = (obs.minZ + obs.maxZ) / 2;
          const dx = myPos.x - cx;
          const dz = myPos.z - cz;
          const distO = Math.sqrt(dx * dx + dz * dz);
          if (distO < 2.0 && distO > 0.01) {
            const push = (2 - distO) * 0.3;
            myPos.x += (dx / distO) * push;
            myPos.z += (dz / distO) * push;
          }
        }

        // Clamp
        const half = MAP_SIZE / 2 - 0.5;
        myPos.x = THREE.MathUtils.clamp(myPos.x, -half, half);
        myPos.z = THREE.MathUtils.clamp(myPos.z, -half, half);

        this.group.position.copy(myPos);
      }
    }

    // Face player or movement direction
    if (canSee) {
      const lookTarget = playerPos.clone();
      lookTarget.y = myPos.y;
      this.group.lookAt(lookTarget);
    } else if (targetPos) {
      const lookTarget = targetPos.clone();
      lookTarget.y = myPos.y;
      this.group.lookAt(lookTarget);
    }

    // Shoot
    if (this.state === 'attack' && canSee && dist < 28) {
      this.shootCooldown -= dt;
      if (this.shootCooldown <= 0) {
        this.shootCooldown = 0.25 + Math.random() * 0.2;
        const spread = 0.05 + (1 - Math.min(dist / 28, 1)) * 0.03;
        return { shoot: true, spread, from: myPos.clone(), to: playerPos.clone() };
      }
    } else if (this.state === 'chase') {
      this.shootCooldown = Math.min(this.shootCooldown + dt, 0.3);
    }

    return null;
  }

  hasLineOfSight(pos, obstacles) {
    const myPos = this.getPos();
    const dir = new THREE.Vector3().subVectors(pos, myPos);
    const dist = dir.length();
    if (dist < 1) return true;
    dir.normalize();
    const step = 0.8;
    const steps = Math.floor(dist / step);
    for (let i = 1; i < steps; i++) {
      const p = new THREE.Vector3().copy(myPos).addScaledVector(dir, i * step);
      for (const obs of obstacles) {
        if (this.pointInAABB(p, obs)) return false;
      }
    }
    return true;
  }

  pointInAABB(p, box) {
    return p.x >= box.minX && p.x <= box.maxX && p.z >= box.minZ && p.z <= box.maxZ;
  }

  updateHPBar(cam) {
    if (!this.alive) return;
    const pos = this.getPos().clone();
    pos.y += 1.6;
    pos.project(cam);
    const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;
    this.hpBarBg.style.left = (x - 20) + 'px';
    this.hpBarBg.style.top = y + 'px';
    const pct = Math.max(0, this.health / 100);
    this.hpBarFill.style.width = (pct * 100) + '%';
    this.hpBarFill.style.background = pct > 0.5 ? '#44ff44' : pct > 0.25 ? '#ffaa44' : '#ff4444';
    this.hpBarBg.style.display = 'block';
  }

  dispose() {
    this.hpBarBg.remove();
  }
}

// ── Particles ──
const particles = [];
function spawnParticles(pos, color) {
  const count = 30;
  for (let i = 0; i < count; i++) {
    const size = 0.05 + Math.random() * 0.15;
    const geo = new THREE.BoxGeometry(size, size, size);
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      Math.random() * 2,
      (Math.random() - 0.5) * 2
    ).normalize().multiplyScalar(3 + Math.random() * 5);
    mesh.userData.vel = dir;
    mesh.userData.life = 0.8 + Math.random() * 0.6;
    scene.add(mesh);
    particles.push(mesh);
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.userData.vel.y -= 5 * dt;
    p.position.addScaledVector(p.userData.vel, dt);
    p.userData.life -= dt;
    p.material.opacity = Math.max(0, p.userData.life / 1.4);
    p.scale.multiplyScalar(0.98);
    if (p.userData.life <= 0) {
      scene.remove(p);
      p.geometry.dispose();
      p.material.dispose();
      particles.splice(i, 1);
    }
  }
}

// ── Pickups ──
const pickups = [];

function createPickups() {
  for (const sp of pickupSpawns) {
    const isHealth = Math.random() > 0.4;
    const group = new THREE.Group();
    group.position.set(sp.x, 0.3, sp.z);

    if (isHealth) {
      const crossMat = new THREE.MeshStandardMaterial({ color: 0x44ff44, emissive: 0x44ff44, emissiveIntensity: 0.1 });
      const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.1), crossMat);
      const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), crossMat);
      group.add(hBar);
      group.add(vBar);
      group.userData.type = 'health';
      group.userData.value = 25;
    } else {
      const boxMat = new THREE.MeshStandardMaterial({ color: 0x4488ff, emissive: 0x4488ff, emissiveIntensity: 0.1 });
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), boxMat);
      group.add(box);
      // Bullets on top
      const bulletMat = new THREE.MeshStandardMaterial({ color: 0xccaa44, metalness: 0.8, roughness: 0.2 });
      for (let i = 0; i < 3; i++) {
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 4), bulletMat);
        b.position.set((i - 1) * 0.12, 0.2, 0);
        b.rotation.x = Math.PI / 2;
        group.add(b);
      }
      group.userData.type = 'ammo';
      group.userData.value = 15;
    }

    group.userData.active = true;
    group.userData.respawnTimer = 0;
    scene.add(group);
    pickups.push(group);
  }
}

function updatePickups(dt, playerPos) {
  for (const p of pickups) {
    if (p.userData.active) {
      p.rotation.y += dt * 1.5;
      p.position.y = 0.3 + Math.sin(Date.now() * 0.003 + p.position.x) * 0.1;

      const dist = playerPos.distanceTo(p.position);
      if (dist < 1.2) {
        if (p.userData.type === 'health') {
          state.health = Math.min(state.maxHealth, state.health + p.userData.value);
          showPickupMsg('+ ' + p.userData.value + ' HP');
        } else {
          state.reserve = Math.min(90, state.reserve + p.userData.value);
          showPickupMsg('+ ' + p.userData.value + ' BALAS');
        }
        updateHUD();
        p.userData.active = false;
        p.userData.respawnTimer = 8;
        p.visible = false;
      }
    } else {
      p.userData.respawnTimer -= dt;
      if (p.userData.respawnTimer <= 0) {
        p.userData.active = true;
        p.visible = true;
      }
    }
  }
}

let pickupMsgTimeout = null;
function showPickupMsg(text) {
  const el = document.getElementById('pickupMsg');
  if (el) el.remove();
  const div = document.createElement('div');
  div.id = 'pickupMsg';
  div.className = 'hud-pickup';
  div.textContent = text;
  document.getElementById('hud').appendChild(div);
  clearTimeout(pickupMsgTimeout);
  pickupMsgTimeout = setTimeout(() => { const e = document.getElementById('pickupMsg'); if (e) e.remove(); }, 2000);
}

// ── Weapon & Gun Model ──
const gunGroup = new THREE.Group();
let gunBobPhase = 0;

function createGunModel() {
  // Main body
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.4, metalness: 0.6 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.4), bodyMat);
  body.position.set(0, 0, -0.2);
  gunGroup.add(body);

  // Barrel
  const barrelMat = new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.3, metalness: 0.7 });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.5, 8), barrelMat);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.01, -0.45);
  gunGroup.add(barrel);

  // Grip
  const gripMat = new THREE.MeshStandardMaterial({ color: 0x3a3020, roughness: 0.8 });
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.06), gripMat);
  grip.position.set(0, -0.08, 0);
  gunGroup.add(grip);

  // Magazine
  const magMat = new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.5, metalness: 0.5 });
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.08), magMat);
  mag.position.set(0, -0.06, 0.02);
  gunGroup.add(mag);

  // Sight
  const sightMat = new THREE.MeshStandardMaterial({ color: 0x444455, roughness: 0.3, metalness: 0.5 });
  const sight = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.02), sightMat);
  sight.position.set(0, 0.08, -0.25);
  gunGroup.add(sight);

  // Muzzle flash light
  const muzzleFlash = new THREE.PointLight(0xffaa44, 0, 3);
  muzzleFlash.position.set(0, 0, -0.75);
  gunGroup.add(muzzleFlash);
  gunGroup.userData.muzzleFlash = muzzleFlash;

  gunGroup.position.set(0.25, -0.15, -0.4);
  camera.add(gunGroup);
  scene.add(camera);
}

// ── Game objects ──
let bots = [];
let obstacles = [];

function initGame() {
  // Clear previous
  for (const b of bots) b.dispose();
  bots = [];
  botBullets = [];
  pickups.length = 0;

  // Reset state
  state.health = 100;
  state.ammo = 30;
  state.reserve = 90;
  state.score = 0;
  state.kills = 0;
  state.round = 0;
  state.dead = false;
  state.reloading = false;
  state.shootCooldown = 0;

  // Clear old pickups
  for (const p of pickups) {
    scene.remove(p);
    p.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
  }
  pickups.length = 0;

  // Pickups
  createPickups();

  // Obstacles list for AI
  obstacles = walls.map(w => ({ minX: w.minX, maxX: w.maxX, minZ: w.minZ, maxZ: w.maxZ }));

  // Start round 1
  startRound();
}

function startRound() {
  state.round++;
  const count = BOT_COUNT[Math.min(state.round - 1, BOT_COUNT.length - 1)];

  // Create/respawn bots
  for (let i = 0; i < count; i++) {
    if (i >= bots.length) {
      const bot = new Bot(i);
      bots.push(bot);
      scene.add(bot.group);
    } else {
      bots[i].spawn();
      bots[i].hpBarBg.style.display = 'block';
    }
  }
  // Hide extra bots
  for (let i = count; i < bots.length; i++) {
    bots[i].group.visible = false;
    bots[i].alive = false;
    bots[i].hpBarBg.style.display = 'none';
  }

  showRoundAnnouncement(state.round, count);
  updateHUD();
}

function showRoundAnnouncement(round, botCount) {
  roundInfo.textContent = `RONDA ${round}`;
  const sub = document.createElement('span');
  sub.className = 'round-sub';
  sub.textContent = `${botCount} enemigos`;
  roundInfo.appendChild(sub);
  roundInfo.className = 'hud-round show';
  setTimeout(() => { roundInfo.className = 'hud-round'; roundInfo.innerHTML = ''; }, 2500);
}

// ── Shooting ──
let muzzleFlashTimer = 0;

function shoot() {
  if (state.reloading || state.dead) return;
  if (state.ammo <= 0) { reload(); return; }
  if (state.shootCooldown > 0) return;

  state.ammo--;
  state.shootCooldown = 0.12;

  // Muzzle flash
  const mf = gunGroup.userData.muzzleFlash;
  if (mf) { mf.intensity = 3; muzzleFlashTimer = 0.05; }

  // Recoil animation
  gunGroup.position.z = -0.3;

  // Crosshair expansion
  crosshair.classList.add('shoot');
  setTimeout(() => crosshair.classList.remove('shoot'), 100);

  // Calculate shot
  const dir = new THREE.Vector3(0, 0, -1);
  dir.applyQuaternion(camera.quaternion);

  const spread = 0.005;
  dir.x += (Math.random() - 0.5) * spread;
  dir.y += (Math.random() - 0.5) * spread;
  dir.z += (Math.random() - 0.5) * spread;
  dir.normalize();

  const raycaster = new THREE.Raycaster(camera.position.clone(), dir, 0.5, 60);
  const hitTargets = [];
  for (const bot of bots) {
    if (!bot.alive) continue;
    hitTargets.push(bot.headMesh, ...bot.group.children.filter(c => c !== bot.headMesh && c !== bot.headHitbox));
  }
  const intersects = raycaster.intersectObjects(hitTargets);

  if (intersects.length > 0) {
    const hit = intersects[0];
    let hitBot = null;
    let isHeadshot = false;

    for (const bot of bots) {
      if (!bot.alive) continue;
      if (hit.object === bot.headMesh) {
        hitBot = bot;
        isHeadshot = true;
        break;
      }
      if (bot.group.children.includes(hit.object) && hit.object !== bot.headHitbox) {
        hitBot = bot;
        break;
      }
    }

    if (hitBot) {
      const dmg = isHeadshot ? 75 : 25;
      const result = hitBot.takeDamage(dmg, isHeadshot);

      // Hitmarker
      showHitmarker(isHeadshot);

      // Damage number
      showDamageNumber(hit.point, dmg, isHeadshot);

      if (result === 'kill') {
        addKillFeed('Tú', isHeadshot ? 'cabeza' : '');
        updateHUD();
        playSound('kill');
        spawnParticles(hitBot.getPos(), hitBot.color);
      } else {
        playSound('hit');
      }
    }
  }

  playSound('shoot');
  updateHUD();
}

function reload() {
  if (state.reloading || state.ammo === state.maxAmmo || state.reserve <= 0) return;
  state.reloading = true;
  const needed = state.maxAmmo - state.ammo;
  const available = Math.min(needed, state.reserve);

  setTimeout(() => {
    state.ammo += available;
    state.reserve -= available;
    state.reloading = false;
    updateHUD();
  }, 1500);

  // Reload animation
  gunGroup.position.y = -0.3;
  setTimeout(() => { gunGroup.position.y = -0.15; }, 750);
}

function showHitmarker(headshot) {
  hitmarker.classList.add('show');
  if (headshot) hitmarker.style.transform = 'translate(-50%, -50%) scale(1.3)';
  setTimeout(() => {
    hitmarker.classList.remove('show');
    hitmarker.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 150);
}

function showDamageNumber(pos, dmg, headshot) {
  const v = pos.clone().project(camera);
  const x = (v.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-v.y * 0.5 + 0.5) * window.innerHeight;

  const el = document.createElement('div');
  el.className = 'dmg-num' + (headshot ? ' headshot' : '');
  el.textContent = dmg;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  damageNumbers.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

function addKillFeed(killer, type) {
  const msg = document.createElement('div');
  msg.className = 'kill-msg';
  msg.textContent = `${killer} eliminó a bot ${type ? '(' + type + ') ' : ''}`;
  killFeed.appendChild(msg);
  while (killFeed.children.length > 5) killFeed.removeChild(killFeed.firstChild);
  setTimeout(() => { if (msg.parentNode) msg.remove(); }, 3000);
}

// ── Bot damage player ──
function applyBotDamage(dmg, dir) {
  if (state.dead) return;
  state.health -= dmg;
  updateHUD();

  if (dir) {
    const worldAngle = Math.atan2(dir.x, dir.z);
    const camAngle = camera.rotation.y + Math.PI;
    let rel = worldAngle - camAngle;
    while (rel > Math.PI) rel -= Math.PI * 2;
    while (rel < -Math.PI) rel += Math.PI * 2;
    const cls = Math.abs(rel) < 1 ? 'hit-front' : Math.abs(rel) > 2.5 ? 'hit-back' : rel > 0 ? 'hit-left' : 'hit-right';
    dmgOverlay.innerHTML = '<div class="dmg-vignette"></div>';
    dmgOverlay.className = 'hud-dmg ' + cls;
    setTimeout(() => { dmgOverlay.className = 'hud-dmg'; }, 200);
  }

  playSound('hurt');

  if (state.health <= 0) {
    state.health = 0;
    playerDeath();
  }
}

function playerDeath() {
  state.dead = true;
  state.playing = false;

  // Show game over after brief delay
  setTimeout(() => {
    renderer.domElement.style.display = 'none';
    finalScore.textContent = state.score;
    finalKills.textContent = state.kills;
    finalRounds.textContent = state.round;
    gameOver.style.display = 'flex';
    hud.style.display = 'none';
    // Cleanup bot HP bars
    for (const b of bots) b.hpBarBg.style.display = 'none';
  }, 1000);
}

// ── Sounds (Web Audio) ──
let audioCtx = null;
function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(type) {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    switch (type) {
      case 'shoot':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.08);
        break;
      case 'hit':
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.06);
        break;
      case 'kill':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.2);
        break;
      case 'hurt':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.2);
        break;
      case 'pickup':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.15);
        break;
    }
  } catch (e) { /* ignore audio errors */ }
}

// ── HUD ──
function updateHUD() {
  healthBar.style.width = Math.max(0, state.health / state.maxHealth * 100) + '%';
  healthBar.style.background = state.health > 50 ? '#44ff44' : state.health > 25 ? '#ffaa44' : '#ff4444';
  healthText.textContent = Math.max(0, Math.round(state.health));
  ammoText.textContent = state.ammo;
  ammoReserve.textContent = state.reloading ? '...' : state.reserve;
  scoreText.textContent = state.score;
  killsText.textContent = state.kills;

  // Low HP overlay
  const lowhp = $('lowhpOverlay');
  if (lowhp) {
    if (state.health < 30) lowhp.classList.add('active');
    else lowhp.classList.remove('active');
  }

  // Update bots alive count
  const alive = bots.filter(b => b.alive).length;
  botsAlive.textContent = `ENEMIGOS: ${alive}`;
}

// ── Input ──
const keys = {};
let mouseDX = 0, mouseDY = 0;
let isPointerLocked = false;

document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'KeyR' && state.playing) reload();
});
document.addEventListener('keyup', e => { keys[e.code] = false; });

document.addEventListener('mousemove', e => {
  if (isPointerLocked) {
    mouseDX += e.movementX;
    mouseDY += e.movementY;
  }
});

document.addEventListener('mousedown', e => {
  if (e.button === 0 && isPointerLocked && state.playing && !state.dead) {
    shoot();
  }
});

document.addEventListener('pointerlockchange', () => {
  isPointerLocked = document.pointerLockElement === renderer.domElement;
  if (!isPointerLocked && state.playing && !state.dead) {
    state.paused = true;
  }
});

// ── Physics & collision ──
function collidesWithWalls(x, z, radius) {
  for (const w of walls) {
    if (x + radius > w.minX && x - radius < w.maxX && z + radius > w.minZ && z - radius < w.maxZ) {
      return true;
    }
  }
  const half = MAP_SIZE / 2 - radius;
  if (x < -half || x > half || z < -half || z > half) return true;
  return false;
}

function checkLineCollision(from, to, radius) {
  // Check if a line from->to passes through any wall (for bot shooting)
  const dir = new THREE.Vector3().subVectors(to, from);
  const dist = dir.length();
  if (dist < 0.1) return true;
  dir.normalize();
  const steps = Math.floor(dist / 0.5);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = new THREE.Vector3().lerpVectors(from, to, t);
    if (collidesWithWalls(p.x, p.z, radius)) {
      return i > 2; // Allow some margin near the origin
    }
  }
  return false;
}

// ── Game loop ──
let velocityY = 0;
let onGround = true;

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (state.playing && !state.dead) {
    updatePlayer(dt);
    updateBots(dt);
    updatePickups(dt, camera.position);
    updateParticles(dt);
    updateMuzzleFlash(dt);
    updateGunBob(dt);
    updateHUD();

    // Check if all bots eliminated
    checkRoundComplete();
  }

  renderer.render(scene, camera);
}

function updatePlayer(dt) {
  if (state.paused) {
    // Check for unpause
    if (isPointerLocked) state.paused = false;
    return;
  }

  // Mouse look
  const sens = 0.002;
  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  euler.setFromQuaternion(camera.quaternion);
  euler.y -= mouseDX * sens;
  euler.x -= mouseDY * sens;
  euler.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, euler.x));
  camera.quaternion.setFromEuler(euler);
  mouseDX = 0;
  mouseDY = 0;

  // Movement
  const dir = new THREE.Vector3();
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  forward.y = 0;
  forward.normalize();
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  right.y = 0;
  right.normalize();

  if (keys['KeyW'] || keys['ArrowUp']) dir.add(forward);
  if (keys['KeyS'] || keys['ArrowDown']) dir.sub(forward);
  if (keys['KeyA'] || keys['ArrowLeft']) dir.sub(right);
  if (keys['KeyD'] || keys['ArrowRight']) dir.add(right);

  let moving = dir.length() > 0;
  if (moving) {
    dir.normalize();
    state.lastDir.copy(dir);
  }

  let speed = RUN_SPEED * dt;
  let nx = camera.position.x + dir.x * speed;
  let nz = camera.position.z + dir.z * speed;

  if (!collidesWithWalls(nx, camera.position.z, PLAYER_RADIUS)) {
    camera.position.x = nx;
  }
  if (!collidesWithWalls(camera.position.x, nz, PLAYER_RADIUS)) {
    camera.position.z = nz;
  }

  // Jump / Gravity
  if ((keys['Space'] || keys['KeyB']) && onGround) {
    velocityY = JUMP_SPEED;
    onGround = false;
  }

  velocityY += GRAVITY * dt;
  camera.position.y += velocityY * dt;
  if (camera.position.y <= PLAYER_HEIGHT) {
    camera.position.y = PLAYER_HEIGHT;
    velocityY = 0;
    onGround = true;
  }

  // Gun recoil recovery
  gunGroup.position.z += (0.4 - gunGroup.position.z) * 0.15;

  // Smooth shoot cooldown
  if (state.shootCooldown > 0) state.shootCooldown -= dt;
}

function updateGunBob(dt) {
  if (state.dead) return;
  const moving = keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD'] ||
                 keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight'];
  if (moving && onGround) {
    gunBobPhase += dt * 12;
    gunGroup.position.y = -0.15 + Math.sin(gunBobPhase) * 0.02;
    gunGroup.rotation.z = Math.sin(gunBobPhase * 2) * 0.005;
  } else {
    gunGroup.position.y += (-0.15 - gunGroup.position.y) * 0.1;
    gunGroup.rotation.z *= 0.9;
  }
}

function updateMuzzleFlash(dt) {
  if (muzzleFlashTimer > 0) {
    muzzleFlashTimer -= dt;
    if (muzzleFlashTimer <= 0) {
      const mf = gunGroup.userData.muzzleFlash;
      if (mf) mf.intensity = 0;
    }
  }
}

function updateBots(dt) {
  const playerPos = camera.position.clone();
  for (const bot of bots) {
    const result = bot.update(dt, playerPos, playerPos, obstacles);
    if (result && result.shoot) {
      const hit = !checkLineCollision(result.from, result.to, 0.2);
      if (hit) {
        const dmgDir = new THREE.Vector3().subVectors(result.from, playerPos).normalize();
        applyBotDamage(8 + Math.random() * 4, dmgDir);
      }
    }
    bot.updateHPBar(camera);
  }
}
    }
    bot.updateHPBar(camera);
  }
}

function checkRoundComplete() {
  const alive = bots.filter(b => b.alive).length;
  if (alive === 0 && bots.length > 0) {
    state.playing = false;
    setTimeout(() => {
      if (state.round >= BOT_COUNT.length) {
        // Victory!
        renderer.domElement.style.display = 'none';
        finalScore.textContent = state.score;
        finalKills.textContent = state.kills;
        finalRounds.textContent = state.round;
        gameOver.style.display = 'flex';
        hud.style.display = 'none';
        document.getElementById('gameOver').querySelector('.go-title').textContent = 'VICTORIA';
        for (const b of bots) b.hpBarBg.style.display = 'none';
      } else {
        startRound();
        state.playing = true;
      }
    }, ROUND_END_DELAY * 1000);
  }
}

// ── Window resize ──
window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// ── Button events ──
$('btnPlay').addEventListener('click', () => {
  initAudio();
  menu.style.display = 'none';
  renderer.domElement.style.display = 'block';
  hud.style.display = 'block';
  state.playing = true;
  state.paused = false;

  // Only init once
  if (bots.length === 0) {
    createGunModel();
    initGame();
  } else {
    initGame(); // reinit
  }

  renderer.domElement.requestPointerLock();
});

$('btnControls').addEventListener('click', () => {
  controlsModal.style.display = 'flex';
});

$('btnCloseControls').addEventListener('click', () => {
  controlsModal.style.display = 'none';
});

$('btnRestart').addEventListener('click', () => {
  gameOver.style.display = 'none';
  renderer.domElement.style.display = 'block';
  hud.style.display = 'block';
  document.getElementById('gameOver').querySelector('.go-title').textContent = 'FIN DEL JUEGO';
  initGame();
  state.playing = true;
  renderer.domElement.requestPointerLock();
});

$('btnMenu').addEventListener('click', () => {
  gameOver.style.display = 'none';
  menu.style.display = 'flex';
  for (const b of bots) b.hpBarBg.style.display = 'none';
});

// ── Init ──
frame();

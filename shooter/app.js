import * as THREE from 'three';

/* ============================================================
   STRIKE BATTLE — 3D FPS con bots
   ============================================================ */

// ─── CONFIG ───
const CFG = {
  playerSpeed: 7,
  botSpeed: 4.5,
  playerHealth: 100,
  botHealth: 100,
  shootCooldown: 0.12,
  botShootCooldown: 0.8,
  maxAmmo: 30,
  reloadTime: 1.8,
  botDetectRange: 28,
  botAttackRange: 18,
  gravity: -25,
  jumpForce: 9,
  mapSize: 80,
  totalRounds: 5,
};

// ─── DOM REFS ───
const $ = (id) => document.getElementById(id);
const menu = $('menu');
const hud = $('hud');
const gameOver = $('gameOver');
const controlsModal = $('controlsModal');
const healthBar = $('healthBar');
const healthText = $('healthText');
const ammoText = $('ammoText');
const ammoReserve = $('ammoReserve');
const scoreText = $('scoreText');
const killsText = $('killsText');
const finalScore = $('finalScore');
const finalKills = $('finalKills');
const finalRounds = $('finalRounds');
const crosshair = $('crosshair');
const dmgOverlay = $('dmgOverlay');
const killFeed = $('killFeed');
const roundInfo = $('roundInfo');
const botsAlive = $('botsAlive');

// ─── SOUND MANAGER (procedural) ───
class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }
  init() {
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { this.enabled = false; }
  }
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }
  _gain(v) {
    const g = this.ctx.createGain(); g.gain.value = v; g.connect(this.ctx.destination); return g;
  }
  shoot() {
    if (!this.enabled) return;
    const c = this.ctx;
    const buf = c.createBuffer(1, c.sampleRate * 0.08, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.01)) * 0.6;
      data[i] += Math.sin(i * 800 * Math.PI * 2 / c.sampleRate) * Math.exp(-i / (c.sampleRate * 0.005)) * 0.4;
    }
    const src = c.createBufferSource(); src.buffer = buf;
    const g = this._gain(0.3); src.connect(g); src.start();
  }
  hit() {
    if (!this.enabled) return;
    const c = this.ctx;
    const buf = c.createBuffer(1, c.sampleRate * 0.06, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(i * 300 * Math.PI * 2 / c.sampleRate) * Math.exp(-i / (c.sampleRate * 0.008)) * 0.5;
    }
    const src = c.createBufferSource(); src.buffer = buf;
    const g = this._gain(0.2); src.connect(g); src.start();
  }
  kill() {
    if (!this.enabled) return;
    const c = this.ctx;
    const buf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / c.sampleRate;
      data[i] = Math.sin(t * 800 * Math.PI * 2) * Math.exp(-t * 8) * 0.5 + Math.sin(t * 400 * Math.PI * 2) * Math.exp(-t * 4) * 0.3;
    }
    const src = c.createBufferSource(); src.buffer = buf;
    const g = this._gain(0.25); src.connect(g); src.start();
  }
  hitPlayer() {
    if (!this.enabled) return;
    const c = this.ctx;
    const buf = c.createBuffer(1, c.sampleRate * 0.15, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / c.sampleRate;
      data[i] = Math.sin(t * 150 * Math.PI * 2) * Math.exp(-t * 10) * 0.6;
    }
    const src = c.createBufferSource(); src.buffer = buf;
    const g = this._gain(0.3); src.connect(g); src.start();
  }
}

// ─── GAME ───
class Game {
  constructor() {
    this.sound = new SoundManager();
    this.state = 'menu'; // menu | playing | paused | gameover
    this.score = 0;
    this.kills = 0;
    this.round = 1;
    this.bots = [];
    this.walls = [];
    this.botSpawns = [];
    this.playerSpawn = null;
    this.keys = {};
    this.isLocked = false;
    this.shootTimer = 0;
    this.reloading = false;
    this.reloadTimer = 0;
    this.ammo = CFG.maxAmmo;
    this.reserveAmmo = CFG.maxAmmo;
    this.playerHealth = CFG.playerHealth;
    this.maxHealth = CFG.playerHealth;
    this.yaw = 0;
    this.pitch = 0;
    this.velocity = new THREE.Vector3();
    this.onGround = false;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = null;
    this.playerBody = null;
    this.raycaster = null;

    this.init();
  }

  init() {
    // ─── THREE.JS SETUP ───
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.Fog(0x1a1a2e, 60, 120);

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, CFG.playerHealth * 0.018, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    $('gameCanvas').appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();

    // ─── LIGHTS ───
    const ambient = new THREE.AmbientLight(0x404060, 0.6);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.8);
    dirLight.position.set(30, 50, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    this.scene.add(dirLight);

    const hemi = new THREE.HemisphereLight(0x4466ff, 0x222244, 0.4);
    this.scene.add(hemi);

    // ─── GROUND ───
    const groundGeo = new THREE.PlaneGeometry(CFG.mapSize, CFG.mapSize);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x2a3a2a, roughness: 0.9, metalness: 0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // ─── MAP ───
    this.buildMap();

    // ─── EVENTS ───
    window.addEventListener('resize', () => this.onResize());
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'KeyR' && this.state === 'playing') this.reload();
      if (e.code === 'Escape' && this.isLocked) {
        document.exitPointerLock();
      }
    });
    document.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('mousedown', (e) => {
      if (e.button === 0 && this.isLocked && this.state === 'playing') this.shoot();
    });
    document.addEventListener('pointerlockchange', () => {
      this.isLocked = document.pointerLockElement === this.renderer.domElement;
      if (!this.isLocked && this.state === 'playing') {
        // paused
      }
    });

    // ─── UI BUTTONS ───
    $('btnPlay').addEventListener('click', () => {
      this.sound.init();
      this.sound.resume();
      this.startGame();
    });
    $('btnControls').addEventListener('click', () => {
      controlsModal.style.display = 'flex';
    });
    $('btnCloseControls').addEventListener('click', () => {
      controlsModal.style.display = 'none';
    });
    $('btnRestart').addEventListener('click', () => this.restart());
    $('btnMenu').addEventListener('click', () => this.goToMenu());

    // ─── RENDER LOOP ───
    this.animate();
  }

  buildMap() {
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x555577, roughness: 0.7, metalness: 0.2,
    });
    const wallMatDark = new THREE.MeshStandardMaterial({
      color: 0x333344, roughness: 0.8, metalness: 0.1,
    });
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x444455, roughness: 0.9, metalness: 0,
    });

    const addBox = (w, h, d, x, y, z, mat, isWall = true) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y + h / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      if (isWall) {
        this.walls.push({
          mesh, minX: x - w / 2, maxX: x + w / 2,
          minZ: z - d / 2, maxZ: z + d / 2, height: h,
        });
      }
      return mesh;
    };

    // Border walls (tall)
    const M = CFG.mapSize / 2 - 0.5;
    addBox(CFG.mapSize, 6, 0.5, 0, 0, -M, wallMatDark);
    addBox(CFG.mapSize, 6, 0.5, 0, 0, M, wallMatDark);
    addBox(0.5, 6, CFG.mapSize, -M, 0, 0, wallMatDark);
    addBox(0.5, 6, CFG.mapSize, M, 0, 0, wallMatDark);

    // Central building
    addBox(10, 4, 10, 0, 0, 0, wallMat);
    addBox(10, 4, 10, -18, 0, -15, wallMat);
    addBox(10, 4, 10, 18, 0, 15, wallMat);

    // Walls for cover
    addBox(6, 2.5, 0.5, -10, 0, -8, wallMat);
    addBox(6, 2.5, 0.5, 10, 0, 8, wallMat);
    addBox(0.5, 2.5, 6, -25, 0, 10, wallMat);
    addBox(0.5, 2.5, 6, 25, 0, -10, wallMat);
    addBox(4, 2, 0.5, -5, 0, 20, wallMat);
    addBox(4, 2, 0.5, 5, 0, -20, wallMat);

    // Floor platforms (walkable)
    addBox(6, 0.5, 6, -12, 0.5, 12, floorMat, false);
    addBox(6, 0.5, 6, 12, 0.5, -12, floorMat, false);

    // ─── SPAWN POINTS ───
    this.playerSpawn = new THREE.Vector3(0, 0, 25);
    this.botSpawns = [
      new THREE.Vector3(-20, 0, -20), new THREE.Vector3(20, 0, -20),
      new THREE.Vector3(-15, 0, 10), new THREE.Vector3(15, 0, 10),
      new THREE.Vector3(-25, 0, -5), new THREE.Vector3(25, 0, 5),
      new THREE.Vector3(0, 0, -25), new THREE.Vector3(-20, 0, 20),
    ];
  }

  startGame() {
    this.state = 'playing';
    menu.style.display = 'none';
    gameOver.style.display = 'none';
    hud.style.display = 'block';
    this.resetPlayer();
    this.spawnBots();
    this.updateHUD();
    this.showRoundInfo();
    this.renderer.domElement.requestPointerLock();
  }

  resetPlayer() {
    this.playerHealth = CFG.playerHealth;
    this.ammo = CFG.maxAmmo;
    this.reserveAmmo = CFG.maxAmmo;
    this.shootTimer = 0;
    this.reloading = false;
    this.reloadTimer = 0;
    this.velocity.set(0, 0, 0);
    this.onGround = false;
    this.yaw = 0;
    this.pitch = 0;
    if (this.playerSpawn) {
      this.camera.position.copy(this.playerSpawn);
      this.camera.position.y = 1.7;
    }
  }

  spawnBots() {
    // Remove old bots
    this.bots.forEach((b) => {
      if (b.mesh) this.scene.remove(b.mesh);
    });
    this.bots = [];

    const count = Math.min(4 + this.round, 8);
    for (let i = 0; i < count; i++) {
      const spawn = this.botSpawns[i % this.botSpawns.length].clone();
      spawn.x += (Math.random() - 0.5) * 4;
      spawn.z += (Math.random() - 0.5) * 4;
      this.spawnBot(spawn);
    }
    this.updateBotsAlive();
  }

  spawnBot(pos) {
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.8, 1.2, 0.6);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xcc3333, roughness: 0.6, metalness: 0.2,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.8;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffccaa, roughness: 0.8 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.6;
    head.castShadow = true;
    group.add(head);

    // Gun (simple box)
    const gunGeo = new THREE.BoxGeometry(0.1, 0.1, 0.6);
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.3 });
    const gun = new THREE.Mesh(gunGeo, gunMat);
    gun.position.set(0.5, 0.9, -0.4);
    group.add(gun);

    group.position.copy(pos);
    group.position.y = 0;
    this.scene.add(group);

    // Health bar (sprite-like)
    const barGroup = new THREE.Group();
    const barBg = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    barBg.position.y = 2.1;
    barGroup.add(barBg);

    const barFill = new THREE.Mesh(
      new THREE.PlaneGeometry(0.76, 0.04),
      new THREE.MeshBasicMaterial({ color: 0xff4444 })
    );
    barFill.position.y = 2.1;
    barFill.position.z = 0.001;
    barGroup.add(barFill);
    group.add(barGroup);

    const bot = {
      mesh: group,
      health: CFG.botHealth,
      maxHealth: CFG.botHealth,
      speed: CFG.botSpeed + Math.random() * 1.5,
      state: 'patrol', // patrol | chase | attack
      shootTimer: Math.random() * 2,
      waypoint: this.randomWaypoint(),
      waypointTimer: 0,
      barFill,
      barGroup,
      gun,
      alive: true,
    };

    this.bots.push(bot);
    return bot;
  }

  randomWaypoint() {
    const half = CFG.mapSize / 2 - 5;
    return new THREE.Vector3(
      (Math.random() - 0.5) * half * 2,
      0,
      (Math.random() - 0.5) * half * 2
    );
  }

  // ─── PLAYER ───
  shoot() {
    if (this.reloading) return;
    if (Date.now() - this.shootTimer < CFG.shootCooldown * 1000) return;
    if (this.ammo <= 0) { this.reload(); return; }

    this.shootTimer = Date.now();
    this.ammo--;
    this.sound.shoot();

    // Crosshair kick
    crosshair.style.transform = 'translate(-50%, -50%) scale(1.3)';
    setTimeout(() => { crosshair.style.transform = 'translate(-50%, -50%) scale(1)'; }, 80);

    // Raycast for hit
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const targets = [];
    this.bots.forEach((b) => {
      if (b.alive && b.mesh) targets.push(b.mesh);
    });

    const intersects = this.raycaster.intersectObjects(targets, true);
    if (intersects.length > 0) {
      let hitObj = intersects[0].object;
      let hitBot = null;
      for (const b of this.bots) {
        if (b.alive && b.mesh) {
          let found = false;
          b.mesh.traverse((child) => {
            if (child === hitObj) found = true;
          });
          if (found) { hitBot = b; break; }
        }
      }

      if (hitBot) {
        const dmg = Math.floor(20 + Math.random() * 15);
        hitBot.health -= dmg;
        this.sound.hit();
        dmgOverlay.classList.add('hit');
        setTimeout(() => dmgOverlay.classList.remove('hit'), 100);

        // Update health bar
        const pct = Math.max(0, hitBot.health / hitBot.maxHealth);
        hitBot.barFill.scale.x = pct;
        hitBot.barFill.position.x = -0.38 * (1 - pct);

        if (hitBot.health <= 0) {
          this.killBot(hitBot);
        }
      }
    }

    this.updateHUD();
    if (this.ammo === 0) this.reload();
  }

  reload() {
    if (this.reloading || this.ammo === CFG.maxAmmo || this.reserveAmmo <= 0) return;
    this.reloading = true;
    this.reloadTimer = Date.now();
  }

  finishReload() {
    const needed = CFG.maxAmmo - this.ammo;
    const give = Math.min(needed, this.reserveAmmo);
    this.ammo += give;
    this.reserveAmmo -= give;
    this.reloading = false;
    this.updateHUD();
  }

  killBot(bot) {
    bot.alive = false;
    this.kills++;
    this.score += 100 * this.round;

    this.sound.kill();

    // Remove bot mesh
    if (bot.mesh) {
      this.scene.remove(bot.mesh);
    }

    // Kill feed
    this.addKillFeed('Jugador eliminó a un bot');

    // Respawn bot after delay
    setTimeout(() => {
      if (this.state === 'playing') {
        const spawn = this.botSpawns[Math.floor(Math.random() * this.botSpawns.length)].clone();
        spawn.x += (Math.random() - 0.5) * 4;
        spawn.z += (Math.random() - 0.5) * 4;
        this.spawnBot(spawn);
        this.updateBotsAlive();
      }
    }, 3000);

    // Check if all bots killed
    const alive = this.bots.filter((b) => b.alive);
    if (alive.length === 0) {
      this.nextRound();
    }

    this.updateHUD();
    this.updateBotsAlive();
  }

  nextRound() {
    if (this.round >= CFG.totalRounds) {
      this.endGame(true);
      return;
    }
    this.round++;
    // Remove all bots
    this.bots.forEach((b) => {
      if (b.mesh) this.scene.remove(b.mesh);
    });
    this.bots = [];
    this.spawnBots();
    this.resetPlayer();
    this.showRoundInfo();
    this.updateHUD();
  }

  showRoundInfo() {
    roundInfo.textContent = `RONDA ${this.round}`;
    roundInfo.classList.add('show');
    setTimeout(() => roundInfo.classList.remove('show'), 2000);
  }

  addKillFeed(msg) {
    const el = document.createElement('div');
    el.className = 'kill-msg';
    el.textContent = msg;
    killFeed.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  updateBotsAlive() {
    const alive = this.bots.filter((b) => b.alive).length;
    botsAlive.textContent = `Bots: ${alive}`;
  }

  // ─── BOT AI ───
  updateBots(dt) {
    const playerPos = this.camera.position.clone();
    playerPos.y = 0;

    this.bots.forEach((bot) => {
      if (!bot.alive || !bot.mesh) return;

      const botPos = bot.mesh.position.clone();
      botPos.y = 0;
      const dist = playerPos.distanceTo(botPos);

      // State transitions
      if (dist < CFG.botAttackRange) {
        bot.state = 'attack';
      } else if (dist < CFG.botDetectRange) {
        bot.state = 'chase';
      } else {
        bot.state = 'patrol';
      }

      const dir = new THREE.Vector3();

      switch (bot.state) {
        case 'patrol': {
          const wpDist = botPos.distanceTo(bot.waypoint);
          if (wpDist < 3) {
            bot.waypoint = this.randomWaypoint();
          }
          dir.copy(bot.waypoint).sub(botPos).normalize();
          break;
        }
        case 'chase': {
          dir.copy(playerPos).sub(botPos).normalize();
          break;
        }
        case 'attack': {
          dir.copy(playerPos).sub(botPos).normalize();
          // Shoot at player
          bot.shootTimer -= dt;
          if (bot.shootTimer <= 0) {
            bot.shootTimer = CFG.botShootCooldown + Math.random() * 0.5;
            this.botShoot(bot);
          }
          break;
        }
      }

      if (bot.state !== 'attack') {
        // Move bot
        const moveSpeed = bot.speed * dt;
        bot.mesh.position.x += dir.x * moveSpeed;
        bot.mesh.position.z += dir.z * moveSpeed;

        // Clamp to map
        const half = CFG.mapSize / 2 - 1;
        bot.mesh.position.x = Math.max(-half, Math.min(half, bot.mesh.position.x));
        bot.mesh.position.z = Math.max(-half, Math.min(half, bot.mesh.position.z));

        // Rotate to face movement direction
        if (dir.length() > 0.1) {
          const angle = Math.atan2(dir.x, dir.z);
          bot.mesh.rotation.y = angle;
        }
      } else {
        // Face player
        const angle = Math.atan2(dir.x, dir.z);
        bot.mesh.rotation.y = angle;
      }

      // Keep health bar facing camera
      if (bot.barGroup) {
        bot.barGroup.lookAt(this.camera.position);
      }
    });
  }

  botShoot(bot) {
    if (!bot.alive) return;
    const dir = new THREE.Vector3().subVectors(
      this.camera.position, bot.mesh.position
    ).normalize();

    // Random inaccuracy
    const spread = 0.08;
    dir.x += (Math.random() - 0.5) * spread;
    dir.y += (Math.random() - 0.5) * spread;
    dir.z += (Math.random() - 0.5) * spread;
    dir.normalize();

    // Simple hit check: ray vs player capsule
    const toPlayer = new THREE.Vector3().subVectors(
      this.camera.position, bot.mesh.position
    );
    const dot = dir.dot(toPlayer.normalize());

    if (dot > 0.85) {
      // Hit player
      const dmg = Math.floor(8 + Math.random() * 8);
      this.playerHealth -= dmg;
      this.sound.hitPlayer();
      dmgOverlay.classList.add('hit');
      setTimeout(() => dmgOverlay.classList.remove('hit'), 150);

      this.updateHUD();

      if (this.playerHealth <= 0) {
        this.endGame(false);
      }
    }
  }

  // ─── PLAYER MOVEMENT ───
  updatePlayer(dt) {
    if (this.state !== 'playing') return;

    // Reload timer
    if (this.reloading) {
      if (Date.now() - this.reloadTimer > CFG.reloadTime * 1000) {
        this.finishReload();
      }
    }

    // Movement
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    const moveDir = new THREE.Vector3();

    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveDir.add(forward);
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveDir.sub(forward);
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveDir.sub(right);
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveDir.add(right);

    if (moveDir.length() > 0) {
      moveDir.normalize();
      // Strafing is slower
      const isStrafe = this.keys['KeyA'] || this.keys['KeyD'] || this.keys['ArrowLeft'] || this.keys['ArrowRight'];
      const speedMult = (isStrafe && (this.keys['KeyW'] || this.keys['KeyS'] || this.keys['ArrowUp'] || this.keys['ArrowDown'])) ? 0.85 : 1;

      this.camera.position.x += moveDir.x * CFG.playerSpeed * dt * speedMult;
      this.camera.position.z += moveDir.z * CFG.playerSpeed * dt * speedMult;
    }

    // Jump
    if ((this.keys['Space']) && this.onGround) {
      this.velocity.y = CFG.jumpForce;
      this.onGround = false;
    }

    // Gravity
    this.velocity.y += CFG.gravity * dt;
    this.camera.position.y += this.velocity.y * dt;

    // Ground collision
    if (this.camera.position.y < 1.7) {
      this.camera.position.y = 1.7;
      this.velocity.y = 0;
      this.onGround = true;
    }

    // Map bounds collision
    const half = CFG.mapSize / 2 - 0.5;
    this.camera.position.x = Math.max(-half, Math.min(half, this.camera.position.x));
    this.camera.position.z = Math.max(-half, Math.min(half, this.camera.position.z));

    // Wall collision (AABB)
    const pRadius = 0.4;
    for (const wall of this.walls) {
      const px = this.camera.position.x;
      const pz = this.camera.position.z;
      if (px + pRadius > wall.minX && px - pRadius < wall.maxX &&
          pz + pRadius > wall.minZ && pz - pRadius < wall.maxZ &&
          this.camera.position.y - 1.7 < wall.height) {
        // Push out
        const overlapX = Math.min(px + pRadius - wall.minX, wall.maxX - px + pRadius);
        const overlapZ = Math.min(pz + pRadius - wall.minZ, wall.maxZ - pz + pRadius);
        if (overlapX < overlapZ) {
          this.camera.position.x += (px < (wall.minX + wall.maxX) / 2) ? -(px + pRadius - wall.minX) : (wall.maxX - px + pRadius);
        } else {
          this.camera.position.z += (pz < (wall.minZ + wall.maxZ) / 2) ? -(pz + pRadius - wall.minZ) : (wall.maxZ - pz + pRadius);
        }
      }
    }
  }

  // ─── MOUSE ───
  onMouseMove(e) {
    if (!this.isLocked) return;
    const sensitivity = 0.002;
    this.yaw -= e.movementX * sensitivity;
    this.pitch -= e.movementY * sensitivity;
    this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));

    const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
    this.camera.quaternion.copy(qYaw.multiply(qPitch));
  }

  // ─── UI ───
  updateHUD() {
    const hpPct = Math.max(0, this.playerHealth / this.maxHealth);
    healthBar.style.width = (hpPct * 100) + '%';
    healthText.textContent = Math.ceil(this.playerHealth);

    // Color change for low health
    if (hpPct < 0.3) {
      healthBar.style.background = 'linear-gradient(90deg, #ff4444, #ff6644)';
    } else if (hpPct < 0.6) {
      healthBar.style.background = 'linear-gradient(90deg, #ffaa44, #ffcc44)';
    } else {
      healthBar.style.background = 'linear-gradient(90deg, #44ff44, #88ff44)';
    }

    ammoText.textContent = this.ammo;
    ammoReserve.textContent = this.reserveAmmo;
    scoreText.textContent = this.score;
    killsText.textContent = this.kills;
  }

  endGame(won) {
    this.state = 'gameover';
    document.exitPointerLock();
    if (won) {
      this.score += 500 * this.round;
    }
    finalScore.textContent = this.score;
    finalKills.textContent = this.kills;
    finalRounds.textContent = this.round;
    gameOver.style.display = 'flex';
  }

  restart() {
    this.score = 0;
    this.kills = 0;
    this.round = 1;
    gameOver.style.display = 'none';
    // Remove all bots
    this.bots.forEach((b) => {
      if (b.mesh) this.scene.remove(b.mesh);
    });
    this.bots = [];
    this.startGame();
  }

  goToMenu() {
    this.state = 'menu';
    gameOver.style.display = 'none';
    hud.style.display = 'none';
    menu.style.display = 'flex';
    document.exitPointerLock();
    this.bots.forEach((b) => {
      if (b.mesh) this.scene.remove(b.mesh);
    });
    this.bots = [];
  }

  // ─── RESIZE ───
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ─── ANIMATION LOOP ───
  animate() {
    requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.05);

    if (this.state === 'playing') {
      this.updatePlayer(dt);
      this.updateBots(dt);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// ─── START ───
const game = new Game();

import * as THREE from 'three';
import { $ } from './utils.js';
import { initScene, renderer, camera, scene, renderMenuScene } from './scene.js';
import { initMap, MAP_SIZE, HALF_MAP, getObstacles, mapData } from './map.js';
import { initParticles, updateParticles, spawnExplosion, spawnSparks } from './particles.js';
import { WeaponManager, WEAPON_DEFS, WEAPON_ORDER } from './weapons.js';
import { Bot, createBots, spawnBots } from './bots.js';
import { initPlayer, playerState, playerPos, updatePlayer, applyDamage, getForwardRay } from './player.js';
import { createPickups, updatePickups, setOnPickup } from './pickups.js';
import { initAudio, playSound } from './sounds.js';
import { initMenu, selectedWeapon, selectedDifficulty, showMenu, showGameOver, hideMenu } from './menu.js';
import {
  updateHUD, setBotPositions, showCrosshairShoot, showHitmarker,
  showDamageNumber, showDamageIndicator, addKillFeed, showRoundAnnouncement
} from './hud.js';

// ── Init ──
const canvasContainer = $('gameCanvas');
const menuBg = $('menuBg');
initScene(canvasContainer, menuBg);
initAudio();
initParticles(scene);
initMap(scene);

const weaponManager = new WeaponManager();
const clock = new THREE.Clock();
let paused = false;
let totalShots = 0, totalHits = 0;
let roundEndTimer = 0;
let roundComplete = false;

// Input state
const keys = {};
let mouseDX = 0, mouseDY = 0;
let isPointerLocked = false;

// Game objects
let bots = [];
let gameRound = 0;
let gameRunning = false;

// ── Weapon pickup callback ──
setOnPickup((amount) => {
  const w = weaponManager.getCurrent();
  if (w) {
    w.reserve += amount;
    // Cap reserve at 3x mag size
    const maxReserve = w.def.magSize * 6;
    if (w.reserve > maxReserve) w.reserve = maxReserve;
  }
});

// ── Player shoot ──
function playerShoot() {
  if (playerState.dead || paused || !gameRunning) return;
  const raycaster = getForwardRay(camera, 60);
  weaponManager.shoot(raycaster, (ray, def) => {
    totalShots++;
    const hitTargets = [];
    for (const bot of bots) {
      if (!bot.alive) continue;
      hitTargets.push(bot.headMesh, ...bot.group.children.filter(c => c !== bot.headMesh && c !== bot.headHitbox));
    }
    const intersects = ray.intersectObjects(hitTargets);

    if (intersects.length > 0) {
      const hit = intersects[0];
      let hitBot = null;
      let isHeadshot = false;

      for (const bot of bots) {
        if (!bot.alive) continue;
        if (hit.object === bot.headMesh) {
          hitBot = bot; isHeadshot = true; break;
        }
        if (bot.group.children.includes(hit.object) && hit.object !== bot.headHitbox) {
          hitBot = bot; break;
        }
      }

      if (hitBot) {
        totalHits++;
        const result = hitBot.takeDamage(def.damage, isHeadshot);
        showHitmarker(isHeadshot);
        showDamageNumber(hit.point, isHeadshot ? def.damage * 3 : def.damage, isHeadshot, camera);
        spawnSparks(hit.point, ray.ray.direction);

        if (isHeadshot) playSound('headshot');
        else playSound('hit');

        if (result && result.kill) {
          playerState.score += isHeadshot ? 150 : 100;
          playerState.kills++;
          addKillFeed('Tú', isHeadshot);
          if (isHeadshot) playSound('kill');
          checkRoundComplete();
        }
      }
    }
  });
}

// ── Bot shoot ──
let botShootCooldown = 0;

function handleBotShooting(dt) {
  const playerPosVec = playerPos.clone();
  const obs = getObstacles();
  botShootCooldown -= dt;

  for (const bot of bots) {
    if (!bot.alive) continue;
    const result = bot.update(dt, playerPosVec, obs);
    if (result && result.shoot && botShootCooldown <= 0) {
      const hit = !checkLineCollision(result.from, result.to);
      if (hit) {
        applyDamage(result.dmg);
        const dmgDir = new THREE.Vector3().subVectors(result.from, playerPosVec).normalize();
        showDamageIndicator(dmgDir, camera);
        botShootCooldown = 0.05;
      }
    }
  }
}

function checkLineCollision(from, to) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const dist = dir.length();
  if (dist < 0.5) return false;
  dir.normalize();
  const steps = Math.floor(dist / 0.4);
  for (let i = 1; i < steps; i++) {
    const p = new THREE.Vector3().copy(from).addScaledVector(dir, i * 0.4);
    const half = HALF_MAP - 0.2;
    if (p.x < -half || p.x > half || p.z < -half || p.z > half) return true;
    for (const w of getObstacles()) {
      if (p.x > w.minX && p.x < w.maxX && p.z > w.minZ && p.z < w.maxZ) return true;
    }
  }
  return false;
}

// ── Round system ──
const BOT_COUNTS = [4, 6, 8, 10, 12, 15, 18, 22, 26, 30];
const DIFF_MULT = [0.6, 1.0, 1.5, 2.0];

function startGame() {
  // Cleanup previous
  for (const b of bots) {
    b.dispose();
    scene.remove(b.group);
  }
  bots = [];

  // Reset
  playerState.health = 100;
  playerState.armor = 0;
  playerState.score = 0;
  playerState.kills = 0;
  playerState.dead = false;
  totalShots = 0;
  totalHits = 0;
  gameRound = 0;
  roundComplete = false;
  roundEndTimer = 0;

  initPlayer(camera);
  weaponManager.switchTo(selectedWeapon);

  // Reset weapon ammo
  for (const id of WEAPON_ORDER) {
    const w = weaponManager.weapons[id];
    if (w) {
      w.ammo = w.def.magSize;
      w.reserve = w.def.reserve;
    }
  }

  createPickups(scene);
  startNextRound();
}

function startNextRound() {
  gameRound++;
  const count = BOT_COUNTS[Math.min(gameRound - 1, BOT_COUNTS.length - 1)];
  const diffMul = DIFF_MULT[Math.min(selectedDifficulty - 1, DIFF_MULT.length - 1)];

  const existing = bots.length;
  if (existing < count) {
    const newBots = createBots(count - existing, selectedDifficulty, getObstacles());
    for (const b of newBots) {
      scene.add(b.group);
      bots.push(b);
    }
  }

  const activeBots = bots.slice(0, count);
  for (let i = existing; i < bots.length; i++) {
    bots[i].group.visible = false;
    bots[i].alive = false;
    bots[i].hpBar.bg.style.display = 'none';
  }

  // Adjust bot stats for difficulty
  for (const bot of activeBots) {
    bot.difficulty = selectedDifficulty;
    bot.maxHealth = bot.type.hp * (1 + (selectedDifficulty - 1) * 0.15);
    bot.health = bot.maxHealth;
  }

  spawnBots(activeBots, mapData.spawnPoints, getObstacles());

  roundComplete = false;
  showRoundAnnouncement(gameRound, count);
  gameRunning = true;
}

function checkRoundComplete() {
  const alive = bots.filter(b => b.alive).length;
  if (alive === 0 && bots.length > 0 && !roundComplete) {
    roundComplete = true;
    gameRunning = false;
    roundEndTimer = 3;

    if (gameRound >= BOT_COUNTS.length) {
      setTimeout(() => {
        playSound('victory');
        document.querySelector('.go-title').textContent = 'VICTORIA';
        showGameOver(playerState.score, playerState.kills, gameRound, totalHits / Math.max(totalShots, 1));
        for (const b of bots) b.hpBar.bg.style.display = 'none';
        gameRunning = false;
      }, 1500);
    }
  }
}

// ── Input ──
document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (!gameRunning || playerState.dead) return;

  if (e.code === 'KeyR') weaponManager.reload();

  // Weapon switching 1-5
  const num = parseInt(e.key);
  if (num >= 1 && num <= WEAPON_ORDER.length) {
    weaponManager.switchTo(WEAPON_ORDER[num - 1]);
  }
});

document.addEventListener('keyup', e => { keys[e.code] = false; });

document.addEventListener('mousemove', e => {
  if (isPointerLocked) {
    mouseDX += e.movementX;
    mouseDY += e.movementY;
  }
});

document.addEventListener('mousedown', e => {
  if (e.button === 0 && isPointerLocked && !playerState.dead) {
    playerShoot();
  }
});

// Hold fire for automatic weapons
document.addEventListener('mouseup', e => {
  if (e.button === 0) { /* auto-fire handled by key state */ }
});

document.addEventListener('pointerlockchange', () => {
  isPointerLocked = document.pointerLockElement === renderer.domElement;
  if (!isPointerLocked && gameRunning && !playerState.dead) {
    paused = true;
  } else if (isPointerLocked) {
    paused = false;
  }
});

// ── Menu callbacks ──
initMenu({
  onPlay: () => {
    hideMenu();
    gameRunning = true;
    paused = false;
    renderer.domElement.style.display = 'block';
    const hud = $('hud');
    hud.style.display = 'block';

    // First time init weapon manager
    if (!weaponManager.weapons.assault) {
      weaponManager.init(scene, camera);
    }

    startGame();
    renderer.domElement.requestPointerLock();
  },
  onRestart: () => {
    document.querySelector('.go-title').textContent = 'FIN DEL JUEGO';
    renderer.domElement.style.display = 'block';
    $('hud').style.display = 'block';
    startGame();
    gameRunning = true;
    paused = false;
    renderer.domElement.requestPointerLock();
  },
  onMenu: () => {
    showMenu();
    for (const b of bots) b.hpBar.bg.style.display = 'none';
  }
});

// ── Window resize ──
window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// ── Game loop ──
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;

  // Menu scene
  renderMenuScene(dt);

  if (gameRunning && !playerState.dead) {
    // Player
    const { moving, onGround } = updatePlayer(dt, camera, keys, mouseDX, mouseDY);
    mouseDX = 0; mouseDY = 0;

    // Weapon
    weaponManager.update(dt);
    weaponManager.group.position.y = -0.12 + (moving && onGround ? Math.sin(time * 14) * 0.015 : 0);

    // Bots
    handleBotShooting(dt);
    for (const bot of bots) bot.updateHPBar(camera);

    // Pickups
    updatePickups(dt);

    // Particles
    updateParticles(dt);

    // Round end timer
    if (roundComplete) {
      roundEndTimer -= dt;
      if (roundEndTimer <= 0 && gameRound < BOT_COUNTS.length) {
        startNextRound();
        gameRunning = true;
      }
    }

    // Auto-fire
    if (keys['']) { } // placeholder
    // For automatic weapons, check if mouse is held
    // We track this via a flag

    // Bot positions for minimap
    const botPosArr = bots.filter(b => b.alive).map(b => b.getPos());
    setBotPositions(botPosArr);

    // HUD
    const aliveBots = bots.filter(b => b.alive).length;
    updateHUD(weaponManager.getState(), gameRound, aliveBots, BOT_COUNTS[Math.min(gameRound - 1, BOT_COUNTS.length - 1)] || aliveBots);

    // Player death check
    if (playerState.dead) {
      gameRunning = false;
      setTimeout(() => {
        renderer.domElement.style.display = 'none';
        $('hud').style.display = 'none';
        showGameOver(playerState.score, playerState.kills, gameRound, totalHits / Math.max(totalShots, 1));
        for (const b of bots) b.hpBar.bg.style.display = 'none';
      }, 1200);
    }
  }

  renderer.render(scene, camera);
}

frame();

// Auto-fire for automatic weapons
let mouseDown = false;
document.addEventListener('mousedown', e => {
  if (e.button === 0) {
    mouseDown = true;
    autoFireLoop();
  }
});
document.addEventListener('mouseup', e => {
  if (e.button === 0) mouseDown = false;
});

function autoFireLoop() {
  if (!mouseDown || !gameRunning || playerState.dead || !isPointerLocked) return;
  const def = weaponManager.getDef();
  if (def && def.automatic) {
    playerShoot();
  }
  setTimeout(autoFireLoop, 16);
}

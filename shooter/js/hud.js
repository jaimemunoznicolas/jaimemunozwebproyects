import { $ } from './utils.js';
import { playerState } from './player.js';
import { WEAPON_ORDER, WEAPON_DEFS } from './weapons.js';
import { HALF_MAP } from './map.js';

// DOM refs
const healthBar = $('healthBar');
const armorBar = $('armorBar');
const healthText = $('healthText');
const ammoText = $('ammoText');
const ammoReserve = $('ammoReserve');
const scoreText = $('scoreText');
const killsText = $('killsText');
const hudRound = $('hudRound');
const crosshair = $('crosshair');
const hitmarker = $('hitmarker');
const dmgOverlay = $('dmgOverlay');
const killFeed = $('killFeed');
const roundInfo = $('roundInfo');
const botsAlive = $('botsAlive');
const lowhp = $('lowhpOverlay');
const damageNumbers = $('damageNumbers');
const weaponName = $('weaponName');
const weaponIcon = $('weaponIcon');
const weaponStrip = $('weaponStrip');
const reloadIndicator = $('reloadIndicator');
const minimapCanvas = $('minimapCanvas');

let botPositions = [];
let playerMapPos = { x: 0, z: 0 };

export function setBotPositions(positions) { botPositions = positions; }
export function setPlayerMapPos(x, z) { playerMapPos.x = x; playerMapPos.z = z; }

export function updateHUD(weaponState, round, aliveBots, totalBots) {
  // Health & Armor
  const hpPct = Math.max(0, playerState.health / playerState.maxHealth * 100);
  healthBar.style.width = hpPct + '%';
  healthBar.style.background = hpPct > 60 ? '#44ff44' : hpPct > 30 ? '#ffaa44' : '#ff4444';
  healthText.textContent = Math.max(0, Math.round(playerState.health));

  const arPct = Math.max(0, playerState.armor / playerState.maxArmor * 100);
  armorBar.style.width = arPct + '%';

  // Low HP
  if (playerState.health < 30) lowhp.classList.add('active');
  else lowhp.classList.remove('active');

  // Score / Kills
  scoreText.textContent = playerState.score;
  killsText.textContent = playerState.kills;

  // Round
  hudRound.textContent = 'R' + round;

  // Weapon
  if (weaponState) {
    ammoText.textContent = weaponState.ammo;
    ammoReserve.textContent = weaponState.reloading ? '...' : weaponState.reserve;
    weaponName.textContent = weaponState.name;
    weaponIcon.textContent = weaponState.icon;
    reloadIndicator.style.display = weaponState.reloading ? 'block' : 'none';
  }

  // Weapon strip
  weaponStrip.innerHTML = '';
  for (const id of WEAPON_ORDER) {
    const def = WEAPON_DEFS[id];
    const item = document.createElement('div');
    item.className = 'ws-item' + (id === weaponState?.id ? ' active' : '');
    item.innerHTML = `<span class="ws-key">${def.key || WEAPON_ORDER.indexOf(id) + 1}</span>${def.name.substring(0, 4)}`;
    weaponStrip.appendChild(item);
  }

  // Bots alive
  botsAlive.textContent = `ENEMIGOS: ${aliveBots} / ${totalBots}`;

  // Minimap
  drawMinimap();
}

export function showCrosshairShoot() {
  crosshair.classList.add('shoot');
  setTimeout(() => crosshair.classList.remove('shoot'), 100);
}

export function showHitmarker(headshot) {
  hitmarker.classList.add('show');
  hitmarker.style.transform = headshot ? 'translate(-50%,-50%) scale(1.4)' : 'translate(-50%,-50%) scale(1)';
  setTimeout(() => {
    hitmarker.classList.remove('show');
    hitmarker.style.transform = 'translate(-50%,-50%) scale(1)';
  }, 120);
}

export function showDamageNumber(pos, dmg, headshot, camera) {
  const v = pos.clone().project(camera);
  const x = (v.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-v.y * 0.5 + 0.5) * window.innerHeight;
  const el = document.createElement('div');
  el.className = 'dmg-num' + (headshot ? ' headshot' : '');
  el.textContent = dmg;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  damageNumbers.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

export function showDamageIndicator(dir, camera) {
  if (!dir) return;
  const worldAngle = Math.atan2(dir.x, dir.z);
  const camAngle = camera.rotation.y + Math.PI;
  let rel = worldAngle - camAngle;
  while (rel > Math.PI) rel -= Math.PI * 2;
  while (rel < -Math.PI) rel += Math.PI * 2;
  const cls = Math.abs(rel) < 1 ? 'hit-front' :
              Math.abs(rel) > 2.5 ? 'hit-back' :
              rel > 0 ? 'hit-left' : 'hit-right';
  dmgOverlay.className = 'hud-dmg ' + cls;
  setTimeout(() => { dmgOverlay.className = 'hud-dmg'; }, 200);
}

export function addKillFeed(killer, headshot) {
  const msg = document.createElement('div');
  msg.className = 'kill-msg';
  msg.textContent = `${killer} eliminó a bot` + (headshot ? ' (cabeza)' : '');
  killFeed.appendChild(msg);
  while (killFeed.children.length > 6) killFeed.removeChild(killFeed.firstChild);
  setTimeout(() => { if (msg.parentNode) msg.remove(); }, 3000);
}

export function showRoundAnnouncement(round, count) {
  roundInfo.innerHTML = `<span>RONDA ${round}</span><span class="round-sub">${count} enemigos</span>`;
  roundInfo.className = 'hud-round show';
  setTimeout(() => { roundInfo.className = 'hud-round'; roundInfo.innerHTML = ''; }, 2500);
}

export function showMessage(text, duration = 2000) {
  roundInfo.innerHTML = `<span>${text}</span>`;
  roundInfo.className = 'hud-round show';
  setTimeout(() => { roundInfo.className = 'hud-round'; roundInfo.innerHTML = ''; }, duration);
}

function drawMinimap() {
  const ctx = minimapCanvas.getContext('2d');
  const size = 140;
  ctx.clearRect(0, 0, size, size);

  // Background
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, size, size);

  const scale = size / (HALF_MAP * 2);

  // Player
  const px = (playerMapPos.x + HALF_MAP) * scale;
  const py = (playerMapPos.z + HALF_MAP) * scale;
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.arc(px, py, 3, 0, Math.PI * 2);
  ctx.fill();

  // Bots
  ctx.fillStyle = '#ffaa44';
  for (const bp of botPositions) {
    const bx = (bp.x + HALF_MAP) * scale;
    const by = (bp.z + HALF_MAP) * scale;
    ctx.beginPath();
    ctx.arc(bx, by, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Border
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.strokeRect(0, 0, size, size);
}

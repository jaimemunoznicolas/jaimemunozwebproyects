import { $ } from './utils.js';
import { WEAPON_DEFS, WEAPON_ORDER } from './weapons.js';

export let selectedWeapon = 'assault';
export let selectedDifficulty = 1; // 1=easy, 2=normal, 3=hard, 4=insane

let onPlay = null;
let onRestart = null;
let onMenu = null;

export function initMenu(callbacks) {
  onPlay = callbacks.onPlay;
  onRestart = callbacks.onRestart;
  onMenu = callbacks.onMenu;

  // Weapon select
  const grid = $('weaponGrid');
  WEAPON_ORDER.forEach(id => {
    const def = WEAPON_DEFS[id];
    const card = document.createElement('div');
    card.className = 'weapon-card' + (id === selectedWeapon ? ' selected' : '');
    card.dataset.id = id;
    card.innerHTML = `
      <div class="w-icon">${def.icon}</div>
      <div class="w-name">${def.name}</div>
      <div class="w-stat">Daño: <span class="w-dmg">${def.damage}</span> · <span class="w-fire">${(def.fireRate * 1000).toFixed(0)}ms</span> · <span class="w-mag">${def.magSize}</span></div>
    `;
    card.addEventListener('click', () => selectWeapon(id));
    grid.appendChild(card);
  });

  // Difficulty buttons
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedDifficulty = { easy: 1, normal: 2, hard: 3, insane: 4 }[btn.dataset.diff] || 2;
      updateMenuLabels();
    });
  });

  // Button events
  $('btnPlay').addEventListener('click', () => {
    if (onPlay) onPlay();
  });

  $('btnSelectWeapon').addEventListener('click', () => {
    $('weaponSelect').style.display = 'flex';
  });

  $('btnCloseWeapons').addEventListener('click', () => {
    $('weaponSelect').style.display = 'none';
  });

  $('btnDifficulty').addEventListener('click', () => {
    $('difficultySelect').style.display = 'flex';
  });

  $('btnCloseDiff').addEventListener('click', () => {
    $('difficultySelect').style.display = 'none';
  });

  $('btnControls').addEventListener('click', () => {
    $('controlsModal').style.display = 'flex';
  });

  $('btnCloseControls').addEventListener('click', () => {
    $('controlsModal').style.display = 'none';
  });

  $('btnRestart').addEventListener('click', () => {
    if (onRestart) onRestart();
  });

  $('btnMenu').addEventListener('click', () => {
    if (onMenu) onMenu();
  });

  // Key binding display
  WEAPON_ORDER.forEach((id, i) => {
    WEAPON_DEFS[id].key = String(i + 1);
  });

  updateMenuLabels();
}

function selectWeapon(id) {
  selectedWeapon = id;
  document.querySelectorAll('.weapon-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`.weapon-card[data-id="${id}"]`)?.classList.add('selected');
  updateMenuLabels();
}

function updateMenuLabels() {
  const def = WEAPON_DEFS[selectedWeapon];
  $('menuWeapon').textContent = def ? def.name : 'ASSAULT RIFLE';
  const diffNames = { 1: 'FÁCIL', 2: 'NORMAL', 3: 'DIFÍCIL', 4: 'LOCO' };
  $('menuDifficulty').textContent = diffNames[selectedDifficulty] || 'NORMAL';
}

export function showMenu() {
  $('menu').style.display = 'flex';
  $('gameOver').style.display = 'none';
  $('hud').style.display = 'none';
  const md = window.menuSceneData;
  if (md) md.renderer.domElement.style.display = 'block';
}

export function hideMenu() {
  $('menu').style.display = 'none';
  $('gameOver').style.display = 'none';
  const md = window.menuSceneData;
  if (md) md.renderer.domElement.style.display = 'none';
}

export function showGameOver(score, kills, round, acc) {
  $('finalScore').textContent = score;
  $('finalKills').textContent = kills;
  $('finalRounds').textContent = round;
  $('finalAcc').textContent = (acc * 100).toFixed(0) + '%';

  // MVP
  const mvp = $('mvpDisplay');
  if (kills >= 10) mvp.textContent = '🏆 ¡LEYENDA!';
  else if (kills >= 5) mvp.textContent = '⭐ ¡ÉLITE!';
  else if (kills >= 3) mvp.textContent = '🔥 ¡BUEN TRABAJO!';
  else mvp.textContent = '💪 SIGUE INTENTANDO';

  $('gameOver').style.display = 'flex';
}

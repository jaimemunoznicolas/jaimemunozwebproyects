import * as THREE from 'three';
import { clamp } from './utils.js';
import { collidesWithWalls } from './map.js';
import { playSound } from './sounds.js';

export const PLAYER_HEIGHT = 1.6;
const PLAYER_RADIUS = 0.35;
const GRAVITY = -22;
const RUN_SPEED = 9;
const JUMP_SPEED = 8.5;

export const playerState = {
  health: 100,
  maxHealth: 100,
  armor: 0,
  maxArmor: 100,
  score: 0,
  kills: 0,
  dead: false,
};

let velocityY = 0;
let onGround = true;
export let playerPos = new THREE.Vector3(0, PLAYER_HEIGHT, 0);

export function initPlayer(camera) {
  playerPos.set(0, PLAYER_HEIGHT, 0);
  camera.position.copy(playerPos);
  velocityY = 0;
  onGround = true;
  playerState.health = 100;
  playerState.armor = 0;
  playerState.score = 0;
  playerState.kills = 0;
  playerState.dead = false;
}

export function updatePlayer(dt, camera, keys, mouseDX, mouseDY) {
  if (playerState.dead) return;

  // Mouse look
  const sens = 0.002;
  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  euler.setFromQuaternion(camera.quaternion);
  euler.y -= mouseDX * sens;
  euler.x -= mouseDY * sens;
  euler.x = clamp(euler.x, -Math.PI / 2.1, Math.PI / 2.1);
  camera.quaternion.setFromEuler(euler);

  // Movement
  const dir = new THREE.Vector3();
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  forward.y = 0; forward.normalize();
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  right.y = 0; right.normalize();

  if (keys['KeyW'] || keys['ArrowUp']) dir.add(forward);
  if (keys['KeyS'] || keys['ArrowDown']) dir.sub(forward);
  if (keys['KeyA'] || keys['ArrowLeft']) dir.sub(right);
  if (keys['KeyD'] || keys['ArrowRight']) dir.add(right);

  const moving = dir.length() > 0;
  if (moving) dir.normalize();

  const speed = RUN_SPEED * dt;
  let nx = playerPos.x + dir.x * speed;
  let nz = playerPos.z + dir.z * speed;

  if (!collidesWithWalls(nx, playerPos.z, PLAYER_RADIUS)) playerPos.x = nx;
  if (!collidesWithWalls(playerPos.x, nz, PLAYER_RADIUS)) playerPos.z = nz;

  // Jump / Gravity
  if ((keys['Space']) && onGround) {
    velocityY = JUMP_SPEED;
    onGround = false;
  }
  velocityY += GRAVITY * dt;
  playerPos.y += velocityY * dt;
  if (playerPos.y <= PLAYER_HEIGHT) {
    playerPos.y = PLAYER_HEIGHT;
    velocityY = 0;
    onGround = true;
  }

  camera.position.copy(playerPos);
  return { moving, onGround };
}

export function applyDamage(amount, dir) {
  if (playerState.dead) return;
  // Armor absorbs 50%
  if (playerState.armor > 0) {
    const armorAbsorb = Math.min(playerState.armor, amount * 0.5);
    playerState.armor -= armorAbsorb;
    amount -= armorAbsorb;
  }
  playerState.health -= amount;
  playSound('hurt');
  if (playerState.health <= 0) {
    playerState.health = 0;
    playerState.dead = true;
  }
  return { dir };
}

export function healPlayer(amount) {
  playerState.health = Math.min(playerState.maxHealth, playerState.health + amount);
}

export function addArmor(amount) {
  playerState.armor = Math.min(playerState.maxArmor, playerState.armor + amount);
}

export function getForwardRay(camera, range = 60) {
  const dir = new THREE.Vector3(0, 0, -1);
  dir.applyQuaternion(camera.quaternion);
  return new THREE.Raycaster(playerPos.clone(), dir, 0.3, range);
}

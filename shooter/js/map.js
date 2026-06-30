import * as THREE from 'three';
import { rand, randInt } from './utils.js';

export const MAP_SIZE = 120;
export const HALF_MAP = MAP_SIZE / 2;
const BH = 4; // border wall height

export const walls = [];
export const mapData = { spawnPoints: [] };

// ── Core helpers ──
function addWall(x, z, w, h, d, color = 0x2a2a4a, emissive = 0x000000) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 - h / 20, metalness: 0.15 + h / 30, emissive, emissiveIntensity: emissive ? 0.1 : 0 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function commit(mesh, scene) {
  scene.add(mesh);
  const pos = mesh.position;
  const halfW = mesh.geometry.parameters.width / 2;
  const halfD = mesh.geometry.parameters.depth / 2;
  walls.push({
    mesh,
    minX: pos.x - halfW, maxX: pos.x + halfW,
    minZ: pos.z - halfD, maxZ: pos.z + halfD,
  });
}

function building(scene, x, z, w, d, h, color, trim = true) {
  const m = addWall(x, z, w, h, d, color);
  commit(m, scene);
  if (trim) {
    const t = addWall(x, z + d / 2 - 0.1, w * 0.8, 0.1, 0.2, 0x444488, 0x222244);
    t.position.set(x, h * 0.7, z + d / 2 - 0.1);
    commit(t, scene);
    const t2 = addWall(x, z - d / 2 + 0.1, w * 0.8, 0.1, 0.2, 0x444488, 0x222244);
    t2.position.set(x, h * 0.5, z - d / 2 + 0.1);
    commit(t2, scene);
  }
  // Roof edge
  const roof = addWall(x, z, w + 0.6, 0.08, d + 0.6, 0x333355);
  roof.position.set(x, h + 0.04, z);
  scene.add(roof);
  return { x, z, w, d, h, mesh: m };
}

function pillar(scene, x, z, h, color = 0x555577) {
  const geo = new THREE.CylinderGeometry(0.2, 0.25, h, 6);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.3 });
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, h / 2, z);
  m.castShadow = true;
  scene.add(m);
  const r = 0.25;
  walls.push({ mesh: m, minX: x - r, maxX: x + r, minZ: z - r, maxZ: z + r });
}

function crate(scene, x, z, size = 0.7, color = 0x554433) {
  const geo = new THREE.BoxGeometry(size, size * 0.5, size);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.1 });
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, size * 0.25, z);
  m.castShadow = true;
  m.receiveShadow = true;
  scene.add(m);
  const half = size / 2;
  walls.push({ mesh: m, minX: x - half, maxX: x + half, minZ: z - half, maxZ: z + half });
}

function barrel(scene, x, z, color = 0x664422) {
  const geo = new THREE.CylinderGeometry(0.2, 0.25, 0.5, 8);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, 0.25, z);
  m.castShadow = true;
  scene.add(m);
  const r = 0.25;
  walls.push({ mesh: m, minX: x - r, maxX: x + r, minZ: z - r, maxZ: z + r });
}

function lampPost(scene, x, z) {
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x333344, metalness: 0.6, roughness: 0.4 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 2.5, 6), poleMat);
  pole.position.set(x, 1.25, z);
  pole.castShadow = true;
  scene.add(pole);
  const light = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshStandardMaterial({ color: 0xffcc66, emissive: 0xffaa44, emissiveIntensity: 0.2 }));
  light.position.set(x, 2.5, z);
  scene.add(light);
  const pl = new THREE.PointLight(0xffaa66, 0.3, 6);
  pl.position.set(x, 2.5, z);
  scene.add(pl);
  const r = 0.1;
  walls.push({ mesh: pole, minX: x - r, maxX: x + r, minZ: z - r, maxZ: z + r });
}

function ramp(scene, x, z, w, dir) {
  // Simple sloped ramp using a box rotated
  const geo = new THREE.BoxGeometry(w, 0.2, 1.5);
  const mat = new THREE.MeshStandardMaterial({ color: 0x444466, roughness: 0.7 });
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x + (dir === 'x' ? 0.8 : 0), 0.1, z + (dir === 'z' ? 0.8 : 0));
  if (dir === 'x') m.rotation.z = 0.25;
  if (dir === 'z') m.rotation.x = 0.25;
  m.receiveShadow = true;
  scene.add(m);
}

export function initMap(scene) {
  walls.length = 0;

  // ── Ground ──
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE),
    new THREE.MeshStandardMaterial({ color: 0x16162a, roughness: 0.9, metalness: 0.05 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid overlay
  const grid = new THREE.GridHelper(MAP_SIZE, 60, 0x222244, 0x191933);
  grid.position.y = 0.05;
  scene.add(grid);

  // Border walls
  const bw = 1.5;
  commit(addWall(-HALF_MAP, 0, bw, BH, MAP_SIZE, 0x111122), scene);
  commit(addWall(HALF_MAP, 0, bw, BH, MAP_SIZE, 0x111122), scene);
  commit(addWall(0, -HALF_MAP, MAP_SIZE, BH, bw, 0x111122), scene);
  commit(addWall(0, HALF_MAP, MAP_SIZE, BH, bw, 0x111122), scene);

  // ── ZONE: Central Plaza (0,0) ──
  // Fountain
  const fountainBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 2.2, 0.6, 16),
    new THREE.MeshStandardMaterial({ color: 0x444477, roughness: 0.4, metalness: 0.3 })
  );
  fountainBase.position.set(0, 0.3, 0);
  scene.add(fountainBase);
  const fountainWater = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.6, 0.05, 16),
    new THREE.MeshStandardMaterial({ color: 0x4488cc, emissive: 0x4488ff, emissiveIntensity: 0.05, transparent: true, opacity: 0.6 })
  );
  fountainWater.position.set(0, 0.6, 0);
  scene.add(fountainWater);
  const fountainCenter = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x8888bb, metalness: 0.5, roughness: 0.3 })
  );
  fountainCenter.position.set(0, 1.0, 0);
  scene.add(fountainCenter);
  const fr = 2.2;
  walls.push({ mesh: fountainBase, minX: -fr, maxX: fr, minZ: -fr, maxZ: fr });

  // Plaza lamps
  for (let a = 0; a < 4; a++) {
    const ang = a * Math.PI / 2 + Math.PI / 4;
    lampPost(scene, Math.cos(ang) * 6, Math.sin(ang) * 6);
  }

  // ── ZONE: Office Tower (north-east) ──
  building(scene, 22, -20, 12, 10, 5.5, 0x3a3a6a);
  // Windows
  for (let fy = 1.5; fy < 5; fy += 1.5) {
    for (let fx = -4; fx <= 4; fx += 2) {
      const win = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x88ccff, emissive: 0x4488ff, emissiveIntensity: 0.05, side: THREE.DoubleSide })
      );
      win.position.set(22 + fx, fy, -15);
      scene.add(win);
    }
  }

  // Ramp to office roof
  ramp(scene, 22, -16, 2, 'z');

  // ── ZONE: Bank (south-east) ──
  const bank = building(scene, 25, 22, 10, 8, 4.0, 0x4a4a6a);
  // Columns
  for (let cx = 21; cx <= 29; cx += 4) {
    pillar(scene, cx, 18, 2.5, 0x8888aa);
  }

  // ── ZONE: Warehouse (south-west) ──
  building(scene, -25, 22, 14, 8, 3.0, 0x3a3a5a);
  // Large doors
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x222233, metalness: 0.4, roughness: 0.6 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.5, 0.1), doorMat);
  door.position.set(-25, 1.25, 26);
  scene.add(door);

  // ── ZONE: Apartments (north-west) ──
  building(scene, -24, -22, 12, 8, 4.5, 0x4a3a6a);
  // Balcony
  const balcony = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.1, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x444466, roughness: 0.6 })
  );
  balcony.position.set(-24, 2.5, -26);
  scene.add(balcony);
  const railMat = new THREE.MeshStandardMaterial({ color: 0x555577, metalness: 0.3, roughness: 0.4 });
  for (let i = -4; i <= 4; i += 1.5) {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 4), railMat);
    rail.position.set(-24 + i, 2.9, -26);
    scene.add(rail);
  }

  // ── ZONE: Garage (north, small) ──
  building(scene, 8, -32, 6, 5, 2.2, 0x3a3a4a);
  // Ramp to garage roof
  ramp(scene, 8, -34.5, 2.5, 'z');

  // ── ZONE: Shops (east row) ──
  building(scene, 36, -8, 4, 6, 2.0, 0x4a4a5a);
  building(scene, 36, 4, 4, 6, 2.0, 0x3a4a5a);

  // ── COVER WALLS ──
  const coverPositions = [
    [-8, -8], [8, 8], [-8, 8], [8, -8],
    [-14, 0], [14, 0], [0, -14], [0, 14],
    [-18, -18], [18, 18], [-18, 18], [18, -18],
    [-30, 0], [30, 0], [0, -30], [0, 30],
    [-30, -10], [30, 10], [-30, 10], [30, -10],
  ];
  for (const [cx, cz] of coverPositions) {
    const cw = rand(2, 4);
    const cd = 0.5;
    const ch = rand(1.0, 1.8);
    commit(addWall(cx, cz, cw, ch, cd, 0x3a3a5a), scene);
  }

  // ── CRATES & BARRELS ──
  const cratePositions = [
    [-5, -5], [5, 5], [-5, 5], [5, -5],
    [-10, -12], [12, 10], [10, -12], [-12, 10],
    [-20, -25], [20, 25], [-20, 25], [20, -25],
    [-35, -5], [35, 5], [-35, 5], [35, -5],
    [-2, -20], [2, 20], [-20, -2], [20, 2],
  ];
  for (const [cx, cz] of cratePositions) {
    const s = rand(0.5, 0.9);
    const colors = [0x554433, 0x665544, 0x445566, 0x664433, 0x556644];
    crate(scene, cx, cz, s, colors[randInt(0, colors.length - 1)]);
  }

  const barrelPositions = [
    [-15, -15], [15, 15], [-15, 15], [15, -15],
    [-6, -30], [6, 30], [-30, -6], [30, 6],
  ];
  for (const [cx, cz] of barrelPositions) {
    barrel(scene, cx, cz);
  }

  // ── STREET LAMPS ──
  const lampPositions = [
    [-10, -10], [10, 10], [-10, 10], [10, -10],
    [-20, -20], [20, 20], [-20, 20], [20, -20],
    [-35, -15], [35, 15], [-35, 15], [35, -15],
    [0, -25], [0, 25], [-25, 0], [25, 0],
  ];
  for (const [lx, lz] of lampPositions) {
    lampPost(scene, lx, lz);
  }

  // ── Spawn points ──
  mapData.spawnPoints = [
    { x: -35, z: -35 }, { x: 35, z: -35 },
    { x: -35, z: 35 }, { x: 35, z: 35 },
    { x: -25, z: -25 }, { x: 25, z: -25 },
    { x: -25, z: 25 }, { x: 25, z: 25 },
    { x: -40, z: 0 }, { x: 40, z: 0 },
    { x: 0, z: -40 }, { x: 0, z: 40 },
    { x: -15, z: -30 }, { x: 15, z: -30 },
    { x: -15, z: 30 }, { x: 15, z: 30 },
  ];

  return walls;
}

export function getObstacles() {
  return walls.map(w => ({ minX: w.minX, maxX: w.maxX, minZ: w.minZ, maxZ: w.maxZ }));
}

export function collidesWithWalls(x, z, radius) {
  const half = HALF_MAP - radius;
  if (x < -half || x > half || z < -half || z > half) return true;
  for (const w of walls) {
    if (x + radius > w.minX && x - radius < w.maxX && z + radius > w.minZ && z - radius < w.maxZ) return true;
  }
  return false;
}

export function collidesWithAABB(x, z, radius, box) {
  return x + radius > box.minX && x - radius < box.maxX && z + radius > box.minZ && z - radius < box.maxZ;
}

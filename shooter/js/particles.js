import * as THREE from 'three';
import { rand } from './utils.js';

const particles = [];
const sceneRef = { scene: null };

export function initParticles(scene) {
  sceneRef.scene = scene;
}

export function spawnExplosion(pos, color, count = 30) {
  const s = sceneRef.scene;
  if (!s) return;
  for (let i = 0; i < count; i++) {
    const size = rand(0.04, 0.18);
    const geo = new THREE.BoxGeometry(size, size, size);
    const mat = new THREE.MeshStandardMaterial({
      color, emissive: color, emissiveIntensity: 0.4,
      transparent: true, opacity: 1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    const dir = new THREE.Vector3(rand(-1,1), rand(0,2), rand(-1,1)).normalize();
    dir.multiplyScalar(rand(3, 7));
    mesh.userData.vel = dir;
    mesh.userData.life = rand(0.5, 1.0);
    s.add(mesh);
    particles.push(mesh);
  }
}

export function spawnSparks(pos, dir, count = 8) {
  const s = sceneRef.scene;
  if (!s) return;
  for (let i = 0; i < count; i++) {
    const geo = new THREE.SphereGeometry(0.03, 4, 4);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffcc44, emissive: 0xff8800, emissiveIntensity: 0.3 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    const spread = new THREE.Vector3(rand(-1,1), rand(-0.5,1), rand(-1,1)).normalize();
    spread.add(dir.clone().multiplyScalar(2));
    mesh.userData.vel = spread.multiplyScalar(rand(2, 5));
    mesh.userData.life = rand(0.2, 0.5);
    s.add(mesh);
    particles.push(mesh);
  }
}

export function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.userData.vel.y -= 6 * dt;
    p.position.addScaledVector(p.userData.vel, dt);
    p.userData.life -= dt;
    p.material.opacity = Math.max(0, p.userData.life / 1.0);
    p.scale.multiplyScalar(0.97);
    if (p.userData.life <= 0) {
      const s = sceneRef.scene;
      if (s) s.remove(p);
      p.geometry.dispose();
      p.material.dispose();
      particles.splice(i, 1);
    }
  }
}

import * as THREE from 'three';
import { playSound } from './sounds.js';
import { playerPos, healPlayer, addArmor } from './player.js';
import { WEAPON_DEFS } from './weapons.js';

const pickups = [];

export function createPickups(scene) {
  clearPickups(scene);

  const positions = [
    { x: -20, z: 0 }, { x: 20, z: 0 },
    { x: 0, z: -20 }, { x: 0, z: 20 },
    { x: -12, z: -12 }, { x: 12, z: 12 },
    { x: -30, z: -15 }, { x: 30, z: 15 },
    { x: -15, z: 30 }, { x: 15, z: -30 },
    { x: -5, z: -35 }, { x: 5, z: 35 },
  ];

  const types = ['health', 'ammo', 'armor', 'health', 'ammo', 'health', 'armor', 'ammo'];

  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    const type = types[i % types.length];
    const group = new THREE.Group();
    group.position.set(pos.x, 0.3, pos.z);
    group.userData.type = type;
    group.userData.active = true;
    group.userData.respawnTimer = 0;

    switch (type) {
      case 'health': {
        const mat = new THREE.MeshStandardMaterial({ color: 0x44ff44, emissive: 0x44ff44, emissiveIntensity: 0.15 });
        const h = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.08), mat);
        const v = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.08), mat);
        group.add(h); group.add(v);
        group.userData.value = 25;
        const glow = new THREE.PointLight(0x44ff44, 0.08, 1.5);
        glow.position.y = 0.2;
        group.add(glow);
        break;
      }
      case 'ammo': {
        const mat = new THREE.MeshStandardMaterial({ color: 0x4488ff, emissive: 0x4488ff, emissiveIntensity: 0.15 });
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), mat);
        group.add(box);
        for (let j = 0; j < 3; j++) {
          const b = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.08, 4),
            new THREE.MeshStandardMaterial({ color: 0xccaa44, metalness: 0.8 })
          );
          b.position.set((j - 1) * 0.1, 0.18, 0);
          b.rotation.x = Math.PI / 2;
          group.add(b);
        }
        group.userData.value = 20;
        break;
      }
      case 'armor': {
        const mat = new THREE.MeshStandardMaterial({ color: 0x4488ff, emissive: 0x4488ff, emissiveIntensity: 0.15 });
        const plate = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.08), mat);
        plate.position.z = 0.05;
        group.add(plate);
        const plate2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.08), mat);
        plate2.position.z = -0.05;
        plate2.position.y = 0.05;
        group.add(plate2);
        group.userData.value = 30;
        const glow2 = new THREE.PointLight(0x4488ff, 0.08, 1.5);
        glow2.position.y = 0.2;
        group.add(glow2);
        break;
      }
    }

    scene.add(group);
    pickups.push(group);
  }
}

function clearPickups(scene) {
  for (const p of pickups) {
    scene.remove(p);
    p.traverse(c => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    });
  }
  pickups.length = 0;
}

let onPickupCallback = null;
export function setOnPickup(cb) { onPickupCallback = cb; }

export function updatePickups(dt) {
  const time = Date.now() * 0.001;
  for (const p of pickups) {
    if (p.userData.active) {
      p.rotation.y += dt * 1.2;
      p.position.y = 0.3 + Math.sin(time * 2 + p.position.x * 0.5) * 0.12;

      const dist = playerPos.distanceTo(p.position);
      if (dist < 1.0) {
        const type = p.userData.type;
        const val = p.userData.value;
        if (type === 'health') healPlayer(val);
        else if (type === 'armor') addArmor(val);
        else if (type === 'ammo') {
          if (onPickupCallback) onPickupCallback(val);
        }
        playSound('pickup');
        p.userData.active = false;
        p.userData.respawnTimer = 10;
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

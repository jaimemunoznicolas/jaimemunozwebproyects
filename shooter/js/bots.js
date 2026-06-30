import * as THREE from 'three';
import { rand, randInt, clamp, dist2D, angleDiff } from './utils.js';
import { MAP_SIZE, HALF_MAP, collidesWithAABB } from './map.js';
import { spawnExplosion } from './particles.js';
import { playSound } from './sounds.js';

const BOT_TYPES = [
  { id: 'soldier', hp: 100, speed: 3.5, dmg: 8, color: 0xff4444, scale: 1.0, name: 'Soldado' },
  { id: 'heavy', hp: 180, speed: 2.0, dmg: 15, color: 0xff8800, scale: 1.25, name: 'Pesado' },
  { id: 'sniper', hp: 70, speed: 2.5, dmg: 20, color: 0x4488ff, scale: 1.0, name: 'Francotirador' },
  { id: 'scout', hp: 60, speed: 5.0, dmg: 5, color: 0x44ff44, scale: 0.85, name: 'Explorador' },
];

export class Bot {
  constructor(index, typeIdx, difficulty) {
    this.index = index;
    this.type = BOT_TYPES[typeIdx % BOT_TYPES.length];
    this.difficulty = difficulty || 1;
    this.alive = false;
    this.health = this.type.hp;
    this.maxHealth = this.type.hp;
    this.group = new THREE.Group();
    this.buildModel();
    this.hpBar = this.createHPBar();
    this.state = 'idle';
    this.waypoint = null;
    this.stateTimer = 0;
    this.shootCooldown = 0;
    this.targetPos = null;
    this.lastSeenPlayer = null;
    this.sightTimer = 0;
    this.strafeDir = 1;
    this.strafeTimer = 0;
    this.obstacles = [];
    this.spawnPos = new THREE.Vector3();
    this.respawnTimer = 0;
  }

  buildModel() {
    const s = this.type.scale;
    const bodyColor = this.type.color;
    const skinColor = 0xffccaa;
    const pantsColor = 0x222244;

    // Body (torso)
    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.5, metalness: 0.15 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5 * s, 0.6 * s, 0.3 * s), bodyMat);
    body.position.y = 0.5 * s;
    body.castShadow = true;
    this.group.add(body);

    // Head
    const headMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.4 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22 * s, 8, 8), headMat);
    head.position.y = 1.05 * s;
    head.castShadow = true;
    this.group.add(head);
    this.headMesh = head;

    // Head hitbox
    this.headHitbox = new THREE.Mesh(new THREE.SphereGeometry(0.28 * s, 6, 6), new THREE.MeshBasicMaterial({ visible: false }));
    this.headHitbox.position.y = 1.05 * s;
    this.group.add(this.headHitbox);

    // Helmet for heavy
    if (this.type.id === 'heavy') {
      const helm = new THREE.Mesh(new THREE.SphereGeometry(0.26 * s, 6, 6), new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.6, roughness: 0.3 }));
      helm.position.y = 1.12 * s;
      helm.scale.y = 0.7;
      this.group.add(helm);
    }

    // Upper arms
    const armMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.5 });
    for (let side of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * s, 0.07 * s, 0.35 * s, 6), armMat);
      arm.position.set(side * 0.38 * s, 0.55 * s, 0);
      arm.rotation.z = side * 0.2;
      arm.castShadow = true;
      this.group.add(arm);
    }

    // Lower arms
    const foreMat = new THREE.MeshStandardMaterial({ color: 0xddbbaa, roughness: 0.5 });
    for (let side of [-1, 1]) {
      const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * s, 0.06 * s, 0.3 * s, 6), foreMat);
      fore.position.set(side * 0.42 * s, 0.25 * s, 0.1);
      fore.castShadow = true;
      this.group.add(fore);
    }

    // Legs
    const legMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.7 });
    for (let side of [-0.15, 0.15]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07 * s, 0.08 * s, 0.5 * s, 6), legMat);
      leg.position.set(side * s, 0.25 * s, 0);
      leg.castShadow = true;
      this.group.add(leg);
    }

    // Gun model (scaled per bot type)
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x333344, metalness: 0.5, roughness: 0.3 });
    const gunLen = this.type.id === 'sniper' ? 0.5 * s : this.type.id === 'shotgun' ? 0.4 * s : 0.35 * s;
    const gun = new THREE.Mesh(new THREE.CylinderGeometry(0.025 * s, 0.03 * s, gunLen, 6), gunMat);
    gun.rotation.x = Math.PI / 2;
    gun.position.set(0.35 * s, 0.4 * s, -0.3 * s);
    this.group.add(gun);
    this.gunMesh = gun;

    // Glow effect on body
    if (this.type.id !== 'scout') {
      const glow = new THREE.Mesh(
        new THREE.BoxGeometry(0.55 * s, 0.65 * s, 0.35 * s),
        new THREE.MeshBasicMaterial({ color: bodyColor, transparent: true, opacity: 0.08 })
      );
      glow.position.y = 0.5 * s;
      this.group.add(glow);
    }
  }

  createHPBar() {
    const bg = document.createElement('div');
    bg.style.cssText = 'position:fixed;width:36px;height:3px;background:rgba(0,0,0,0.6);border-radius:2px;pointer-events:none;z-index:5;';
    const fill = document.createElement('div');
    fill.style.cssText = 'height:100%;border-radius:2px;transition:width 0.15s;';
    bg.appendChild(fill);
    document.body.appendChild(bg);
    return { bg, fill };
  }

  getPos() { return this.group.position; }

  getHeadWorldPos() {
    const p = new THREE.Vector3();
    this.headHitbox.getWorldPosition(p);
    return p;
  }

  spawn(pos, obstacles) {
    this.group.position.copy(pos);
    this.spawnPos.copy(pos);
    this.alive = true;
    this.health = this.maxHealth;
    this.group.visible = true;
    this.hpBar.bg.style.display = 'block';
    this.state = 'patrol';
    this.stateTimer = 0;
    this.targetPos = null;
    this.lastSeenPlayer = null;
    this.sightTimer = 0;
    this.shootCooldown = rand(0, 0.5);
    this.strafeDir = Math.random() > 0.5 ? 1 : -1;
    this.strafeTimer = 0;
    this.obstacles = obstacles;
    this.waypoint = this.randomWaypoint();
  }

  randomWaypoint() {
    const margin = 8;
    const half = HALF_MAP - margin;
    return new THREE.Vector3(rand(-half, half), 0, rand(-half, half));
  }

  takeDamage(amount, isHeadshot) {
    if (!this.alive) return null;
    const effective = isHeadshot ? amount * 3 : amount;
    this.health -= effective;
    if (this.health <= 0) {
      this.die();
      return { kill: true, headshot: isHeadshot };
    }
    return { kill: false, headshot: isHeadshot };
  }

  die() {
    this.alive = false;
    this.group.visible = false;
    this.hpBar.bg.style.display = 'none';
    this.respawnTimer = 5;
    spawnExplosion(this.getPos(), this.type.color, 25);
  }

  hasLineOfSight(playerPos) {
    const myPos = this.getPos();
    const dir = new THREE.Vector3().subVectors(playerPos, myPos);
    const dist = dir.length();
    if (dist < 1) return true;
    dir.normalize();
    const steps = Math.floor(dist / 0.6);
    for (let i = 1; i < steps; i++) {
      const p = new THREE.Vector3().copy(myPos).addScaledVector(dir, i * 0.6);
      for (const obs of this.obstacles) {
        if (collidesWithAABB(p.x, p.z, 0.1, obs)) return false;
      }
    }
    return true;
  }

  update(dt, playerPos, obstacles) {
    if (!this.alive) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.spawn(this.spawnPos, obstacles);
      }
      return null;
    }

    this.obstacles = obstacles;
    const myPos = this.getPos();
    const dist = dist2D(myPos, playerPos);
    const canSee = dist < 40 && this.hasLineOfSight(playerPos);
    const typeSpeed = this.type.speed;
    const diffMul = 1 + (this.difficulty - 1) * 0.3;

    // Sight memory
    if (canSee) {
      this.sightTimer = Math.min(this.sightTimer + dt, 3);
      this.lastSeenPlayer = playerPos.clone();
    } else {
      this.sightTimer = Math.max(this.sightTimer - dt * 0.5, 0);
    }

    // State transitions
    if (canSee && dist < 35) {
      this.state = 'attack';
    } else if (this.sightTimer > 0.5 && this.lastSeenPlayer) {
      this.state = 'chase';
    } else if (this.state === 'attack' || this.state === 'chase') {
      this.state = 'investigate';
      this.targetPos = this.lastSeenPlayer ? this.lastSeenPlayer.clone() : this.waypoint;
      this.stateTimer = 4;
    } else {
      this.state = 'patrol';
    }

    let moveTarget = null;
    let speed = typeSpeed * diffMul;

    switch (this.state) {
      case 'patrol': {
        if (!this.waypoint || dist2D(myPos, this.waypoint) < 3) {
          this.waypoint = this.randomWaypoint();
        }
        moveTarget = this.waypoint;
        break;
      }
      case 'chase': {
        moveTarget = this.lastSeenPlayer;
        speed *= 1.3;
        break;
      }
      case 'investigate': {
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) this.state = 'patrol';
        moveTarget = this.targetPos;
        break;
      }
      case 'attack': {
        this.strafeTimer += dt;
        if (this.strafeTimer > rand(0.8, 1.5)) {
          this.strafeTimer = 0;
          this.strafeDir = Math.random() > 0.5 ? 1 : -1;
        }
        const toPlayer = new THREE.Vector3().subVectors(playerPos, myPos).normalize();
        const strafe = new THREE.Vector3().crossVectors(toPlayer, new THREE.Vector3(0, 1, 0)).normalize();
        strafe.multiplyScalar(this.strafeDir * 2.5);
        moveTarget = playerPos.clone().add(strafe);
        speed *= 0.7;
        break;
      }
    }

    // Movement
    if (moveTarget) {
      const dir = new THREE.Vector3().subVectors(moveTarget, myPos);
      dir.y = 0;
      if (dir.length() > 1.0) {
        dir.normalize();
        myPos.x += dir.x * speed * dt;
        myPos.z += dir.z * speed * dt;

        // Obstacle push
        for (const obs of obstacles) {
          const cx = (obs.minX + obs.maxX) / 2;
          const cz = (obs.minZ + obs.maxZ) / 2;
          const dx = myPos.x - cx;
          const dz = myPos.z - cz;
          const d = Math.sqrt(dx * dx + dz * dz);
          if (d < 1.5 && d > 0.01) {
            myPos.x += (dx / d) * (1.5 - d) * 0.3;
            myPos.z += (dz / d) * (1.5 - d) * 0.3;
          }
        }

        const half = HALF_MAP - 0.8;
        myPos.x = clamp(myPos.x, -half, half);
        myPos.z = clamp(myPos.z, -half, half);
        this.group.position.copy(myPos);
      }
    }

    // Rotation - face player or movement
    const lookTarget = (canSee || this.state === 'attack') ? playerPos : moveTarget;
    if (lookTarget) {
      const lt = lookTarget.clone();
      lt.y = myPos.y;
      this.group.lookAt(lt);
    }

    // Shooting
    if (this.state === 'attack' && canSee && dist < 30) {
      this.shootCooldown -= dt;
      if (this.shootCooldown <= 0) {
        const fireRate = this.type.id === 'sniper' ? 0.8 :
                        this.type.id === 'heavy' ? 0.6 :
                        this.type.id === 'scout' ? 0.15 : 0.25;
        this.shootCooldown = fireRate / diffMul + rand(0, 0.1);
        const spread = this.type.id === 'sniper' ? 0.01 :
                      this.type.id === 'heavy' ? 0.06 :
                      this.type.id === 'scout' ? 0.08 : 0.035;
        return { shoot: true, spread: spread * (2 - diffMul), from: myPos.clone(), to: playerPos.clone(), dmg: this.type.dmg };
      }
    }

    return null;
  }

  updateHPBar(camera) {
    if (!this.alive) { this.hpBar.bg.style.display = 'none'; return; }
    const pos = this.getPos().clone();
    pos.y += 1.6 * this.type.scale;
    pos.project(camera);
    const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;
    this.hpBar.bg.style.left = (x - 18) + 'px';
    this.hpBar.bg.style.top = y + 'px';
    const pct = Math.max(0, this.health / this.maxHealth);
    this.hpBar.fill.style.width = (pct * 100) + '%';
    this.hpBar.fill.style.background = pct > 0.6 ? '#44ff44' : pct > 0.3 ? '#ffaa44' : '#ff4444';
    this.hpBar.bg.style.display = 'block';
  }

  dispose() {
    this.hpBar.bg.remove();
  }
}

export function createBots(count, difficulty, obstacles) {
  const bots = [];
  for (let i = 0; i < count; i++) {
    const typeIdx = i % BOT_TYPES.length;
    const bot = new Bot(i, typeIdx, difficulty);
    bots.push(bot);
  }
  return bots;
}

export function spawnBots(bots, spawns, obstacles) {
  for (let i = 0; i < bots.length; i++) {
    const sp = spawns[i % spawns.length];
    const p = new THREE.Vector3(sp.x + rand(-3, 3), 0, sp.z + rand(-3, 3));
    bots[i].spawn(p, obstacles);
  }
}

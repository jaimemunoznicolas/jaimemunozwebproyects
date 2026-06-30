import * as THREE from 'three';

export const WEAPON_DEFS = {
  assault: {
    id: 'assault', name: 'ASSAULT RIFLE', icon: '🔫',
    damage: 25, headshotMul: 3.0, fireRate: 0.1,
    reloadTime: 1.8, magSize: 30, reserve: 120,
    spread: 0.008, recoil: 0.02, automatic: true, pellets: 1, range: 60,
    sound: 'rifle', color: 0x444466,
  },
  shotgun: {
    id: 'shotgun', name: 'SHOTGUN', icon: '💥',
    damage: 15, headshotMul: 2.0, fireRate: 0.55,
    reloadTime: 2.5, magSize: 8, reserve: 32,
    spread: 0.1, recoil: 0.1, automatic: false, pellets: 8, range: 25,
    sound: 'shotgun', color: 0x664444,
  },
  smg: {
    id: 'smg', name: 'SMG', icon: '⚡',
    damage: 12, headshotMul: 2.5, fireRate: 0.065,
    reloadTime: 1.5, magSize: 50, reserve: 200,
    spread: 0.025, recoil: 0.015, automatic: true, pellets: 1, range: 35,
    sound: 'smg', color: 0x446644,
  },
  sniper: {
    id: 'sniper', name: 'SNIPER RIFLE', icon: '🎯',
    damage: 80, headshotMul: 4.0, fireRate: 0.8,
    reloadTime: 3.0, magSize: 5, reserve: 20,
    spread: 0.002, recoil: 0.12, automatic: false, pellets: 1, range: 80,
    sound: 'sniper', color: 0x444488,
  },
  pistol: {
    id: 'pistol', name: 'PISTOL', icon: '🔫',
    damage: 20, headshotMul: 3.0, fireRate: 0.18,
    reloadTime: 1.2, magSize: 12, reserve: 48,
    spread: 0.012, recoil: 0.025, automatic: false, pellets: 1, range: 30,
    sound: 'pistol', color: 0x555555,
  },
};

export const WEAPON_ORDER = ['assault', 'shotgun', 'smg', 'sniper', 'pistol'];

export class WeaponManager {
  constructor() {
    this.weapons = {};
    this.currentId = 'assault';
    this.selectedId = 'assault';
    this.cooldown = 0;
    this.reloading = false;
    this.reloadTimer = 0;
    this.group = new THREE.Group();
  }

  init(scene, camera) {
    // Create each weapon's model
    for (const id of WEAPON_ORDER) {
      this.weapons[id] = this.createWeaponState(id);
    }
    this.switchTo(this.selectedId);
    camera.add(this.group);
    this.group.position.set(0.3, -0.12, -0.35);
  }

  createWeaponState(id) {
    const def = WEAPON_DEFS[id];
    return {
      def,
      ammo: def.magSize,
      reserve: def.reserve,
      model: this.buildWeaponModel(def),
      visible: false,
    };
  }

  buildWeaponModel(def) {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.4, metalness: 0.6 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.5, metalness: 0.4 });
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x3a3020, roughness: 0.8 });

    switch (def.id) {
      case 'assault': {
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.45), bodyMat);
        body.position.z = -0.22;
        g.add(body);
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.55, 8), darkMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.z = -0.5;
        g.add(barrel);
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.06), gripMat);
        grip.position.set(0, -0.08, 0.02);
        g.add(grip);
        const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.08), darkMat);
        mag.position.set(0, -0.06, 0.04);
        g.add(mag);
        const scope = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.04), new THREE.MeshStandardMaterial({ color: 0x444466 }));
        scope.position.set(0, 0.08, -0.2);
        g.add(scope);
        break;
      }
      case 'shotgun': {
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.5), bodyMat);
        body.position.z = -0.25;
        g.add(body);
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.6, 8), darkMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.z = -0.55;
        g.add(barrel);
        const barrel2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.55, 8), darkMat);
        barrel2.rotation.x = Math.PI / 2;
        barrel2.position.set(0.04, 0, -0.52);
        g.add(barrel2);
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.13, 0.06), gripMat);
        grip.position.set(0, -0.08, 0.04);
        g.add(grip);
        const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.12), gripMat);
        stock.position.set(0, -0.02, 0.18);
        g.add(stock);
        break;
      }
      case 'smg': {
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.35), bodyMat);
        body.position.z = -0.17;
        g.add(body);
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.4, 6), darkMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.z = -0.35;
        g.add(barrel);
        const mag = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.06), darkMat);
        mag.position.set(0, -0.1, 0.02);
        g.add(mag);
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.04), gripMat);
        grip.position.set(0, -0.06, 0.08);
        g.add(grip);
        break;
      }
      case 'sniper': {
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.6), bodyMat);
        body.position.z = -0.3;
        g.add(body);
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.8, 8), darkMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.z = -0.7;
        g.add(barrel);
        const scope = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.1), new THREE.MeshStandardMaterial({ color: 0x444466, metalness: 0.7, roughness: 0.2 }));
        scope.position.set(0, 0.1, -0.2);
        g.add(scope);
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.06), gripMat);
        grip.position.set(0, -0.07, -0.05);
        g.add(grip);
        const stock = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.15), gripMat);
        stock.position.set(0, -0.01, 0.2);
        g.add(stock);
        break;
      }
      case 'pistol': {
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.25), bodyMat);
        body.position.z = -0.12;
        g.add(body);
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.3, 6), darkMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.z = -0.3;
        g.add(barrel);
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.05), gripMat);
        grip.position.set(0, -0.09, 0.02);
        g.add(grip);
        break;
      }
    }

    // Muzzle flash point
    const mf = new THREE.PointLight(0xffaa44, 0, 2);
    mf.position.set(0, 0, -0.8);
    g.add(mf);
    g.userData.muzzleFlash = mf;

    g.visible = false;
    return g;
  }

  switchTo(id) {
    if (this.reloading) return;
    // Hide current
    if (this.currentId && this.weapons[this.currentId]) {
      this.weapons[this.currentId].model.visible = false;
      this.weapons[this.currentId].visible = false;
    }
    // Remove current model from group
    while (this.group.children.length > 0) {
      const c = this.group.children[0];
      if (c.userData && c.userData.muzzleFlash) { /* keep */ }
      this.group.remove(c);
    }

    this.currentId = id;
    const w = this.weapons[id];
    this.group.add(w.model);
    w.model.visible = true;
    w.visible = true;
    this.cooldown = 0;
  }

  getCurrent() {
    return this.weapons[this.currentId];
  }

  getDef() {
    return this.getCurrent().def;
  }

  shoot(raycaster, onHit) {
    const w = this.getCurrent();
    const def = w.def;
    if (this.reloading) return;
    if (this.cooldown > 0) return;
    if (w.ammo <= 0) { this.reload(); return; }

    w.ammo--;
    this.cooldown = def.fireRate;

    // Muzzle flash
    const mf = w.model.userData.muzzleFlash;
    if (mf) mf.intensity = 2.5;
    setTimeout(() => { if (mf) mf.intensity = 0; }, 50);

    // Recoil
    this.group.position.z = -0.35 + def.recoil * 0.5;

    for (let p = 0; p < def.pellets; p++) {
      const dir = new THREE.Vector3(0, 0, -1);
      dir.applyQuaternion(raycaster.ray.direction.clone().normalize());
      dir.x += (Math.random() - 0.5) * def.spread * 2;
      dir.y += (Math.random() - 0.5) * def.spread * 2;
      dir.z += (Math.random() - 0.5) * def.spread * 0.5;
      dir.normalize();

      const r = new THREE.Raycaster(raycaster.ray.origin.clone(), dir, 0.3, def.range);
      onHit(r, def);
    }

    return def;
  }

  reload() {
    const w = this.getCurrent();
    const def = w.def;
    if (this.reloading || w.ammo === def.magSize || w.reserve <= 0) return;
    this.reloading = true;
    this.reloadTimer = def.reloadTime;
  }

  updateReload(dt) {
    if (!this.reloading) return;
    this.reloadTimer -= dt;
    if (this.reloadTimer <= 0) {
      const w = this.getCurrent();
      const def = w.def;
      const needed = def.magSize - w.ammo;
      const available = Math.min(needed, w.reserve);
      w.ammo += available;
      w.reserve -= available;
      this.reloading = false;
    }
  }

  update(dt) {
    if (this.cooldown > 0) this.cooldown -= dt;
    this.group.position.z += (-0.35 - this.group.position.z) * 0.1;
    this.updateReload(dt);
  }

  getState() {
    const w = this.getCurrent();
    return {
      ammo: w.ammo,
      reserve: w.reserve,
      magSize: w.def.magSize,
      name: w.def.name,
      icon: w.def.icon,
      id: w.def.id,
      reloading: this.reloading,
    };
  }
}

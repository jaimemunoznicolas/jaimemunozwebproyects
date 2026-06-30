import * as THREE from 'three';

export let scene, renderer, camera;

export function initScene(container, menuContainer) {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080818);
  scene.fog = new THREE.FogExp2(0x080818, 0.006);

  camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 200);
  scene.add(camera);

  // Lights
  const ambient = new THREE.AmbientLight(0x303060, 0.5);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0x6666aa, 0x443322, 0.5);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffeedd, 1.5);
  sun.position.set(40, 50, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 120;
  sun.shadow.camera.left = -70;
  sun.shadow.camera.right = 70;
  sun.shadow.camera.top = 70;
  sun.shadow.camera.bottom = -70;
  sun.shadow.bias = -0.002;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0x4444ff, 0.25);
  fill.position.set(-30, 20, -30);
  scene.add(fill);

  // Stars
  const starCount = 3000;
  const starGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 100 + Math.random() * 40;
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = Math.abs(r * Math.cos(phi));
    pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    sizes[i] = 0.3 + Math.random() * 1.5;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  starGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.25, transparent: true, opacity: 0.7, sizeAttenuation: true,
  });
  scene.add(new THREE.Points(starGeo, starMat));

  // Menu background scene
  if (menuContainer) {
    const menuRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    menuRenderer.setSize(window.innerWidth, window.innerHeight);
    menuRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    menuRenderer.setClearColor(0x000000, 0);
    menuContainer.appendChild(menuRenderer.domElement);

    const menuScene = new THREE.Scene();
    const menuCam = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    menuCam.position.set(0, 4, 10);
    menuCam.lookAt(0, 1, 0);

    const mLight = new THREE.DirectionalLight(0xffffff, 1);
    mLight.position.set(5, 10, 5);
    menuScene.add(mLight);
    menuScene.add(new THREE.AmbientLight(0x444466, 0.4));

    // Floating crystals in menu
    const crystalGroup = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const g = new THREE.OctahedronGeometry(rand2(0.2, 0.5));
      const m = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(rand2(0.7, 0.85), 0.6, 0.4),
        metalness: 0.3, roughness: 0.2, transparent: true, opacity: 0.6,
      });
      const mesh = new THREE.Mesh(g, m);
      const angle = (i / 12) * Math.PI * 2;
      const radius = rand2(2, 4);
      mesh.position.set(Math.cos(angle) * radius, rand2(0.5, 3), Math.sin(angle) * radius);
      mesh.userData = { angle, radius, speed: rand2(0.2, 0.5), phase: rand2(0, Math.PI * 2) };
      crystalGroup.add(mesh);
    }
    menuScene.add(crystalGroup);
    window.menuSceneData = { renderer: menuRenderer, scene: menuScene, camera: menuCam, crystals: crystalGroup };
  }

  window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    const md = window.menuSceneData;
    if (md) { md.renderer.setSize(w, h); md.camera.aspect = w / h; md.camera.updateProjectionMatrix(); }
  });

  return { scene, renderer, camera };
}

function rand2(min, max) { return Math.random() * (max - min) + min; }

export function renderMenuScene(dt) {
  const md = window.menuSceneData;
  if (!md || !md.renderer.domElement.style.display || md.renderer.domElement.style.display === 'none') return;
  md.crystals.rotation.y += dt * 0.15;
  md.crystals.children.forEach((c, i) => {
    c.position.y += Math.sin(dt * c.userData.speed + c.userData.phase) * 0.003;
    c.rotation.x += dt * 0.5;
    c.rotation.z += dt * 0.3;
  });
  md.renderer.render(md.scene, md.camera);
}

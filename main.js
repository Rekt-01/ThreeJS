import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ====================== SCENE SETUP ======================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87b8e0);
scene.fog = new THREE.FogExp2(0x87b8e0, 0.0042);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(8, 6.5, 18);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.body.appendChild(renderer.domElement);

// Post-processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.28, 0.45, 0.88
);
composer.addPass(bloomPass);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.minDistance = 6;
controls.maxDistance = 40;
controls.target.set(0, 4.2, 0);

// ====================== LIGHTING ======================
const hemi = new THREE.HemisphereLight(0xfff5e6, 0x3a5f2a, 0.7);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff4e0, 2.8);
sun.position.set(28, 42, 18);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 110;
const s = 22;
sun.shadow.camera.left = -s;
sun.shadow.camera.right = s;
sun.shadow.camera.top = s;
sun.shadow.camera.bottom = -s;
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.02;
scene.add(sun);

// Soft fill light
const fill = new THREE.DirectionalLight(0xb8d4ff, 0.35);
fill.position.set(-20, 15, -15);
scene.add(fill);

// ====================== GROUND ======================
const groundGeo = new THREE.PlaneGeometry(200, 200, 64, 64);
const pos = groundGeo.attributes.position;
for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i);
  const z = pos.getZ(i);
  pos.setY(i, Math.sin(x * 0.08) * Math.cos(z * 0.07) * 0.18 + Math.random() * 0.04);
}
groundGeo.computeVertexNormals();

const groundMat = new THREE.MeshStandardMaterial({
  color: 0x3d6b1e,
  roughness: 0.92,
  metalness: 0.0
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ====================== GRASS ======================
const grassCount = 22000;
const grassGeo = new THREE.ConeGeometry(0.035, 0.55, 3);
grassGeo.translate(0, 0.275, 0);

const grassMat = new THREE.MeshStandardMaterial({
  color: 0x4e8c28,
  roughness: 0.75,
  side: THREE.DoubleSide
});

const grass = new THREE.InstancedMesh(grassGeo, grassMat, grassCount);
grass.castShadow = true;
grass.receiveShadow = true;

const dummy = new THREE.Object3D();
const grassData = [];

for (let i = 0; i < grassCount; i++) {
  const r = Math.pow(Math.random(), 0.65) * 48;
  const theta = Math.random() * Math.PI * 2;
  const x = Math.cos(theta) * r;
  const z = Math.sin(theta) * r;

  const h = 0.55 + Math.random() * 0.7;
  dummy.position.set(x, 0, z);
  dummy.scale.set(0.9 + Math.random() * 0.4, h, 0.9 + Math.random() * 0.4);
  dummy.rotation.y = Math.random() * Math.PI;
  dummy.updateMatrix();
  grass.setMatrixAt(i, dummy.matrix);

  const green = 0.45 + Math.random() * 0.25;
  grass.setColorAt(i, new THREE.Color(0.2 + Math.random() * 0.1, green, 0.12 + Math.random() * 0.08));

  grassData.push({
    matrix: dummy.matrix.clone(),
    phase: Math.random() * Math.PI * 2,
    amp: 0.03 + Math.random() * 0.04
  });
}
grass.instanceMatrix.needsUpdate = true;
if (grass.instanceColor) grass.instanceColor.needsUpdate = true;
scene.add(grass);

// ====================== TREE ======================
const tree = new THREE.Group();

const barkMat = new THREE.MeshStandardMaterial({
  color: 0x3a2a1f,
  roughness: 0.95,
  metalness: 0.02
});

const leafMat = new THREE.MeshStandardMaterial({
  color: 0x3f7a1c,
  roughness: 0.65,
  flatShading: true
});

// Trunk
const trunkH = 6.2;
const trunkGeo = new THREE.CylinderGeometry(0.32, 0.78, trunkH, 12);
trunkGeo.translate(0, trunkH / 2, 0);
const trunk = new THREE.Mesh(trunkGeo, barkMat);
trunk.castShadow = true;
trunk.receiveShadow = true;
trunk.rotation.z = 0.03;
tree.add(trunk);

// Recursive branch function
function createBranch(origin, dir, length, radius, depth, maxDepth = 5) {
  if (depth > maxDepth || length < 0.25) return;

  const geo = new THREE.CylinderGeometry(radius * 0.55, radius, length, 7);
  geo.translate(0, length / 2, 0);
  const mesh = new THREE.Mesh(geo, barkMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const quat = new THREE.Quaternion();
  quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  mesh.quaternion.copy(quat);
  mesh.position.copy(origin);
  tree.add(mesh);

  const end = origin.clone().add(dir.clone().normalize().multiplyScalar(length));

  if (depth >= 3) {
    const leafCount = depth === maxDepth ? 8 : 4;
    for (let i = 0; i < leafCount; i++) {
      const size = 0.7 + Math.random() * 0.9;
      const lGeo = new THREE.IcosahedronGeometry(size, 1);
      const v = lGeo.attributes.position;
      for (let j = 0; j < v.count; j++) {
        v.setXYZ(
          j,
          v.getX(j) + (Math.random() - 0.5) * 0.4,
          v.getY(j) + (Math.random() - 0.5) * 0.35,
          v.getZ(j) + (Math.random() - 0.5) * 0.4
        );
      }
      lGeo.computeVertexNormals();

      const leaf = new THREE.Mesh(lGeo, leafMat);
      leaf.position.copy(end).add(new THREE.Vector3(
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.5) * 1.3,
        (Math.random() - 0.5) * 1.8
      ));
      leaf.rotation.set(Math.random() * 0.6, Math.random() * Math.PI, Math.random() * 0.6);
      leaf.castShadow = true;
      leaf.userData.isLeaf = true;
      leaf.userData.phase = Math.random() * Math.PI * 2;
      tree.add(leaf);
    }
  }

  const branches = depth < 2 ? 4 : 3;
  for (let i = 0; i < branches; i++) {
    const angle = (i / branches) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const elev = 0.35 + Math.random() * 0.55;

    const newDir = new THREE.Vector3(
      Math.sin(elev) * Math.cos(angle),
      Math.cos(elev),
      Math.sin(elev) * Math.sin(angle)
    );
    newDir.add(dir.clone().multiplyScalar(0.4)).normalize();

    createBranch(
      end,
      newDir,
      length * (0.65 + Math.random() * 0.15),
      radius * (0.55 + Math.random() * 0.1),
      depth + 1,
      maxDepth
    );
  }
}

// Primary limbs
const base = new THREE.Vector3(0, trunkH * 0.78, 0);
for (let i = 0; i < 6; i++) {
  const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.3;
  const dir = new THREE.Vector3(
    Math.cos(angle) * 0.7,
    0.55 + Math.random() * 0.25,
    Math.sin(angle) * 0.7
  ).normalize();
  createBranch(base, dir, 2.6 + Math.random() * 0.5, 0.22, 1);
}

scene.add(tree);

// ====================== ROCKS & FLOWERS ======================
const rockMat = new THREE.MeshStandardMaterial({ color: 0x6a635c, roughness: 0.9 });
for (let i = 0; i < 14; i++) {
  const size = 0.25 + Math.random() * 0.55;
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), rockMat);
  const r = 4 + Math.random() * 18;
  const a = Math.random() * Math.PI * 2;
  rock.position.set(Math.cos(a) * r, size * 0.4, Math.sin(a) * r);
  rock.rotation.set(Math.random(), Math.random(), Math.random());
  rock.castShadow = true;
  rock.receiveShadow = true;
  scene.add(rock);
}

// Wildflowers
const flowerColors = [0xe85d75, 0xf2c14e, 0x7ec8e3, 0xffffff];
for (let i = 0; i < 35; i++) {
  const group = new THREE.Group();
  const r = 3 + Math.random() * 22;
  const a = Math.random() * Math.PI * 2;
  group.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);

  for (let j = 0; j < 3 + Math.floor(Math.random() * 4); j++) {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.02, 0.35, 4),
      new THREE.MeshStandardMaterial({ color: 0x3a7a22 })
    );
    stem.position.y = 0.18;
    stem.position.x = (Math.random() - 0.5) * 0.25;
    stem.position.z = (Math.random() - 0.5) * 0.25;
    group.add(stem);

    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(0.07 + Math.random() * 0.04, 6, 6),
      new THREE.MeshStandardMaterial({
        color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
        roughness: 0.6
      })
    );
    petal.position.copy(stem.position);
    petal.position.y += 0.2;
    group.add(petal);
  }
  scene.add(group);
}

// ====================== ANIMATION ======================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Tree sway
  tree.rotation.z = Math.sin(t * 0.9) * 0.012;
  tree.rotation.x = Math.cos(t * 0.7) * 0.008;

  // Leaf movement
  tree.traverse(obj => {
    if (obj.userData.isLeaf) {
      obj.rotation.z = Math.sin(t * 1.8 + obj.userData.phase) * 0.04;
      obj.rotation.x = Math.cos(t * 1.5 + obj.userData.phase) * 0.03;
    }
  });

  // Grass wind
  for (let i = 0; i < grassCount; i += 7) {
    const d = grassData[i];
    dummy.matrix.copy(d.matrix);
    dummy.rotation.z = Math.sin(t * 2.2 + d.phase) * d.amp;
    dummy.rotation.x = Math.cos(t * 1.7 + d.phase * 0.8) * d.amp * 0.7;
    dummy.updateMatrix();
    grass.setMatrixAt(i, dummy.matrix);
  }
  grass.instanceMatrix.needsUpdate = true;

  controls.update();
  composer.render();
}

animate();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// 1. Scene, Camera, & Cinematic Renderer Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.FogExp2(0x87ceeb, 0.005);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 7, 24);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// 2. Post-Processing Pipeline (Adds cinematic sun bloom & glow)
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.35,  // Bloom strength
    0.4,   // Radius
    0.85   // Threshold
);
composer.addPass(bloomPass);

// 3. Interactive Orbit Controls (Mouse & Touch compatible)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.01;
controls.minDistance = 5;
controls.maxDistance = 45;
controls.target.set(0, 4.5, 0);

// 4. Summer Day Lighting
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x446622, 0.85);
scene.add(hemisphereLight);

const sunLight = new THREE.DirectionalLight(0xfffaf0, 3.2);
sunLight.position.set(30, 50, 30);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 120;
const d = 20;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

// 5. Ground Field Terrain
const groundGeo = new THREE.PlaneGeometry(250, 250);
const groundMat = new THREE.MeshStandardMaterial({ 
    color: 0x42701e, 
    roughness: 0.85, 
    metalness: 0.05 
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// 6. Instanced Grass Field (Renders 15,000 individual blades instantly via GPU)
const grassBladeGeo = new THREE.ConeGeometry(0.04, 0.6, 2);
grassBladeGeo.translate(0, 0.3, 0); // Pivot at base
const grassBladeMat = new THREE.MeshStandardMaterial({ 
    color: 0x5a9a2a, 
    roughness: 0.7,
    side: THREE.DoubleSide
});
const grassCount = 15000;
const grassInstanced = new THREE.InstancedMesh(grassBladeGeo, grassBladeMat, grassCount);
grassInstanced.receiveShadow = true;

const dummy = new THREE.Object3D();
for (let i = 0; i < grassCount; i++) {
    const radius = 2 + Math.random() * 45;
    const theta = Math.random() * Math.PI * 2;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    
    dummy.position.set(x, 0, z);
    dummy.scale.set(1, 0.5 + Math.random() * 0.8, 1);
    dummy.rotation.y = Math.random() * Math.PI;
    dummy.updateMatrix();
    
    grassInstanced.setMatrixAt(i, dummy.matrix);
}
scene.add(grassInstanced);

// 7. Masterpiece Procedural Tree Generation
const treeGroup = new THREE.Group();

const barkMat = new THREE.MeshStandardMaterial({ color: 0x423226, roughness: 0.9, metalness: 0.05 });
const leafMat = new THREE.MeshStandardMaterial({ color: 0x4c8a22, roughness: 0.5, flatShading: true });

// Main Trunk
const trunkHeight = 5.8;
const trunkGeo = new THREE.CylinderGeometry(0.28, 0.7, trunkHeight, 10);
trunkGeo.translate(0, trunkHeight / 2, 0);
const trunk = new THREE.Mesh(trunkGeo, barkMat);
trunk.castShadow = true;
trunk.receiveShadow = true;
treeGroup.add(trunk);

// Recursive branch and dense leaf cluster builder
const buildBranch = (pos, radius, length, angleX, angleZ, depth) => {
    if (depth > 4) return;

    const bGeo = new THREE.CylinderGeometry(radius * 0.6, radius, length, 6);
    bGeo.translate(0, length / 2, 0);
    const branch = new THREE.Mesh(bGeo, barkMat);
    branch.position.copy(pos);
    branch.rotation.x = angleX;
    branch.rotation.z = angleZ;
    branch.castShadow = true;
    branch.receiveShadow = true;
    treeGroup.add(branch);

    const tip = new THREE.Vector3(0, length, 0);
    tip.applyEuler(new THREE.Euler(angleX, 0, angleZ));
    tip.add(pos);

    if (depth === 4) {
        // High density leaf clouds
        for (let c = 0; c < 6; c++) {
            const size = 0.9 + Math.random() * 0.8;
            const lGeo = new THREE.DodecahedronGeometry(size, 1);
            
            const v = lGeo.attributes.position;
            for (let i = 0; i < v.count; i++) {
                v.setX(i, v.getX(i) + (Math.random() - 0.5) * 0.35);
                v.setY(i, v.getY(i) + (Math.random() - 0.5) * 0.35);
                v.setZ(i, v.getZ(i) + (Math.random() - 0.5) * 0.35);
            }
            lGeo.computeVertexNormals();

            const leafCloud = new THREE.Mesh(lGeo, leafMat);
            leafCloud.position.set(
                tip.x + (Math.random() - 0.5) * 1.6,
                tip.y + (Math.random() - 0.5) * 1.2,
                tip.z + (Math.random() - 0.5) * 1.6
            );
            leafCloud.castShadow = true;
            treeGroup.add(leafCloud);
        }
    } else {
        for (let i = 0; i < 3; i++) {
            buildBranch(tip, radius * 0.58, length * 0.72, angleX + (Math.random() - 0.3) * 0.45, angleZ + (Math.random() - 0.5) * 0.7, depth + 1);
        }
    }
};

const limbs = 5;
for (let i = 0; i < limbs; i++) {
    const angle = (i / limbs) * Math.PI * 2;
    const startPos = new THREE.Vector3(0, trunkHeight * 0.85, 0);
    const ax = 0.48 + Math.random() * 0.2;
    const az = (Math.random() - 0.5) * 0.3;
    buildBranch(startPos, 0.22, 2.5, Math.cos(angle) * ax, Math.sin(angle) * ax, 2);
}

scene.add(treeGroup);

// 8. Animation & Organic Wind Simulation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    treeGroup.rotation.z = Math.sin(time * 1.2) * 0.01;
    treeGroup.rotation.x = Math.cos(time * 0.9) * 0.007;

    controls.update();
    composer.render(); // Render scene through cinematic post-processing bloom pipeline
}

animate();

// Handle Window Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

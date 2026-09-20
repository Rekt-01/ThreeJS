import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Scene, Camera, & Renderer (Optimized for brightness & realism)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x06060c);
scene.fog = new THREE.FogExp2(0x06060c, 0.012);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(28, 22, 38);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6; // Brighter overall scene exposure
document.body.appendChild(renderer.domElement);

// 2. Touch & Mouse Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.02;
controls.minDistance = 10;
controls.maxDistance = 80;

// 3. Bright, Cinematic Lighting & Night Glow
// Brighter cool ambient light to illuminate shadows
const ambientLight = new THREE.AmbientLight(0x7799cc, 0.9);
scene.add(ambientLight);

// Main moonlight / sunset key light
const sunLight = new THREE.DirectionalLight(0xffeedd, 3.0);
sunLight.position.set(35, 60, 25);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 160;
const d = 25;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

// Upward city-glow light to illuminate the underside of structures
const groundGlow = new THREE.DirectionalLight(0x334466, 1.2);
groundGlow.position.set(-20, -30, -20);
scene.add(groundGlow);

// Detailed Ground Plaza
const groundGeo = new THREE.PlaneGeometry(120, 120);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f0f14, roughness: 0.6, metalness: 0.3 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// 4. Highly Detailed Procedural Skyscraper Generation
const buildingGroup = new THREE.Group();

const concreteMat = new THREE.MeshStandardMaterial({ color: 0x1d1d24, roughness: 0.6 });
const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x112233,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.7,
    thickness: 1.5,
    reflectivity: 0.9
});
const frameMat = new THREE.MeshStandardMaterial({ color: 0x4a4a56, metalness: 0.85, roughness: 0.2 });
const lightMat = new THREE.MeshBasicMaterial({ color: 0xffeedd }); // Warm interior floor lights

const floors = 26;
const width = 8.5;
const depth = 8.5;
const floorHeight = 1.15;

for (let i = 0; i < floors; i++) {
    const yPos = i * floorHeight + floorHeight / 2;

    // Detailed Concrete Floor Slab
    const slabGeo = new THREE.BoxGeometry(width + 0.6, 0.12, depth + 0.6);
    const slab = new THREE.Mesh(slabGeo, concreteMat);
    slab.position.set(0, yPos - floorHeight / 2, 0);
    slab.castShadow = true;
    slab.receiveShadow = true;
    buildingGroup.add(slab);

    // Glowing Interior Ceiling Strip (Makes windows look lit up and detailed)
    if (i % 2 === 0 || i === floors - 1) {
        const interiorGeo = new THREE.BoxGeometry(width - 0.4, 0.05, depth - 0.4);
        const interior = new THREE.Mesh(interiorGeo, lightMat);
        interior.position.set(0, yPos - floorHeight / 2 + 0.08, 0);
        buildingGroup.add(interior);
    }

    // Inset Glass Facade (Creates structural depth)
    const wallGeo = new THREE.BoxGeometry(width - 0.3, floorHeight - 0.12, depth - 0.3);
    const wall = new THREE.Mesh(wallGeo, glassMat);
    wall.position.set(0, yPos, 0);
    buildingGroup.add(wall);

    // Structural Corner Pillars running up the height of the building
    if (i === 0) {
        const pillarGeo = new THREE.BoxGeometry(0.5, floors * floorHeight, 0.5);
        [-width/2 + 0.2, width/2 - 0.2].forEach(x => {
            [-depth/2 + 0.2, depth/2 - 0.2].forEach(z => {
                const pillar = new THREE.Mesh(pillarGeo, frameMat);
                pillar.position.set(x, (floors * floorHeight)/2, z);
                pillar.castShadow = true;
                pillar.receiveShadow = true;
                buildingGroup.add(pillar);
            });
        });
    }
}

// Architectural Roof Crown & Communication Spire
const roofGeo = new THREE.BoxGeometry(width * 0.7, 1.8, depth * 0.7);
const roof = new THREE.Mesh(roofGeo, frameMat);
roof.position.set(0, floors * floorHeight + 0.9, 0);
roof.castShadow = true;
buildingGroup.add(roof);

const spireGeo = new THREE.CylinderGeometry(0.04, 0.12, 10, 8);
const spire = new THREE.Mesh(spireGeo, frameMat);
spire.position.set(0, floors * floorHeight + 6.8, 0);
spire.castShadow = true;
buildingGroup.add(spire);

scene.add(buildingGroup);

// 5. Render Loop with Touch Damping
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Handle Window Resizing Responsively
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

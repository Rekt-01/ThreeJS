import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Scene, Camera, & Renderer (with Shadows enabled)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a12);
scene.fog = new THREE.FogExp2(0x0a0a12, 0.015);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(25, 20, 35);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// 2. Add Touch & Mouse Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.minDistance = 10;
controls.maxDistance = 80;

// 3. Realistic Lighting & Sun Shadows
const ambientLight = new THREE.AmbientLight(0xddeeff, 0.4);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
sunLight.position.set(30, 50, 20);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 150;
const d = 25;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

// Ground Plane to receive shadows
const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x111116, roughness: 0.8, metalness: 0.2 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// 4. Procedural Skyscraper Generation
const buildingGroup = new THREE.Group();

const concreteMaterial = new THREE.MeshStandardMaterial({ color: 0x222228, roughness: 0.7 });
const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x112233,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.6,
    thickness: 1.2,
    reflectivity: 0.9
});
const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x3a3a42, metalness: 0.8, roughness: 0.2 });

const floors = 22;
const width = 8;
const depth = 8;
const floorHeight = 1.2;

for (let i = 0; i < floors; i++) {
    const yPos = i * floorHeight + floorHeight / 2;

    // Floor Slab
    const slabGeo = new THREE.BoxGeometry(width + 0.4, 0.15, depth + 0.4);
    const slab = new THREE.Mesh(slabGeo, concreteMaterial);
    slab.position.set(0, yPos - floorHeight / 2, 0);
    slab.castShadow = true;
    slab.receiveShadow = true;
    buildingGroup.add(slab);

    // Glass Facade
    const wallGeo = new THREE.BoxGeometry(width, floorHeight - 0.15, depth);
    const wall = new THREE.Mesh(wallGeo, glassMaterial);
    wall.position.set(0, yPos, 0);
    buildingGroup.add(wall);

    // Structural Pillars
    if (i === 0) {
        const pillarGeo = new THREE.BoxGeometry(0.6, floors * floorHeight, 0.6);
        [-width/2, width/2].forEach(x => {
            [-depth/2, depth/2].forEach(z => {
                const pillar = new THREE.Mesh(pillarGeo, frameMaterial);
                pillar.position.set(x, (floors * floorHeight)/2, z);
                pillar.castShadow = true;
                pillar.receiveShadow = true;
                buildingGroup.add(pillar);
            });
        });
    }
}

// Architectural Roof Crown & Antenna
const roofGeo = new THREE.BoxGeometry(width * 0.7, 1.5, depth * 0.7);
const roof = new THREE.Mesh(roofGeo, frameMaterial);
roof.position.set(0, floors * floorHeight + 0.75, 0);
roof.castShadow = true;
buildingGroup.add(roof);

const antennaGeo = new THREE.CylinderGeometry(0.05, 0.15, 8, 8);
const antenna = new THREE.Mesh(antennaGeo, frameMaterial);
antenna.position.set(0, floors * floorHeight + 5.5, 0);
antenna.castShadow = true;
buildingGroup.add(antenna);

scene.add(buildingGroup);

// 5. Render Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Handle Window Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Scene, Camera, & Bright Summer Atmosphere Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Bright daytime sky blue
scene.fog = new THREE.FogExp2(0x87ceeb, 0.007); // Soft distant atmospheric haze

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 9, 25);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

// 2. Interactive Orbit Controls (Mouse & Touch compatible)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.02; // Keep camera above ground
controls.minDistance = 6;
controls.maxDistance = 50;
controls.target.set(0, 5, 0);

// 3. Bright Summer Daylight Lighting
// Sky hemisphere light (bright white-blue sky illuminating top, warm grass reflection from below)
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x557a2b, 0.9);
scene.add(hemisphereLight);

// High overhead golden summer sun
const sunLight = new THREE.DirectionalLight(0xfffaf0, 2.8);
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

// 4. Vibrant Summer Field Ground
const groundGeo = new THREE.PlaneGeometry(200, 200);
const groundMat = new THREE.MeshStandardMaterial({ 
    color: 0x4a7c23, // Lush summer green grass
    roughness: 0.8, 
    metalness: 0.05 
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// 5. High-Density Procedural Tree Generation
const treeGroup = new THREE.Group();

// Rich bark material
const barkMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4d392f, 
    roughness: 0.9, 
    metalness: 0.05 
});

// Vibrant sunlit summer leaf material
const leafMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x528a25, 
    roughness: 0.5, 
    metalness: 0.1,
    flatShading: true 
});

// Primary Trunk
const trunkHeight = 6.5;
const trunkGeo = new THREE.CylinderGeometry(0.3, 0.75, trunkHeight, 10);
trunkGeo.translate(0, trunkHeight / 2, 0);
const trunk = new THREE.Mesh(trunkGeo, barkMaterial);
trunk.castShadow = true;
trunk.receiveShadow = true;
treeGroup.add(trunk);

// Recursive branch & ultra-dense foliage generation logic
const maxDepth = 4;
const generateBranchSystem = (pos, radius, length, angleX, angleZ, depth) => {
    if (depth > maxDepth) return;

    // Build branch segment
    const branchGeo = new THREE.CylinderGeometry(radius * 0.65, radius, length, 6);
    branchGeo.translate(0, length / 2, 0);
    const branch = new THREE.Mesh(branchGeo, barkMaterial);
    branch.position.copy(pos);
    branch.rotation.x = angleX;
    branch.rotation.z = angleZ;
    branch.castShadow = true;
    branch.receiveShadow = true;
    treeGroup.add(branch);

    // Calculate branch tip location
    const tip = new THREE.Vector3(0, length, 0);
    tip.applyEuler(new THREE.Euler(angleX, 0, angleZ));
    tip.add(pos);

    if (depth === maxDepth) {
        // High density leaf cluster clouds at final branch tips
        const clusterCount = 5;
        for (let c = 0; c < clusterCount; c++) {
            const size = 1.0 + Math.random() * 0.9;
            const leafGeo = new THREE.DodecahedronGeometry(size, 1);
            
            // Displace vertices to create lush organic puff shapes
            const v = leafGeo.attributes.position;
            for (let i = 0; i < v.count; i++) {
                v.setX(i, v.getX(i) + (Math.random() - 0.5) * 0.4);
                v.setY(i, v.getY(i) + (Math.random() - 0.5) * 0.4);
                v.setZ(i, v.getZ(i) + (Math.random() - 0.5) * 0.4);
            }
            leafGeo.computeVertexNormals();

            const cluster = new THREE.Mesh(leafGeo, leafMaterial);
            cluster.position.set(
                tip.x + (Math.random() - 0.5) * 1.8,
                tip.y + (Math.random() - 0.5) * 1.2,
                tip.z + (Math.random() - 0.5) * 1.8
            );
            cluster.castShadow = true;
            treeGroup.add(cluster);
        }
    } else {
        // Sub-branches split out organically
        const splits = 3;
        for (let i = 0; i < splits; i++) {
            const nextLength = length * 0.72;
            const nextRadius = radius * 0.6;
            const nextAngleX = angleX + (Math.random() - 0.3) * 0.5;
            const nextAngleZ = angleZ + (Math.random() - 0.5) * 0.7;
            generateBranchSystem(tip, nextRadius, nextLength, nextAngleX, nextAngleZ, depth + 1);
        }
    }
};

// Spawn main structural limbs from top of trunk
const primaryLimbs = 5;
for (let i = 0; i < primaryLimbs; i++) {
    const angle = (i / primaryLimbs) * Math.PI * 2;
    const startPos = new THREE.Vector3(0, trunkHeight * 0.85, 0);
    const ax = 0.5 + Math.random() * 0.25;
    const az = (Math.random() - 0.5) * 0.3;
    
    const rotX = Math.cos(angle) * ax;
    const rotZ = Math.sin(angle) * ax;

    generateBranchSystem(startPos, 0.24, 2.8, rotX, rotZ, 2);
}

scene.add(treeGroup);

// 6. Animation Loop with Organic Summer Breeze
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    // Gentle sway to mimic a warm summer breeze blowing through the canopy
    treeGroup.rotation.z = Math.sin(time * 1.1) * 0.012;
    treeGroup.rotation.x = Math.cos(time * 0.8) * 0.008;

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

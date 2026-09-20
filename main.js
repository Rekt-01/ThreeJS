import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Scene, Camera, & Renderer Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1118);
scene.fog = new THREE.FogExp2(0x0a1118, 0.012);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 8, 22);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
document.body.appendChild(renderer.domElement);

// 2. Interactive Orbit Controls (Works for mouse & mobile touch)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.01; // Don't allow camera below ground
controls.minDistance = 5;
controls.maxDistance = 50;
controls.target.set(0, 5, 0);

// 3. Cinematic Outdoor Lighting (Warm sunset/daylight style)
const hemisphereLight = new THREE.HemisphereLight(0xddeeff, 0x334422, 0.8);
scene.add(hemisphereLight);

const sunLight = new THREE.DirectionalLight(0xfffaed, 2.5);
sunLight.position.set(20, 30, 20);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 100;
const d = 15;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

// 4. Field Ground Plane
const groundGeo = new THREE.PlaneGeometry(150, 150);
const groundMat = new THREE.MeshStandardMaterial({ 
    color: 0x1b2618, 
    roughness: 0.9, 
    metalness: 0.1 
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// 5. Procedural Realistic Tree Generation
const treeGroup = new THREE.Group();

// Materials
const barkMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3b2f2f, 
    roughness: 0.85, 
    metalness: 0.05 
});

const leafMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3a5a30, 
    roughness: 0.6, 
    metalness: 0.1,
    flatShading: true // Gives leaves a rich faceted low-poly organic look
});

// Main Trunk (Built using a tapered Cylinder)
const trunkHeight = 6;
const trunkGeo = new THREE.CylinderGeometry(0.35, 0.7, trunkHeight, 8);
trunkGeo.translate(0, trunkHeight / 2, 0); // Shift pivot to base
const trunk = new THREE.Mesh(trunkGeo, barkMaterial);
trunk.castShadow = true;
trunk.receiveShadow = true;
treeGroup.add(trunk);

// Procedural Branch Generation Loop
const branchLevels = 4;
const createBranches = (parentPosition, parentRadius, length, angleX, angleZ, level) => {
    if (level > branchLevels) return;

    // Create branch mesh
    const branchGeo = new THREE.CylinderGeometry(parentRadius * 0.6, parentRadius, length, 6);
    branchGeo.translate(0, length / 2, 0);
    const branch = new THREE.Mesh(branchGeo, barkMaterial);
    branch.position.copy(parentPosition);
    
    // Rotate branch dynamically outward
    branch.rotation.x = angleX;
    branch.rotation.z = angleZ;
    branch.castShadow = true;
    branch.receiveShadow = true;
    treeGroup.add(branch);

    // Tip position calculation for sub-branches & leaves
    const tipVector = new THREE.Vector3(0, length, 0);
    tipVector.applyEuler(new THREE.Euler(angleX, 0, angleZ));
    tipVector.add(parentPosition);

    if (level === branchLevels) {
        // Attach Leaf Clusters at the tips of terminal branches
        const clusterCount = 4;
        for (let c = 0; c < clusterCount; c++) {
            const leafSize = 1.2 + Math.random() * 0.8;
            const leafGeo = new THREE.DodecahedronGeometry(leafSize, 1);
            
            // Distort vertices slightly for an organic, puffy cloud shape
            const pos = leafGeo.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * 0.3);
                pos.setY(i, pos.getY(i) + (Math.random() - 0.5) * 0.3);
                pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * 0.3);
            }
            leafGeo.computeVertexNormals();

            const leaves = new THREE.Mesh(leafGeo, leafMaterial);
            
            // Random offset spread around the branch tip
            const offsetX = (Math.random() - 0.5) * 1.5;
            const offsetY = (Math.random() - 0.5) * 1.0;
            const offsetZ = (Math.random() - 0.5) * 1.5;
            
            leaves.position.set(tipVector.x + offsetX, tipVector.y + offsetY, tipVector.z + offsetZ);
            leaves.castShadow = true;
            treeGroup.add(leaves);
        }
    } else {
        // Spawn sub-branches recursively
        const subCount = 3;
        for (let i = 0; i < subCount; i++) {
            const subLength = length * 0.7;
            const subRadius = parentRadius * 0.55;
            const subAngleX = angleX + (Math.random() - 0.3) * 0.6;
            const subAngleZ = angleZ + (Math.random() - 0.5) * 0.8;
            createBranches(tipVector, subRadius, subLength, subAngleX, subAngleZ, level + 1);
        }
    }
};

// Spawn initial primary limbs branching out from the top of the trunk
const mainLimbs = 4;
for (let i = 0; i < mainLimbs; i++) {
    const angle = (i / mainLimbs) * Math.PI * 2;
    const startPos = new THREE.Vector3(0, trunkHeight * 0.85, 0);
    const initialAngleX = 0.4 + Math.random() * 0.2;
    const initialAngleZ = (Math.random() - 0.5) * 0.3;
    
    // Offset rotation around trunk center
    const rotatedX = Math.cos(angle) * initialAngleX;
    const rotatedZ = Math.sin(angle) * initialAngleX;

    createBranches(startPos, 0.22, 2.5, rotatedX, rotatedZ, 2);
}

scene.add(treeGroup);

// 6. Animation Loop & Soft Wind Sway effect on leaves
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Gentle natural wind effect moving the entire tree structure slightly
    treeGroup.rotation.z = Math.sin(elapsedTime * 1.2) * 0.015;
    treeGroup.rotation.x = Math.cos(elapsedTime * 0.9) * 0.01;

    controls.update();
    renderer.render(scene, camera);
}

animate();

// Responsive Window Handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

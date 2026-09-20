import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createSceneSetup } from './sceneSetup.js';
import { createEnvironment } from './environment.js';
import { createProceduralTree } from './treeGenerator.js';

// 1. Initialize Scene, Camera, Renderer & Post-Processing
const { scene, camera, renderer, composer } = createSceneSetup();

// 2. Add Orbit Controls (Mouse & Touch compatible)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.01;
controls.minDistance = 5;
controls.maxDistance = 45;
controls.target.set(0, 4.5, 0);

// 3. Build Environment and Tree
createEnvironment(scene);
const tree = createProceduralTree();
scene.add(tree);

// 4. Animation & Wind Sway Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    tree.rotation.z = Math.sin(time * 1.2) * 0.01;
    tree.rotation.x = Math.cos(time * 0.9) * 0.007;

    controls.update();
    composer.render();
}

animate();


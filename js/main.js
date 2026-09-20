import * as THREE from 'three';
import { createSceneSetup } from './sceneSetup.js';
import { createEnvironment } from './environment.js';
import { createProceduralTree } from './treeGenerator.js';
import { setupThirdPersonControls } from './controls.js';
import { createProceduralCharacter } from './character.js';

try {
    // 1. Initialize Scene, Camera, Renderer & Post-Processing
    const { scene, camera, renderer, composer } = createSceneSetup();

    // 2. Build Environment and Tree
    createEnvironment(scene);
    const tree = createProceduralTree();
    scene.add(tree);

    // 3. Add Procedural Character to Scene
    const character = createProceduralCharacter();
    scene.add(character.mesh);

    // 4. Initialize Third-Person Character Controls
    const updateControls = setupThirdPersonControls(character.mesh, renderer);

    // 5. Animation & Movement Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Natural tree wind sway
        tree.rotation.z = Math.sin(time * 1.2) * 0.01;
        tree.rotation.x = Math.cos(time * 0.9) * 0.007;

        // Update character movement, camera follow, and check if walking
        const isWalking = updateControls(delta, camera);

        // Update character limbs and breathing animation
        character.updateAnimation(time, isWalking, delta);

        composer.render();
    }

    animate();

} catch (error) {
    // If anything fails, print the error directly on your iPhone screen
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'absolute';
    errorDiv.style.top = '20px';
    errorDiv.style.left = '20px';
    errorDiv.style.color = '#ff3333';
    errorDiv.style.background = 'rgba(0,0,0,0.8)';
    errorDiv.style.padding = '20px';
    errorDiv.style.fontFamily = 'monospace';
    errorDiv.style.zIndex = '9999';
    errorDiv.style.maxHeight = '80vh';
    errorDiv.style.overflow = 'auto';
    errorDiv.innerHTML = `<strong>Error Caught:</strong><br>${error.message}<br><br>${error.stack}`;
    document.body.appendChild(errorDiv);
}

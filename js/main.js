import * as THREE from 'three';
import { createSceneSetup } from './sceneSetup.js';
import { createEnvironment } from './environment.js';
import { createProceduralTree } from './treeGenerator.js';
import { setupThirdPersonControls } from './controls.js';
import { createProceduralCharacter } from './character.js';
import { createLandmarks } from './landmarks.js';
import { createWorldProps } from './worldProps.js';

try {
    const { scene, camera, renderer, composer } = createSceneSetup();

    // World
    createEnvironment(scene);
    createLandmarks(scene);
    createWorldProps(scene);

    // Big original tree (keep it as a focal point)
    const mainTree = createProceduralTree();
    mainTree.position.set(0, 0, 0);
    mainTree.scale.setScalar(1.15);
    scene.add(mainTree);

    // Character
    const character = createProceduralCharacter();
    scene.add(character.mesh);

    // Controls
    const updateControls = setupThirdPersonControls(character.mesh, renderer);

    // Animate
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Gentle wind on main tree
        mainTree.rotation.z = Math.sin(time * 1.1) * 0.012;
        mainTree.rotation.x = Math.cos(time * 0.85) * 0.008;

        const isWalking = updateControls(delta, camera);
        character.updateAnimation(time, isWalking, delta);

        composer.render();
    }

    animate();

} catch (error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: absolute; top: 20px; left: 20px;
        color: #ff3333; background: rgba(0,0,0,0.85);
        padding: 20px; font-family: monospace; z-index: 9999;
        max-height: 80vh; overflow: auto; border-radius: 8px;
    `;
    errorDiv.innerHTML = `<strong>Error:</strong><br>${error.message}<br><br>${error.stack}`;
    document.body.appendChild(errorDiv);
}

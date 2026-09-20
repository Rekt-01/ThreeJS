import * as THREE from 'three';

export function setupThirdPersonControls(character, renderer) {
    let isDragging = false;
    let previousTouchX = 0;
    let cameraAngleY = 0; // Orbit angle around the character

    // Touch drag on screen rotates the third-person camera view around the character
    window.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            const t = e.touches[0];
            if (t.clientX < 160 && t.clientY > window.innerHeight - 160) return; // Ignore joystick area
            isDragging = true;
            previousTouchX = t.clientX;
        }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging || e.touches.length === 0) return;
        const t = e.touches[0];
        const deltaX = t.clientX - previousTouchX;
        cameraAngleY -= deltaX * 0.005; // Orbit camera around character
        previousTouchX = t.clientX;
    }, { passive: false });

    window.addEventListener('touchend', () => { isDragging = false; });

    // Virtual Joystick UI for walking & steering the character
    const joystickUI = document.createElement('div');
    joystickUI.style.cssText = 'position:fixed; bottom:40px; left:40px; width:130px; height:130px; background:rgba(255,255,255,0.15); border:2px solid rgba(255,255,255,0.3); border-radius:50%; z-index:999; touch-action:none; display:flex; align-items:center; justify-content:center;';
    
    const knob = document.createElement('div');
    knob.style.cssText = 'width:50px; height:50px; background:rgba(255,255,255,0.5); border-radius:50%; position:absolute; pointer-events:none;';
    joystickUI.appendChild(knob);
    document.body.appendChild(joystickUI);

    let joystickActive = false;
    let joystickDirection = new THREE.Vector2(0, 0);

    joystickUI.addEventListener('touchstart', (e) => { joystickActive = true; handleJoystick(e.touches[0]); e.stopPropagation(); }, { passive: false });
    joystickUI.addEventListener('touchmove', (e) => { if (joystickActive) { handleJoystick(e.touches[0]); e.stopPropagation(); } }, { passive: false });
    joystickUI.addEventListener('touchend', (e) => { joystickActive = false; joystickDirection.set(0, 0); knob.style.transform = `translate(0px, 0px)`; e.stopPropagation(); }, { passive: false });

    function handleJoystick(touch) {
        const rect = joystickUI.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;
        const maxRadius = 45;
        const distance = Math.min(maxRadius, Math.sqrt(dx * dx + dy * dy));
        const angle = Math.atan2(dy, dx);
        const knobX = Math.cos(angle) * distance;
        const knobY = Math.sin(angle) * distance;
        knob.style.transform = `translate(${knobX}px, ${knobY}px)`;
        joystickDirection.set(knobX / maxRadius, knobY / maxRadius);
    }

    const keys = { w: false, a: false, s: false, d: false };
    window.addEventListener('keydown', (e) => { if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', (e) => { if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = false; });

    return function updateControls(delta, camera) {
        const speed = 9.0 * delta;
        const turnSpeed = 3.5 * delta;
        let isWalking = false;

        // Steer character direction
        if (joystickActive) {
            character.rotation.y -= joystickDirection.x * turnSpeed;
            if (Math.abs(joystickDirection.y) > 0.1) isWalking = true;
        }

        if (keys.a) { character.rotation.y += turnSpeed * 1.2; isWalking = true; }
        if (keys.d) { character.rotation.y -= turnSpeed * 1.2; isWalking = true; }

        // Move character forward/backward relative to its rotation
        const moveDir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), character.rotation.y);

        if (joystickActive) {
            character.position.addScaledVector(moveDir, -joystickDirection.y * speed);
        }
        if (keys.w) { character.position.addScaledVector(moveDir, speed); isWalking = true; }
        if (keys.s) { character.position.addScaledVector(moveDir, -speed); isWalking = true; }

        // Map boundary limits
        const maxDist = 95;
        character.position.x = Math.max(-maxDist, Math.min(maxDist, character.position.x));
        character.position.z = Math.max(-maxDist, Math.min(maxDist, character.position.z));

        // Smooth Third-Person Camera Follow
        const idealOffset = new THREE.Vector3(
            Math.sin(cameraAngleY) * 5.5, 
            2.4, 
            -Math.cos(cameraAngleY) * 5.5
        ).add(character.position);

        const idealLookAt = character.position.clone().add(new THREE.Vector3(0, 1.1, 0));

        camera.position.lerp(idealOffset, 0.12);
        camera.lookAt(idealLookAt);

        return isWalking;
    };
}

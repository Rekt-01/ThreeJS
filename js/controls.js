import * as THREE from 'three';

export function setupMobileControls(camera, renderer) {
    // 1. Raise camera height for a better field perspective
    camera.position.set(0, 2.8, 15);
    camera.rotation.order = 'YXZ';

    let isDragging = false;
    let previousTouchX = 0;
    let previousTouchY = 0;
    
    // Touch handlers for looking around (right side / free screen drag)
    window.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            const t = e.touches[0];
            // Ignore touches starting on the joystick area
            if (t.clientX < 160 && t.clientY > window.innerHeight - 160) return;

            isDragging = true;
            previousTouchX = t.clientX;
            previousTouchY = t.clientY;
        }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging || e.touches.length === 0) return;
        
        const t = e.touches[0];
        const deltaX = t.clientX - previousTouchX;
        const deltaY = t.clientY - previousTouchY;
        
        camera.rotation.y -= deltaX * 0.004;
        camera.rotation.x -= deltaY * 0.004;
        camera.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, camera.rotation.x));
        
        previousTouchX = t.clientX;
        previousTouchY = t.clientY;
    }, { passive: false });

    window.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Create Virtual Joystick UI
    const joystickUI = document.createElement('div');
    joystickUI.style.cssText = 'position:fixed; bottom:40px; left:40px; width:130px; height:130px; background:rgba(255,255,255,0.15); border:2px solid rgba(255,255,255,0.3); border-radius:50%; z-index:999; touch-action:none; display:flex; align-items:center; justify-content:center;';
    
    const knob = document.createElement('div');
    knob.style.cssText = 'width:50px; height:50px; background:rgba(255,255,255,0.5); border-radius:50%; position:absolute; pointer-events:none;';
    joystickUI.appendChild(knob);
    document.body.appendChild(joystickUI);

    let joystickActive = false;
    let joystickDirection = new THREE.Vector2(0, 0);

    joystickUI.addEventListener('touchstart', (e) => {
        joystickActive = true;
        handleJoystick(e.touches[0]);
        e.stopPropagation();
    }, { passive: false });

    joystickUI.addEventListener('touchmove', (e) => {
        if (joystickActive) {
            handleJoystick(e.touches[0]);
            e.stopPropagation();
        }
    }, { passive: false });

    joystickUI.addEventListener('touchend', (e) => {
        joystickActive = false;
        joystickDirection.set(0, 0);
        knob.style.transform = `translate(0px, 0px)`;
        e.stopPropagation();
    });

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

    // Desktop keyboard fallback (A/D turns or strafes, W/S moves forward/back)
    const keys = { w: false, a: false, s: false, d: false };
    window.addEventListener('keydown', (e) => { if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', (e) => { if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = false; });

    // Update function called inside main animation loop
    return function updateControls(delta) {
        const speed = 11.0 * delta;
        const turnSpeed = 2.2 * delta; // Turning speed when steering left/right

        // If pushing left/right on the joystick, smoothly rotate the camera heading (turning with the control)
        if (joystickActive) {
            camera.rotation.y -= joystickDirection.x * turnSpeed;
        }

        // Desktop keyboard turning/movement support
        if (keys.a) camera.rotation.y += turnSpeed * 1.5;
        if (keys.d) camera.rotation.y -= turnSpeed * 1.5;

        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        dir.y = 0;
        dir.normalize();

        // Forward / Backward motion based on joystick vertical axis or W/S keys
        if (joystickActive) {
            camera.position.addScaledVector(dir, -joystickDirection.y * speed);
        }

        if (keys.w) camera.position.addScaledVector(dir, speed);
        if (keys.s) camera.position.addScaledVector(dir, -speed);

        // Lock camera height
        camera.position.y = 2.8;

        // Boundary constraints
        const maxDist = 95;
        camera.position.x = Math.max(-maxDist, Math.min(maxDist, camera.position.x));
        camera.position.z = Math.max(-maxDist, Math.min(maxDist, camera.position.z));
    };
}

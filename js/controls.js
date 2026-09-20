import * as THREE from 'three';

export function setupMobileControls(camera, renderer) {
    // 1. Raise camera height for a better field perspective (was 1.7)
    camera.position.set(0, 2.8, 15);
    camera.rotation.order = 'YXZ';

    let isDragging = false;
    let previousTouchX = 0;
    let previousTouchY = 0;
    
    // Touch handlers for looking around
    window.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            // Ignore touches that start directly on the joystick UI (bottom-left area)
            const t = e.touches[0];
            if (t.clientX < 150 && t.clientY > window.innerHeight - 150) return;

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
        
        // Slightly increased look sensitivity for snappy mobile response
        camera.rotation.y -= deltaX * 0.004;
        camera.rotation.x -= deltaY * 0.004;
        camera.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, camera.rotation.x));
        
        previousTouchX = t.clientX;
        previousTouchY = t.clientY;
    }, { passive: false });

    window.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Create a larger, more comfortable On-Screen Virtual Joystick UI
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
        e.stopPropagation(); // Prevent trigger conflict with look handler
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

    // Desktop WASD Fallback keys
    const keys = { w: false, a: false, s: false, d: false };
    window.addEventListener('keydown', (e) => { if (e.key in keys) keys[e.key] = true; });
    window.addEventListener('keyup', (e) => { if (e.key in keys) keys[e.key] = false; });

    // Update function called inside the main loop
    return function updateControls(delta) {
        // Increased walking speed multiplier (was 5.0, now 11.0 for snappier travel)
        const speed = 11.0 * delta;
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        dir.y = 0;
        dir.normalize();

        const sideDir = new THREE.Vector3(-dir.z, 0, dir.x);

        if (joystickActive) {
            camera.position.addScaledVector(dir, -joystickDirection.y * speed);
            camera.position.addScaledVector(sideDir, joystickDirection.x * speed);
        }

        if (keys.w) camera.position.addScaledVector(dir, speed);
        if (keys.s) camera.position.addScaledVector(dir, -speed);
        if (keys.a) camera.position.addScaledVector(sideDir, -speed);
        if (keys.d) camera.position.addScaledVector(sideDir, speed);

        // Keep camera locked at the new higher eye-level height
        camera.position.y = 2.8;

        // Boundary constraints
        const maxDist = 95;
        camera.position.x = Math.max(-maxDist, Math.min(maxDist, camera.position.x));
        camera.position.z = Math.max(-maxDist, Math.min(maxDist, camera.position.z));
    };
}

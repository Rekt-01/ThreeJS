import * as THREE from 'three';

export function setupMobileControls(camera, renderer) {
    // Position camera at eye-level in the field
    camera.position.set(0, 1.7, 15);
    camera.rotation.order = 'YXZ';

    let isDragging = false;
    let previousTouchX = 0;
    let previousTouchY = 0;
    
    // Touch handlers for looking around (dragging the screen)
    window.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1 && e.target === renderer.domElement) {
            isDragging = true;
            previousTouchX = e.touches[0].clientX;
            previousTouchY = e.touches[0].clientY;
        }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging || e.touches.length === 0) return;
        
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        
        const deltaX = touchX - previousTouchX;
        const deltaY = touchY - previousTouchY;
        
        camera.rotation.y -= deltaX * 0.003;
        camera.rotation.x -= deltaY * 0.003;
        camera.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, camera.rotation.x));
        
        previousTouchX = touchX;
        previousTouchY = touchY;
    }, { passive: false });

    window.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Create On-Screen Virtual Joystick UI for Walking
    const joystickUI = document.createElement('div');
    joystickUI.style.cssText = 'position:fixed; bottom:30px; left:30px; width:100px; height:100px; background:rgba(255,255,255,0.2); border:2px solid rgba(255,255,255,0.4); border-radius:50%; z-index:999; touch-action:none; display:flex; align-items:center; justify-content:center;';
    
    const knob = document.createElement('div');
    knob.style.cssText = 'width:40px; height:40px; background:rgba(255,255,255,0.6); border-radius:50%; position:absolute;';
    joystickUI.appendChild(knob);
    document.body.appendChild(joystickUI);

    let joystickActive = false;
    let joystickDirection = new THREE.Vector2(0, 0);

    joystickUI.addEventListener('touchstart', (e) => {
        joystickActive = true;
        handleJoystick(e.touches[0]);
    }, { passive: false });

    joystickUI.addEventListener('touchmove', (e) => {
        if (joystickActive) handleJoystick(e.touches[0]);
    }, { passive: false });

    joystickUI.addEventListener('touchend', () => {
        joystickActive = false;
        joystickDirection.set(0, 0);
        knob.style.transform = `translate(0px, 0px)`;
    });

    function handleJoystick(touch) {
        const rect = joystickUI.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;
        
        const distance = Math.min(40, Math.sqrt(dx * dx + dy * dy));
        const angle = Math.atan2(dy, dx);
        
        const knobX = Math.cos(angle) * distance;
        const knobY = Math.sin(angle) * distance;
        knob.style.transform = `translate(${knobX}px, ${knobY}px)`;
        
        joystickDirection.set(knobX / 40, knobY / 40);
    }

    // Desktop WASD Fallback keys
    const keys = { w: false, a: false, s: false, d: false };
    window.addEventListener('keydown', (e) => { if (e.key in keys) keys[e.key] = true; });
    window.addEventListener('keyup', (e) => { if (e.key in keys) keys[e.key] = false; });

    // Update function to be called inside the main loop
    return function updateControls(delta) {
        const speed = 5.0 * delta;
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

        camera.position.y = 1.7; // Lock camera to eye level

        // Boundary constraints
        const maxDist = 95;
        camera.position.x = Math.max(-maxDist, Math.min(maxDist, camera.position.x));
        camera.position.z = Math.max(-maxDist, Math.min(maxDist, camera.position.z));
    };
}

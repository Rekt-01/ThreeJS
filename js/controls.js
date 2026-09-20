import * as THREE from 'three';

export function setupThirdPersonControls(character, renderer) {
    // ── Camera orbit state ──────────────────────────────────
    let cameraAngleY = 0;      // yaw
    let cameraAngleX = 0.25;   // pitch (slight downward look)
    const minPitch = -0.4;
    const maxPitch = 0.85;

    let isDragging = false;
    let previousX = 0;
    let previousY = 0;

    // ── Pointer / Touch look ────────────────────────────────
    const onPointerDown = (e) => {
        // Ignore if touching the joystick area
        if (e.clientX < 180 && e.clientY > window.innerHeight - 180) return;

        isDragging = true;
        previousX = e.clientX ?? e.touches?.[0]?.clientX;
        previousY = e.clientY ?? e.touches?.[0]?.clientY;
    };

    const onPointerMove = (e) => {
        if (!isDragging) return;

        const clientX = e.clientX ?? e.touches?.[0]?.clientX;
        const clientY = e.clientY ?? e.touches?.[0]?.clientY;
        if (clientX === undefined) return;

        const deltaX = clientX - previousX;
        const deltaY = clientY - previousY;

        // Sensitivity
        cameraAngleY -= deltaX * 0.0045;
        cameraAngleX += deltaY * 0.0035;

        // Clamp pitch so you can’t flip the camera
        cameraAngleX = Math.max(minPitch, Math.min(maxPitch, cameraAngleX));

        previousX = clientX;
        previousY = clientY;
    };

    const onPointerUp = () => {
        isDragging = false;
    };

    // Mouse
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    // Touch
    window.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) onPointerDown(e.touches[0]);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) onPointerMove(e.touches[0]);
    }, { passive: false });

    window.addEventListener('touchend', onPointerUp);

    // ── Joystick UI ─────────────────────────────────────────
    const joystickUI = document.createElement('div');
    joystickUI.style.cssText = `
        position: fixed;
        bottom: 36px;
        left: 36px;
        width: 130px;
        height: 130px;
        background: rgba(255,255,255,0.1);
        border: 2px solid rgba(255,255,255,0.22);
        border-radius: 50%;
        z-index: 999;
        touch-action: none;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const knob = document.createElement('div');
    knob.style.cssText = `
        width: 52px;
        height: 52px;
        background: rgba(255,255,255,0.55);
        border-radius: 50%;
        position: absolute;
        pointer-events: none;
        transition: transform 0.05s linear;
    `;
    joystickUI.appendChild(knob);
    document.body.appendChild(joystickUI);

    let joystickActive = false;
    let joystickDir = new THREE.Vector2(0, 0);

    const handleJoystick = (touch) => {
        const rect = joystickUI.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;

        const maxRadius = 42;
        const distance = Math.min(maxRadius, Math.hypot(dx, dy));
        const angle = Math.atan2(dy, dx);

        const knobX = Math.cos(angle) * distance;
        const knobY = Math.sin(angle) * distance;

        knob.style.transform = `translate(${knobX}px, ${knobY}px)`;
        joystickDir.set(knobX / maxRadius, knobY / maxRadius);
    };

    joystickUI.addEventListener('touchstart', (e) => {
        joystickActive = true;
        handleJoystick(e.touches[0]);
        e.stopPropagation();
        e.preventDefault();
    }, { passive: false });

    joystickUI.addEventListener('touchmove', (e) => {
        if (joystickActive) {
            handleJoystick(e.touches[0]);
            e.stopPropagation();
            e.preventDefault();
        }
    }, { passive: false });

    joystickUI.addEventListener('touchend', (e) => {
        joystickActive = false;
        joystickDir.set(0, 0);
        knob.style.transform = `translate(0px, 0px)`;
        e.stopPropagation();
    }, { passive: false });

    // ── Keyboard ────────────────────────────────────────────
    const keys = { w: false, a: false, s: false, d: false };

    window.addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        if (k in keys) keys[k] = true;
    });
    window.addEventListener('keyup', (e) => {
        const k = e.key.toLowerCase();
        if (k in keys) keys[k] = false;
    });

    // ── Main update ─────────────────────────────────────────
    return function updateControls(delta, camera) {
        const moveSpeed = 7.8;
        let isWalking = false;

        // --- Input vector (joystick + keyboard) ---
        const input = new THREE.Vector2(0, 0);

        if (joystickActive) {
            input.x += joystickDir.x;
            input.y += joystickDir.y;
        }

        if (keys.w) input.y -= 1;
        if (keys.s) input.y += 1;
        if (keys.a) input.x -= 1;
        if (keys.d) input.x += 1;

        // Deadzone
        if (input.length() < 0.15) {
            input.set(0, 0);
        } else {
            input.normalize();
            isWalking = true;
        }

        // --- Move relative to camera ---
        if (isWalking) {
            // Forward direction based on camera yaw only
            const forward = new THREE.Vector3(
                Math.sin(cameraAngleY),
                0,
                -Math.cos(cameraAngleY)
            );
            const right = new THREE.Vector3(
                Math.cos(cameraAngleY),
                0,
                Math.sin(cameraAngleY)
            );

            const moveDir = new THREE.Vector3()
                .addScaledVector(forward, -input.y)
                .addScaledVector(right, input.x)
                .normalize();

            character.position.addScaledVector(moveDir, moveSpeed * delta);

            // Smoothly rotate character to face movement direction
            const targetRot = Math.atan2(moveDir.x, moveDir.z);
            let diff = targetRot - character.rotation.y;

            // Shortest angle
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;

            character.rotation.y += diff * Math.min(1, 12 * delta);
        }

        // Clamp world bounds
        const maxDist = 95;
        character.position.x = THREE.MathUtils.clamp(character.position.x, -maxDist, maxDist);
        character.position.z = THREE.MathUtils.clamp(character.position.z, -maxDist, maxDist);

        // --- Camera follow (orbit) ---
        const distance = 5.2;
        const height = 1.9;

        const idealOffset = new THREE.Vector3(
            Math.sin(cameraAngleY) * Math.cos(cameraAngleX) * distance,
            height + Math.sin(cameraAngleX) * distance * 0.7,
            -Math.cos(cameraAngleY) * Math.cos(cameraAngleX) * distance
        );

        const targetPos = character.position.clone().add(idealOffset);
        camera.position.lerp(targetPos, 1 - Math.exp(-8 * delta)); // smooth but responsive

        const lookAt = character.position.clone().add(new THREE.Vector3(0, 1.15, 0));
        camera.lookAt(lookAt);

        return isWalking;
    };
}

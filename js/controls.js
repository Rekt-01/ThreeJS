import * as THREE from 'three';
import { getTerrainHeight } from './environment.js';

export function setupThirdPersonControls(character, renderer) {
    let cameraAngleY = 0;
    let cameraAngleX = 0.32;
    const minPitch = -0.35;
    const maxPitch = 0.75;

    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    // ——— Look controls ———
    const onDown = (e) => {
        const x = e.clientX ?? e.touches?.[0]?.clientX;
        const y = e.clientY ?? e.touches?.[0]?.clientY;
        if (x < 170 && y > window.innerHeight - 170) return; // ignore joystick area

        isDragging = true;
        prevX = x;
        prevY = y;
    };

    const onMove = (e) => {
        if (!isDragging) return;
        const x = e.clientX ?? e.touches?.[0]?.clientX;
        const y = e.clientY ?? e.touches?.[0]?.clientY;
        if (x === undefined) return;

        const dx = x - prevX;
        const dy = y - prevY;

        cameraAngleY -= dx * 0.005;
        cameraAngleX += dy * 0.004;
        cameraAngleX = Math.max(minPitch, Math.min(maxPitch, cameraAngleX));

        prevX = x;
        prevY = y;
    };

    const onUp = () => { isDragging = false; };

    window.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    window.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) onDown(e.touches[0]);
    }, { passive: false });
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) onMove(e.touches[0]);
    }, { passive: false });
    window.addEventListener('touchend', onUp);

    // ——— Joystick ———
    const joy = document.createElement('div');
    joy.style.cssText = `
        position:fixed; bottom:32px; left:32px;
        width:120px; height:120px;
        background:rgba(255,255,255,0.12);
        border:2px solid rgba(255,255,255,0.25);
        border-radius:50%; z-index:999; touch-action:none;
    `;
    const knob = document.createElement('div');
    knob.style.cssText = `
        width:48px; height:48px;
        background:rgba(255,255,255,0.55);
        border-radius:50%; position:absolute;
        left:36px; top:36px; pointer-events:none;
    `;
    joy.appendChild(knob);
    document.body.appendChild(joy);

    let joyActive = false;
    let joyDir = new THREE.Vector2();

    const updateJoy = (touch) => {
        const rect = joy.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = touch.clientX - cx;
        let dy = touch.clientY - cy;
        const max = 38;
        const len = Math.min(max, Math.hypot(dx, dy));
        const ang = Math.atan2(dy, dx);
        const kx = Math.cos(ang) * len;
        const ky = Math.sin(ang) * len;
        knob.style.transform = `translate(${kx}px, ${ky}px)`;
        joyDir.set(kx / max, -ky / max);
    };

    joy.addEventListener('touchstart', e => {
        joyActive = true;
        updateJoy(e.touches[0]);
        e.preventDefault();
        e.stopPropagation();
    }, { passive: false });

    joy.addEventListener('touchmove', e => {
        if (joyActive) {
            updateJoy(e.touches[0]);
            e.preventDefault();
            e.stopPropagation();
        }
    }, { passive: false });

    joy.addEventListener('touchend', e => {
        joyActive = false;
        joyDir.set(0, 0);
        knob.style.transform = 'translate(0,0)';
        e.stopPropagation();
    });

    // ——— Keyboard ———
    const keys = { w: false, a: false, s: false, d: false };
    window.addEventListener('keydown', e => {
        const k = e.key.toLowerCase();
        if (k in keys) keys[k] = true;
    });
    window.addEventListener('keyup', e => {
        const k = e.key.toLowerCase();
        if (k in keys) keys[k] = false;
    });

    // ——— Update loop ———
    return function updateControls(delta, camera) {
        const speed = 8.5;
        let walking = false;

        const input = new THREE.Vector2();
        if (joyActive) input.add(joyDir);
        if (keys.w) input.y += 1;
        if (keys.s) input.y -= 1;
        if (keys.a) input.x -= 1;
        if (keys.d) input.x += 1;

        if (input.length() > 0.15) {
            input.normalize();
            walking = true;

            // Match camera look direction on the ground plane
            // (camera sits at sin(y), -cos(y) relative to the character)
            const forward = new THREE.Vector3(
                -Math.sin(cameraAngleY),
                0,
                Math.cos(cameraAngleY)
            );
            const right = new THREE.Vector3(
                Math.cos(cameraAngleY),
                0,
                Math.sin(cameraAngleY)
            );

            const move = new THREE.Vector3()
                .addScaledVector(forward, input.y)
                .addScaledVector(right, input.x)
                .normalize();

            character.position.addScaledVector(move, speed * delta);

            const targetAngle = Math.atan2(move.x, move.z);
            let diff = targetAngle - character.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            character.rotation.y += diff * Math.min(1, 10 * delta);
        }

        // Terrain height + walk/idle bob from character.js
        const h = getTerrainHeight(character.position.x, character.position.z);
        const bob = character.userData.verticalBob || 0;
        character.position.y = h + bob;

        const max = 90;
        character.position.x = THREE.MathUtils.clamp(character.position.x, -max, max);
        character.position.z = THREE.MathUtils.clamp(character.position.z, -max, max);

        const dist = 5.4;
        const offset = new THREE.Vector3(
            Math.sin(cameraAngleY) * Math.cos(cameraAngleX) * dist,
            1.7 + Math.sin(cameraAngleX) * dist * 0.65,
            -Math.cos(cameraAngleY) * Math.cos(cameraAngleX) * dist
        );

        const targetCam = character.position.clone().add(offset);
        camera.position.lerp(targetCam, 1 - Math.exp(-10 * delta));

        const look = character.position.clone().add(new THREE.Vector3(0, 1.3, 0));
        camera.lookAt(look);

        return walking;
    };
}

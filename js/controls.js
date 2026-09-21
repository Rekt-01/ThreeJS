import * as THREE from 'three';
import { getTerrainHeight } from './environment.js';

export function setupThirdPersonControls(character, renderer) {
    let cameraAngleX = 0.32;
    let cameraDistance = 5.4;
    let currentCamYaw = 0; // Tracks smooth camera lag rotation
    
    const minPitch = -0.35;
    const maxPitch = 0.75;

    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    let isCinematic = true;
    let cinematicTimer = 0;
    const cinematicDuration = 3.5;

    const onDown = (e) => {
        if (isCinematic) return;
        const x = e.clientX ?? e.touches?.[0]?.clientX;
        const y = e.clientY ?? e.touches?.[0]?.clientY;
        if (x < 170 && y > window.innerHeight - 170) return;

        isDragging = true;
        prevX = x;
        prevY = y;
    };

    const onMove = (e) => {
        if (isCinematic || !isDragging) return;
        const x = e.clientX ?? e.touches?.[0]?.clientX;
        const y = e.clientY ?? e.touches?.[0]?.clientY;
        if (x === undefined) return;

        const dx = x - prevX;
        const dy = y - prevY;

        character.rotation.y -= dx * 0.005;
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
        if (isCinematic) return;
        joyActive = true;
        updateJoy(e.touches[0]);
        e.preventDefault();
        e.stopPropagation();
    }, { passive: false });

    joy.addEventListener('touchmove', e => {
        if (isCinematic) return;
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

    const keys = { w: false, a: false, s: false, d: false };
    window.addEventListener('keydown', e => {
        if (isCinematic) return;
        const k = e.key.toLowerCase();
        if (k in keys) keys[k] = true;
    });
    window.addEventListener('keyup', e => {
        const k = e.key.toLowerCase();
        if (k in keys) keys[k] = false;
    });

    return function updateControls(delta, camera) {
        const speed = 8.5;
        let walking = false;

        if (isCinematic) {
            cinematicTimer += delta;
            const progress = cinematicTimer / cinematicDuration;

            const cinematicAngle = progress * Math.PI * 1.5; 
            const cineDist = cameraDistance + Math.sin(progress * Math.PI) * 2;
            
            const offsetX = Math.sin(cinematicAngle) * Math.cos(cameraAngleX) * cineDist;
            const offsetZ = Math.cos(cinematicAngle) * Math.cos(cameraAngleX) * cineDist;
            const offsetY = 1.7 + Math.sin(cameraAngleX) * cineDist * 0.65;

            camera.position.set(
                character.position.x + offsetX,
                character.position.y + offsetY,
                character.position.z + offsetZ
            );
            camera.lookAt(character.position.clone().add(new THREE.Vector3(0, 1.3, 0)));

            if (cinematicTimer >= cinematicDuration) {
                isCinematic = false;
                currentCamYaw = character.rotation.y; // Sync camera yaw when entering game
            }
            return false;
        }

        const input = new THREE.Vector2();
        if (joyActive) input.add(joyDir);
        
        if (keys.w) input.y += 1;
        if (keys.s) input.y -= 1;
        if (keys.a) input.x -= 1;
        if (keys.d) input.x += 1;

        if (input.length() > 0.15) {
            input.normalize();
            walking = true;

            const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), character.rotation.y);
            const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), character.rotation.y);

            const move = new THREE.Vector3()
                .addScaledVector(forward, input.y)
                .addScaledVector(right, input.x)
                .normalize();

            character.position.addScaledVector(move, speed * delta);

            if (keys.a && !isDragging) character.rotation.y += 2.5 * delta;
            if (keys.d && !isDragging) character.rotation.y -= 2.5 * delta;
        }

        const FOOT_OFFSET = 0.16;
        const h = getTerrainHeight(character.position.x, character.position.z);
        const bob = character.userData.verticalBob || 0;
        character.position.y = h - FOOT_OFFSET + bob;

        const max = 90;
        character.position.x = THREE.MathUtils.clamp(character.position.x, -max, max);
        character.position.z = THREE.MathUtils.clamp(character.position.z, -max, max);

        // Smoothly lag camera yaw behind character rotation for fluid cinematic feel
        let targetYaw = character.rotation.y;
        let yawDiff = targetYaw - currentCamYaw;
        while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
        while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
        currentCamYaw += yawDiff * Math.min(1, 6 * delta);

        const offsetX = Math.sin(currentCamYaw) * Math.cos(cameraAngleX) * cameraDistance;
        const offsetZ = Math.cos(currentCamYaw) * Math.cos(cameraAngleX) * cameraDistance;
        const offsetY = 1.7 + Math.sin(cameraAngleX) * cameraDistance * 0.65;

        const targetCamPos = new THREE.Vector3(
            character.position.x + offsetX,
            character.position.y + offsetY,
            character.position.z + offsetZ
        );

        camera.position.lerp(targetCamPos, 1 - Math.exp(-10 * delta));
        camera.lookAt(character.position.clone().add(new THREE.Vector3(0, 1.3, 0)));

        return walking;
    };
}

import * as THREE from 'three';

export function createProceduralCharacter() {
    const characterGroup = new THREE.Group();

    // Materials matching the style
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.5 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x4a3319, roughness: 0.8 }); // Brown hair/hood
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xdc3545, roughness: 0.4 }); // Bright Red shirt[span_1](start_span)[span_1](end_span)
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.6 }); 
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.7 }); 
    const maskMat = new THREE.MeshStandardMaterial({ color: 0xf8f9fa, roughness: 0.3 }); // White hockey mask[span_2](start_span)[span_2](end_span)
    const darkSlotMat = new THREE.MeshBasicMaterial({ color: 0x111111 }); // Dark eyes/holes[span_3](start_span)[span_3](end_span)

    // 1. Head & Hair
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.45;

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), skinMat);
    head.scale.set(1, 1.2, 1);
    headGroup.add(head);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.138, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
    hair.position.set(0, 0.03, -0.01);
    headGroup.add(hair);

    // 2. Hockey Mask (Attached to face)[span_4](start_span)[span_4](end_span)
    const maskGroup = new THREE.Group();
    maskGroup.position.set(0, 0, 0.03);

    // Main white mask plate
    const maskPlate = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 0.04), maskMat);
    maskGroup.add(maskPlate);

    // Cross Eyes (Dark cross shapes)[span_5](start_span)[span_5](end_span)
    const eyeHoleGeo = new THREE.BoxGeometry(0.035, 0.035, 0.05);
    
    // Left Cross Eye
    const leftEyeH = new THREE.Mesh(eyeHoleGeo, darkSlotMat);
    leftEyeH.position.set(-0.05, 0.04, 0.01);
    const leftEyeV = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.05, 0.05), darkSlotMat);
    leftEyeV.position.set(-0.05, 0.04, 0.01);

    // Right Cross Eye
    const rightEyeH = new THREE.Mesh(eyeHoleGeo, darkSlotMat);
    rightEyeH.position.set(0.05, 0.04, 0.01);
    const rightEyeV = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.05, 0.05), darkSlotMat);
    rightEyeV.position.set(0.05, 0.04, 0.01);

    maskGroup.add(leftEyeH, leftEyeV, rightEyeH, rightEyeV);

    // Mouth / Jaw Ventilation Slots[span_6](start_span)[span_6](end_span)
    for (let i = -1; i <= 1; i++) {
        const slot = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.05), darkSlotMat);
        slot.position.set(i * 0.035, -0.07, 0.01);
        maskGroup.add(slot);
    }
    for (let i = -1; i <= 1; i++) {
        const slot = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.05), darkSlotMat);
        slot.position.set(i * 0.035, -0.11, 0.01);
        maskGroup.add(slot);
    }

    headGroup.add(maskGroup);
    characterGroup.add(headGroup);

    // 3. Torso (Red Shirt)[span_7](start_span)[span_7](end_span)
    const torsoGeo = new THREE.CylinderGeometry(0.18, 0.11, 0.55, 12);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 0.95;
    torso.castShadow = true;
    characterGroup.add(torso);

    // 4. Limbs Group
    const limbsGroup = new THREE.Group();

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.04, 0.032, 0.48, 8);
    armGeo.translate(0, -0.2, 0);

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.21, 1.15, 0);
    leftArmGroup.add(new THREE.Mesh(armGeo, shirtMat));
    limbsGroup.add(leftArmGroup);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.21, 1.15, 0);
    rightArmGroup.add(new THREE.Mesh(armGeo, shirtMat));
    limbsGroup.add(rightArmGroup);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.055, 0.04, 0.55, 8);
    legGeo.translate(0, -0.25, 0);

    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.08, 0.68, 0);
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.14), shoeMat);
    leftShoe.position.set(0, -0.52, 0.03);
    leftLegGroup.add(leftLeg, leftShoe);
    limbsGroup.add(leftLegGroup);

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.08, 0.68, 0);
    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.14), shoeMat);
    rightShoe.position.set(0, -0.52, 0.03);
    rightLegGroup.add(rightLeg, rightShoe);
    limbsGroup.add(rightLegGroup);

    characterGroup.add(limbsGroup);

    let walkCycle = 0;

    return {
        mesh: characterGroup,
        updateAnimation: (time, isWalking, delta) => {
            if (isWalking) {
                walkCycle += delta * 14;
                limbsGroup.position.y = Math.sin(walkCycle * 2) * 0.04;
                torso.rotation.z = Math.sin(walkCycle) * 0.03;

                leftArmGroup.rotation.x = Math.sin(walkCycle) * 0.6;
                rightArmGroup.rotation.x = -Math.sin(walkCycle) * 0.6;
                leftLegGroup.rotation.x = -Math.sin(walkCycle) * 0.6;
                rightLegGroup.rotation.x = Math.sin(walkCycle) * 0.6;
            } else {
                walkCycle = 0;
                limbsGroup.position.y = THREE.MathUtils.lerp(limbsGroup.position.y, Math.sin(time * 2) * 0.008, 0.1);
                torso.rotation.z = THREE.MathUtils.lerp(torso.rotation.z, 0, 0.1);
                leftArmGroup.rotation.x = THREE.MathUtils.lerp(leftArmGroup.rotation.x, 0, 0.1);
                rightArmGroup.rotation.x = THREE.MathUtils.lerp(rightArmGroup.rotation.x, 0, 0.1);
                leftLegGroup.rotation.x = THREE.MathUtils.lerp(leftLegGroup.rotation.x, 0, 0.1);
                rightLegGroup.rotation.x = THREE.MathUtils.lerp(rightLegGroup.rotation.x, 0, 0.1);
            }
        }
    };
}

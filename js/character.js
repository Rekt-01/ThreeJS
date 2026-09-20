import * as THREE from 'three';

export function createProceduralCharacter() {
    const characterGroup = new THREE.Group();

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.5 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x2c1d11, roughness: 0.8 }); 
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 }); 
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x2980b9, roughness: 0.4 }); 
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1a252f, roughness: 0.6 }); 
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.7 }); 

    // 1. Head & Face
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.45;

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), skinMat);
    head.scale.set(1, 1.2, 1); // Oval human head shape
    headGroup.add(head);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.138, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), hairMat);
    hair.position.set(0, 0.02, -0.01);
    headGroup.add(hair);

    const eyeGeo = new THREE.SphereGeometry(0.015, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.04, 0.02, 0.11);
    const rightEye = leftEye.clone();
    rightEye.position.x = 0.04;
    headGroup.add(leftEye, rightEye);

    characterGroup.add(headGroup);

    // 2. Torso (Tapered so it's not a barrel)
    // Top is wider (shoulders), bottom is narrower (waist)
    const torsoGeo = new THREE.CylinderGeometry(0.18, 0.11, 0.55, 12);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 0.95;
    torso.castShadow = true;
    characterGroup.add(torso);

    // 3. Limbs Group
    const limbsGroup = new THREE.Group();

    // Arms (Slender)
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

    // Legs (Slender & Athletic)
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

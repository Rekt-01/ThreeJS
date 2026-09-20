import * as THREE from 'three';

export function createProceduralCharacter() {
    const characterGroup = new THREE.Group();

    // High-fidelity stylized materials
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.5 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x2c1d11, roughness: 0.8 }); 
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 }); 
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x2980b9, roughness: 0.4 }); 
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }); 
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.6 }); 
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.7 }); 

    // 1. Head & Facial Features
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.52;

    const headGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.castShadow = true;
    headGroup.add(head);

    // Procedural Layered Hair Volume
    const hairGeo = new THREE.SphereGeometry(0.168, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.02, -0.01);
    hair.rotation.x = -0.15;
    headGroup.add(hair);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.022, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.055, 0.02, 0.14);
    const rightEye = leftEye.clone();
    rightEye.position.x = 0.055;
    headGroup.add(leftEye, rightEye);

    // Nose bridge
    const noseGeo = new THREE.BoxGeometry(0.025, 0.04, 0.03);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.position.set(0, -0.01, 0.155);
    headGroup.add(nose);

    characterGroup.add(headGroup);

    // 2. Torso & Collar
    const torsoGeo = new THREE.CylinderGeometry(0.22, 0.16, 0.65, 12);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 1.05;
    torso.castShadow = true;
    characterGroup.add(torso);

    const collarGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 12);
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.y = 1.35;
    characterGroup.add(collar);

    // 3. Limbs Group (with hands and structured joints)
    const limbsGroup = new THREE.Group();

    // Arms with Hands
    const armGeo = new THREE.CylinderGeometry(0.055, 0.045, 0.52, 8);
    armGeo.translate(0, -0.23, 0);
    const handGeo = new THREE.SphereGeometry(0.045, 8, 8);

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.28, 1.32, 0);
    const leftArm = new THREE.Mesh(armGeo, shirtMat);
    const leftHand = new THREE.Mesh(handGeo, skinMat);
    leftHand.position.set(0, -0.5, 0);
    leftArmGroup.add(leftArm, leftHand);
    limbsGroup.add(leftArmGroup);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.28, 1.32, 0);
    const rightArm = new THREE.Mesh(armGeo, shirtMat);
    const rightHand = new THREE.Mesh(handGeo, skinMat);
    rightHand.position.set(0, -0.5, 0);
    rightArmGroup.add(rightArm, rightHand);
    limbsGroup.add(rightArmGroup);

    // Legs with Shoes
    const legGeo = new THREE.CylinderGeometry(0.075, 0.055, 0.58, 8);
    legGeo.translate(0, -0.29, 0);
    
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.12, 0.72, 0);
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.075, 0.18), shoeMat);
    leftShoe.position.set(0, -0.59, 0.04);
    leftLegGroup.add(leftLeg, leftShoe);
    limbsGroup.add(leftLegGroup);

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.12, 0.72, 0);
    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.075, 0.18), shoeMat);
    rightShoe.position.set(0, -0.59, 0.04);
    rightLegGroup.add(rightLeg, rightShoe);
    limbsGroup.add(rightLegGroup);

    characterGroup.add(limbsGroup);

    let currentWalkCycle = 0;

    return {
        mesh: characterGroup,
        updateAnimation: (time, isWalking, delta) => {
            if (isWalking) {
                currentWalkCycle += delta * 13;

                // Fluid walking physics: vertical bounce, torso torsion, and head stabilizing balance
                limbsGroup.position.y = Math.sin(currentWalkCycle * 2) * 0.065;
                torso.rotation.z = Math.sin(currentWalkCycle) * 0.06;
                headGroup.rotation.z = -Math.sin(currentWalkCycle) * 0.04;
                headGroup.rotation.y = Math.sin(currentWalkCycle * 0.5) * 0.05; // Slight natural head turning

                leftArmGroup.rotation.x = Math.sin(currentWalkCycle) * 0.75;
                rightArmGroup.rotation.x = -Math.sin(currentWalkCycle) * 0.75;
                
                leftLegGroup.rotation.x = -Math.sin(currentWalkCycle) * 0.75;
                rightLegGroup.rotation.x = Math.sin(currentWalkCycle) * 0.75;
            } else {
                // Lifelike idle breathing pose with subtle weight shifting
                currentWalkCycle = 0;
                limbsGroup.position.y = THREE.MathUtils.lerp(limbsGroup.position.y, Math.sin(time * 2.5) * 0.012, 0.1);
                torso.rotation.z = THREE.MathUtils.lerp(torso.rotation.z, 0, 0.1);
                headGroup.rotation.z = THREE.MathUtils.lerp(headGroup.rotation.z, 0, 0.1);
                headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, 0, 0.1);
                
                leftArmGroup.rotation.x = THREE.MathUtils.lerp(leftArmGroup.rotation.x, 0, 0.1);
                rightArmGroup.rotation.x = THREE.MathUtils.lerp(rightArmGroup.rotation.x, 0, 0.1);
                leftLegGroup.rotation.x = THREE.MathUtils.lerp(leftLegGroup.rotation.x, 0, 0.1);
                rightLegGroup.rotation.x = THREE.MathUtils.lerp(rightLegGroup.rotation.x, 0, 0.1);
            }
        }
    };
}

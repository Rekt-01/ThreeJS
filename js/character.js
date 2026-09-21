import * as THREE from 'three';

export function createProceduralCharacter() {
    const character = new THREE.Group();

    // ── Materials (flat, bold, stylized) ─────────────────────
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffcc99 });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x3b2a1a });
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f });
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const bootMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const maskMat = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
    const darkMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const strapMat = new THREE.MeshLambertMaterial({ color: 0x222222 });

    // ── HEAD (oversized for stylized look) ───────────────────
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.55;

    const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.36, 0.30),
        skinMat
    );
    headGroup.add(head);

    const hair = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.18, 0.32),
        hairMat
    );
    hair.position.y = 0.14;
    headGroup.add(hair);

    // ── HOCKEY MASK ──────────────────────────────────────────
    const maskGroup = new THREE.Group();
    maskGroup.position.set(0, 0.02, 0.16);

    const mask = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.38, 0.06),
        maskMat
    );
    maskGroup.add(mask);

    const eyeH = new THREE.BoxGeometry(0.07, 0.025, 0.08);
    const eyeV = new THREE.BoxGeometry(0.025, 0.09, 0.08);

    const leftH = new THREE.Mesh(eyeH, darkMat);
    leftH.position.set(-0.08, 0.07, 0.02);
    const leftV = new THREE.Mesh(eyeV, darkMat);
    leftV.position.set(-0.08, 0.07, 0.02);

    const rightH = new THREE.Mesh(eyeH, darkMat);
    rightH.position.set(0.08, 0.07, 0.02);
    const rightV = new THREE.Mesh(eyeV, darkMat);
    rightV.position.set(0.08, 0.07, 0.02);

    maskGroup.add(leftH, leftV, rightH, rightV);

    for (let i = -1; i <= 1; i++) {
        const vent = new THREE.Mesh(
            new THREE.BoxGeometry(0.03, 0.07, 0.08),
            darkMat
        );
        vent.position.set(i * 0.07, -0.09, 0.02);
        maskGroup.add(vent);
    }

    const leftStrap = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.08, 0.18),
        strapMat
    );
    leftStrap.position.set(-0.18, 0.02, -0.05);
    const rightStrap = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.08, 0.18),
        strapMat
    );
    rightStrap.position.set(0.18, 0.02, -0.05);
    maskGroup.add(leftStrap, rightStrap);

    headGroup.add(maskGroup);
    character.add(headGroup);

    // ── TORSO ────────────────────────────────────────────────
    const torso = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.55, 0.28),
        shirtMat
    );
    torso.position.y = 1.05;
    torso.castShadow = true;
    character.add(torso);

    const collar = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.08, 0.30),
        shirtMat
    );
    collar.position.y = 1.34;
    character.add(collar);

    // ── ARMS ─────────────────────────────────────────────────
    const armGeo = new THREE.BoxGeometry(0.12, 0.42, 0.12);
    const handGeo = new THREE.BoxGeometry(0.11, 0.11, 0.11);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.28, 1.22, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, shirtMat);
    leftArmMesh.position.y = -0.18;
    leftArm.add(leftArmMesh);
    const leftHand = new THREE.Mesh(handGeo, skinMat);
    leftHand.position.y = -0.46;
    leftArm.add(leftHand);
    character.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.28, 1.22, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, shirtMat);
    rightArmMesh.position.y = -0.18;
    rightArm.add(rightArmMesh);
    const rightHand = new THREE.Mesh(handGeo, skinMat);
    rightHand.position.y = -0.46;
    rightArm.add(rightHand);
    character.add(rightArm);

    // ── LEGS ─────────────────────────────────────────────────
    const legGeo = new THREE.BoxGeometry(0.15, 0.52, 0.15);

    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.12, 0.72, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLegMesh.position.y = -0.20;
    leftLeg.add(leftLegMesh);

    const bootGeo = new THREE.BoxGeometry(0.16, 0.12, 0.22);
    const leftBoot = new THREE.Mesh(bootGeo, bootMat);
    leftBoot.position.set(0, -0.50, 0.03);
    leftLeg.add(leftBoot);
    character.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.12, 0.72, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rightLegMesh.position.y = -0.20;
    rightLeg.add(rightLegMesh);
    const rightBoot = new THREE.Mesh(bootGeo, bootMat);
    rightBoot.position.set(0, -0.50, 0.03);
    rightLeg.add(rightBoot);
    character.add(rightLeg);

    // ── Animation ────────────────────────────────────────────
    let phase = 0;

    return {
        mesh: character,

        updateAnimation: (time, isWalking, delta) => {
            if (isWalking) {
                phase += delta * 10;

                const swing = Math.sin(phase);
                const bob = Math.sin(phase * 2) * 0.04;

                // Only store bob — controls owns world Y (terrain + offset)
                character.userData.verticalBob = bob;

                leftArm.rotation.x = swing * 0.7;
                rightArm.rotation.x = -swing * 0.7;
                leftLeg.rotation.x = -swing * 0.65;
                rightLeg.rotation.x = swing * 0.65;
                torso.rotation.y = swing * 0.08;
                headGroup.rotation.y = -swing * 0.1;

            } else {
                phase = 0;
                const breath = Math.sin(time * 2) * 0.015;
                character.userData.verticalBob = breath;

                leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0.1, 0.1);
                rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, -0.1, 0.1);
                leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, 0.1);
                rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, 0.1);
                torso.rotation.y = THREE.MathUtils.lerp(torso.rotation.y, 0, 0.1);
                headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, 0, 0.1);
            }
        }
    };
}

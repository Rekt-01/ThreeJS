updateAnimation: (time, isWalking, delta) => {
    if (isWalking) {
        phase += delta * 10;
        const swing = Math.sin(phase);

        leftArm.rotation.x = swing * 0.7;
        rightArm.rotation.x = -swing * 0.7;
        leftLeg.rotation.x = -swing * 0.65;
        rightLeg.rotation.x = swing * 0.65;
        torso.rotation.y = swing * 0.08;
        headGroup.rotation.y = -swing * 0.1;
    } else {
        phase = 0;
        leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0.08, 0.1);
        rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, -0.08, 0.1);
        leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, 0.1);
        rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, 0.1);
        torso.rotation.y = THREE.MathUtils.lerp(torso.rotation.y, 0, 0.1);
        headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, 0, 0.1);
    }
}

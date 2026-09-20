import * as THREE from 'three';

export function createEnvironment(scene) {
    // ─────────────────────────────────────
    // Ground with subtle height variation
    // ─────────────────────────────────────
    const size = 220;
    const segments = 64;
    const groundGeo = new THREE.PlaneGeometry(size, size, segments, segments);

    // Simple procedural hills
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i); // this is actually Z in world after rotation

        const hill1 = Math.sin(x * 0.035) * Math.cos(y * 0.028) * 1.8;
        const hill2 = Math.sin(x * 0.06 + 2.1) * Math.cos(y * 0.05) * 0.9;
        const noise = (Math.random() - 0.5) * 0.25;

        pos.setZ(i, hill1 + hill2 + noise);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x4a7a28,
        roughness: 0.9,
        metalness: 0.02,
        flatShading: false
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ─────────────────────────────────────
    // Dirt paths
    // ─────────────────────────────────────
    const pathMat = new THREE.MeshStandardMaterial({
        color: 0x8b6914,
        roughness: 0.95
    });

    function createPath(points, width = 2.8) {
        const curve = new THREE.CatmullRomCurve3(points);
        const pathGeo = new THREE.TubeGeometry(curve, 64, width * 0.5, 8, false);
        // Flatten it
        const path = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            pathMat
        );
        // Simpler flat path approach for performance
        const shape = new THREE.Shape();
        // We'll use multiple planes instead for simplicity & performance
    }

    // Simple flat dirt paths (performance friendly)
    const path1 = new THREE.Mesh(
        new THREE.PlaneGeometry(48, 3.2),
        pathMat
    );
    path1.rotation.x = -Math.PI / 2;
    path1.position.set(5, 0.04, -4);
    path1.rotation.z = 0.4;
    path1.receiveShadow = true;
    scene.add(path1);

    const path2 = new THREE.Mesh(
        new THREE.PlaneGeometry(32, 2.8),
        pathMat
    );
    path2.rotation.x = -Math.PI / 2;
    path2.position.set(-8, 0.04, 10);
    path2.rotation.z = -0.7;
    path2.receiveShadow = true;
    scene.add(path2);

    // ─────────────────────────────────────
    // Improved grass (follows terrain better)
    // ─────────────────────────────────────
    const grassBladeGeo = new THREE.ConeGeometry(0.045, 0.65, 3);
    grassBladeGeo.translate(0, 0.32, 0);

    const grassMat = new THREE.MeshStandardMaterial({
        color: 0x5ca32e,
        roughness: 0.75,
        side: THREE.DoubleSide
    });

    const grassCount = 18000;
    const grass = new THREE.InstancedMesh(grassBladeGeo, grassMat, grassCount);
    grass.receiveShadow = true;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < grassCount; i++) {
        const radius = 3 + Math.random() * 55;
        const theta = Math.random() * Math.PI * 2;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;

        // Approximate height from the hills formula
        const hill1 = Math.sin(x * 0.035) * Math.cos(z * 0.028) * 1.8;
        const hill2 = Math.sin(x * 0.06 + 2.1) * Math.cos(z * 0.05) * 0.9;

        dummy.position.set(x, hill1 + hill2, z);
        dummy.scale.setScalar(0.6 + Math.random() * 0.9);
        dummy.rotation.y = Math.random() * Math.PI;
        dummy.rotation.x = (Math.random() - 0.5) * 0.2;
        dummy.updateMatrix();
        grass.setMatrixAt(i, dummy.matrix);
    }
    scene.add(grass);
}

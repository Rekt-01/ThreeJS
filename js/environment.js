import * as THREE from 'three';

// Height function used by controls so the character stays on the ground
export function getTerrainHeight(x, z) {
    const hill1 = Math.sin(x * 0.035) * Math.cos(z * 0.028) * 1.8;
    const hill2 = Math.sin(x * 0.06 + 2.1) * Math.cos(z * 0.05) * 0.9;
    return hill1 + hill2;
}

export function createEnvironment(scene) {
    // ─────────────────────────────────────
    // Ground with subtle rolling hills
    // ─────────────────────────────────────
    const size = 220;
    const segments = 64;
    const groundGeo = new THREE.PlaneGeometry(size, size, segments, segments);

    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i); // becomes Z after rotation

        const height = getTerrainHeight(x, y);
        pos.setZ(i, height);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x4a7a28,
        roughness: 0.9,
        metalness: 0.02
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

    const path1 = new THREE.Mesh(
        new THREE.PlaneGeometry(48, 3.2),
        pathMat
    );
    path1.rotation.x = -Math.PI / 2;
    path1.position.set(5, 0.06, -4);
    path1.rotation.z = 0.4;
    path1.receiveShadow = true;
    scene.add(path1);

    const path2 = new THREE.Mesh(
        new THREE.PlaneGeometry(32, 2.8),
        pathMat
    );
    path2.rotation.x = -Math.PI / 2;
    path2.position.set(-8, 0.06, 10);
    path2.rotation.z = -0.7;
    path2.receiveShadow = true;
    scene.add(path2);

    // ─────────────────────────────────────
    // Grass
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

        const h = getTerrainHeight(x, z);

        dummy.position.set(x, h, z);
        dummy.scale.setScalar(0.6 + Math.random() * 0.9);
        dummy.rotation.y = Math.random() * Math.PI;
        dummy.rotation.x = (Math.random() - 0.5) * 0.2;
        dummy.updateMatrix();
        grass.setMatrixAt(i, dummy.matrix);
    }
    scene.add(grass);
}

import * as THREE from 'three';

export function createLandmarks(scene) {
    const group = new THREE.Group();

    // ─────────────────────────────────────
    // Ancient Stone Circle (main landmark)
    // ─────────────────────────────────────
    const stoneMat = new THREE.MeshStandardMaterial({
        color: 0x6b6b6b,
        roughness: 0.92,
        metalness: 0.05,
        flatShading: true
    });

    const mossMat = new THREE.MeshStandardMaterial({
        color: 0x4a7c3a,
        roughness: 0.85,
        flatShading: true
    });

    const circleCenter = new THREE.Vector3(18, 0, -12);
    const radius = 11;
    const stoneCount = 9;

    for (let i = 0; i < stoneCount; i++) {
        const angle = (i / stoneCount) * Math.PI * 2;
        const x = circleCenter.x + Math.cos(angle) * radius;
        const z = circleCenter.z + Math.sin(angle) * radius;

        const height = 2.8 + Math.random() * 2.4;
        const width = 0.9 + Math.random() * 0.7;
        const depth = 0.55 + Math.random() * 0.4;

        const stone = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            stoneMat
        );
        stone.position.set(x, height / 2, z);
        stone.rotation.y = angle + Math.PI / 2 + (Math.random() - 0.5) * 0.3;
        stone.rotation.z = (Math.random() - 0.5) * 0.15;
        stone.castShadow = true;
        stone.receiveShadow = true;
        group.add(stone);

        // Moss patches on some stones
        if (Math.random() > 0.4) {
            const moss = new THREE.Mesh(
                new THREE.BoxGeometry(width * 0.7, 0.25, depth * 0.6),
                mossMat
            );
            moss.position.set(x, height * 0.6 + (Math.random() - 0.5), z);
            moss.rotation.copy(stone.rotation);
            group.add(moss);
        }
    }

    // Central altar stone
    const altar = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.7, 1.9),
        stoneMat
    );
    altar.position.set(circleCenter.x, 0.35, circleCenter.z);
    altar.castShadow = true;
    altar.receiveShadow = true;
    group.add(altar);

    // ─────────────────────────────────────
    // Small Abandoned Wooden Shrine
    // ─────────────────────────────────────
    const woodMat = new THREE.MeshStandardMaterial({
        color: 0x5c4033,
        roughness: 0.88,
        flatShading: true
    });
    const darkWoodMat = new THREE.MeshStandardMaterial({
        color: 0x3a2a22,
        roughness: 0.9,
        flatShading: true
    });

    const shrinePos = new THREE.Vector3(-22, 0, 16);

    // Floor platform
    const platform = new THREE.Mesh(
        new THREE.BoxGeometry(5.5, 0.35, 4.2),
        woodMat
    );
    platform.position.set(shrinePos.x, 0.18, shrinePos.z);
    platform.receiveShadow = true;
    group.add(platform);

    // Back wall
    const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(5.2, 3.2, 0.3),
        woodMat
    );
    backWall.position.set(shrinePos.x, 1.8, shrinePos.z - 1.8);
    backWall.castShadow = true;
    group.add(backWall);

    // Side walls (partially collapsed feel)
    const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 2.6, 3.4),
        woodMat
    );
    leftWall.position.set(shrinePos.x - 2.5, 1.5, shrinePos.z - 0.2);
    leftWall.castShadow = true;
    group.add(leftWall);

    const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 1.9, 2.8),
        woodMat
    );
    rightWall.position.set(shrinePos.x + 2.5, 1.15, shrinePos.z + 0.1);
    rightWall.rotation.z = 0.18;
    rightWall.castShadow = true;
    group.add(rightWall);

    // Roof (tilted / broken)
    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(5.8, 0.25, 4.6),
        darkWoodMat
    );
    roof.position.set(shrinePos.x, 3.4, shrinePos.z - 0.3);
    roof.rotation.x = -0.22;
    roof.rotation.z = 0.08;
    roof.castShadow = true;
    group.add(roof);

    // Simple offering table inside
    const table = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.7, 0.8),
        darkWoodMat
    );
    table.position.set(shrinePos.x, 0.7, shrinePos.z - 0.6);
    table.castShadow = true;
    group.add(table);

    scene.add(group);
    return group;
}

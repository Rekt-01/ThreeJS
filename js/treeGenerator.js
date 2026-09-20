import * as THREE from 'three';

export function createProceduralTree() {
    const treeGroup = new THREE.Group();

    const barkMat = new THREE.MeshStandardMaterial({ color: 0x423226, roughness: 0.9, metalness: 0.05 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4c8a22, roughness: 0.5, flatShading: true });

    // Main Trunk
    const trunkHeight = 5.8;
    const trunkGeo = new THREE.CylinderGeometry(0.28, 0.7, trunkHeight, 10);
    trunkGeo.translate(0, trunkHeight / 2, 0);
    const trunk = new THREE.Mesh(trunkGeo, barkMat);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    // Recursive branch builder
    const buildBranch = (pos, radius, length, angleX, angleZ, depth) => {
        if (depth > 4) return;

        const bGeo = new THREE.CylinderGeometry(radius * 0.6, radius, length, 6);
        bGeo.translate(0, length / 2, 0);
        const branch = new THREE.Mesh(bGeo, barkMat);
        branch.position.copy(pos);
        branch.rotation.x = angleX;
        branch.rotation.z = angleZ;
        branch.castShadow = true;
        branch.receiveShadow = true;
        treeGroup.add(branch);

        const tip = new THREE.Vector3(0, length, 0);
        tip.applyEuler(new THREE.Euler(angleX, 0, angleZ));
        tip.add(pos);

        if (depth === 4) {
            for (let c = 0; c < 6; c++) {
                const size = 0.9 + Math.random() * 0.8;
                const lGeo = new THREE.DodecahedronGeometry(size, 1);
                
                const v = lGeo.attributes.position;
                for (let i = 0; i < v.count; i++) {
                    v.setX(i, v.getX(i) + (Math.random() - 0.5) * 0.35);
                    v.setY(i, v.getY(i) + (Math.random() - 0.5) * 0.35);
                    v.setZ(i, v.getZ(i) + (Math.random() - 0.5) * 0.35);
                }
                lGeo.computeVertexNormals();

                const leafCloud = new THREE.Mesh(lGeo, leafMat);
                leafCloud.position.set(
                    tip.x + (Math.random() - 0.5) * 1.6,
                    tip.y + (Math.random() - 0.5) * 1.2,
                    tip.z + (Math.random() - 0.5) * 1.6
                );
                leafCloud.castShadow = true;
                treeGroup.add(leafCloud);
            }
        } else {
            for (let i = 0; i < 3; i++) {
                buildBranch(tip, radius * 0.58, length * 0.72, angleX + (Math.random() - 0.3) * 0.45, angleZ + (Math.random() - 0.5) * 0.7, depth + 1);
            }
        }
    };

    const limbs = 5;
    for (let i = 0; i < limbs; i++) {
        const angle = (i / limbs) * Math.PI * 2;
        const startPos = new THREE.Vector3(0, trunkHeight * 0.85, 0);
        const ax = 0.48 + Math.random() * 0.2;
        const az = (Math.random() - 0.5) * 0.3;
        buildBranch(startPos, 0.22, 2.5, Math.cos(angle) * ax, Math.sin(angle) * ax, 2);
    }

    return treeGroup;
}


import * as THREE from 'three';
import { createProceduralTree } from './treeGenerator.js';

export function createWorldProps(scene) {
    const group = new THREE.Group();

    // ─────────────────────────────────────
    // Rock clusters
    // ─────────────────────────────────────
    const rockMat = new THREE.MeshStandardMaterial({
        color: 0x5a5a5a,
        roughness: 0.95,
        flatShading: true
    });

    function addRockCluster(cx, cz, count = 5) {
        for (let i = 0; i < count; i++) {
            const s = 0.6 + Math.random() * 1.8;
            const rock = new THREE.Mesh(
                new THREE.DodecahedronGeometry(s, 0),
                rockMat
            );
            rock.position.set(
                cx + (Math.random() - 0.5) * 4,
                s * 0.4,
                cz + (Math.random() - 0.5) * 4
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.scale.y = 0.6 + Math.random() * 0.5;
            rock.castShadow = true;
            rock.receiveShadow = true;
            group.add(rock);
        }
    }

    addRockCluster(8, 22, 6);
    addRockCluster(-28, -8, 5);
    addRockCluster(32, 8, 4);
    addRockCluster(-15, -25, 7);
    addRockCluster(25, -28, 5);

    // ─────────────────────────────────────
    // Extra trees (scattered meaningfully)
    // ─────────────────────────────────────
    const treePositions = [
        [32, 0, -18],
        [-30, 0, 8],
        [12, 0, 28],
        [-18, 0, -28],
        [38, 0, 12],
        [-35, 0, -15],
        [8, 0, -32],
        [-8, 0, 35],
        [42, 0, -8],
        [-22, 0, 28]
    ];

    treePositions.forEach(([x, y, z]) => {
        const tree = createProceduralTree();
        tree.position.set(x, y, z);
        tree.scale.setScalar(0.75 + Math.random() * 0.5);
        tree.rotation.y = Math.random() * Math.PI * 2;
        group.add(tree);
    });

    scene.add(group);
    return group;
}

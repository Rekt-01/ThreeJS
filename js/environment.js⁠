import * as THREE from 'three';

export function createEnvironment(scene) {
    // Ground Field Terrain
    const groundGeo = new THREE.PlaneGeometry(250, 250);
    const groundMat = new THREE.MeshStandardMaterial({ 
        color: 0x42701e, 
        roughness: 0.85, 
        metalness: 0.05 
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Instanced Grass Field (15,000 blades)
    const grassBladeGeo = new THREE.ConeGeometry(0.04, 0.6, 2);
    grassBladeGeo.translate(0, 0.3, 0);
    const grassBladeMat = new THREE.MeshStandardMaterial({ 
        color: 0x5a9a2a, 
        roughness: 0.7,
        side: THREE.DoubleSide
    });
    const grassCount = 15000;
    const grassInstanced = new THREE.InstancedMesh(grassBladeGeo, grassBladeMat, grassCount);
    grassInstanced.receiveShadow = true;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < grassCount; i++) {
        const radius = 2 + Math.random() * 45;
        const theta = Math.random() * Math.PI * 2;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        
        dummy.position.set(x, 0, z);
        dummy.scale.set(1, 0.5 + Math.random() * 0.8, 1);
        dummy.rotation.y = Math.random() * Math.PI;
        dummy.updateMatrix();
        
        grassInstanced.setMatrixAt(i, dummy.matrix);
    }
    scene.add(grassInstanced);
}


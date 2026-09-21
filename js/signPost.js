import * as THREE from 'three';

export function createSignPost(scene, x = 3, z = 4) {
    const signGroup = new THREE.Group();

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x8B5A2B });
    const darkWoodMat = new THREE.MeshLambertMaterial({ color: 0x5C4033 });

    const postGeo = new THREE.BoxGeometry(0.15, 2.2, 0.15);
    const post = new THREE.Mesh(postGeo, darkWoodMat);
    post.position.y = 1.1;
    post.castShadow = true;
    signGroup.add(post);

    const boardGeo = new THREE.BoxGeometry(1.8, 0.9, 0.08);
    const board = new THREE.Mesh(boardGeo, woodMat);
    board.position.set(0, 1.8, 0.05);
    board.castShadow = true;
    signGroup.add(board);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#deb887';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 12;
    ctx.strokeStyle = '#5c4033';
    ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

    ctx.fillStyle = '#111111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('WELCOME TO', canvas.width / 2, 70);
    ctx.fillText('RUG WORLD', canvas.width / 2, 115);

    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#d32f2f';
    ctx.fillText('population: You!!', canvas.width / 2, 180);

    const texture = new THREE.CanvasTexture(canvas);
    const textPlaneGeo = new THREE.PlaneGeometry(1.7, 0.8);
    const textPlaneMat = new THREE.MeshBasicMaterial({ map: texture });
    const textPlane = new THREE.Mesh(textPlaneGeo, textPlaneMat);
    textPlane.position.set(0, 1.8, 0.1);
    signGroup.add(textPlane);

    // Position the sign post relative to arguments passed
    signGroup.position.set(x, 0, z);
    signGroup.rotation.y = Math.PI; // Face toward the player spawn

    scene.add(signGroup);
}

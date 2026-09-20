import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// 1. Scene, Camera, and Renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// 2. Procedural Particle Geometry (Generated entirely via math code)
const particleCount = 35000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
    // Spreads particles into a spherical galaxy shape mathematically
    positions[i] = (Math.random() - 0.5) * 10;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// 3. High-End Custom Material with Additive Blending for a neon glow
const material = new THREE.PointsMaterial({
    size: 0.015,
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending 
});

const particleSphere = new THREE.Points(geometry, material);
scene.add(particleSphere);

camera.position.z = 4;

// 4. Mouse Tracking Interactivity
let mouseX = 0;
let mouseY = 0;
window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// 5. The 60 FPS Render Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();

    // Rotate the particle structure organically over time
    particleSphere.rotation.y = elapsedTime * 0.05;
    particleSphere.rotation.x = elapsedTime * 0.02;

    // Make particles react dynamically to your mouse cursor position
    particleSphere.rotation.y += mouseX * 0.05;
    particleSphere.rotation.x += mouseY * 0.05;

    renderer.render(scene, camera);
}

animate();

// Handle browser window resizing smoothly
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

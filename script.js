// SCENE SETUP
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Black background

// CAMERA
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 2, 7);
camera.lookAt(0, 1, 0);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById("scene-container").appendChild(renderer.domElement);

// LIGHTING
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const candleLight = new THREE.PointLight(0xffaa55, 2, 5);
candleLight.castShadow = true;
candleLight.position.set(0, 1.5, 0);
scene.add(candleLight);

// TABLE
const table = new THREE.Mesh(
    new THREE.BoxGeometry(5, 0.15, 3),
    new THREE.MeshStandardMaterial({ color: 0x2f2f2f })
);
table.position.y = 0;
table.receiveShadow = true;
scene.add(table);

// CAKE GROUP
const cake = new THREE.Group();

// CAKE BASE
const cakeBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 0.6, 64),
    new THREE.MeshPhysicalMaterial({ color: 0xffc0cb, roughness: 0.4, metalness: 0.1, clearcoat: 0.4 })
);
cakeBase.position.y = 0.45;
cakeBase.castShadow = true;
cake.add(cakeBase);

// CAKE TOP
const cakeTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 0.4, 64),
    new THREE.MeshPhysicalMaterial({ color: 0xff9aa2, roughness: 0.35, metalness: 0.1, clearcoat: 0.5 })
);
cakeTop.position.y = 0.85;
cakeTop.castShadow = true;
cake.add(cakeTop);

// CANDLE
const candle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.4, 32),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
);
candle.position.set(0, 1.2, 0);
cake.add(candle);

// FLAME
const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffa500, emissive: 0xffa500, emissiveIntensity: 1 })
);
flame.position.set(0, 1.45, 0);
cake.add(flame);

cake.position.y = 0.05;
scene.add(cake);

// SHADOW PLANE UNDER CAKE
const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    new THREE.ShadowMaterial({ opacity: 0.5 })
);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = 0.001;
scene.add(shadowPlane);

// FIREWORKS ARRAY
let fireworks = [];

// BALLOONS
let balloons = [];
let balloonStrings = [];
function createBalloon() {
    const balloon = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 16, 16),
        new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, emissive: 0x222222 })
    );
    balloon.position.set((Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 4);
    balloon.castShadow = true;

    // String
    const stringMat = new THREE.LineBasicMaterial({ color: 0xffffff });
    const stringGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -0.5, 0)
    ]);
    const stringLine = new THREE.Line(stringGeom, stringMat);
    stringLine.position.copy(balloon.position);

    scene.add(balloon);
    scene.add(stringLine);
    balloons.push({ mesh: balloon, sway: Math.random() * 0.02 });
    balloonStrings.push(stringLine);
}

// FLAME ANIMATION
let flameDir = 1;

// ANIMATION LOOP
function animate() {
    requestAnimationFrame(animate);

    // Flame flicker and glow
    if (flame.parent) {
        flame.position.y += 0.004 * flameDir;
        if (flame.position.y > 1.48 || flame.position.y < 1.42) flameDir *= -1;
        candleLight.intensity = 1.5 + Math.sin(Date.now() * 0.01) * 0.3;
    }

    // Rotate cake slowly
    cake.rotation.y += 0.002;

    // Move balloons up with sway
    balloons.forEach((b, i) => {
        b.mesh.position.y += 0.008;
        b.mesh.position.x += Math.sin(Date.now() * 0.002 + i) * b.sway;
        // update string
        const line = balloonStrings[i];
        line.geometry.setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, -0.5, 0)
        ]);
        line.position.copy(b.mesh.position);
    });

    // Animate fireworks
    fireworks.forEach((f, i) => {
        f.position.y += 0.03;
        f.material.opacity -= 0.02;
        if (f.material.opacity <= 0) {
            scene.remove(f);
            fireworks.splice(i, 1);
        }
    });

    renderer.render(scene, camera);
}

animate();

// HANDLE SPACE KEY
let candleBlown = false;
document.addEventListener('keydown', (e) => {
    if (e.code === "Space" && !candleBlown) {
        candleBlown = true;

        // Remove flame
        cake.remove(flame);

        // Hide prompt
        document.getElementById("prompt").classList.add("hidden");

        // Fireworks
        for (let i = 0; i < 30; i++) {
            const spark = new THREE.Mesh(
                new THREE.SphereGeometry(0.05, 8, 8),
                new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, transparent: true, opacity: 1 })
            );
            spark.position.set((Math.random() - 0.5) * 4, 1 + Math.random() * 2, (Math.random() - 0.5) * 4);
            scene.add(spark);
            fireworks.push(spark);
        }

        // Balloons
        for (let i = 0; i < 6; i++) createBalloon();

        // Envelope appears
        document.getElementById("envelope").classList.remove("hidden");
    }
});

// OPEN ENVELOPE BUTTON
document.getElementById("open-envelope").onclick = () => {
    document.getElementById("note").classList.remove("hidden");
    document.getElementById("envelope").classList.add("hidden");
};

// RESIZE
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
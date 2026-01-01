// 3D Time Management Presentation
let scene, camera, renderer, currentScene = 0;
let particles = [];
let clock, spiralObjects = [], matrixCubes = [], pomodoroTimer, timeFlowParticles = [];
let animationId;
let confettiParticles = [];
let achievementExplosions = [];

// Scene configurations
const scenes = [
    {
        title: "Master Your Time",
        description: "A Journey Through Time Management in 3D",
        setup: setupIntroScene,
        animate: animateIntroScene
    },
    {
        title: "The Time Spiral",
        description: "Time flows in cycles - understand your patterns",
        setup: setupTimeSpiralScene,
        animate: animateTimeSpiralScene
    },
    {
        title: "Eisenhower Priority Matrix",
        description: "Urgent vs Important - The 4 Quadrants of Productivity",
        setup: setupPriorityMatrixScene,
        animate: animatePriorityMatrixScene
    },
    {
        title: "Pomodoro Technique",
        description: "25 minutes of focus, 5 minutes of rest",
        setup: setupPomodoroScene,
        animate: animatePomodoroScene
    },
    {
        title: "Time Flow Visualization",
        description: "Watch your time flow - make every moment count",
        setup: setupTimeFlowScene,
        animate: animateTimeFlowScene
    }
];

// Initialize Three.js
function init() {
    const container = document.getElementById('canvas-container');
    
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.002);
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0xff00ff, 0.5, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sceneIndex = parseInt(e.target.dataset.scene);
            switchScene(sceneIndex);
        });
    });
    
    // Start with intro scene
    switchScene(0);
    
    // Hide loading
    document.querySelector('.loading').style.display = 'none';
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Switch between scenes
function switchScene(index) {
    if (index === currentScene) return;
    
    // Clear current scene
    clearScene();
    
    currentScene = index;
    
    // Update UI
    document.querySelectorAll('.control-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
    
    const sceneTitle = document.getElementById('scene-title');
    sceneTitle.textContent = scenes[index].title;
    sceneTitle.classList.add('active');
    
    const infoPanel = document.getElementById('info-panel');
    infoPanel.innerHTML = `<h1>${scenes[index].title}</h1><p>${scenes[index].description}</p>`;
    infoPanel.classList.add('active');
    
    setTimeout(() => {
        infoPanel.classList.remove('active');
    }, 3000);
    
    // Setup new scene
    scenes[index].setup();
    
    // Start animation
    if (animationId) cancelAnimationFrame(animationId);
    animate();
}

// Clear scene objects
function clearScene() {
    particles.forEach(p => scene.remove(p));
    spiralObjects.forEach(o => scene.remove(o));
    matrixCubes.forEach(c => scene.remove(c));
    timeFlowParticles.forEach(p => scene.remove(p));
    confettiParticles.forEach(p => scene.remove(p));
    achievementExplosions.forEach(e => scene.remove(e));
    if (clock) scene.remove(clock);
    if (pomodoroTimer) scene.remove(pomodoroTimer);

    particles = [];
    spiralObjects = [];
    matrixCubes = [];
    timeFlowParticles = [];
    confettiParticles = [];
    achievementExplosions = [];
    clock = null;
    pomodoroTimer = null;
}

// Create confetti explosion effect
function createConfettiExplosion(position, count = 50) {
    for (let i = 0; i < count; i++) {
        const geometry = new THREE.BoxGeometry(0.2, 0.3, 0.05);
        const hue = Math.random();
        const color = new THREE.Color().setHSL(hue, 1, 0.6);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.8,
            shininess: 100
        });
        const confetti = new THREE.Mesh(geometry, material);

        confetti.position.copy(position);

        const angle = Math.random() * Math.PI * 2;
        const speed = 0.2 + Math.random() * 0.3;
        confetti.userData = {
            velocity: new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                (Math.random() - 0.5) * speed
            ),
            rotationVelocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2
            ),
            gravity: -0.01,
            lifetime: 100 + Math.random() * 100
        };

        confettiParticles.push(confetti);
        scene.add(confetti);
    }
}

// Update confetti particles
function updateConfetti() {
    confettiParticles = confettiParticles.filter(confetti => {
        confetti.userData.velocity.y += confetti.userData.gravity;
        confetti.position.add(confetti.userData.velocity);
        confetti.rotation.x += confetti.userData.rotationVelocity.x;
        confetti.rotation.y += confetti.userData.rotationVelocity.y;
        confetti.rotation.z += confetti.userData.rotationVelocity.z;

        confetti.userData.lifetime--;

        if (confetti.userData.lifetime <= 0) {
            scene.remove(confetti);
            return false;
        }

        // Fade out
        confetti.material.opacity = confetti.userData.lifetime / 200;
        confetti.material.transparent = true;

        return true;
    });
}

// Create achievement burst effect
function createAchievementBurst(position) {
    const burstGroup = new THREE.Group();

    for (let i = 0; i < 20; i++) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshPhongMaterial({
            color: 0xffdd00,
            emissive: 0xffaa00,
            emissiveIntensity: 1
        });
        const particle = new THREE.Mesh(geometry, material);

        const angle = (i / 20) * Math.PI * 2;
        const speed = 0.3;
        particle.userData = {
            velocity: new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                (Math.random() - 0.5) * speed
            )
        };

        burstGroup.add(particle);
    }

    burstGroup.position.copy(position);
    burstGroup.userData = { lifetime: 60 };
    achievementExplosions.push(burstGroup);
    scene.add(burstGroup);
}

// Update achievement explosions
function updateAchievementBursts() {
    achievementExplosions = achievementExplosions.filter(burst => {
        burst.children.forEach(particle => {
            particle.position.add(particle.userData.velocity);
            particle.userData.velocity.multiplyScalar(0.95);
        });

        burst.userData.lifetime--;

        if (burst.userData.lifetime <= 0) {
            scene.remove(burst);
            return false;
        }

        // Fade out
        burst.children.forEach(particle => {
            particle.material.opacity = burst.userData.lifetime / 60;
            particle.material.transparent = true;
        });

        return true;
    });
}

// Scene 1: Intro with floating clock particles
function setupIntroScene() {
    // Create 3D clock
    const clockGroup = new THREE.Group();
    
    // Clock face
    const faceGeometry = new THREE.CylinderGeometry(8, 8, 0.5, 64);
    const faceMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x2c3e50,
        emissive: 0x1a1a2e,
        shininess: 100
    });
    const face = new THREE.Mesh(faceGeometry, faceMaterial);
    face.rotation.x = Math.PI / 2;
    clockGroup.add(face);
    
    // Clock numbers
    for (let i = 1; i <= 12; i++) {
        const angle = (i * 30 - 90) * Math.PI / 180;
        const radius = 6.5;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        const numberGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const numberMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xecf0f1,
            emissive: 0x3498db
        });
        const number = new THREE.Mesh(numberGeometry, numberMaterial);
        number.position.set(x, y, 0.5);
        clockGroup.add(number);
    }
    
    // Hour hand
    const hourGeometry = new THREE.BoxGeometry(0.3, 4, 0.3);
    const hourMaterial = new THREE.MeshPhongMaterial({ color: 0xe74c3c });
    const hourHand = new THREE.Mesh(hourGeometry, hourMaterial);
    hourHand.position.y = 2;
    hourHand.position.z = 0.6;
    clockGroup.add(hourHand);
    
    // Minute hand
    const minuteGeometry = new THREE.BoxGeometry(0.2, 6, 0.2);
    const minuteMaterial = new THREE.MeshPhongMaterial({ color: 0x3498db });
    const minuteHand = new THREE.Mesh(minuteGeometry, minuteMaterial);
    minuteHand.position.y = 3;
    minuteHand.position.z = 0.7;
    clockGroup.add(minuteHand);
    
    // Center dot
    const centerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const centerMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xf39c12,
        emissive: 0xf39c12
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.z = 0.8;
    clockGroup.add(center);
    
    clock = clockGroup;
    scene.add(clock);
    
    // Floating particles around clock
    for (let i = 0; i < 200; i++) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshPhongMaterial({ 
            color: Math.random() * 0xffffff,
            emissive: Math.random() * 0x444444
        });
        const particle = new THREE.Mesh(geometry, material);
        
        const radius = 15 + Math.random() * 10;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;
        
        particle.position.x = radius * Math.sin(theta) * Math.cos(phi);
        particle.position.y = radius * Math.sin(theta) * Math.sin(phi);
        particle.position.z = radius * Math.cos(theta);
        
        particle.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02
            )
        };
        
        particles.push(particle);
        scene.add(particle);
    }
}

function animateIntroScene() {
    if (clock) {
        clock.rotation.y += 0.005;
        clock.children[13].rotation.z += 0.02; // Minute hand
        clock.children[12].rotation.z += 0.005; // Hour hand
    }
    
    particles.forEach(particle => {
        particle.position.add(particle.userData.velocity);
        particle.rotation.x += 0.01;
        particle.rotation.y += 0.01;
        
        // Bounce back if too far
        if (particle.position.length() > 30) {
            particle.userData.velocity.multiplyScalar(-1);
        }
    });
}

// Scene 2: Time Spiral
function setupTimeSpiralScene() {
    const spiralCount = 500;
    const spiralRadius = 20;
    
    for (let i = 0; i < spiralCount; i++) {
        const t = i / spiralCount;
        const angle = t * Math.PI * 8;
        const radius = t * spiralRadius;
        
        const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const hue = t;
        const color = new THREE.Color().setHSL(hue, 1, 0.5);
        const material = new THREE.MeshPhongMaterial({ 
            color: color,
            emissive: color,
            emissiveIntensity: 0.5
        });
        const cube = new THREE.Mesh(geometry, material);
        
        cube.position.x = Math.cos(angle) * radius;
        cube.position.y = Math.sin(angle) * radius;
        cube.position.z = t * 20 - 10;
        
        cube.userData = { angle: angle, radius: radius, t: t };
        
        spiralObjects.push(cube);
        scene.add(cube);
    }
}

function animateTimeSpiralScene() {
    spiralObjects.forEach((obj, i) => {
        obj.userData.angle += 0.01;
        obj.position.x = Math.cos(obj.userData.angle) * obj.userData.radius;
        obj.position.y = Math.sin(obj.userData.angle) * obj.userData.radius;
        obj.rotation.x += 0.02;
        obj.rotation.y += 0.02;
    });
    
    camera.position.z = 30 + Math.sin(Date.now() * 0.001) * 5;
}

// Scene 3: Priority Matrix (Eisenhower Matrix)
function setupPriorityMatrixScene() {
    const quadrants = [
        { color: 0xff4444, label: 'Urgent & Important', pos: [5, 5, 0] },
        { color: 0x44ff44, label: 'Not Urgent & Important', pos: [-5, 5, 0] },
        { color: 0xffaa44, label: 'Urgent & Not Important', pos: [5, -5, 0] },
        { color: 0x4444ff, label: 'Not Urgent & Not Important', pos: [-5, -5, 0] }
    ];
    
    quadrants.forEach((quad, index) => {
        const geometry = new THREE.BoxGeometry(8, 8, 2);
        const material = new THREE.MeshPhongMaterial({ 
            color: quad.color,
            transparent: true,
            opacity: 0.7,
            emissive: quad.color,
            emissiveIntensity: 0.3
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(...quad.pos);
        
        // Add smaller cubes inside representing tasks
        for (let i = 0; i < 10; i++) {
            const taskGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            const taskMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
            const task = new THREE.Mesh(taskGeometry, taskMaterial);
            task.position.set(
                quad.pos[0] + (Math.random() - 0.5) * 6,
                quad.pos[1] + (Math.random() - 0.5) * 6,
                quad.pos[2] + Math.random() * 2
            );
            task.userData = { 
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.05,
                    (Math.random() - 0.5) * 0.05,
                    0
                ),
                bounds: { x: quad.pos[0], y: quad.pos[1], size: 3.5 }
            };
            matrixCubes.push(task);
            scene.add(task);
        }
        
        matrixCubes.push(cube);
        scene.add(cube);
    });
    
    // Add dividing lines
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    
    // Vertical line
    const vLineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -10, 0),
        new THREE.Vector3(0, 10, 0)
    ]);
    const vLine = new THREE.Line(vLineGeometry, lineMaterial);
    matrixCubes.push(vLine);
    scene.add(vLine);
    
    // Horizontal line
    const hLineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-10, 0, 0),
        new THREE.Vector3(10, 0, 0)
    ]);
    const hLine = new THREE.Line(hLineGeometry, lineMaterial);
    matrixCubes.push(hLine);
    scene.add(hLine);
}

function animatePriorityMatrixScene() {
    matrixCubes.forEach(cube => {
        if (cube.geometry.type === 'BoxGeometry' && cube.geometry.parameters.width === 0.5) {
            cube.position.add(cube.userData.velocity);
            cube.rotation.x += 0.02;
            cube.rotation.y += 0.02;
            
            // Keep within quadrant bounds
            const bounds = cube.userData.bounds;
            if (Math.abs(cube.position.x - bounds.x) > bounds.size) {
                cube.userData.velocity.x *= -1;
            }
            if (Math.abs(cube.position.y - bounds.y) > bounds.size) {
                cube.userData.velocity.y *= -1;
            }
        } else if (cube.geometry.type === 'BoxGeometry') {
            cube.rotation.z += 0.002;
        }
    });
}

// Scene 4: Pomodoro Timer
function setupPomodoroScene() {
    const timerGroup = new THREE.Group();
    
    // Tomato shape (sphere)
    const tomatoGeometry = new THREE.SphereGeometry(5, 32, 32);
    const tomatoMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff6347,
        emissive: 0xff0000,
        emissiveIntensity: 0.3,
        shininess: 100
    });
    const tomato = new THREE.Mesh(tomatoGeometry, tomatoMaterial);
    timerGroup.add(tomato);
    
    // Timer ring
    const ringGeometry = new THREE.TorusGeometry(7, 0.5, 16, 100);
    const ringMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 0.5
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    timerGroup.add(ring);
    
    // 25-minute segments
    for (let i = 0; i < 25; i++) {
        const angle = (i / 25) * Math.PI * 2;
        const segmentGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
        const segmentMaterial = new THREE.MeshPhongMaterial({ 
            color: i < 5 ? 0x00ff00 : 0xffffff
        });
        const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
        segment.position.x = Math.cos(angle) * 9;
        segment.position.z = Math.sin(angle) * 9;
        timerGroup.add(segment);
    }
    
    pomodoroTimer = timerGroup;
    scene.add(pomodoroTimer);
    
    // Orbiting particles
    for (let i = 0; i < 50; i++) {
        const geometry = new THREE.SphereGeometry(0.2, 8, 8);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xffff00,
            emissive: 0xffaa00
        });
        const particle = new THREE.Mesh(geometry, material);
        
        const angle = (i / 50) * Math.PI * 2;
        const radius = 12;
        particle.position.x = Math.cos(angle) * radius;
        particle.position.z = Math.sin(angle) * radius;
        particle.position.y = (Math.random() - 0.5) * 4;
        
        particle.userData = { angle: angle, radius: radius, speed: 0.02 + Math.random() * 0.02 };
        
        particles.push(particle);
        scene.add(particle);
    }
}

function animatePomodoroScene() {
    if (pomodoroTimer) {
        pomodoroTimer.rotation.y += 0.01;
        pomodoroTimer.children[1].rotation.z -= 0.02; // Ring rotation
        
        // Pulse effect
        const scale = 1 + Math.sin(Date.now() * 0.003) * 0.1;
        pomodoroTimer.children[0].scale.set(scale, scale, scale);
    }
    
    particles.forEach(particle => {
        particle.userData.angle += particle.userData.speed;
        particle.position.x = Math.cos(particle.userData.angle) * particle.userData.radius;
        particle.position.z = Math.sin(particle.userData.angle) * particle.userData.radius;
        particle.rotation.x += 0.05;
        particle.rotation.y += 0.05;
    });
}

// Scene 5: Time Flow Visualization
function setupTimeFlowScene() {
    for (let i = 0; i < 1000; i++) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const hue = Math.random();
        const color = new THREE.Color().setHSL(hue, 1, 0.5);
        const material = new THREE.MeshPhongMaterial({ 
            color: color,
            emissive: color,
            emissiveIntensity: 0.5
        });
        const particle = new THREE.Mesh(geometry, material);
        
        particle.position.x = (Math.random() - 0.5) * 50;
        particle.position.y = (Math.random() - 0.5) * 50;
        particle.position.z = Math.random() * 100 - 50;
        
        particle.userData = {
            velocity: new THREE.Vector3(0, 0, 0.2 + Math.random() * 0.3),
            originalColor: color.clone()
        };
        
        timeFlowParticles.push(particle);
        scene.add(particle);
    }
}

function animateTimeFlowScene() {
    timeFlowParticles.forEach(particle => {
        particle.position.add(particle.userData.velocity);
        
        // Reset if too far
        if (particle.position.z > 50) {
            particle.position.z = -50;
            particle.position.x = (Math.random() - 0.5) * 50;
            particle.position.y = (Math.random() - 0.5) * 50;
        }
        
        // Color shift based on position
        const hue = (particle.position.z + 50) / 100;
        particle.material.color.setHSL(hue, 1, 0.5);
        particle.material.emissive.setHSL(hue, 1, 0.3);
        
        particle.rotation.x += 0.02;
        particle.rotation.y += 0.02;
    });
    
    camera.position.z = 30 + Math.sin(Date.now() * 0.0005) * 10;
}

// Main animation loop
function animate() {
    animationId = requestAnimationFrame(animate);

    // Run current scene animation
    scenes[currentScene].animate();

    // Update effects
    updateConfetti();
    updateAchievementBursts();

    // Random confetti bursts in scenes
    if (Math.random() < 0.01 && confettiParticles.length < 100) {
        const pos = new THREE.Vector3(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
        );
        createConfettiExplosion(pos, 20);
    }

    // Random achievement bursts
    if (Math.random() < 0.005 && achievementExplosions.length < 5) {
        const pos = new THREE.Vector3(
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15
        );
        createAchievementBurst(pos);
    }

    renderer.render(scene, camera);
}

// Start the application
init();

// 3D Time Management Presentation
let scene, camera, renderer, currentScene = 0;
let particles = [];
let clock, spiralObjects = [], matrixCubes = [], pomodoroTimer, timeFlowParticles = [];
let animationId;
let confettiParticles = [];
let explosionParticles = [];
let raycaster, mouse;
let interactiveObjects = [];
let tooltip;

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
    
    // Enhanced Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0xff00ff, 0.5, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0x00ffff, 0.7, 100);
    pointLight3.position.set(0, 15, -10);
    scene.add(pointLight3);
    
    const pointLight4 = new THREE.PointLight(0xffff00, 0.6, 100);
    pointLight4.position.set(-15, 0, 5);
    scene.add(pointLight4);
    
    // Raycaster for interactivity
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Create tooltip element
    tooltip = document.createElement('div');
    tooltip.style.position = 'absolute';
    tooltip.style.background = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '10px 15px';
    tooltip.style.borderRadius = '8px';
    tooltip.style.fontSize = '14px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.display = 'none';
    tooltip.style.zIndex = '1000';
    tooltip.style.backdropFilter = 'blur(10px)';
    tooltip.style.border = '1px solid rgba(255, 255, 255, 0.3)';
    document.body.appendChild(tooltip);
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onMouseClick);
    
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

// Mouse move handler for interactivity
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update raycaster
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects);
    
    if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.userData.tooltip) {
            tooltip.style.display = 'block';
            tooltip.style.left = event.clientX + 15 + 'px';
            tooltip.style.top = event.clientY + 15 + 'px';
            tooltip.innerHTML = obj.userData.tooltip;
            obj.material.emissiveIntensity = 0.8;
        }
    } else {
        tooltip.style.display = 'none';
        interactiveObjects.forEach(obj => {
            if (obj.material.emissiveIntensity) {
                obj.material.emissiveIntensity = 0.3;
            }
        });
    }
}

// Mouse click handler for explosions
function onMouseClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects);
    
    if (intersects.length > 0) {
        const point = intersects[0].point;
        createExplosion(point);
        createConfetti(point);
    }
}

// Create particle explosion effect
function createExplosion(position) {
    for (let i = 0; i < 50; i++) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const color = new THREE.Color().setHSL(Math.random(), 1, 0.5);
        const material = new THREE.MeshBasicMaterial({ color: color });
        const particle = new THREE.Mesh(geometry, material);
        
        particle.position.copy(position);
        
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5
        );
        
        particle.userData = {
            velocity: velocity,
            life: 1.0,
            decay: 0.02
        };
        
        explosionParticles.push(particle);
        scene.add(particle);
    }
}

// Create confetti effect
function createConfetti(position) {
    for (let i = 0; i < 30; i++) {
        const geometry = new THREE.BoxGeometry(0.2, 0.3, 0.05);
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        const material = new THREE.MeshPhongMaterial({ 
            color: colors[Math.floor(Math.random() * colors.length)],
            shininess: 100
        });
        const confetti = new THREE.Mesh(geometry, material);
        
        confetti.position.copy(position);
        confetti.position.y += 2;
        
        confetti.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                Math.random() * 0.5 + 0.2,
                (Math.random() - 0.5) * 0.3
            ),
            rotationSpeed: new THREE.Vector3(
                Math.random() * 0.2,
                Math.random() * 0.2,
                Math.random() * 0.2
            ),
            life: 1.0,
            decay: 0.01
        };
        
        confettiParticles.push(confetti);
        scene.add(confetti);
    }
}

// Update explosion particles
function updateExplosions() {
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
        const particle = explosionParticles[i];
        particle.position.add(particle.userData.velocity);
        particle.userData.velocity.y -= 0.01; // Gravity
        particle.userData.life -= particle.userData.decay;
        particle.material.opacity = particle.userData.life;
        particle.material.transparent = true;
        
        if (particle.userData.life <= 0) {
            scene.remove(particle);
            explosionParticles.splice(i, 1);
        }
    }
}

// Update confetti particles
function updateConfetti() {
    for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const confetti = confettiParticles[i];
        confetti.position.add(confetti.userData.velocity);
        confetti.userData.velocity.y -= 0.015; // Gravity
        confetti.rotation.x += confetti.userData.rotationSpeed.x;
        confetti.rotation.y += confetti.userData.rotationSpeed.y;
        confetti.rotation.z += confetti.userData.rotationSpeed.z;
        confetti.userData.life -= confetti.userData.decay;
        
        if (confetti.userData.life <= 0 || confetti.position.y < -20) {
            scene.remove(confetti);
            confettiParticles.splice(i, 1);
        }
    }
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
    if (clock) scene.remove(clock);
    if (pomodoroTimer) scene.remove(pomodoroTimer);
    
    particles = [];
    spiralObjects = [];
    matrixCubes = [];
    timeFlowParticles = [];
    interactiveObjects = [];
    clock = null;
    pomodoroTimer = null;
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
    clock.userData.tooltip = "⏰ Click to see time management magic!";
    scene.add(clock);
    interactiveObjects.push(clock);
    
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
        
        cube.userData = { 
            angle: angle, 
            radius: radius, 
            t: t,
            tooltip: "🌀 Time flows in cycles - Click for celebration!"
        };
        
        spiralObjects.push(cube);
        scene.add(cube);
        
        // Make some cubes interactive
        if (i % 50 === 0) {
            interactiveObjects.push(cube);
        }
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
        { color: 0xff4444, label: 'Urgent & Important', pos: [5, 5, 0], tip: '🔴 Do First: Critical tasks that need immediate attention' },
        { color: 0x44ff44, label: 'Not Urgent & Important', pos: [-5, 5, 0], tip: '🟢 Schedule: Important long-term goals' },
        { color: 0xffaa44, label: 'Urgent & Not Important', pos: [5, -5, 0], tip: '🟠 Delegate: Tasks that can be done by others' },
        { color: 0x4444ff, label: 'Not Urgent & Not Important', pos: [-5, -5, 0], tip: '🔵 Eliminate: Time wasters and distractions' }
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
        cube.userData.tooltip = quad.tip;
        interactiveObjects.push(cube);
        
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
    pomodoroTimer.userData.tooltip = "🍅 Pomodoro: 25 min focus + 5 min break = Productivity!";
    scene.add(pomodoroTimer);
    interactiveObjects.push(pomodoroTimer);
    
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
    
    // Update particle effects
    updateExplosions();
    updateConfetti();
    
    // Cinematic camera movement
    const time = Date.now() * 0.0001;
    camera.position.x += Math.sin(time * 0.5) * 0.01;
    camera.position.y += Math.cos(time * 0.3) * 0.01;
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
}

// Start the application
init();

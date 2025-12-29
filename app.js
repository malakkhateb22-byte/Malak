// 3D Time Management Universe
let scene, camera, renderer, controls;
let animationPaused = false;
let clickableObjects = [];
let particleSystems = [];
let timeRiver, avatar;
let clock = new THREE.Clock();

// Time management tips database
const tips = {
    email: {
        title: "📧 Email Management",
        content: "Use the 2-minute rule: If an email takes less than 2 minutes to respond to, do it immediately. Batch process longer emails during dedicated time blocks. Set specific times to check email (e.g., 9 AM, 1 PM, 4 PM) instead of constantly monitoring your inbox."
    },
    meeting: {
        title: "📅 Meeting Optimization",
        content: "Apply the 'No Agenda, No Attenda' rule. Every meeting should have a clear purpose and agenda. Consider if the meeting could be an email instead. Use the Pomodoro technique: 25-minute focused meetings with 5-minute breaks."
    },
    break: {
        title: "🏝️ Strategic Breaks",
        content: "Take regular breaks using the 52-17 rule: work for 52 minutes, break for 17 minutes. During breaks, step away from screens, stretch, or take a short walk. Breaks boost productivity and prevent burnout."
    },
    hourglass: {
        title: "⏳ Time Tracking",
        content: "Track your time to understand where it goes. Use time-blocking: assign specific time slots to tasks. The Pomodoro Technique (25 min work + 5 min break) helps maintain focus and measure productivity in concrete intervals."
    },
    gear: {
        title: "⚙️ Eisenhower Matrix",
        content: "Prioritize tasks using four quadrants: 1) Urgent & Important (Do First), 2) Important but Not Urgent (Schedule), 3) Urgent but Not Important (Delegate), 4) Neither (Eliminate). Focus on quadrant 2 to prevent crises."
    },
    calendar: {
        title: "📆 Time Blocking",
        content: "Schedule every hour of your day in advance. Group similar tasks together (batching). Protect your calendar: block time for deep work, and don't let meetings fragment your day. Review and adjust your schedule weekly."
    }
};

// Initialize the scene
function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 30);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 100;
    controls.minDistance = 10;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x8a2be2, 2, 100);
    pointLight1.position.set(20, 20, 20);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x4169e1, 2, 100);
    pointLight2.position.set(-20, 20, -20);
    scene.add(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0xffd700, 1.5, 100);
    pointLight3.position.set(0, 30, 0);
    scene.add(pointLight3);
    
    // Create starry background
    createStarfield();
    
    // Create main elements
    createAvatar();
    createOrbitingTasks();
    createHourglasses();
    createGears();
    createCalendars();
    createTimeRiver();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onMouseClick);
    
    document.getElementById('toggle-animation').addEventListener('click', toggleAnimation);
    document.getElementById('reset-camera').addEventListener('click', resetCamera);
    document.getElementById('toggle-tips').addEventListener('click', toggleTips);
    document.getElementById('close-info').addEventListener('click', closeInfoPanel);
    
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('fade-out');
        setTimeout(() => loadingScreen.style.display = 'none', 500);
    }, 1500);
    
    // Start animation
    animate();
}

// Create starfield background
function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        transparent: true,
        opacity: 0.8
    });
    
    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}

// Create central avatar
function createAvatar() {
    const avatarGroup = new THREE.Group();
    
    // Body (sphere with gradient effect)
    const bodyGeometry = new THREE.SphereGeometry(2, 32, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0x8a2be2,
        emissive: 0x4169e1,
        emissiveIntensity: 0.5,
        shininess: 100
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    avatarGroup.add(body);
    
    // Glowing ring around avatar
    const ringGeometry = new THREE.TorusGeometry(3, 0.2, 16, 100);
    const ringMaterial = new THREE.MeshPhongMaterial({
        color: 0xffd700,
        emissive: 0xffd700,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.7
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    avatarGroup.add(ring);
    
    avatarGroup.position.set(0, 0, 0);
    scene.add(avatarGroup);
    avatar = avatarGroup;
}

// Create orbiting task planets
function createOrbitingTasks() {
    // Emails as shooting stars
    for (let i = 0; i < 8; i++) {
        const starGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const starMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 1
        });
        const star = new THREE.Mesh(starGeometry, starMaterial);
        
        const angle = (i / 8) * Math.PI * 2;
        const radius = 12;
        star.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle * 2) * 3,
            Math.sin(angle) * radius
        );
        
        star.userData = { type: 'email', angle: angle, radius: radius, speed: 0.02 };
        clickableObjects.push(star);
        scene.add(star);
        
        // Add trail effect
        createTrail(star, 0xffff00);
    }
    
    // Meetings as pulsing asteroids
    for (let i = 0; i < 6; i++) {
        const asteroidGeometry = new THREE.DodecahedronGeometry(0.8, 0);
        const asteroidMaterial = new THREE.MeshPhongMaterial({
            color: 0xff6347,
            emissive: 0xff4500,
            emissiveIntensity: 0.5
        });
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        
        const angle = (i / 6) * Math.PI * 2;
        const radius = 18;
        asteroid.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle * 3) * 4,
            Math.sin(angle) * radius
        );
        
        asteroid.userData = { type: 'meeting', angle: angle, radius: radius, speed: 0.015, pulsePhase: i };
        clickableObjects.push(asteroid);
        scene.add(asteroid);
    }
    
    // Breaks as floating islands
    for (let i = 0; i < 4; i++) {
        const islandGroup = new THREE.Group();
        
        const islandGeometry = new THREE.CylinderGeometry(1.5, 1, 0.5, 8);
        const islandMaterial = new THREE.MeshPhongMaterial({
            color: 0x32cd32,
            emissive: 0x228b22,
            emissiveIntensity: 0.3
        });
        const island = new THREE.Mesh(islandGeometry, islandMaterial);
        islandGroup.add(island);
        
        // Add palm tree
        const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.75;
        islandGroup.add(trunk);
        
        const leavesGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 1.5;
        islandGroup.add(leaves);
        
        const angle = (i / 4) * Math.PI * 2;
        const radius = 24;
        islandGroup.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle * 4) * 5,
            Math.sin(angle) * radius
        );
        
        islandGroup.userData = { type: 'break', angle: angle, radius: radius, speed: 0.01, floatPhase: i };
        clickableObjects.push(islandGroup);
        scene.add(islandGroup);
    }
}

// Create hourglasses
function createHourglasses() {
    for (let i = 0; i < 5; i++) {
        const hourglassGroup = new THREE.Group();
        
        // Top bulb
        const topGeometry = new THREE.SphereGeometry(0.8, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const glassMaterial = new THREE.MeshPhongMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.6,
            emissive: 0x4169e1,
            emissiveIntensity: 0.3
        });
        const topBulb = new THREE.Mesh(topGeometry, glassMaterial);
        topBulb.position.y = 0.8;
        hourglassGroup.add(topBulb);
        
        // Bottom bulb
        const bottomGeometry = new THREE.SphereGeometry(0.8, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
        const bottomBulb = new THREE.Mesh(bottomGeometry, glassMaterial);
        bottomBulb.position.y = -0.8;
        hourglassGroup.add(bottomBulb);
        
        // Middle connector
        const middleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8);
        const middle = new THREE.Mesh(middleGeometry, glassMaterial);
        hourglassGroup.add(middle);
        
        const angle = (i / 5) * Math.PI * 2;
        const radius = 15 + Math.random() * 5;
        const height = (Math.random() - 0.5) * 20;
        hourglassGroup.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
        
        hourglassGroup.userData = { type: 'hourglass', rotationSpeed: 0.01 + Math.random() * 0.02 };
        clickableObjects.push(hourglassGroup);
        scene.add(hourglassGroup);
    }
}

// Create gears
function createGears() {
    for (let i = 0; i < 8; i++) {
        const gearGroup = new THREE.Group();
        
        // Main gear body
        const gearGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.3, 12);
        const gearMaterial = new THREE.MeshPhongMaterial({
            color: 0xc0c0c0,
            emissive: 0x8a2be2,
            emissiveIntensity: 0.2,
            metalness: 0.8
        });
        const gear = new THREE.Mesh(gearGeometry, gearMaterial);
        gearGroup.add(gear);
        
        // Gear teeth
        for (let j = 0; j < 12; j++) {
            const toothGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.3);
            const tooth = new THREE.Mesh(toothGeometry, gearMaterial);
            const angle = (j / 12) * Math.PI * 2;
            tooth.position.set(Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5);
            gearGroup.add(tooth);
        }
        
        const angle = (i / 8) * Math.PI * 2;
        const radius = 20 + Math.random() * 10;
        const height = (Math.random() - 0.5) * 25;
        gearGroup.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
        
        gearGroup.rotation.x = Math.random() * Math.PI;
        gearGroup.rotation.y = Math.random() * Math.PI;
        
        gearGroup.userData = { 
            type: 'gear', 
            rotationSpeed: (Math.random() - 0.5) * 0.03,
            axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize()
        };
        clickableObjects.push(gearGroup);
        scene.add(gearGroup);
    }
}

// Create calendars
function createCalendars() {
    for (let i = 0; i < 6; i++) {
        const calendarGroup = new THREE.Group();
        
        // Calendar base
        const baseGeometry = new THREE.BoxGeometry(2, 2.5, 0.1);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0x8a2be2,
            emissiveIntensity: 0.2
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        calendarGroup.add(base);
        
        // Calendar grid
        const gridMaterial = new THREE.MeshPhongMaterial({ color: 0x4169e1 });
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 7; col++) {
                const cellGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.05);
                const cell = new THREE.Mesh(cellGeometry, gridMaterial);
                cell.position.set(
                    (col - 3) * 0.25,
                    (2 - row) * 0.25 - 0.3,
                    0.1
                );
                calendarGroup.add(cell);
            }
        }
        
        const angle = (i / 6) * Math.PI * 2;
        const radius = 25 + Math.random() * 5;
        const height = (Math.random() - 0.5) * 20;
        calendarGroup.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
        
        calendarGroup.rotation.y = -angle;
        
        calendarGroup.userData = { 
            type: 'calendar', 
            floatPhase: i,
            floatSpeed: 0.5 + Math.random() * 0.5
        };
        clickableObjects.push(calendarGroup);
        scene.add(calendarGroup);
    }
}

// Create time river with flowing particles
function createTimeRiver() {
    const riverGroup = new THREE.Group();
    
    // Create flowing particle system
    const particleCount = 2000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 5 - 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        
        velocities.push({
            x: (Math.random() - 0.5) * 0.1,
            y: (Math.random() - 0.5) * 0.05,
            z: (Math.random() - 0.5) * 0.1
        });
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x4169e1,
        size: 0.3,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    particleSystem.userData = { velocities: velocities };
    particleSystems.push(particleSystem);
    scene.add(particleSystem);
    
    timeRiver = particleSystem;
}

// Create trail effect for shooting stars
function createTrail(object, color) {
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });
    
    const positions = new Float32Array(30);
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const trail = new THREE.Line(trailGeometry, trailMaterial);
    object.userData.trail = trail;
    scene.add(trail);
}

// Create particle explosion effect
function createExplosion(position, color) {
    const particleCount = 50;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = position.x;
        positions[i * 3 + 1] = position.y;
        positions[i * 3 + 2] = position.z;
        
        const speed = 0.2 + Math.random() * 0.3;
        velocities.push({
            x: (Math.random() - 0.5) * speed,
            y: (Math.random() - 0.5) * speed,
            z: (Math.random() - 0.5) * speed,
            life: 1.0
        });
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: color,
        size: 0.5,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    particleSystem.userData = { velocities: velocities, isExplosion: true };
    particleSystems.push(particleSystem);
    scene.add(particleSystem);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (!animationPaused) {
        const delta = clock.getDelta();
        const elapsed = clock.getElapsedTime();
        
        // Animate avatar ring
        if (avatar) {
            avatar.children[1].rotation.z += 0.01;
            avatar.children[0].rotation.y += 0.005;
        }
        
        // Animate orbiting objects
        clickableObjects.forEach(obj => {
            if (obj.userData.type === 'email') {
                obj.userData.angle += obj.userData.speed;
                obj.position.x = Math.cos(obj.userData.angle) * obj.userData.radius;
                obj.position.y = Math.sin(obj.userData.angle * 2) * 3;
                obj.position.z = Math.sin(obj.userData.angle) * obj.userData.radius;
                
                // Update trail
                if (obj.userData.trail) {
                    const positions = obj.userData.trail.geometry.attributes.position.array;
                    for (let i = positions.length - 3; i >= 3; i -= 3) {
                        positions[i] = positions[i - 3];
                        positions[i + 1] = positions[i - 2];
                        positions[i + 2] = positions[i - 1];
                    }
                    positions[0] = obj.position.x;
                    positions[1] = obj.position.y;
                    positions[2] = obj.position.z;
                    obj.userData.trail.geometry.attributes.position.needsUpdate = true;
                }
            } else if (obj.userData.type === 'meeting') {
                obj.userData.angle += obj.userData.speed;
                obj.position.x = Math.cos(obj.userData.angle) * obj.userData.radius;
                obj.position.y = Math.sin(obj.userData.angle * 3) * 4;
                obj.position.z = Math.sin(obj.userData.angle) * obj.userData.radius;
                
                // Pulsing effect
                const pulse = 1 + Math.sin(elapsed * 2 + obj.userData.pulsePhase) * 0.2;
                obj.scale.set(pulse, pulse, pulse);
                obj.rotation.x += 0.02;
                obj.rotation.y += 0.03;
            } else if (obj.userData.type === 'break') {
                obj.userData.angle += obj.userData.speed;
                obj.position.x = Math.cos(obj.userData.angle) * obj.userData.radius;
                obj.position.y = Math.sin(obj.userData.angle * 4) * 5 + Math.sin(elapsed + obj.userData.floatPhase) * 2;
                obj.position.z = Math.sin(obj.userData.angle) * obj.userData.radius;
                obj.rotation.y += 0.005;
            } else if (obj.userData.type === 'hourglass') {
                obj.rotation.y += obj.userData.rotationSpeed;
                obj.rotation.x = Math.sin(elapsed * 0.5) * 0.3;
            } else if (obj.userData.type === 'gear') {
                obj.rotateOnAxis(obj.userData.axis, obj.userData.rotationSpeed);
            } else if (obj.userData.type === 'calendar') {
                obj.position.y += Math.sin(elapsed * obj.userData.floatSpeed + obj.userData.floatPhase) * 0.02;
            }
        });
        
        // Animate time river particles
        if (timeRiver) {
            const positions = timeRiver.geometry.attributes.position.array;
            const velocities = timeRiver.userData.velocities;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i / 3].x;
                positions[i + 1] += velocities[i / 3].y;
                positions[i + 2] += velocities[i / 3].z;
                
                // Reset particles that go too far
                if (Math.abs(positions[i]) > 50 || Math.abs(positions[i + 2]) > 50) {
                    positions[i] = (Math.random() - 0.5) * 10;
                    positions[i + 1] = (Math.random() - 0.5) * 5 - 10;
                    positions[i + 2] = (Math.random() - 0.5) * 10;
                }
            }
            
            timeRiver.geometry.attributes.position.needsUpdate = true;
        }
        
        // Animate explosion particles
        particleSystems.forEach((system, index) => {
            if (system.userData.isExplosion) {
                const positions = system.geometry.attributes.position.array;
                const velocities = system.userData.velocities;
                let allDead = true;
                
                for (let i = 0; i < positions.length; i += 3) {
                    if (velocities[i / 3].life > 0) {
                        positions[i] += velocities[i / 3].x;
                        positions[i + 1] += velocities[i / 3].y;
                        positions[i + 2] += velocities[i / 3].z;
                        velocities[i / 3].life -= 0.02;
                        allDead = false;
                    }
                }
                
                system.material.opacity = Math.max(0, velocities[0].life);
                system.geometry.attributes.position.needsUpdate = true;
                
                if (allDead) {
                    scene.remove(system);
                    particleSystems.splice(index, 1);
                }
            }
        });
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle mouse clicks for interactivity
function onMouseClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(clickableObjects, true);
    
    if (intersects.length > 0) {
        let clickedObject = intersects[0].object;
        
        // Find the parent group if clicked on a child
        while (clickedObject.parent && !clickedObject.userData.type) {
            clickedObject = clickedObject.parent;
        }
        
        const type = clickedObject.userData.type;
        
        if (type && tips[type]) {
            showInfoPanel(tips[type].title, tips[type].content);
            createExplosion(clickedObject.position, 0xffd700);
        }
    }
}

// Show info panel
function showInfoPanel(title, content) {
    document.getElementById('info-title').textContent = title;
    document.getElementById('info-content').textContent = content;
    document.getElementById('info-panel').classList.remove('hidden');
}

// Close info panel
function closeInfoPanel() {
    document.getElementById('info-panel').classList.add('hidden');
}

// Toggle animation
function toggleAnimation() {
    animationPaused = !animationPaused;
    const button = document.getElementById('toggle-animation');
    button.textContent = animationPaused ? '▶ Play' : '⏸ Pause';
}

// Reset camera
function resetCamera() {
    camera.position.set(0, 5, 30);
    controls.target.set(0, 0, 0);
    controls.update();
}

// Toggle tips overlay
function toggleTips() {
    const tipsOverlay = document.getElementById('tips-overlay');
    tipsOverlay.classList.toggle('hidden');
}

// Initialize when page loads
window.addEventListener('load', init);

let gameActive = false;
let currentTrack = 'city';
let canvas, ctx;

// Car object
const car = {
    x: 400,
    y: 500,
    width: 30,
    height: 50,
    angle: 0,
    speed: 0,
    maxSpeed: 8,
    acceleration: 0.3,
    friction: 0.95,
    angularSpeed: 0
};

// Track data
const tracks = {
    city: {
        name: 'City',
        roadY: 250,
        finishY: 100,
        obstacles: [
            { x: 300, y: 150, width: 60, height: 20 },
            { x: 500, y: 200, width: 60, height: 20 },
            { x: 350, y: 350, width: 60, height: 20 }
        ]
    },
    desert: {
        name: 'Desert',
        roadY: 250,
        finishY: 100,
        obstacles: [
            { x: 250, y: 180, width: 50, height: 50 },
            { x: 550, y: 220, width: 50, height: 50 },
            { x: 400, y: 380, width: 50, height: 50 }
        ]
    }
};

const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function startGame(track) {
    currentTrack = track;
    gameActive = true;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    document.getElementById('trackName').textContent = tracks[track].name;
    
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    resetCar();
    gameLoop();
}

function backToMenu() {
    gameActive = false;
    document.getElementById('menu').style.display = 'flex';
    document.getElementById('gameContainer').style.display = 'none';
}

function resetCar() {
    car.x = 400;
    car.y = 500;
    car.angle = 0;
    car.speed = 0;
}

function updateCar() {
    // Handle input
    if (keys['ArrowUp'] || keys['w']) {
        car.speed += car.acceleration;
    }
    if (keys['ArrowDown'] || keys['s']) {
        car.speed -= car.acceleration;
    }
    if (keys['ArrowLeft'] || keys['a']) {
        car.angularSpeed = -0.1;
    } else if (keys['ArrowRight'] || keys['d']) {
        car.angularSpeed = 0.1;
    } else {
        car.angularSpeed = 0;
    }
    if (keys[' ']) {
        car.speed *= 0.9;
    }

    // Limit speed
    if (car.speed > car.maxSpeed) car.speed = car.maxSpeed;
    if (car.speed < -car.maxSpeed / 2) car.speed = -car.maxSpeed / 2;

    // Apply friction
    car.speed *= car.friction;

    // Update angle
    car.angle += car.angularSpeed;

    // Update position
    car.x += Math.sin(car.angle) * car.speed;
    car.y -= Math.cos(car.angle) * car.speed;

    // Keep car in bounds
    if (car.x < 0) car.x = 0;
    if (car.x > canvas.width) car.x = canvas.width;
    if (car.y < 0) car.y = 0;
    if (car.y > canvas.height) car.y = canvas.height;

    // Update HUD
    document.getElementById('speed').textContent = Math.round(Math.abs(car.speed * 10));
    const progress = Math.max(0, Math.round(((500 - car.y) / (500 - tracks[currentTrack].finishY)) * 100));
    document.getElementById('progress').textContent = Math.min(100, progress);

    // Check for finish
    if (car.y < tracks[currentTrack].finishY) {
        alert('🏁 Finished! Great job!');
        backToMenu();
    }
}

function drawTrack() {
    const track = tracks[currentTrack];
    
    // Draw road
    ctx.fillStyle = '#333';
    ctx.fillRect(150, 0, 500, 600);

    // Draw road lines
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(400, 0);
    ctx.lineTo(400, 600);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw finish line
    ctx.fillStyle = '#FFF';
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
            ctx.fillRect(150, track.finishY + i * 10, 500, 10);
        }
    }
    ctx.globalAlpha = 1;

    // Draw obstacles
    if (currentTrack === 'city') {
        ctx.fillStyle = '#8B4513';
        track.obstacles.forEach(obs => {
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        });
    } else {
        ctx.fillStyle = '#CD853F';
        track.obstacles.forEach(obs => {
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        });
    }
}

function drawCar() {
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);

    // Car body
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);

    // Car window
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(-car.width / 2 + 5, -car.height / 2 + 10, car.width - 10, 15);

    ctx.restore();
}

function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawTrack();
    updateCar();
    drawCar();

    if (gameActive) {
        requestAnimationFrame(gameLoop);
    }
}
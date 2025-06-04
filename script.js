// Game variables
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-btn');
const resetButton = document.getElementById('reset-btn');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-btn');

// Mobile control buttons
const upButton = document.getElementById('up-btn');
const downButton = document.getElementById('down-btn');
const leftButton = document.getElementById('left-btn');
const rightButton = document.getElementById('right-btn');

// Game settings
let gridSize;
let tileCount;
let gameSpeed = 100; // milliseconds

// Game state
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameStatus = 'beginning'; // 'beginning', 'running', 'paused', 'stopped'
let gameLoop;

// Resize canvas based on screen size
function resizeCanvas() {
    const maxSize = Math.min(window.innerWidth - 20, 400);

    canvas.style.width = maxSize + 'px';
    canvas.style.height = maxSize + 'px';

    // Update the internal canvas dimensions
    canvas.width = maxSize;
    canvas.height = maxSize;

    resetCanvasDimensions();

    // Redraw if game is not running
    if (gameStatus !== 'running') {
        draw();
    }
}

function resetCanvasDimensions() {
    // Recalculate grid size based on new canvas dimensions
    gridSize = Math.floor(canvas.width / 20);
    tileCount = Math.floor(canvas.width / gridSize);
}

// Initialize the game
function initGame() {
    // Create initial snake
    snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
    ];

    resetCanvasDimensions();

    // Set initial direction
    direction = 'right';
    nextDirection = 'right';

    // Reset score
    score = 0;
    scoreElement.textContent = `Score: ${score}`;

    // Create initial food
    createFood();

    // Hide game over screen
    gameOverScreen.style.display = 'none';
}

// Create food at random position
function createFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };

    // Make sure food doesn't spawn on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            createFood();
            break;
        }
    }
}

// Draw everything on the canvas
function draw() {
    // Clear canvas
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = '#4CAF50';
    for (let segment of snake) {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
    }

    // Draw snake head with different color
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 1, gridSize - 1);

    // Draw food
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1);
}

// Update game state
function update() {
    // Update direction
    direction = nextDirection;

    // Calculate new head position
    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    // Check for collisions with walls
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Check for collisions with self
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    // Check if snake eats food
    if (head.x === food.x && head.y === food.y) {
        // Increase score
        score += 10;
        scoreElement.textContent = `Score: ${score}`;

        // Create new food
        createFood();

        // Increase game speed slightly
        if (gameSpeed > 50) {
            gameSpeed -= 2;
        }
    } else {
        // Remove tail if no food was eaten
        snake.pop();
    }

    // Add new head
    snake.unshift(head);
}

// Game loop
function gameStep() {
    update();
    draw();
}

// Start the game
function startGame() {
    function start() {
        gameStatus = 'running';
        gameLoop = setInterval(gameStep, gameSpeed);
        startButton.textContent = 'Pause';
    }

    if (gameStatus === 'paused') {
        start();
    } else if (gameStatus === 'running') {
        gameStatus = 'paused';
        clearInterval(gameLoop);
        startButton.textContent = 'Resume';
    } else if (gameStatus === 'stopped') {
        resetGame();
        start();
    } else {
        start();
    }
}

// Reset the game
function resetGame() {
    clearInterval(gameLoop);
    gameStatus = 'stopped';
    startButton.textContent = 'Start Game';
    initGame();
    draw();
}

// Game over
function gameOver() {
    clearInterval(gameLoop);
    gameStatus = 'stopped';
    startButton.textContent = 'Start Game';

    // Show game over screen
    finalScoreElement.textContent = `Your score: ${score}`;
    gameOverScreen.style.display = 'block';
}

// Change direction based on input
function changeDirection(newDirection) {
    // Prevent 180-degree turns
    if (
        (newDirection === 'up' && direction !== 'down') ||
        (newDirection === 'down' && direction !== 'up') ||
        (newDirection === 'left' && direction !== 'right') ||
        (newDirection === 'right' && direction !== 'left')
    ) {
        nextDirection = newDirection;
    }
}

// Event listeners
startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);
restartButton.addEventListener('click', function() {
    resetGame();
    startGame();
});

// Keyboard controls
document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'ArrowUp':
            changeDirection('up');
            event.preventDefault();
            break;
        case 'ArrowDown':
            changeDirection('down');
            event.preventDefault();
            break;
        case 'ArrowLeft':
            changeDirection('left');
            event.preventDefault();
            break;
        case 'ArrowRight':
            changeDirection('right');
            event.preventDefault();
            break;
        case ' ':
            // Space bar to start/pause
            startGame();
            event.preventDefault();
            break;
    }
});

// Mobile button controls
if (upButton) {
    upButton.addEventListener('click', function() {
        changeDirection('up');
    });
}

if (downButton) {
    downButton.addEventListener('click', function() {
        changeDirection('down');
    });
}

if (leftButton) {
    leftButton.addEventListener('click', function() {
        changeDirection('left');
    });
}

if (rightButton) {
    rightButton.addEventListener('click', function() {
        changeDirection('right');
    });
}

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', function(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    event.preventDefault();
});

canvas.addEventListener('touchmove', function(event) {
    if (!touchStartX || !touchStartY) {
        return;
    }

    let touchEndX = event.touches[0].clientX;
    let touchEndY = event.touches[0].clientY;

    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;

    // Determine swipe direction based on which axis had the greater movement
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
            changeDirection('right');
        } else {
            changeDirection('left');
        }
    } else {
        if (dy > 0) {
            changeDirection('down');
        } else {
            changeDirection('up');
        }
    }

    touchStartX = touchEndX;
    touchStartY = touchEndY;
    event.preventDefault();
});

// Prevent scrolling when touching the canvas
canvas.addEventListener('touchend', function(event) {
    event.preventDefault();
});

// Initialize the game
initGame();

// Handle window resize
window.addEventListener('resize', resizeCanvas);

// Draw the initial state
resizeCanvas();
draw();

class Snake {
    constructor() {
        this.reset();
    }

    reset() {
        this.position = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.grew = false;
    }

    move() {
        this.direction = this.nextDirection;
        const head = { x: this.position[0].x + this.direction.x, y: this.position[0].y + this.direction.y };
        this.position.unshift(head);
        if (!this.grew) {
            this.position.pop();
        }
        this.grew = false;
    }

    grow() {
        this.grew = true;
    }

    checkCollision(width, height, wallPass) {
        const head = this.position[0];
        
        if (wallPass) {
            // Wrap around when passing through walls
            this.position[0] = {
                x: (head.x + width) % width,
                y: (head.y + height) % height
            };
            return false;
        } else {
            // Check wall collision
            if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) {
                return true;
            }
        }
        
        // Check self collision
        return this.position.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.width = this.canvas.width / this.gridSize;
        this.height = this.canvas.height / this.gridSize;
        this.snake = new Snake();
        this.food = { x: 15, y: 15 };
        this.score = 0;
        this.gameLoop = null;
        this.wallPass = true;
        this.gameSpeed = {
            slow: 150,
            normal: 100,
            fast: 60
        };
        this.currentSpeed = this.gameSpeed.normal;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('startButton').addEventListener('click', () => this.start());
        document.addEventListener('keydown', (e) => this.handleInput(e));
        
        // Add event listeners for game mode radio buttons
        document.getElementById('wallPass').addEventListener('change', (e) => {
            this.wallPass = e.target.checked;
            this.canvas.classList.remove('walls-mode');
        });
        document.getElementById('wallCollision').addEventListener('change', (e) => {
            this.wallPass = !e.target.checked;
            this.canvas.classList.add('walls-mode');
        });

        // Add event listeners for speed control
        document.getElementById('speedSlow').addEventListener('change', () => {
            this.currentSpeed = this.gameSpeed.slow;
            if (this.gameLoop) this.updateGameSpeed();
        });
        document.getElementById('speedNormal').addEventListener('change', () => {
            this.currentSpeed = this.gameSpeed.normal;
            if (this.gameLoop) this.updateGameSpeed();
        });
        document.getElementById('speedFast').addEventListener('change', () => {
            this.currentSpeed = this.gameSpeed.fast;
            if (this.gameLoop) this.updateGameSpeed();
        });
    }

    updateGameSpeed() {
        clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.currentSpeed);
    }

    handleInput(e) {
        const key = e.key.toLowerCase();
        const directions = {
            'arrowup': { x: 0, y: -1 },
            'arrowdown': { x: 0, y: 1 },
            'arrowleft': { x: -1, y: 0 },
            'arrowright': { x: 1, y: 0 },
            'w': { x: 0, y: -1 },
            's': { x: 0, y: 1 },
            'a': { x: -1, y: 0 },
            'd': { x: 1, y: 0 }
        };

        if (directions[key]) {
            const newDirection = directions[key];
            const currentDirection = this.snake.direction;
            if (newDirection.x !== -currentDirection.x || newDirection.y !== -currentDirection.y) {
                this.snake.nextDirection = newDirection;
            }
        }
    }

    generateFood() {
        while (true) {
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);
            if (!this.snake.position.some(segment => segment.x === x && segment.y === y)) {
                this.food = { x, y };
                break;
            }
        }
    }

    update() {
        this.snake.move();

        if (this.snake.checkCollision(this.width, this.height, this.wallPass)) {
            this.gameOver();
            return;
        }

        const head = this.snake.position[0];
        if (head.x === this.food.x && head.y === this.food.y) {
            this.snake.grow();
            this.score += 10;
            document.getElementById('score').textContent = this.score;
            this.generateFood();
        }
    }

    draw() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.ctx.fillStyle = '#4CAF50';
        this.snake.position.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
        });

        // Draw food
        this.ctx.fillStyle = '#FF4444';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 1,
            this.gridSize - 1
        );
    }

    start() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        this.snake.reset();
        this.score = 0;
        document.getElementById('score').textContent = this.score;
        this.generateFood();
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.currentSpeed);
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        alert(`Game Over! Your score: ${this.score}`);
    }
}

// Initialize the game
const game = new Game();
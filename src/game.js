// Game configuration
const BLOCK_SIZE = 20;
const BOARD_WIDTH = 12;
const BOARD_HEIGHT = 20;

// Update canvas size to match the game board dimensions
// Move all the initialization code inside DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    // Add these variables at the top of the DOMContentLoaded callback
    let gameInterval = null;
    let isPaused = false;
    let score = 0;
    let currentPiece = null;
    let currentPieceX = 0;
    let currentPieceY = 0;
    
    // Initialize the game board
    const board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));

    // Tetromino definitions
    const PIECES = [
        [[1, 1, 1, 1]],           // I
        [[1, 1], [1, 1]],        // O
        [[1, 1, 1], [0, 1, 0]],  // T
        [[1, 1, 1], [1, 0, 0]],  // L
        [[1, 1, 1], [0, 0, 1]],  // J
        [[1, 1, 0], [0, 1, 1]],  // S
        [[0, 1, 1], [1, 1, 0]]   // Z
    ];
    const canvas = document.getElementById('tetris');
    canvas.width = BLOCK_SIZE * BOARD_WIDTH;
    canvas.height = BLOCK_SIZE * BOARD_HEIGHT;
    const context = canvas.getContext('2d');

    // Remove the previewCanvas related code since it's not in the HTML
    // const previewCanvas = document.getElementById('previewCanvas');
    // const previewContext = previewCanvas.getContext('2d');
    let nextPiece = null;

    // Add this function to draw the preview piece
    function drawPreview() {
        previewContext.fillStyle = '#000';
        previewContext.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

        if (nextPiece) {
            const blockSize = 20;
            const offsetX = (previewCanvas.width - nextPiece[0].length * blockSize) / 2;
            const offsetY = (previewCanvas.height - nextPiece.length * blockSize) / 2;

            nextPiece.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        previewContext.fillStyle = 'red';
                        previewContext.fillRect(
                            offsetX + x * blockSize,
                            offsetY + y * blockSize,
                            blockSize,
                            blockSize
                        );
                        previewContext.strokeStyle = '#fff';
                        previewContext.strokeRect(
                            offsetX + x * blockSize,
                            offsetY + y * blockSize,
                            blockSize,
                            blockSize
                        );
                    }
                });
            });
        }
    }

    // Update createPiece function
    function createPiece() {
        currentPiece = PIECES[Math.floor(Math.random() * PIECES.length)];
        currentPieceX = Math.floor(BOARD_WIDTH / 2 - currentPiece[0].length / 2);
        currentPieceY = 0;
        
        // Check for game over
        if (isCollision()) {
            clearInterval(gameInterval);
            alert('Game Over!');
            restartGame();
            return;
        }
    }

    // Update draw function
    function draw() {
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        drawBoard();
        if (currentPiece) {
            drawPiece();
        }
    }

    function drawBoard() {
        board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    context.fillStyle = 'rgb(0, 255, 0)';
                    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    context.strokeStyle = '#fff';
                    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            });
        });
    }

    function drawPiece() {
        currentPiece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    context.fillStyle = 'red';
                    context.fillRect(
                        (currentPieceX + x) * BLOCK_SIZE,
                        (currentPieceY + y) * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    );
                    context.strokeStyle = '#fff';
                    context.strokeRect(
                        (currentPieceX + x) * BLOCK_SIZE,
                        (currentPieceY + y) * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    );
                }
            });
        });
    }

    function moveLeft() {
        currentPieceX--;
        if (isCollision()) {
            currentPieceX++;
        }
        draw();
    }

    function moveRight() {
        currentPieceX++;
        if (isCollision()) {
            currentPieceX--;
        }
        draw();
    }

    function moveDown() {
        console.log('Moving down');  // Debug
        currentPieceY++;
        if (isCollision()) {
            currentPieceY--;
            mergePiece();
            createPiece();
        }
        draw();
    }

    function initGame() {
        console.log('Game initialized');  // Debug
        if (gameInterval) {
            clearInterval(gameInterval);
        }

        // Reset game state
        isPaused = false;
        score = 0;
        document.getElementById('score').textContent = '0';
        
        // Clear the board
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                board[y][x] = 0;
            }
        }
        
        createPiece();
        draw();
        
        console.log('Starting game interval');  // Debug
        gameInterval = setInterval(() => {
            console.log('Game loop tick');  // Debug
            if (!isPaused) {
                moveDown();
            }
        }, 1000);
    }

    function rotatePiece() {
        const rotated = currentPiece[0].map((_, i) =>
            currentPiece.map(row => row[row.length - 1 - i])
        );
        const previousPiece = currentPiece;
        currentPiece = rotated;
        if (isCollision()) {
            currentPiece = previousPiece;
        }
        draw();
    }

    function isCollision() {
        return currentPiece.some((row, dy) => {
            return row.some((value, dx) => {
                if (!value) return false;
                const newX = currentPieceX + dx;
                const newY = currentPieceY + dy;
                return (
                    newX < 0 ||
                    newX >= BOARD_WIDTH ||
                    newY >= BOARD_HEIGHT ||
                    (newY >= 0 && board[newY][newX])
                );
            });
        });
    }

    function mergePiece() {
        currentPiece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    board[currentPieceY + y][currentPieceX + x] = value;
                }
            });
        });
        clearRows();
    }
  
    function clearRows() {
        for (let y = BOARD_HEIGHT - 1; y >= 0;) {
            if (board[y].every(value => value > 0)) {
                // Move all rows above down
                for (let row = y; row > 0; row--) {
                    board[row] = [...board[row - 1]];
                }
                // Create new empty row at top
                board[0] = Array(BOARD_WIDTH).fill(0);
                
                // Increment score
                score += 100;
                document.getElementById('score').textContent = score;
            } else {
                y--;
            }
        }
    }
  
    // Initialize game
    function initGame() {
        if (gameInterval) {
            clearInterval(gameInterval);
        }
        
        // Reset game state
        isPaused = false;
        score = 0;
        document.getElementById('score').textContent = '0';
        
        // Clear the board
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                board[y][x] = 0;
            }
        }
        createPiece();
        draw();
        
        gameInterval = setInterval(() => {
            if (!isPaused) {
                moveDown();
            }
        }, 1000);
    }

    // Event listeners
    // Add debug for keyboard controls
    document.addEventListener('keydown', event => {
        console.log('Key pressed:', event.key);  // Debug
        if (!isPaused) {
            switch (event.key) {
                case 'ArrowLeft':
                    moveLeft();
                    break;
                case 'ArrowRight':
                    moveRight();
                    break;
                case 'ArrowDown':
                    moveDown();
                    break;
                case 'ArrowUp':
                    rotatePiece();
                    break;
            }
        }
    });

    // Add the missing pause function
    function pauseGame() {
        isPaused = !isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
        draw();
    }

    // Add the missing restart function
    function restartGame() {
        // Clear the board
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                board[y][x] = 0;
            }
        }
        
        score = 0;
        document.getElementById('score').textContent = '0';
        isPaused = false;
        document.getElementById('pauseBtn').textContent = 'Pause';
        
        // Reset game
        initGame();
    }

    document.getElementById('pauseBtn').addEventListener('click', pauseGame);
    document.getElementById('restartBtn').addEventListener('click', restartGame);

    // Start the game
    initGame();
});
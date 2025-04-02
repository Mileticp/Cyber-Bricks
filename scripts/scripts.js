
/**
 * GAME VARIABLES: These store key game elements like ball, paddle, and bricks.
 */
var x = 150; // Ball's initial horizontal position (x-coordinate) in pixels from left edge
var y = 150; // Ball's initial vertical position (y-coordinate) in pixels from top edge
var dx = 2;  // Ball's horizontal velocity (speed in x-direction). Positive = right, Negative = left
var dy = 4;  // Ball's vertical velocity (speed in y-direction). Positive = down, Negative = up
var ctx;     // 2D rendering context for canvas drawing operations
var canvas;  // Reference to the HTML canvas element where game is rendered

/**
 * PADDLE VARIABLES: These define the paddle's size and position.
 */
var paddlex;       // Paddle's horizontal position (x-coordinate) in pixels from left edge
var paddleh = 10;  // Paddle height in pixels (thickness of the paddle)
var paddlew = 85;  // Paddle width in pixels (how wide the paddle is)

/**
 * PLAYER INPUT: These variables track key presses for paddle movement.
 */
var rightPressed = false; // Flag: true when right arrow key is pressed (move paddle right)
var leftPressed = false;  // Flag: true when left arrow key is pressed (move paddle left)

/**
 * CANVAS DIMENSIONS: Define the size of the game area.
 */
var WIDTH = 500;   // Width of the game canvas in pixels
var HEIGHT = 500;  // Height of the game canvas in pixels

/**
 * BRICK VARIABLES: Store information about the bricks in the game.
 */
var bricks;        // 2D array (matrix) tracking brick status: 1 = exists, 0 = destroyed
var NROWS = 5;     // Number of brick rows (vertical layers of bricks)
var NCOLS = 5;     // Number of brick columns (horizontal bricks per row)
var BRICKWIDTH;    // Calculated width of each brick based on canvas width and columns
var BRICKHEIGHT = 15;  // Height of each brick in pixels
var PADDING = 1;   // Space in pixels between bricks (for visual separation)
var brickCount;    // Counter for remaining bricks (when 0, player wins)
var intervalId;    // ID of the game loop interval (used to stop the game)
var opeka = new Image();
opeka.src = "brick.png";

/**
 * INITIALIZATION FUNCTION: Called when the game starts.
 * Sets up canvas, event listeners, and initial game state.
 */
function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    intervalId = setInterval(draw, 10);
    paddlex = (WIDTH - paddlew) / 2;
    initbricks();
}

/**
 * FUNCTION: Initializes the bricks by filling the 2D array.
 * Calculates brick dimensions and sets all bricks to active (1).
 */
function initbricks() {
    BRICKWIDTH = (WIDTH / NCOLS) - PADDING;
    bricks = new Array(NROWS);
    brickCount = NROWS * NCOLS;
    for (let i = 0; i < NROWS; i++) {
        bricks[i] = new Array(NCOLS);
        for (let j = 0; j < NCOLS; j++) {
            bricks[i][j] = 1;
        }
    }
}

/**
 * FUNCTION: Handles key press events.
 * Updates movement flags when arrow keys are pressed.
 * @param {KeyboardEvent} e - The keyboard event object
 */
function keyDownHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = true;
    } 
    else if (e.keyCode == 37) {
        leftPressed = true;
    }
}

/**
 * FUNCTION: Handles key release events.
 * Updates movement flags when arrow keys are released.
 * @param {KeyboardEvent} e - The keyboard event object
 */
function keyUpHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = false;
    } 
    else if (e.keyCode == 37) {
        leftPressed = false;
    }
}

/**
 * FUNCTION: Draws the paddle at its current position.
 * Uses canvas drawing commands to render the paddle.
 */
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddlex, HEIGHT - paddleh, paddlew, paddleh);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

/**
 * FUNCTION: Draws the bricks that are still present.
 * Loops through brick array and draws active bricks.
 */
function drawBricks() {
    for (let i = 0; i < NROWS; i++) {
        for (let j = 0; j < NCOLS; j++) {
            if (bricks[i][j] == 1) {
                ctx.beginPath();
                ctx.rect(
                    (j * (BRICKWIDTH + PADDING)) + PADDING,
                    (i * (BRICKHEIGHT + PADDING)) + PADDING,
                    BRICKWIDTH,
                    BRICKHEIGHT
                    /*ctx.drawImage(oblak, (j * (BRICKWIDTH + PADDING)) + PADDING, (i * (BRICKHEIGHT + PADDING)) + PADDING, BRICKWIDTH, BRICKHEIGHT); */
                );
                ctx.fillStyle = "#FF5733";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

/**
 * FUNCTION: Checks for collision between ball and paddle with improved bounce physics.
 * The ball's horizontal velocity changes based on where it hits the paddle.
 * @returns {boolean} True if collision detected, false otherwise
 */
function checkPaddleCollision() {
    // Check if ball is at paddle's vertical position (with 10px radius consideration)
    if (y + 10 >= HEIGHT - paddleh) {
        // Check if ball is within paddle's horizontal range
        if (x > paddlex && x < paddlex + paddlew) {
            // Calculate relative impact point (-0.5 to 0.5 from center)
            let relativeIntersectX = (x - (paddlex + paddlew/2)) / (paddlew/2);
            
            // Set new horizontal velocity based on impact point (more control)
            // The multiplier (8) determines how sharp the angles can be
            dx = 8 * relativeIntersectX;
            
            // Always reverse vertical direction
            dy = -Math.abs(dy); // Ensure ball always goes up
            
            return true;
        }
    }
    return false;
}

/**
 * FUNCTION: Checks for collision between ball and bricks.
 * Handles brick destruction and ball bouncing.
 */
function checkBrickCollision() {
    for (let i = 0; i < NROWS; i++) {
        for (let j = 0; j < NCOLS; j++) {
            if (bricks[i][j] !== 1) continue;
            
            let brickX = j * (BRICKWIDTH + PADDING) + PADDING;
            let brickY = i * (BRICKHEIGHT + PADDING) + PADDING;
            let brickRight = brickX + BRICKWIDTH;
            let brickBottom = brickY + BRICKHEIGHT;
            
            if (x + 10 > brickX && x - 10 < brickRight &&
                y + 10 > brickY && y - 10 < brickBottom) {
                
                bricks[i][j] = 0;
                brickCount--;
                
                let ballCenterX = x;
                let ballCenterY = y;
                let brickCenterX = brickX + BRICKWIDTH / 2;
                let brickCenterY = brickY + BRICKHEIGHT / 2;
                
                let overlapX = Math.min(
                    Math.abs(ballCenterX - brickX),
                    Math.abs(ballCenterX - brickRight)
                );
                let overlapY = Math.min(
                    Math.abs(ballCenterY - brickY),
                    Math.abs(ballCenterY - brickBottom)
                );
                
                if (overlapX < overlapY) {
                    dx = -dx;
                } else {
                    dy = -dy;
                }
                
                if (brickCount === 0) {
                    clearInterval(intervalId);
                    Swal.fire({
                        title: "You Win!",
                        text: "Congratulations!",
                        icon: "success"
                    }).then(() => location.reload());
                }
                
                return;
            }
        }
    }
}

/**
 * FUNCTION: The main game loop, updates game state and redraws objects.
 * Handles ball movement, collisions, and game over conditions.
 */
function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawPaddle();
    drawBricks();
    
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.closePath();
    
    if (rightPressed && paddlex < WIDTH - paddlew) { 
        paddlex += 7;
    }
    if (leftPressed && paddlex > 0) { 
        paddlex -= 7;
    }
    
    x += dx;
    y += dy;
    
    if (x + 10 > WIDTH || x - 10 < 0) { 
        dx = -dx;
    }
    if (y - 10 < 0) { 
        dy = -dy;
    }
    
    checkPaddleCollision();
    checkBrickCollision();
    
    if (y + 10 >= HEIGHT) {
        clearInterval(intervalId);
        Swal.fire({
            title: "Game Over!",
            text: "You lost!",
            icon: "error"
        }).then(() => location.reload());
        return;
    }
}

window.onload = init;

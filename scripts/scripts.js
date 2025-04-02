
var x = 150; 
var y = 150; 
var dx = 2;  
var dy = 4;  
var ctx;     
var canvas;  

var paddlex;       
var paddleh = 10;  //thickness
var paddlew = 85;  //width

//input
var rightPressed = false; 
var leftPressed = false;  

//canvas
var WIDTH = 500;   
var HEIGHT = 500;  


var bricks;        //ar
var NROWS = 5;     
var NCOLS = 5;     
var BRICKWIDTH;    
var BRICKHEIGHT = 15;  
var PADDING = 1;   
var brickCount;    
var intervalId;    
var opeka = new Image();
opeka.src = "brick.png";
var paddleImg = new Image();
paddleImg.src = "paddle.png";


function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    intervalId = setInterval(draw, 10);
    paddlex = (WIDTH - paddlew) / 2;
    initbricks();
}


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


function keyDownHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = true;
    } 
    else if (e.keyCode == 37) {
        leftPressed = true;
    }
}


function keyUpHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = false;
    } 
    else if (e.keyCode == 37) {
        leftPressed = false;
    }
}


function drawPaddle() {
    ctx.drawImage(paddleImg, paddlex, HEIGHT - paddleh, paddlew, paddleh);
}


function drawBricks() {
    for (let i = 0; i < NROWS; i++) {
        for (let j = 0; j < NCOLS; j++) {
            if (bricks[i][j] == 1) {
                ctx.beginPath();
                ctx.drawImage(opeka,
                    (j * (BRICKWIDTH + PADDING)) + PADDING,
                    (i * (BRICKHEIGHT + PADDING)) + PADDING,
                    BRICKWIDTH,
                    BRICKHEIGHT
                    /*ctx.drawImage(oblak, (j * (BRICKWIDTH + PADDING)) + PADDING, (i * (BRICKHEIGHT + PADDING)) + PADDING, BRICKWIDTH, BRICKHEIGHT); */
                );

                ctx.closePath();
            }
        }
    }
}










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
                        title: "Zmagu!",
                        text: "Zmagu si!",
                        icon: "success"
                    })
                }
                
                return;
            }
        }
    }
}


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
            title: "Zgebu!",
            text: "Zgebu si!",
            icon: "error"
        }).
        return;
    }
}

window.onload = init;


var x = 150; 
var y = 150; 
var dx = 2;  
var dy = 4;  
var ctx;     
var canvas;  

var paddlex;       
var paddleh = 10;  //debelina
var paddlew = 85;  //sirina

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
var score = 0;
var paddleImg = new Image();
paddleImg.src = "images/paddle.png";

var opeke = [];
opeke[0] = new Image();  
opeke[0].src = "images/brick.png";
opeke[1] = new Image();  
opeke[1].src = "images/brick_damaged1.png";
opeke[2] = new Image();  
opeke[2].src = "images/brick_damaged2.png";

var score = 0;
var startTime;
var elapsed = 0;
var lives = 3;



function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    startTime = Date.now();
    intervalId = setInterval(draw, 10);
    paddlex = (WIDTH - paddlew) / 2;
    initbricks();
    updateLives();
}

// Add this new function to update lives display
function updateLives() {
    document.getElementById('lives').textContent = 'Lives: ' + '❤️'.repeat(lives);
}


function initbricks() {
    BRICKWIDTH = (WIDTH / NCOLS) - PADDING;
    bricks = new Array(NROWS);
    brickCount = NROWS * NCOLS;
    for (let i = 0; i < NROWS; i++) {
        bricks[i] = new Array(NCOLS);
        for (let j = 0; j < NCOLS; j++) {
            bricks[i][j] = {
                hits: 0,
                broken: false
            };
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
            let brick = bricks[i][j];
            if (!brick.broken) {
                let hitCount = bricks[i][j].hits;
                let imgIndex = hitCount;
                ctx.beginPath();
                ctx.drawImage(opeke[imgIndex],
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
    // Check ce je zoga na paddli (vertikala)
    if (y + 10 >= HEIGHT - paddleh) {
        // Check ce je zoga na paddli (vodoravna)
        if (x > paddlex && x < paddlex + paddlew) {
            //odboj glede na paddle
            let paddleodboj2 = (x - (paddlex + paddlew/2)) / (paddlew/2);
            dx = 8 * paddleodboj2;
            // odboj s paddla
            dy = -dy;
            
            return true;
        }
    }
    return false;
}

//odboj bricks
function checkBrickCollision() {
    for (let i = 0; i < NROWS; i++) {
        for (let j = 0; j < NCOLS; j++) {
            let brick = bricks[i][j];
            if (brick.broken) continue;
            
            let brickX = j * (BRICKWIDTH + PADDING) + PADDING;
            let brickY = i * (BRICKHEIGHT + PADDING) + PADDING;
            let brickRight = brickX + BRICKWIDTH;
            let brickBottom = brickY + BRICKHEIGHT;
            
            if (x + 10 > brickX && x - 10 < brickRight &&
                y + 10 > brickY && y - 10 < brickBottom) {
                
                    brick.hits++;
                    score += 10;

                    if (brick.hits >= 3) {
                        brick.broken = true;
                        brickCount--;
                        score+=20;
                    }
                    
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
                
                if (brickCount == 0) {
                    clearInterval(intervalId);
                    Swal.fire({
                        title: "Zmagu!",
                        text: "Zmagu si!",
                        icon: "success"
                    }).then(function() {
                        window.location.reload(); 
                      });
                }
                
            }
        }
    }
}


function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawPaddle();
    drawBricks();
    drawScore();
    
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "black";
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
        lives--;
        updateLives();
        
        if (lives <= 0) {
            clearInterval(intervalId);
            Swal.fire({
                title: "Game Over!",
                html: `Game Over!<br><br>Score: ${score}<br>Time: ${elapsed}s`,
                icon: "error"
            }).then(function() {
                window.location.reload(); 
            });
        } else {
            x = 150;
            y = 150;
            dx = 2;
            dy = 4;
            paddlex = (WIDTH - paddlew) / 2;
        }
    }
}

function drawScore() {
    elapsed = Math.round((Date.now() - startTime)/1000);
    document.getElementById('timer').textContent = "Time: " + elapsed + "s | Score: " + score;

} 

window.onload = init;






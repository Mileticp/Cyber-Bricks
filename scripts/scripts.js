
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
var opeka = new Image();
var score = 0;
opeka.src = "images/brick.png";
var paddleImg = new Image();
paddleImg.src = "images/paddle.png";

var score = 0;
var startTime;
var elapsed = 0;



function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    startTime = Date.now();
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
    // Check ce je zoga na paddli (vertikala)
    if (y + 10 >= HEIGHT - paddleh) {
        // Check ce je zoga na paddli (vodoravna)
        if (x > paddlex && x < paddlex + paddlew) {
            //odboj glede na paddle
            let paddleodboj2 = (x - (paddlex + paddlew/2)) / (paddlew/2);
            dx = 8 * paddleodboj2;
            // odboj s paddla
            dy = -Math.abs(dy);
            
            return true;
        }
    }
    return false;
}

//odboj bricks
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
                score++;
                
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
                
                return;
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
        clearInterval(intervalId);
        Swal.fire({
            title: "Zgebu!",
            html: `Zgebu!<br><br>Score: ${score}<br>Time: ${elapsed}s`,
            icon: "error"
        }).then(function() {
            window.location.reload(); 
          });
    }
}

function drawScore() {
    elapsed = Math.floor((Date.now() - startTime)/1000);
    document.getElementById('timer').textContent = "Time: " + elapsed + "s | Score: " + score;

} 

window.onload = init;






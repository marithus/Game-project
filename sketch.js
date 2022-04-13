var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isPlummeting;
var isJumping;
var clouds;
var mountains;
var canyons;
var trees_x;
var collectables;
var spikes;

var game_score;
var lives;
var fading;

var flagpole;
var igloo;
var snows;

var platforms;
var maxHeight;

var Energy = 10;
var velocity = 2;
var jumpPower = 10;
var fallingSpeed = 2;

var enemies;
var isInjured;
var InjuryTimer;

function preload() {
    soundFormats('mp3', 'wav');
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);
    backgroundMusic = loadSound("assets/JingleBells.mp3");
    backgroundMusic.setVolume(0.05);
    deathSound = loadSound('assets/DeathSound.mp3');
    deathSound.setVolume(0.1);
    collectablesSound = loadSound('assets/CollectableSound.wav');
    collectablesSound.setVolume(0.1);
    winSound = loadSound('assets/KidsCheering.mp3');
    winSound.setVolume(0.1);
    damagedSound = loadSound('assets/damaged.wav');
    damagedSound.setVolume(1)
    
    iglooHome = loadImage('images/igloo.png');
    tree = loadImage("images/tree.png");
    snowFlakes = loadImage("images/collectables.png")
    heart = loadImage("images/Lives.png");
    fireEnemies = loadImage('images/enemies.png');
    backGround = loadImage('images/BackGround.png');
    spike = loadImage('images/Spike.png')
}

function startGame() {
    gameChar_x = width / 2;
    gameChar_y = floorPos_y;
    treePos_y = height / 2;
    scrollPos = 0;
    gameChar_world_x = gameChar_x - scrollPos;
    isLeft = false;
    isRight = false;
    isPlummeting = false;
    isJumping = false;
    isInjured = false;
    InjuryTimer = 0;

    trees_x = [300, 400, 500, 1000, 1400, 1900, 2000];

    collectables = [{x_pos: -200, y_pos: 400, size: 30, isFound: false},
                    {x_pos: 710, y_pos: 400, size: 30, isFound: false},
                    {x_pos: 1230, y_pos: 400, size: 30, isFound: false},
                    {x_pos: 1530, y_pos: 400, size: 30, isFound: false},
                    {x_pos: 1850, y_pos: 300, size: 30, isFound: false}
                   ];

    mountains = [{x_pos: 200, y_pos: 200},
                {x_pos: 800, y_pos: 200},
                {x_pos: 1000, y_pos: 200},
                {x_pos: 2200, y_pos: 200},
                {x_pos: 2400, y_pos: 200}
                ];

    canyons = [{x_pos: -500, width: 500},
               {x_pos: 560, width: 100},
               {x_pos: 1200, width: 200},
               {x_pos: 1500, width: 400},
              ];
    game_score = 0;

    flagpole = {isReached: false, x_pos: 2350};

    igloo = {x_pos: 2300};

    platforms = [];
    platforms.push(createPlatforms(-100, floorPos_y - 50, 100));
    platforms.push(createPlatforms(1600, floorPos_y - 50, 100));
    platforms.push(createPlatforms(1800, floorPos_y - 80, 100));

    clouds = [];
    for (var i = 0; i < 20; i++) {
        clouds[i] = new Clouds();
    };
    
    snows = [];
    
    enemies = [];
    enemies.push(new Enemy(100, floorPos_y - 20, 100));
    enemies.push(new Enemy(700, floorPos_y - 20, 100));
    enemies.push(new Enemy(800, floorPos_y - 20, 200));
    enemies.push(new Enemy(900, floorPos_y - 20, 300));
    enemies.push(new Enemy(2000, floorPos_y - 20, 100));

    backgroundMusic.loop();
}

function setup() {
    createCanvas(1024, 576);
    floorPos_y = height * 3 / 4;
    lives = 3;
    fading = false;
    startGame();
}

function draw() {
    background(100, 155, 255);

    noStroke();
    fill(255);
    image (backGround, 0, 0, width, height)
    rect(0, floorPos_y, width, height / 4);
    
    push();
    translate(scrollPos, 0);
    
    gravity();
    
    drawMountains();

    drawIgloo();

    drawTrees();

    renderFlagpole();

    for (var i = 0; i < canyons.length; i++) {
        drawCanyon(canyons[i]);
        checkCanyon(canyons[i]);
    }

    for (var i = 0; i < platforms.length; i++) {
        platforms[i].draw();
    }

    for (var i = 0; i < clouds.length; i++) {
        clouds[i].move();
        clouds[i].draw();
    }

    for (var i = 0; i < collectables.length; i++) {
        if (!collectables[i].isFound) {
            drawCollectable(collectables[i]);
            checkCollectable(collectables[i]);
        }
    }

    for (var i = 0; i < enemies.length; i++){
        enemies[i].draw();
        var isContact = enemies[i].checkContact (gameChar_world_x, gameChar_y);
        if (isContact){
            isInjured = true;
            if (InjuryTimer == 0 && lives > 0){
                lives --;
                damagedSound.play();
                break;
            }
        }
    }
    pop();
    
    drawGameChar();
    
    scoreBoard();
    
    startingScreen();

    if (lives < 1) {
        backgroundMusic.stop();
        textAlign(CENTER);
        fill(0);
        rect(0, 0, width, height);
        textSize(50);
        fill(255, 0, 0);
        text("Game Over", width / 2, height / 2);
        textSize(30);
        fill(255);
        text("Press 'SPACE' to continue", width / 2, height / 2 + 40);
        return;
    }
    if (flagpole.isReached) {
        textAlign(CENTER);
        textSize(50);
        fill(0, 128, 0);
        text("Level Complete", width / 2, height / 2);
        textSize(30);
        fill(255);
        text("Press 'SPACE' to continue", width / 2, height / 2 + 40);
        return;
    }
    
    if (isLeft) {
        if (gameChar_x > width * 0.2) {
            gameChar_x -= 5;
        } else {
            scrollPos += 5;
        }
    }
    
    if (isRight) {
        if (gameChar_x < width * 0.8) {
            gameChar_x += 5;
        } else {
            scrollPos -= 5; 
        }
    }
    if (gameChar_world_x >= 2300){
        isRight = false;
    } else if (gameChar_world_x <= -280){
        isLeft = false;
    }

    for (var i = 0; i < platforms.length; i++) {
        if (platforms[i].checkContact(gameChar_world_x, gameChar_y) &&
            isJumping == false) {
            gameChar_y = gameChar_y;
            velocity = 0;
            Energy = 10;
        }
    }

    let t = frameCount / 60;
    for (let i = 0; i < random(5); i++) {
        snows.push(new snow());
    }
    for (let flake of snows) {
        flake.update(t);
        flake.display();
    }
    
    if (!flagpole.isReached) {
        checkFlagpole();
    }

    Status();
    
    checkPlayerDie();
    
    gameChar_world_x = gameChar_x - scrollPos;
}

function keyPressed() {
    if (keyCode == 37 && gameChar_world_x >= -280) {
        isLeft = true;
        fading = true;
    }
    if (keyCode == 39 && gameChar_world_x <= 2300) {
        isRight = true;
        fading = true;
    }
    if (keyCode == 32 && lives > 0) {
        isJumping = true;
        jumpSound.play();
        fading = true;
    }
    if (keyCode == 32 && lives < 1) {
        lives = 3;
        startGame();
    }
    if (keyCode == 32 && flagpole.isReached == true) {
        lives = 3;
        startGame();
    }
}

function keyReleased() {
    if (keyCode == 37) {
        isLeft = false;
    }
    if (keyCode == 39) {
        isRight = false;
    }
    if (keyCode == 32 && lives > 0) {
        isJumping = false;
    }
}

function drawGameChar() {
    if (isLeft && isJumping && isInjured && InjuryTimer %6 == 0) {
        stroke(1);
        fill(255, 0, 0);
        ellipse(gameChar_x, gameChar_y - 50, 25, 25);
        ellipse(gameChar_x, gameChar_y - 25, 40, 30);
        ellipse(gameChar_x - 5, gameChar_y - 55, 1, 1);
        fill(237, 145, 33);
        ellipse(gameChar_x - 15, gameChar_y - 50, 5, 5);
    } else if (isRight && isJumping && isInjured && InjuryTimer %6 == 0) {
        stroke(1);
        fill(255, 0, 0);
        ellipse(gameChar_x, gameChar_y - 50, 25, 25);
        ellipse(gameChar_x, gameChar_y - 25, 40, 30);
        ellipse(gameChar_x + 5, gameChar_y - 55, 1, 1);
        fill(237, 145, 33)
        ellipse(gameChar_x + 15, gameChar_y - 50, 5, 5);
    } else if (isLeft && isInjured && InjuryTimer %6 == 0) {
        stroke(1);
        fill(255, 0, 0);
        ellipse(gameChar_x, gameChar_y - 50, 25, 25);
        ellipse(gameChar_x, gameChar_y - 20, 40, 40);
        ellipse(gameChar_x - 5, gameChar_y - 55, 1, 1);
        fill(237, 145, 33)
        ellipse(gameChar_x - 15, gameChar_y - 50, 5, 5)
    } else if (isRight && isInjured && InjuryTimer %6 == 0) {
        stroke(1)
        fill(255, 0, 0);
        ellipse(gameChar_x, gameChar_y - 50, 25, 25);
        ellipse(gameChar_x, gameChar_y - 20, 40, 40);
        ellipse(gameChar_x + 5, gameChar_y - 55, 1, 1);
        fill(237, 145, 33)
        ellipse(gameChar_x + 15, gameChar_y - 50, 5, 5);
    }
    else if (isPlummeting && isInjured && InjuryTimer %6 == 0 ||
             isJumping && isInjured && InjuryTimer %6 == 0) {
        stroke(1);
        fill(255, 0, 0);
        ellipse(gameChar_x, gameChar_y - 50, 25, 25);
        ellipse(gameChar_x, gameChar_y - 20, 40, 40);
        ellipse(gameChar_x - 5, gameChar_y - 55, 1, 1);
        fill(237, 145, 33)
        ellipse(gameChar_x - 15, gameChar_y - 50, 5, 5);
    } 
    else if (isLeft && isJumping) {
        stroke(1);
        fill(255);
        ellipse(gameChar_x, gameChar_y - 50, 25, 25);
        ellipse(gameChar_x, gameChar_y - 25, 40, 30);
        ellipse(gameChar_x - 5, gameChar_y - 55, 1, 1);
        fill(237, 145, 33);
        ellipse(gameChar_x - 15, gameChar_y - 50, 5, 5);
    } else if (isRight && isJumping) {
        stroke(1);
        fill(255);
        ellipse(gameChar_x, gameChar_y - 50, 25, 25);
        ellipse(gameChar_x, gameChar_y - 25, 40, 30);
        ellipse(gameChar_x + 5, gameChar_y - 55, 1, 1);
        fill(237, 145, 33)
        ellipse(gameChar_x + 15, gameChar_y - 50, 5, 5);
    } else if (isLeft) {
        stroke(1);
        fill(255);
        ellipse(gameChar_x, gameChar_y - 50, 25, 25);
        ellipse(gameChar_x, gameChar_y - 20, 40, 40);
        ellipse(gameChar_x - 5, gameChar_y - 55, 1, 1);
        fill(237, 145, 33)
        ellipse(gameChar_x - 15, gameChar_y - 50, 5, 5)
    } else if (isRight) {
        stroke(1)
        fill(255);
        ellipse(gameChar_x, gameChar_y - 50, 25, 25);
        ellipse(gameChar_x, gameChar_y - 20, 40, 40);
        ellipse(gameChar_x + 5, gameChar_y - 55, 1, 1);
        fill(237, 145, 33)
        ellipse(gameChar_x + 15, gameChar_y - 50, 5, 5);
    } else if (isPlummeting || isJumping) {
        stroke(1)
        fill(255);
        ellipse(gameChar_x, gameChar_y - 50, 25, 25);
        ellipse(gameChar_x, gameChar_y - 25, 40, 30);
        ellipse(gameChar_x - 5, gameChar_y - 55, 1, 1);
        ellipse(gameChar_x + 5, gameChar_y - 55, 1, 1);
        fill(237, 145, 33);
        ellipse(gameChar_x, gameChar_y - 50, 5, 5);
    } else if(isInjured && InjuryTimer %6 == 0){
        stroke(1);
        fill(255, 0, 0);
        ellipse(gameChar_x, gameChar_y - 50, 25, 25);
        ellipse(gameChar_x, gameChar_y - 20, 40, 40);
        ellipse(gameChar_x - 5, gameChar_y - 55, 1, 1);
        ellipse(gameChar_x + 5, gameChar_y - 55, 1, 1);
        fill(237, 145, 33);
        ellipse(gameChar_x, gameChar_y - 50, 5, 5);
    } else {
        stroke(1);
        fill(255);
        ellipse(gameChar_x, gameChar_y - 50, 25, 25);
        ellipse(gameChar_x, gameChar_y - 20, 40, 40);
        ellipse(gameChar_x - 5, gameChar_y - 55, 1, 1);
        ellipse(gameChar_x + 5, gameChar_y - 55, 1, 1);
        fill(237, 145, 33);
        ellipse(gameChar_x, gameChar_y - 50, 5, 5);
    }
}

function drawMountains() {
    for (var i = 0; i < mountains.length; i++) {
        fill(101, 67, 33);
        triangle(mountains[i].x_pos, mountains[i].y_pos,
                 mountains[i].x_pos + 100, floorPos_y,
                 mountains[i].x_pos - 40, floorPos_y);
        fill(120, 80, 39);
        triangle(mountains[i].x_pos - 40, mountains[i].y_pos + 50,
                 mountains[i].x_pos + 50, floorPos_y,
                 mountains[i].x_pos - 90, floorPos_y);
        //snow
        fill(255, 250, 250);
        triangle(mountains[i].x_pos, mountains[i].y_pos,
                 mountains[i].x_pos - 10, mountains[i].y_pos + 60,
                 mountains[i].x_pos + 26, mountains[i].y_pos + 60);
        triangle(mountains[i].x_pos - 40, mountains[i].y_pos + 50,
                 mountains[i].x_pos - 54, mountains[i].y_pos + 100,
                 mountains[i].x_pos - 15, mountains[i].y_pos + 100);
    }

}

function drawTrees() {
    for (var i = 0; i < trees_x.length; i++) {
        image(tree, trees_x[i], floorPos_y - 130, 80, 130);
    }
}

function renderFlagpole() {
    push();
    strokeWeight(5);
    stroke(0);
    line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 200);

    if (flagpole.isReached) {
        fill(0, 128, 0);
        triangle(flagpole.x_pos, floorPos_y - 200,
                 flagpole.x_pos, floorPos_y - 140,
                 flagpole.x_pos + 60, floorPos_y - 170)
    } else {
        fill(0, 128, 0);
        triangle(flagpole.x_pos, floorPos_y - 50,
                 flagpole.x_pos, floorPos_y - 10,
                 flagpole.x_pos + 60, floorPos_y - 30)
    }

    pop();
}

function checkFlagpole() {
    if (abs(gameChar_world_x - igloo.x_pos) < 10 && game_score == 5) {
        flagpole.isReached = true;
        backgroundMusic.stop();
        winSound.play();
    }
}

function drawCanyon(t_canyon) {
    for (var i = 0; i < canyons.length; i++) {
        noStroke();
        fill(105);
        rect(t_canyon.x_pos, floorPos_y, t_canyon.width, 300);
        for (var i = 0; i < t_canyon.width / 10; i++){
            image(spike, t_canyon.x_pos + [i]*10, height - 10, 10, 10)
        }
    }
}

function checkCanyon(t_canyon) {
    if (gameChar_world_x - 10 > t_canyon.x_pos &&
        gameChar_world_x + 10 < t_canyon.x_pos + t_canyon.width &&
        gameChar_y >= floorPos_y) {
        isPlummeting = true;
    }
}

function drawCollectable(t_collectable) {
    for (var i = 0; i < collectables.length; i++) {
        imageMode(CENTER);
        image(snowFlakes, t_collectable.x_pos, t_collectable.y_pos, t_collectable.size + 5, t_collectable.size)
    }
}

function checkCollectable(t_collectable) {
    if (dist(gameChar_world_x, gameChar_y - 30, t_collectable.x_pos, t_collectable.y_pos) < 35) {
        t_collectable.isFound = true;
        game_score += 1;
        collectablesSound.play();
    }
    return false;
}

// ---------------------------------
// Extenstions
// ---------------------------------

function checkPlayerDie() {
    if (gameChar_y > height - 10) {
        backgroundMusic.stop();
        deathSound.play();
        lives = 0;
    }
}
function scoreBoard() {
    fill(255);
    stroke(1);
    textSize(20);
    textAlign(LEFT);
    text("Lives: ", 10, 30);
    text("Energy:", 10, 50);
    fill(255, 191, 0);
    rect(90, 40, 10 * Energy, 10);
    for (var i = 0; i < lives; i++) {
        image(heart, 70 + i * 30, 15, 20, 20);
    };
    fill(255);
    textAlign(CENTER);
    text("Snowflakes: " + game_score + "/5", 500, 30);
}

function drawIgloo() {
    image(iglooHome, igloo.x_pos, floorPos_y - 100, 150, 100);
}

function Clouds() {
    this.x = random(- 700, 3000);
    this.y = random(90, 170);
    this.size = 50
    this.draw = function () {
        noStroke();
        fill(255);
        ellipse(this.x, this.y, this.size + 100, this.size + 10);
        ellipse(this.x - 10, this.y - 30, this.size + 50, this.size + 30);
        ellipse(this.x + 30, this.y - 20, this.size + 30, this.size);
    }
    this.move = function () {
        this.x = this.x += 1;
        if (this.x > 2500) {
            this.x = -300;
        }
    }
}
function startingScreen(){
    let x = 255;
    textSize(30);
    fill(0, 0, 0, x);
    if(!fading){
        x -= 5;
        textAlign(CENTER);
        text("Use 'Arrow Keys' to move Left and Right / 'Space' to Jump", 
             width/2, height/2 - 200);
        text("Collect all SnowFlakes to win the game", 
             width/2, height/2 - 150);
    }
    else{

    }
}

// Credits anna10128 on https://editor.p5js.org/anna10128/sketches/aCy8mWxV6
// I was able to recreate the effect using the codes as reference.
function snow() {
    this.X = 0;
    this.Y = random(-50, 0);
    this.initialangle = random(0, 2 * PI);
    this.size = random(1, 4);
    this.radius = sqrt(random(pow(width / 2, 2)));
    this.update = function (time) {
        let w = 0.6;
        let angle = w * time + this.initialangle;
        this.X = width / 2 + this.radius * sin(angle);
        this.Y += pow(this.size, 0.5);

        if (this.Y > height) {
            let index = snows.indexOf(this);
            snows.splice(index, 1);
        }
    };
    this.display = function () {
        fill(255);
        noStroke();
        ellipse(this.X, this.Y, this.size);
    };
}

// Extension 1: Platform. Thanks to the tutorial, I was able to create platforms at my desired position.  The platform will be solid when the character fall on it and if the player is holding Spacebar, they will fall through it instead which forces player to be more precise with their movement. I ran to problems like the character be slightly on top of the platforms and the character would instantly teleport to the platform making it looks weird. Thus, I had to reform how my character jump and how gravity worked to make it smoother which created a lot more problem which I was able to solved. I was able to practice more on the for loop to make sure that the character is standing correctly on each platform. I was also able to practice more on the function arguments and arrays for gravity and created energy system.
function createPlatforms(x, y, length) {
    var p = {
        x: x,
        y: y,
        length: length,
        draw: function () {
            fill(255);
            stroke(1);
            rect(this.x, this.y, this.length, 20);
        },
        checkContact: function (gc_x, gc_y) {
            if (gc_x + 5 > this.x && gc_x - 5 < this.x + this.length) {
                var d = this.y - gc_y;
                if (d >= 0 && d < 1) {
                    return true;
                }
            }
            return false;
        }
    }
    return p;
}

function gravity() {
    if (gameChar_y >= floorPos_y && !isJumping && !isPlummeting) {
        gameChar_y = gameChar_y;
        isJumping = false;
        Energy = 10;
    } else {
        gameChar_y = gameChar_y + (velocity);
    }
    if (isJumping && !isPlummeting) {
        if (gameChar_y <= 50 || Energy == 0) {
            if (gameChar_y >= floorPos_y) {
                gameChar_y = floorPos_y;
                isJumping = false;
            } else {
                velocity = fallingSpeed;
            }
        } else {
            velocity = -jumpPower;
            Energy -= 1;
        }
    } else {
        velocity = fallingSpeed;
    }
    if(isPlummeting){
        velocity = fallingSpeed;
        isJumping = false;
        isLeft = false;
        isRight = false
    }
}

// Extension 2: Enemy take form of a fire spirit as my character is a snowman. So, I used the tutorial to create the enemy function which allowed me to spawn enemy into my world at my desired location. I wanted when my character touches the enemy, a sound will be played to notify that the player was injured, and they will lose one heart. But at first every time they contact, due to the for loop, the character will lose lives constantly at a rate of 1, and the sound will be repeated, and it doesn’t stop, making it hard for me to continue. So, I had to create a new variable and learn how to make an invulnerable phase for my character. I was able to practice my for loop and constructor commands, which allowed me to make sure that when the character is injured, he will enter a invulnerable phase before he lose another life if he comes into contact with the enemy.
function Enemy (x, y, range){
    this.x = x;
    this.y = y;
    this.range = range;
    this.currentX = x;
    this.inc = 1;
    
    this.update = function(){
        this.currentX += this.inc;
        
        if(this.currentX >= this.x + this.range){
            this.inc = -1;
        }
        else if(this.currentX < this.x){
            this.inc = 1;
        }
    }
    this.draw = function(){
        this.update();
        imageMode(CENTER);
        image(fireEnemies, this.currentX, this.y, 40, 40);
    }

    this.checkContact = function(gc_x, gc_y){
        var d = dist(gc_x, gc_y - 30, this.currentX, this.y);
        if (d < 40){
            return true;
        }
        return false;
    }
}
function Status(){
    if(isInjured){
        if (InjuryTimer < 120){
            InjuryTimer++;
        }
        else {
            isInjured = false;
            InjuryTimer = 0;
        }
    }
}

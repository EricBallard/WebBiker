// Init graphics
var c = document.createElement('canvas');
var ctx = c.getContext('2d');
c.width = 500;
c.height = 350;
document.body.appendChild(c);


// Terrain generation | Credits: k3dev (https://www.youtube.com/watch?v=MW8HcwHK1S0)
var perm = [];
while (perm.length < 255) {
    while (perm.includes(val = Math.floor(Math.random() * 255)));
    perm.push(val);
}
var lerp = (a,b,t) => a + (b - a) * (1 - Math.cos(t * Math.PI)) / 2;

var noise = x => {
    x = x * 0.01 % 255;
    return lerp(perm[Math.floor(x)], perm[Math.ceil(x)], x - Math.floor(x));
}

// Player 
var player = new function() {
    // Exhaust fumes
    function Particle(ps, px, py) {
        this.size = ps;
        this.x = px;
        this.y = py;
    }

    this.fumes = new Array();

    // Position
    this.x = c.width / 2, this.y = 0;
    this.doingTrick = false;
    this.grounded = false;

    // Velocity
    this.xSpeed = 0, this.ySpeed = 0;
    this.rotation = 0, this.rotationSpeed = 0;

    // Player image
    this.img = new Image();
    this.img.src = '/resources/biker.png';

    // Crash
    this.imgBiker = null;

    this.update = function() {
        // Calculate player position
        const disMultiplier = (distanceTraveled / 15000);
        var rearWheel =  c.height - (distanceTraveled < 595 ? 250 : distanceTraveled < 604 ?
            250 - (604 - distanceTraveled)  : noise(distanceTraveled + 5 + this.x)  * (0.25  * (disMultiplier < 1 ? 1 : disMultiplier)));

        var frontWheel =  c.height - (distanceTraveled < 595 ? 250 : distanceTraveled < 604 ?
            250 - (604 - distanceTraveled)  : noise(distanceTraveled + this.x)  * (0.25  * (disMultiplier < 1 ? 1 : disMultiplier)));

        // Simulate road vibration while accelerating
        if (controls.Up == 1 && controls.Left == 0 && controls.Right == 0)
             frontWheel += Math.round(Math.random()) == 1 ? ((Math.random() * 20) / 100) + 0.1 : 0;

         // Analayze if player is on ground or in air
        if (frontWheel - 15 > this.y) {
            this.ySpeed += 0.1;
            this.grounded = false;
        } else {
            this.ySpeed -= this.y - (frontWheel - 15);
            this.y = frontWheel - 15;
            this.grounded = true;
        }

        var crashed = false;

          // Perform stunt trick or init crash
        if (this.doingTrick) {
            if (this.grounded) {
                crashed = true;
            } else if(controls.Trick == 0) {
                this.img.src = '/resources/biker.png';
                this.doingTrick = false;
            }
        } else if (!this.grounded) {
            if(controls.Trick == 1) {
                this.img.src = '/resources/biker_trick.png';
                this.doingTrick = true;
            }
        }


        // Burn/decrease gas + spawn exhaust fumes
        const accelerating = gasoline > 0 && controls.Up == 1;

        if (accelerating && this.fumes.length < random(8, 16 * (this.xSpeed + 1))) {
            const fumesToSpawn = random(8, 16);
            var fumeSize = this.fumes.length;

            for (let spawn = 0; spawn < fumesToSpawn; spawn++) {
                var rotOff = ((this.rotation + 1) * 100);

                var px = this.x, py = this.y + random(-2, 2);

                 if (rotOff > 0 && rotOff < 90) {
                    // Bike is rotated between 9-12 o'clock
                    px -= random(25, 75);
                    py += random(5, 10);
                } else if (rotOff > 140) {
                    px -= random(25, 75);
                    py -= random(10, 20);
                } else if (rotOff < -110) {
                    // Bike is 6-9 o'clock
                    px += random(25, 75)
                } else if (rotOff < -10) {
                    px = this.x + random(-2, 2);
                    py += random(5, 10);
                } else {
                    px -= random(25, 75);
                }


                this.fumes[fumeSize + spawn] = new Particle(Math.random() * (player.grounded ? 2 : 1), px, py);
                fumeSize += 1;
            }
        }

        if (accelerating && player.grounded && Math.round(distanceTraveled - runwayLength) > 0)
            gasoline = gasoline - 0.75 < 0 ? 0 : gasoline - 0.75;
        
        // If game is over, player runs out of gas, player is idling and touching start wall, or has crashed
        const outOfGas = gameOver || crashed ? false : gasoline < 1 && this.grounded && this.xSpeed < 0.015;

        if (gameOver || crashed || outOfGas || distanceTraveled < -250
            || this.grounded && Math.abs(this.rotation) > Math.PI * 0.5
            || ((distanceTraveled > runwayLength && distanceTraveled < runwayLength + 10) && this.grounded && this.xSpeed < 0.009)) {

            // Reset controls
            controls.Up = 0;
            controls.Down = 0;

            if (!gameOver) {
                // Game has just ended - show leaderboard and spawn wreckage
                var leaderboard = document.getElementById('leaderboard');
                leaderboard.style.display = 'block';

                if (!outOfGas) {
                    // Split rider/bike sprite into 2 for crash animation 
                    this.img.src = '/resources/bike_alacarte.png';

                    // Pick random fall image
                    this.imgBiker = new Image();
                    this.imgBiker.src = '/resources/biker_fall_' + Math.round(Math.random()) +'.png';

                    // Determine which side to draw player on relavent to rotation
                    crashOffset = this.rotation > 0.5 ? 10 : -10;
                }
            }

            // Declare game is over - player has crashed or gone out of bounds
            gameOver = true;

             // Rotate and position according to speed
            this.rotationSpeed = this.rotation > 0.5 ? (this.xSpeed - (this.xSpeed * 2)) : this.xSpeed;
            this.x -= this.xSpeed * 2.5;
        }

        // Calculate player rotation and speed
        var angle = Math.atan2((rearWheel - 15) - this.y, (this.x + 5) - this.x);
        this.y += this.ySpeed;

        if (this.grounded && !gameOver) {
            this.rotation -= (this.rotation - angle) * 0.5;
            this.rotationSpeed =  this.rotationSpeed - (angle - this.rotation);
        }
        
        this.rotationSpeed +=  (distanceTraveled < runwayLength + 5 && distanceTraveled > runwayLength - 5)
        ? -0.05 : (controls.Left - controls.Right) * 0.05;

        this.rotation -= this.rotationSpeed * 0.1;

        // Normalize rotation
        if (this.rotation > Math.PI) this.rotation = -Math.PI;
        if (this.rotation < -Math.PI) this.rotation = Math.PI;

        // Draw to graphics
        if (this.imgBiker != null) {
             // Draw biker in crash
            ctx.save();
            ctx.translate(this.x + crashOffset, this.y);

            // Calculate biker rotation randomly
            ctx.rotate(this.rotation);

            ctx.drawImage(this.imgBiker, -15, -15, 20, 20);
            ctx.restore();
        }

        // Draw player
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.drawImage(this.img, -15, -15, 30, 30);
        ctx.restore();
    }
}


// Generate "random" numbers
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Background
const gradient = ctx.createRadialGradient(250, 175, 500, 90, 60, 100);
gradient.addColorStop(0, '#0033FF');
gradient.addColorStop(1, '#33FFFF');

// Clouds / Jerry cans
var cloudSeed = -1;
var clouds = new Array();
var jerryCans = new Array();

function GameObject(isCloud, iimg, moveSpeed, ix, iy, iw, ih) {
    this.cloud = isCloud;
    this.img = iimg;
    this.speed = moveSpeed;
    this.x = ix;
    this.y = iy;
    this.w = iw;
    this.h = ih;
}

// Game statistics
const runwayLength = 600;

var distanceTraveled = 0;
var crashOffset = 0;
var gasoline = 125;

var gameOver = false;

// Game go brr
function loop() {
    if (!gameOver || (player.grounded && player.xSpeed > 0.015)) {
        // Calculate players speed and relative distance traveled
        const disMultiplier = (distanceTraveled / 15000);
        const speedMultiplier = (player.grounded || player.xSpeed  > 0.15 ? controls.Up - (player.grounded ? controls.Down : 0) : 0)
        player.xSpeed  -= (player.xSpeed  - speedMultiplier) * 0.015;
        distanceTraveled += 10 * player.xSpeed ;

        // Score
        const traveled = (distanceTraveled - runwayLength);
        
        // Canvas background
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0 , c.width, c.height);  

        // Spawn clouds + jerry cans
        const laps = distanceTraveled / c.width;

        var cloudCount = clouds.length;
        const noClouds = cloudCount == 0;

        var canCount = jerryCans.length;

        if (noClouds || cloudSeed < laps)  {
            // Spawn jerry cans
            if (!noClouds) {
                const spawnCan = gasoline / 25 < random(-1, 4) ;
                
                if (spawnCan) {
                    // Spawn random jerry can
                    var canImg = new Image();
                    canImg.src = '/resources/jerrycan.png';
                        
                    jerryCans[canCount] = new GameObject(false, canImg, 0,  c.width, random(50 / disMultiplier, c.height / 2), 30, 30);
                    canCount += 1;
                }
            }

            // Spawn clouds
            const spawnCloud = noClouds || cloudSeed == -1 ? 1 : Math.round(Math.random()) == 1;
            cloudSeed++;
    
             if (spawnCloud) {
                // Generate random cloud
                var cimg = new Image();
                cimg.src = '/resources/cloud_' + (Math.round(Math.random())) + '.png';
                    
                const cloudY = random(random(-25, 0), traveled > 0 ? 100 : 25);
                const cWidth = random(0, 100) + 50;
                const cHeight = random(0, 25) + 25;

                clouds[cloudCount] = new GameObject(true, cimg, (random(3, 12) / 100),  c.width, cloudY, cWidth, cHeight);
                cloudCount += 1;
            }
        }
        

        // Draw game objects
        const objsToDraw = cloudCount + canCount;

        for (var objToDraw = 0; objToDraw < objsToDraw; objToDraw++) {
            const drawingClouds = cloudCount > 0 && objToDraw < cloudCount;
            const objIndex =  drawingClouds ? objToDraw : objToDraw - cloudCount;
            const gameObject = (drawingClouds ? clouds: jerryCans)[objIndex];

            // Remove object if out of view
             if (gameObject == undefined || gameObject.x + gameObject.w <= 10) {
                (drawingClouds ? clouds: jerryCans).splice(objIndex, 1);
                continue;
            }

            // Jerry can collision detection
            if (!gameObject.cloud) {
                if (player.x > gameObject.x  && player.x < gameObject.x + 30) {
                    if (player.y > gameObject.y && player.y < gameObject.y + 30) {
                        jerryCans.splice(objIndex, 1);
                        gasoline = gasoline + 50 > 125 ? 125 : gasoline + 50;
                        continue;
                    }
                }
            }

            gameObject.x -= (player.xSpeed + gameObject.speed) * (gameObject.cloud ? 2.5 : 4);
            ctx.drawImage(gameObject.img, gameObject.x, gameObject.y, gameObject.w, gameObject.h);
        }

        // Draw exhaust fumes
        const fumeSize = player.fumes.length;
        ctx.fillStyle = 'white';
        
        for (let fumeToDraw = 0; fumeToDraw < fumeSize; fumeToDraw++) {
            const fume = player.fumes[fumeToDraw];

            if (fume == undefined || player.x - fume.x > random(25, 200)) {
                player.fumes.splice(fumeToDraw, 1);
                continue;
            }

            ctx.beginPath();
            fume.x -= (player.xSpeed * random(1, 5)) + .5;
            fume.y -= 0.1;

            ctx.arc(fume.x, fume.y, fume.size, 0, Math.PI * 2, true);
            ctx.fill();
        }

        
        // Canvas border
        ctx.lineWidth = 10;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(0, 0, c.width, c.height);

        // Init terrain generation
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(0, c.height);

        // Generate terrain
        for (let drawX = 0; drawX < c.width; drawX++) {
            const disX = distanceTraveled + drawX;
            const seed = disX < runwayLength * 1.42 ? 100 : c.height - noise(disX)
                 * (0.25  * (disMultiplier < 1 ? 1 : disMultiplier));

            ctx.lineTo(drawX, seed);
        }

        // Draw terrain
        ctx.lineTo(c.width, c.height);
        ctx.fill();

         // Draw player
        player.update();

         // Draw score
         ctx.font = "px Verdana Bold";
         ctx.fillText('SCORE: ' + (traveled < 0 ? 0 : Math.round(traveled)), 10, 50)
         ctx.fillText('Rotation: ' + ((player.rotation + 1) * 100), 25, 75)

         // Draw fuel level
         ctx.fillStyle = 'gray';
        ctx.fillRect(10, 16, gasoline, 13);

        ctx.fillStyle = 'black';
        ctx.font = "12px Verdana";
        ctx.fillText('GASOLINE', 12.5, 27.25)

         // Draw fuel guage
         ctx.lineWidth = 2;
         ctx.strokeRect(10, 15, 125, 15);
    }

    // Update canvas
    requestAnimationFrame(loop);
}

// Player control - tracks status of button press
var controls = {Up:0, Down:0, Left:0, Right:0, Trick:0};

function updateKey(key, status) {
    if (!gameOver) {
        switch(key){
            case 'ArrowUp':
                if (gasoline < 1)
                    status = 0;

                controls.Up = status;
                break;
            case 'ArrowDown':
                controls.Down = status;
                break;
             case 'ArrowLeft':
                controls.Left = status;
                break;
            case 'ArrowRight':
                controls.Right = status;
                break;
            case ' ':
                if (player.grounded && status == 1)
                    break;

                controls.Trick = status;
                break;
        }
    }
}

onkeydown = e => { updateKey(e.key, 1) };
onkeyup = e => { updateKey(e.key, 0) };

// It's alive!
loop();
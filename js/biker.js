// Define canvas
var c = document.createElement('canvas');
var ctx = c.getContext('2d');

const width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
const height = ((window.innerWidth > 0) ? window.innerHeight : screen.height) / 2;

c.width = width;
c.height = height;
document.body.appendChild(c);

// Register listener to interact with canvas
var hoveringControl = false;
var muteAudio = false;

function getMousePos(canvas, e) {
    var rect = c.getBoundingClientRect();
    return {
        x: (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) - rect.left,
        y: (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) - rect.top
    };
}
 

function isHovering(mx, my,x, y, w, h) {
    if (mx < x + w   && mx > x - w / 3)
        if (my < y + h  && my > y - h / 3)
            return true;
    return false;
}

function mouseMove(evt) {
    hoveringControl = false;

    mousePos = getMousePos(c, evt);
    const x = mousePos.x, y = mousePos.y;

    // Hover static control displays (mobile controls)
    if (usingMobile) {
        evt.preventDefault();

        if (isHovering(x, y, upPos.x, upPos.y, 45, 45)) {
            hoveringControl = 'UP';
        } else if (isHovering(x, y, downPos.x, downPos.y, 45, 45)) {
            hoveringControl = 'DOWN';
        } else if (isHovering(x, y, leftPos.x, leftPos.y, 45, 45)) {
            hoveringControl = 'LEFT';
        } else if (isHovering(x, y, rightPos.x, rightPos.y, 45, 45)) {
            hoveringControl = 'RIGHT';
        }
    }

    // Hover control diagrams (audio / pc controls)
    if (!hoveringControl) {
        const diagrams = controlDiagrams.length;

        for (var d = 0; d < diagrams; d++) {
            const control = controlDiagrams[d];

            if (isHovering(x, y, control.x, control.y, control.w, control.h)) {
                switch(d) {
                    case 0:
                    hoveringControl = 'AUDIO';
                    break;
                }
            }
        }
    }

    c.style.cursor = hoveringControl ? 'pointer' : 'default';
}

c.addEventListener('mousemove', event => mouseMove(event), false);

function mouseClick(evt, down) {
    if (usingMobile) {
        mouseMove(evt);
    }

    if (hoveringControl == false)
        return;
    else {
        console.log(evt +  '  | Down: ' + down + ' | Click: ' + hoveringControl);

        switch (hoveringControl) {
            case 'AUDIO':
                if (down)
                    return;

                if (muteAudio = !muteAudio)
                    audio.pause();
                else
                    audio.play();

                audioImg.src = '/resources/controls/audio_' + (muteAudio ? 'off' : 'on') + '.png';
                break;
            case 'LEFT':
                controls.Left = down ? 1 : 0;
                break;
            case 'RIGHT':
                controls.Right = down ? 1 : 0;
                break;
            case 'UP':
                accelerate(down ? 1 : 0);
                break;
            case 'DOWN':
                controls.Down = down ? 1 : 0;
                break;
        }
    }
}

c.addEventListener('mousedown',  event => mouseClick(event, true));
c.addEventListener('mouseup', event => mouseClick(event, false));

c.addEventListener('touchstart',  event => mouseClick(event, true));
c.addEventListener('touchend',  event => mouseClick(event, false));

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

// Game Audio
const audio = new Audio('/resources/audio/background_music_compressed.mp3');
audio.volume = 0.35;
audio.loop = true;

const accel_sfx = new Audio('/resources/audio/motobike_accelerate.mp3');
accel_sfx.loop = true;

function fadeOut(p_audio){  
    var actualVolume = p_audio.volume;
    var fadeOutInterval = setInterval(function(){
        actualVolume = (parseFloat(actualVolume) - 0.1).toFixed(1);
        if(actualVolume >= 0){
            p_audio.volume = actualVolume;
        } else {
            p_audio.pause();
            clearInterval(fadeOutInterval);
        }
    }, 100);
}

var seedX = -1;

// Player 
var player = new function() {
    // Player image
    this.imgBiker = null, this.backdrop = new Image(), this.img = new Image();
    this.backdrop.src = '/resources/etc/highlight_drop.png';
    this.img.src = '/resources/biker/biker.png';
    this.w = 30, this.h = 30;

    // Position
    this.x = c.width / 2, this.y = 0;
    this.doingTrick = false;
    this.grounded = false;
    this.trickCounter = 0;

    // Velocity
    this.xSpeed = 0, this.ySpeed = 0;
    this.rotation = 0, this.rotationSpeed = 0;

    // Score popups + debris
    this.popups = new Array(), this.debris = new Array();

    this.update = function() {
        // Calculate player position
        var rearWheel, frontWheel;

        if (distanceTraveled < runwayLength ) {
            rearWheel =  distanceTraveled >= runwayLength - 5 ? 100 - (distanceTraveled - runwayLength) : 100;
            frontWheel = rearWheel;
        } else {
            const disMultiplier = (distanceTraveled / 20000);
            rearWheel =  c.height - (noise(distanceTraveled + 5 + this.x)  * (0.25  * (disMultiplier < 1 ? 1 : disMultiplier)));
            frontWheel = seedX;
        }


        // Simulate road vibration while accelerating
        if (controls.Up == 1 && controls.Left == 0 && controls.Right == 0)
             frontWheel += Math.round(Math.random()) == 1 ? ((Math.random() * 20) / 100) + 0.1 : 0;

         // Analayze if player is on ground or in air
         const off = (frontWheel - 15);

         if (!isNaN(off)) {
            if (off> this.y) {
                this.ySpeed += 0.1;
                this.grounded = false;
            } else {
                this.ySpeed -= this.y - off;
                this.y = off;
    
                this.grounded = true;
            }
        }

         // Perform stunt trick or init crash
        var crashed = this.grounded && Math.abs(this.rotation) > Math.PI * 0.5;

        if (!crashed) {
            var popSize = this.popups.length;

            if (this.doingTrick) {
                if (this.grounded) {
                    crashed = true;
                } else if(controls.Trick == 0) {
                    this.w = 30, this.h = 30;
                    this.img.src = '/resources/biker/biker.png';
                    this.doingTrick = false;
                } else {
                    // Hold trick for points
                    if (this.trickCounter < 25) {
                        this.trickCounter += 1;
                    } else {
                        // Successfully doing trick
                        this.trickCounter = 0;
                        score = score + 250;
                        const px = this.x + (Math.round(Math.random()) == 1 ? random(-60, -45) : random(15, 30));
                        this.popups[popSize == 0 ? 0 : popSize+= 1] = new Popup("+250", px, this.y - random(15, 30));
                    }
                }
            } else if (!this.grounded) {
                if(controls.Trick == 1) {
                    this.w = 33, this.h = 33;
                    this.img.src = '/resources/biker/biker_trick.png';
                    this.doingTrick = true;
                    this.trickCounter = 0;
                }
            }
        }

        // Spawn debris
        const accelerating = player.grounded && gasoline > 0 && controls.Up == 1;

        if (accelerating && this.debris.length < random(8, 16 * (this.xSpeed + 1))) {
            const debrisToSpawn = random(8, 16);
            var debrisize = this.debris.length;

            for (let spawn = 0; spawn < debrisToSpawn; spawn++) {
                var px = this.x - random(0, 50), py = this.y + random(0, 10);
                const rotOff = ((this.rotation + 1) * 100);

                 if (rotOff < 90) {
                    // Facing up hill
                    py += random(0, 10);
                } else if (rotOff > 100) {
                    // Facing down hill
                    py -= random(0, 10);
                }

                this.debris[debrisize + spawn] = new Particle(Math.random() * 1, px, py);
                debrisize += 1;
            }
        }

        // Burn gasoline
        if (accelerating && Math.round(distanceTraveled - runwayLength) > 0)
            gasoline = gasoline - 0.75 < 0 ? 0 : gasoline - 0.75;
        
        // If game is over, player runs out of gas, player is idling and touching start wall, or has crashed
        const outOfGas = gameOver || crashed ? false : gasoline < 1 && this.grounded && this.xSpeed < 0.015;

        // End game
        if (gameOver || crashed || outOfGas || distanceTraveled < -250
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
                    this.img.src = '/resources/biker/bike_alacarte.png';

                    // Pick random fall image
                    this.imgBiker = new Image();
                    this.imgBiker.src = '/resources/biker/biker_fall_' + Math.round(Math.random()) +'.png';

                    // Determine which side to draw player on relavent to rotation
                    crashOffset = this.rotation > 0.5 ? 10 : -10;
                }
                
                // Set audio to end
                audio.currentTime = 112;
                audio.loop = false;

                accel_sfx.pause();
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

        var flipped = false;
        // Normalize rotation
        if (this.rotation > Math.PI) {
            // Front flip
            this.rotation = -Math.PI; 
            flipped = true;
        }

        if (this.rotation < -Math.PI) {
            // Back flip
            this.rotation = Math.PI;
            flipped = true;
        }

        if (!gameOver && flipped) {
            score += 1000;
            const px = this.x + (Math.round(Math.random()) == 1 ? random(-60, -45) : random(15, 30));
            this.popups[popSize == 0 ? 0 : popSize + 1] = new Popup("+1000", px, this.y - random(15, 30));
        }

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

        // If player y is above canvas height - show player highlight backdrop 
        const flyingHigh = score > 0 && this.y < 0;
        
        if (flyingHigh) {
            if (this.doingTrick) {
                if (!this.img.src.includes('biker_trick_highlight.png')) {
                    this.img.src = '/resources/biker/biker_trick_highlight.png';
                }
            } else {
                if (!this.img.src.includes('biker_highlight.png')) {
                    this.img.src = '/resources/biker/biker_highlight.png';
                }
            }

            // Draw height text
            ctx.translate(this.x - 30, 0 + 15);
            ctx.drawImage(this.backdrop, 0, 0, 60, 60);

            ctx.fillStyle = 'gray'
            ctx.font = "1.15rem Verdana Bold";
            ctx.fillText((Math.round(c.height - this.y) + "M"), 15, 75);

            ctx.translate(30, 30);

            //TODO
        } else {
            if (!this.doingTrick && !this.img.src.includes('biker.png'))
                this.img.src = '/resources/biker/biker.png';

            ctx.translate(this.x, this.y);
        }

        ctx.rotate(this.rotation);
        ctx.drawImage(this.img, -15, -15, this.w, this.h);
        ctx.restore();
    }
}

// Generate "random" numbers
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Background
var gradient = ctx.createLinearGradient(0, 0, 0, 170);
gradient.addColorStop(0, "#ff99cc");
gradient.addColorStop(1, "#33ccff");


// Pop up / debris objects
function Popup(pt, px, py) { this.text = pt, this.x = px, this.y = py; }
function Particle(ps, px, py) { this.size = ps, this.x = px, this.y = py; }

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
const runwayLength = width;

var distanceTraveled = 0;
var crashOffset = 0;
var gasoline = 125;
var score = 0;

var gameOver = false;

// Mobiles controls
function Position(px, py) {
    this.x = px;
    this.y = py;
}

const upImg = new Image(),  downImg = new Image();
const leftImg = new Image(),  rightImg = new Image();

upImg.src = '/resources/controls/mobile_up.png';
downImg.src = '/resources/controls/mobile_down.png';

leftImg.src = '/resources/controls/mobile_left.png';
rightImg.src = '/resources/controls/mobile_right.png';

const upPos = new Position(c.width / 4, c.height - (c.height / 4));
const downPos = new Position(upPos.x - 100, upPos.y);

const leftPos = new Position(c.width - (c.width / 4) - 50, upPos.y);
const rightPos = new Position(leftPos.x + 100, upPos.y);

// Control info diagrams
var controlDiagrams = new Array();

const audioImg = new Image();
audioImg.src = '/resources/controls/audio_on.png';
controlDiagrams[0] = new GameObject(false, audioImg, 0,  rightPos.x, 130, 45, 45);


// Game go brr
function loop() {
    if (!gameOver || (player.grounded && player.xSpeed > 0.015)) {
        // Calculate players speed and relative distance traveled
        const disMultiplier = (distanceTraveled / 20000);
        const speedMultiplier = (player.grounded || player.xSpeed  > 0.15 ? controls.Up - (player.grounded ? controls.Down : 0) : 0)
        player.xSpeed  -= (player.xSpeed  - speedMultiplier) * 0.015;

        const momentum =10 * player.xSpeed;
        distanceTraveled += momentum;

        // Score
        const traveled = (distanceTraveled - runwayLength);
        score = (traveled < 1 ? 0 : score + momentum);

        // Canvas background
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0 , c.width, c.height);  

        // Spawn clouds + jerry cans
        const laps = distanceTraveled / 500;

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
                    canImg.src = '/resources/etc/jerrycan.png';
                        
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
                cimg.src = '/resources/etc/cloud_' + (Math.round(Math.random())) + '.png';
                    
                const cloudY = random(random(-25, 0), traveled > 0 ? 100 : 25);
                const cWidth = random(0, 100) + 50;
                const cHeight = random(0, 25) + 25;

                clouds[cloudCount] = new GameObject(true, cimg, (random(3, 12) / 100),  c.width, cloudY, cWidth, cHeight);
                cloudCount += 1;
            }
        }

        // Draw debris + popups
        ctx.fillStyle = 'black';
        const popSize = player.popups.length, debSize = player.debris.length;
        const amountToDraw = popSize +  debSize;
        
        for (let toDraw = 0; toDraw < amountToDraw; toDraw++) {
            const drawingPopup = popSize > 0 && toDraw < popSize;
            const objIndex =  drawingPopup ? toDraw : toDraw - popSize;

            const drawable = (drawingPopup ? player.popups : player.debris)[objIndex];
            var isDebris = false;

            // Remove if out of view 
            if (drawable == undefined ||
                 player.x - drawable.x > ((isDebris = Particle.prototype.isPrototypeOf(drawable) || (player.grounded && player.xSpeed < 0.25)) ? random(25, 200) : random(100, 400))) {
               
                (drawingPopup ? player.popups: player.debris).splice(objIndex, 1);
                continue;
            }

            drawable.x -= (player.xSpeed * random(1, 5)) + .5;
            drawable.y -= 0.1;

            // Draw debris
            if (isDebris) {
                ctx.beginPath();
                ctx.arc(drawable.x, drawable.y, drawable.size, 0, Math.PI * 2, true);
                ctx.fill();
            } else {
                // Draw popups
                ctx.fillText(drawable.text, drawable.x, drawable.y);
            }
        }

        // Canvas border
        ctx.lineWidth = 10;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(0, 0, c.width, c.height);

        // Init terrain generation
        ctx.beginPath();
        ctx.moveTo(0, c.height);

        // Generate terrain
        for (let drawX = 0; drawX < c.width; drawX++) {
            const disX = distanceTraveled + drawX;
            const doff = disX - player.x;

            var seed =  doff < runwayLength ? 100 :  -1;

            if (seed == -1) {                
                seed =  c.height - noise(disX) * (0.25  * (disMultiplier < 1 ? 1 : disMultiplier));
               
                if (seedX == -1 || drawX == Math.round(player.x)) {
                    seedX = seed;
                }
                ctx.lineTo(drawX, seed);
            } else {
                ctx.lineTo(drawX, seed);
            }
        }

        // Draw terrain
        ctx.lineTo(c.width, c.height);
        ctx.fill();

        // Draw game objects
        const diagrams = controlDiagrams.length;
        const objsToDraw = diagrams + cloudCount + canCount;

        for (var toDraw = 0; toDraw < objsToDraw; toDraw++) {
            const drawingDiagrams = diagrams > 0 && toDraw < diagrams;
            const drawingClouds = cloudCount > 0 && toDraw - diagrams < cloudCount;

            const objIndex =  drawingDiagrams ? toDraw : drawingClouds ? toDraw - diagrams : toDraw - diagrams - cloudCount;
            const gameObject = (drawingDiagrams ? controlDiagrams : drawingClouds ? clouds: jerryCans)[objIndex];

            // Remove object if out of view
             if (gameObject == undefined || gameObject.x + gameObject.w <= 10) {
                (drawingDiagrams ? controlDiagrams : drawingClouds ? clouds: jerryCans).splice(objIndex, 1);
                continue;
            }

            // Jerry can collision detection
            if (!gameObject.cloud) {
                if (player.x > gameObject.x - 30  && player.x < gameObject.x + 30) {
                    if (player.y > gameObject.y - 30 && player.y < gameObject.y + 30) {
                        jerryCans.splice(objIndex, 1);
                        gasoline = gasoline + 50 > 125 ? 125 : gasoline + 50;
                        continue;
                    }
                }
            }

            // width == 45 is audio diagram, jerry cans width are 30
            gameObject.x -= (player.xSpeed + gameObject.speed) * (gameObject.cloud ? 2.5 : gameObject.w == 45 ? 6 : 4);
            ctx.drawImage(gameObject.img, gameObject.x, gameObject.y, gameObject.w, gameObject.h);
        }


         // Draw player
         player.update();

        // Draw controls
        if (usingMobile) {
            ctx.drawImage(upImg, upPos.x, upPos.y, 45, 45);
            ctx.drawImage(downImg, downPos.x, downPos.y, 45, 45);

            ctx.drawImage(leftImg, leftPos.x, leftPos.y, 45, 45);
            ctx.drawImage(rightImg, rightPos.x, rightPos.y, 45, 45);
        }

         // Draw score
         ctx.font = "Verdana Bold";
         ctx.fillText('SCORE: ' + Math.round(score), 10, 50)

         // Draw fuel level
         ctx.fillStyle = 'gray';
        ctx.fillRect(10, 16, gasoline, 13);

        ctx.fillStyle = 'black';
        ctx.font = "1.05rem Verdana";
        ctx.fillText('GASOLINE', 12.5, 28.5)

         // Draw fuel guage
         ctx.lineWidth = 2;
         ctx.strokeRect(10, 15, 125, 15);
    }

    // Update canvas
    requestAnimationFrame(loop);
}

// Player control - tracks status of button press
var controls = {Up:0, Down:0, Left:0, Right:0, Trick:0};

var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

const usingMobile = isMobile.any();

// Force zoom-out on mobile
if (usingMobile) {
    document.body.style.zoom = 1.0;
}

function accelerate(status) {
    if (gasoline < 1)
        status = 0;
    else {
        // Play music when user interacts with page
        if (!muteAudio && audio.currentTime == 0)
            audio.play();

        // Accelerate sfx
        if (!muteAudio && status == 1) {
            accel_sfx.currentTime = 0;
            accel_sfx.volume = 0.4;
            accel_sfx.play();
        } else if (!accel_sfx.paused) {
            fadeOut(accel_sfx);
        }
    }

    controls.Up = status;
}

function updateKey(key, status) {
    if (!gameOver) {
        switch(key){
            case 'ArrowUp':
                accelerate(status);
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

// Reset game
function replay() {
    player.imgBiker = null, player.backdrop = new Image(), player.img = new Image();
    player.popups = new Array(), player.debris = new Array(), clouds = new Array(), jerryCans = new Array();

    controls = {Up:0, Down:0, Left:0, Right:0, Trick:0};
    player.backdrop.src = '/resources/etc/highlight_drop.png';
    player.img.src = '/resources/biker/biker.png';

    player.w = 30, player.h = 30,  player.x = c.width / 2, player.y = 0;
    player.doingTrick = false, player.grounded = false, gameOver = false;
    player.trickCounter = 0, player.xSpeed = 0, this.ySpeed = 0;

    player.rotation = 0, player.rotationSpeed = 0;
    cloudSeed = -1, distanceTraveled = 0, crashOffset = 0, gasoline = 125, score = 0;

    leaderboard.style.display = 'none';
    audio.currentTime = 0;
    audio.loop = true;

    // Restory audio controls
    controlDiagrams[0] = new GameObject(false, audioImg, 0,  rightPos.x, 130, 45, 45);

    // Restore submit score form
    const savedForm = document.getElementById('form_holder').innerHTML;
    if (savedForm != '') {
        document.getElementById('leaderboard_title').innerHTML = "<u>Hiscores</u>";
        document.getElementById('hiscores').innerHTML = savedForm;
    }
}

// It's alive!
loop();
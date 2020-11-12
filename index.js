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

// Particle object
function Particle(px, py) {
    this.x = px;
    this.y = py;
  }

// Player 
var player = new function() {
    // Position
    this.x = c.width / 2, this.y = 0;
    this.grounded = false;

    // Velocity
    this.xSpeed = 0; this.ySpeed = 0
    this.rotation = 0,  this.rotationSpeed = 0;

    // Player image
    this.img = new Image();
    this.img.src = '/resources/biker.png';

    // Crash
    this.imgBiker = null;
    this.particles = new Array();

    this.draw = function() {
        const disMultiplier = (distanceTraveled / 5000);

        var frontWheel =  c.height - (distanceTraveled < 595 ? 250 : distanceTraveled < 604 ?
            250 - (604 - distanceTraveled)  : noise(distanceTraveled + 5 + this.x)  * (0.25  * (disMultiplier < 1 ? 1 : disMultiplier)));

        var rearWheel =  c.height - (distanceTraveled < 595 ? 250 : distanceTraveled < 604 ?
            250 - (604 - distanceTraveled)  : noise(distanceTraveled + this.x)  * (0.25  * (disMultiplier < 1 ? 1 : disMultiplier)));

         // Analayze if player is on ground or in air
        if (rearWheel - 15 > this.y) {
            this.ySpeed += 0.1;
            this.grounded = false;
        } else {
            this.ySpeed -= this.y - (rearWheel - 15);
            this.y = rearWheel - 15;
            this.grounded = true;
        }

        // If game is over, player is idling and touching start wall, or has crashed
        if (gameOver || distanceTraveled < -250
            || this.grounded && Math.abs(this.rotation) > Math.PI * 0.5
            || ((distanceTraveled > runwayLength && distanceTraveled < runwayLength + 10) && this.grounded && this.xSpeed < 0.009)) {

            // Rotate and position according to speed
            this.rotationSpeed = this.rotation > 0.5 ? (this.xSpeed - (this.xSpeed * 2)) : this.xSpeed;
            this.x -= this.xSpeed * 2.5;

            if (!gameOver) {
                // Game has just ended - show leaderboard and spawn wreckage
                var leaderboard = document.getElementById('leaderboard');
                leaderboard.style.display = 'block';
                
                // Split rider/bike sprite into 2 for crash animation 
                this.img.src = '/resources/bike_alacarte.png';

                // Pick random fall image
                this.imgBiker = new Image();
                this.imgBiker.src = '/resources/biker_fall_' + Math.round(Math.random()) +'.png';

                // Determine which side to draw player on relavent to rotation
                crashOffset = this.rotation > 0.5 ? 10 : -10;

                // Reset controls
                controls.Up = 0;
                controls.Down = 0;

                // Spawn particle effect
                const particlesToSpawn = Math.floor(Math.random() * 6) + 4;
                
                for (var particle = 0; particle < particlesToSpawn; particle++) {
                    const seed = (Math.random() * 10);
                    const px = (Math.floor(Math.random()) == 1 ? seed : seed - (seed * 2));
                    const py = (Math.floor(Math.random()) == 1 ? seed : seed - (seed * 2));

                    this.particles[particle] = new Particle(this.x + px, this.y + py);
                }

                console.log('Particles Spawned: ' + particlesToSpawn);
            }

            // Declare game is over - player has crashed or gone out of bounds
            gameOver = true;
        }

        // Calculate player rotation and speed
        var angle = Math.atan2((frontWheel - 15) - this.y, (this.x + 5) - this.x);
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


        // Draw particles
        const numbOfParticles = this.particles.length;
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'blue';

        ctx.beginPath();
        for (let i = 0; i < numbOfParticles; i++) {
            var particle = this.particles[i];
            ctx.arc(particle.x, particle.y, 2.5, 0, 1.5 * Math.PI, false);
            particle.x -= this.xSpeed * 2.5;
        }
        ctx.stroke();
    }
}

// Player control object - tracks status of button press
var controls = {Up:0, Down:0, Left:0, Right:0};

function updateKey(key, status) {
    if (!gameOver) {
        switch(key){
            case "ArrowUp":
                controls.Up = status;
                break;
            case "ArrowDown":
                controls.Down = status;
                break;
             case 'ArrowLeft':
                controls.Left = status;
                break;
            case 'ArrowRight':
                controls.Right = status;
                break;
        }
    }
}

onkeydown = e => { updateKey(e.key, 1) };
onkeyup = e => { updateKey(e.key, 0) };

// Game statistics
const runwayLength = 600;
var distanceTraveled = 0;
var crashOffset = 0;

var gameOver = false;

// Game go brr
function loop() {
    if (!gameOver || player.xSpeed > 0.015) {
        // Calculate players speed and relative distance traveled
        const speedMultiplier = (player.grounded || player.xSpeed  > 0.15 ? controls.Up - (player.grounded ? controls.Down : 0) : 0)
        player.xSpeed  -= (player.xSpeed  - speedMultiplier) * 0.015;
        distanceTraveled += 10 * player.xSpeed ;

        // Canvas background
        ctx.fillStyle ='#666699';
        ctx.fillRect(0, 0 , c.width, c.height);  

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
            const disMultiplier = (distanceTraveled / 5000);
            const seed = disX < runwayLength * 1.42 ? 100 : c.height - noise(disX)
                 * (0.25  * (disMultiplier < 1 ? 1 : disMultiplier));

            ctx.lineTo(drawX, seed);
        }

        // Draw terrain
        ctx.lineTo(c.width, c.height);
        ctx.fill();

         // Calculate players position and draw
        player.draw();

        const traveled = (distanceTraveled - 50);
        ctx.fillText('Score: ' + (traveled < 0 ? 0 : Math.round(traveled)), 50, 50)
    }

    // Update canvas
    requestAnimationFrame(loop);
}


// It's alive!
loop();
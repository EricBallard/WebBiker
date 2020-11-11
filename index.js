// Init graphics
var c = document.createElement('canvas');
var ctx = c.getContext('2d');
c.width = 500;
c.height = 350;
document.body.appendChild(c);

/*
    Credits: k3dev
    https://www.youtube.com/watch?v=MW8HcwHK1S0

    TODO:
    Research Math class; #floor, #cost, #ceil
*/

// Terrain generation
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

var grounded = false;

// Player object
var player = new function() {
    // Position
    this.x = c.width / 2, this.y = 0;

    // Velocity
    this.xSpeed = 0; this.ySpeed = 0
    this.rotation = 0,  this.rotationSpeed = 0;

    // Biker image
    this.img = new Image();
    this.img.src = "/resources/biker.png";

    this.draw = function() {
        // Rear whhel
         var p1 = c.height - (t < 45 ? 150 : t < 50 ? 150 - (50 - t) : noise(t + this.x) * 0.25);
        
         // Front wheel
         var p2 =  c.height - (t < 45 ? 150 : t < 50 ? 150 - (50 - t)  : noise(t + 5 + this.x) * 0.25);


        if (p1 - 15 > this.y) {
            this.ySpeed += 0.1;
            grounded = false;
        } else {
            this.ySpeed -= this.y - (p1 - 15);
            this.y = p1 - 15;
            grounded = true;
        }

        // If game is over, player is idling and touching start wall, or has crashed
        if (gameOver
            || ((t > 50 && t < 60) && grounded && speed < 0.009)
            || grounded && Math.abs(this.rotation) > Math.PI * 0.5) {
            //var leaderboard = document.getElementById('leaderboard');
             // leaderboard.style.display = 'block';

           // console.log('game over: ' + leaderboard);
            gameOver = true;
            this.rotationSpeed = 0;
            k.ArrowUp = 0;
            this.x -= speed * 2.5;
        }

        var angle = Math.atan2((p2 - 15) - this.y, (this.x + 5) - this.x);
        this.y += this.ySpeed;

        if (grounded && !gameOver) {
            this.rotation -= (this.rotation - angle) * 0.5;
            this.rotationSpeed =  this.rotationSpeed - (angle - this.rotation);
        }

        this.rotationSpeed +=  (t < 50 && t > 45) ? -0.05 : (k.ArrowLeft - k.ArrowRight) * 0.05;
        this.rotation -= this.rotationSpeed * 0.1;

        if (this.rotation > Math.PI) this.rotation = -Math.PI;
        if (this.rotation < -Math.PI) this.rotation = Math.PI;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(this.img, -15, -15, 30, 30);
        ctx.restore();
    }
}

var distance = 0;
var t = 0;
var speed = 0;
var gameOver = false;
var k = {ArrowUp:0, ArrowDown:0, ArrowLeft:0, ArrowRight:0};

function loop() {
    if (!gameOver || speed > 0.015) {
        speed -= (speed - (grounded || speed > 0.15 ? k.ArrowUp - (grounded ? k.ArrowDown : 0) : 0)) * 0.015;
        t += 10 * speed;

        ctx.fillStyle ='#19f';
        ctx.fillRect(0, 0 , c.width, c.height);

        ctx.lineWidth = 10;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(0, 0, c.width, c.height);

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(0, c.height);

        for (let drawX = 0; drawX < c.width; drawX++) {
            const disX = t + drawX;
            const seed = disX < 300 ? 200 : c.height - noise(disX) * 0.25;
            ctx.lineTo(drawX, seed);
        }

         // Calculate pos and draw
        player.draw();

        ctx.lineTo(c.width, c.height);
        ctx.fill();
    }

    /*
        Debug Text
    */
   ctx.fillText('Speed: ' + speed, 50, 50);
   ctx.fillText('Distance: ' + distance, 50, 70);
   ctx.fillText('X: ' + player.x, 50, 90);
   ctx.fillText('Y: ' + player.y, 50, 130);
   ctx.fillText('T: ' + t, 50, 110);

    // Update canvas
    requestAnimationFrame(loop);
}

/*
    Register player controls 
*/
function updateKey(key, status) {
    if (!gameOver)
       k[key] = status;
}

onkeydown = d => { updateKey(d.key, 1) };
onkeyup = d => { updateKey(d.key, 0) };

// It's alive!
loop();
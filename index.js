var c = document.createElement('canvas');
var ctx = c.getContext('2d');
c.width = 500;
c.height = 350;
document.body.appendChild(c);

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

var player = new function() {
    this.x = c.width / 2;
    this.y = 0;
    this.ySpeed = 0;
    this.rot = 0 ;
    this.rSpeed = 0;
    this.img = new Image();
    this.img.src = "/resources/biker.png";

    this.draw = function() {
        var p1 = c.height - noise(t + this.x) * 0.25;
        var p2 = c.height - noise(t + 5 + this.x) * 0.25;

        if (!gameOver) {
            var grounded = 0;

            if (p1 - 15 > this.y) {
                this.ySpeed += 0.1;
            } else {
                this.ySpeed -= this.y - (p1 - 15);
                this.y = p1 - 15;
                grounded = 1;
            }

            if (grounded && Math.abs(this.rot) > Math.PI * 0.5) {
                var leaderboard = document.getElementById('leaderboard');
                leaderboard.style.display = 'block';

                console.log('game over: ' + leaderboard);
                k.ArrowUp = 0;
                gameOver = true;
                deathX = this.x;
                return;
            }

            var angle = Math.atan2((p2 - 15) - this.y, (this.x + 5) - this.x);
            this.y += this.ySpeed;

            if (grounded) {
                this.rot -= (this.rot - angle) * 0.5;
                this.rSpeed =  this.rSpeed - (angle - this.rot);
            }

            this.rSpeed += (k.ArrowLeft - k.ArrowRight) * 0.05;
            this.rot -= this.rSpeed * 0.1;

            if (this.rot > Math.PI) this.rot = -Math.PI;
            if (this.rot < -Math.PI) this.rot = Math.PI;
        } else {
            // Game is over - update player's X while scene scrollts to stop
            this.x = deathX;
        }


        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.drawImage(this.img, -15, -15, 30, 30);
        ctx.restore();
    }
}

var deathX = 0;
var distance = 0;
var t = 0;
var speed = 0;
var gameOver = false;
var k = {ArrowUp:0, ArrowDown:0, ArrowLeft:0, ArrowRight:0};

function loop() {
    if (!gameOver || speed > 0.01) {
        speed -= (speed - (k.ArrowUp - k.ArrowDown)) * 0.015;
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
            const seed = c.height - noise(t + drawX) * 0.25;
            ctx.lineTo(drawX, seed);

            if (gameOver && deathX > 0) {
                if (deathX == drawX) {
                    deathX--;
                }
            }
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
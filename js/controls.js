
// Player control - tracks status of button press
var controls = {Up:0, Down:0, Left:0, Right:0, Trick:0};

// Determine if browser is mobile by useragent
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

var hoveringControl = false;

var muteAudio = false;


// Define canvas in js environment and dynamically size
const c = document.getElementById('canvas');

function sizeCanvas() {
    const cW =  (window.innerWidth > 0) ? window.innerWidth : screen.width;
    const cH =  ((window.innerWidth > 0) ? window.innerHeight : screen.height) / (usingMobile ? 1 : 1.5);
    c.width = cW < 300 ? 300 : cW;
    c.height = cH < 150 ? 150 : cH;
}

sizeCanvas();

// Accelerate and play sfx
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

// Returns position of mouse/touches
function getMousePos(canvas, e) {
    var rect = c.getBoundingClientRect();
    return {
        x: (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) - rect.left,
        y: (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) - rect.top
    };
}
 
// Validate if mouse x/y is within bounds of UI element x/y
function isHovering(mx, my,x, y, w, h) {
    if (mx < x + w   && mx > x - w / 3)
        if (my < y + h  && my > y - h / 3)
            return true;
    return false;
}

// Track cursor position relative to canvas
function move(evt) {
    hoveringControl = false;

    mousePos = getMousePos(c, evt);
    const x = mousePos.x, y = mousePos.y;

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

    // Hover static control displays (mobile controls)
    if (usingMobile) {
        if (!hoveringControl) {
            evt.preventDefault();

            if (isHovering(x, y, upPos.x, upPos.y, 60, 60)) {
                hoveringControl = 'UP';
            } else if (isHovering(x, y, downPos.x, downPos.y, 60, 60)) {
                hoveringControl = 'DOWN';
            } else if (isHovering(x, y, leftPos.x, leftPos.y, 60, 60)) {
                hoveringControl = 'LEFT';
            } else if (isHovering(x, y, rightPos.x, rightPos.y, 60, 60)) {
                hoveringControl = 'RIGHT';
            }
        }
    }  else {
        c.style.cursor = hoveringControl ? 'pointer' : 'default';
    }
}

// Track double-taps on mobile
var lastTouch = undefined;
var doubleTapping = false;

// Click UI elements
function click(evt, down) {
    if (usingMobile)
        move(evt);

    if (hoveringControl == false) {
        if (usingMobile) {
            if (!down) {
                if (doubleTapping) {
                    doubleTapping = false;
                    controls.Trick = 0;
                }
                return;
            }

            // Listen for double-taps
            const now = new Date().getTime();

            if (lastTouch == undefined) {
                lastTouch = now;
                return;
            }

            let timeDiff = now - lastTouch;
            
            // User has double-tapped
            if (timeDiff > 0 && timeDiff < 500) {
                doubleTapping = true;
                controls.Trick = 1;
            }
    
            lastTouch = undefined;
        }
        return;
    } else {
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
            case 'UP':
                accelerate(down ? 1 : 0);
                break;
            case 'DOWN':
                controls.Down = down ? 1 : 0;
                break;
            case 'LEFT':
                controls.Left = down ? 1 : 0;
                break;
            case 'RIGHT':
                controls.Right = down ? 1 : 0;
                break;
        }
    }
}

// Register control listeners
if (usingMobile) {
    // Mobile
    c.addEventListener('touchstart',  event => click(event, true));
    c.addEventListener('touchend',  event => click(event, false));
} else {
    // PC 
    c.addEventListener('mousemove', event => move(event), false);

    c.addEventListener('mouseup', event => click(event, false));
    c.addEventListener('mousedown',  event => click(event, true));

    onkeydown = e => { updateKey(e.key, 1) };
    onkeyup = e => { updateKey(e.key, 0) };
}

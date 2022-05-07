// 2d graphics
const ctx = c.getContext('2d')

// Terrain generation
var perm = []
while (perm.length < 255) {
  while (perm.includes((val = Math.floor(Math.random() * 255))));
  perm.push(val)
}
var lerp = (a, b, t) => a + ((b - a) * (1 - Math.cos(t * Math.PI))) / 2

var noise = x => {
  x = (x * 0.01) % 255
  return lerp(perm[Math.floor(x)], perm[Math.ceil(x)], x - Math.floor(x))
}

// Generate "random" numbers
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// Background
var gradient = ctx.createLinearGradient(0, 0, 0, 170)
gradient.addColorStop(0, '#ff99cc')
gradient.addColorStop(1, '#33ccff')

// Pop up / debris objects
function Popup(pt, px, py) {
  ;(this.text = pt), (this.x = px), (this.y = py)
}
function Particle(ps, px, py) {
  ;(this.size = ps), (this.x = px), (this.y = py)
}

// Clouds / Jerry cans
var cloudSeed = -1
var clouds = new Array()
var jerryCans = new Array()

function GameObject(isCloud, iimg, moveSpeed, ix, iy, iw, ih) {
  this.cloud = isCloud
  this.img = iimg
  this.speed = moveSpeed
  this.x = ix
  this.y = iy
  this.w = iw
  this.h = ih
}

// Game statistics
const runwayLength = c.width

var distanceTraveled = 0
var crashOffset = 0
var gasoline = 125
var score = 0

var gameOver = false

// Mobiles controls
function Position(px, py) {
  this.x = px
  this.y = py
}

const upImg = new Image(),
  downImg = new Image()
const leftImg = new Image(),
  rightImg = new Image()

upImg.src = '/resources/controls/mobile_up.png'
downImg.src = '/resources/controls/mobile_down.png'

leftImg.src = '/resources/controls/mobile_left.png'
rightImg.src = '/resources/controls/mobile_right.png'

const upPos = new Position(c.width / 4, c.height - c.height / 4)
const downPos = new Position(upPos.x - 100, upPos.y)

const leftPos = new Position(c.width - c.width / 4 - 50, upPos.y)
const rightPos = new Position(leftPos.x + 100, upPos.y)

// Control info diagrams
var controlDiagrams = new Array()

const audioImg = new Image()
audioImg.src = '/resources/controls/audio_on.png'
controlDiagrams[0] = new GameObject(false, audioImg, 0, rightPos.x, 130, 60, 60)

// Show trick info popup
player.popups[0] = new Popup(
  (usingMobile ? 'Double-tap and Hold' : 'Hold Spacebar') + ' in the air for extra points!',
  upPos.x,
  115
)

// Spawn pc control info
if (!usingMobile) {
  this.keysImg = new Image()
  this.keysImg.src = '/resources/controls/pc_controls.png'
  controlDiagrams[1] = new GameObject(false, this.keysImg, 0, downPos.x, c.height - c.height / 2, 200, 200)
}

// Detect mobile orientation change
var usingPortait = false

window.onresize = event => {
  if (usingMobile) {
    if (usingPortait) {
      // User has rotated phone to landscape
      window.location.reload()
    } else if (score < 1) {
      sizeCanvas()
    }
  }
}

// Game go brr
function loop() {
  if (!gameOver || (player.grounded && player.xSpeed > 0.015)) {
    // Canvas background
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, c.width, c.height)

    if (usingMobile && (usingPortait || (window.innerHeight > window.innerWidth && score < 1))) {
      // Mobile device is in portait mode (boo) - require landscape to play game

      // Inform user
      ctx.fillStyle = 'Black'
      ctx.font = '40px Verdana Bold'

      ctx.save()
      ctx.translate(c.width / 2, c.height / 2)
      ctx.rotate(Math.PI / 2)
      ctx.textAlign = 'center'
      ctx.fillText('Rotate your device to play!', 0, 0)
      ctx.restore()

      if (!usingPortait) usingPortait = true
      return
    }

    // Calculate players speed and relative distance traveled
    const disMultiplier = distanceTraveled / 20000
    const speedMultiplier =
      player.grounded || player.xSpeed > 0.15 ? controls.Up - (player.grounded ? controls.Down : 0) : 0
    player.xSpeed -= (player.xSpeed - speedMultiplier) * 0.015

    const momentum = 10 * player.xSpeed
    distanceTraveled += momentum

    // Score
    const traveled = distanceTraveled - runwayLength
    score = traveled < 1 ? 0 : score + momentum

    // Spawn clouds + jerry cans
    const laps = distanceTraveled / 500

    var cloudCount = clouds.length
    const noClouds = cloudCount == 0

    var canCount = jerryCans.length

    if (noClouds || cloudSeed < laps) {
      // Spawn jerry cans
      if (!noClouds) {
        const spawnCan = gasoline / 25 < random(-1, 4)

        if (spawnCan) {
          // Spawn random jerry can
          var canImg = new Image()
          canImg.src = '/resources/etc/jerrycan.png'

          jerryCans[canCount] = new GameObject(
            false,
            canImg,
            0,
            c.width,
            random(50 / disMultiplier, c.height / 2),
            30,
            30
          )
          canCount += 1
        }
      }

      // Spawn clouds
      const spawnCloud = noClouds || cloudSeed == -1 ? 1 : Math.round(Math.random()) == 1
      cloudSeed++

      if (spawnCloud) {
        // Generate random cloud
        var cimg = new Image()
        cimg.src = '/resources/etc/cloud_' + Math.round(Math.random()) + '.png'

        const cloudY = random(random(-25, 0), traveled > 0 ? 100 : 25)
        const cWidth = random(0, 100) + 50
        const cHeight = random(0, 25) + 25

        clouds[cloudCount] = new GameObject(true, cimg, random(3, 12) / 100, c.width, cloudY, cWidth, cHeight)
        cloudCount += 1
      }
    }

    // Draw debris + popups
    ctx.fillStyle = 'black'
    const popSize = player.popups.length,
      debSize = player.debris.length
    const amountToDraw = popSize + debSize

    for (let toDraw = 0; toDraw < amountToDraw; toDraw++) {
      const drawingPopup = popSize > 0 && toDraw < popSize
      const objIndex = drawingPopup ? toDraw : toDraw - popSize

      const drawable = (drawingPopup ? player.popups : player.debris)[objIndex]

      // Remove if out of view

      let remove = drawable == undefined
      let isTrickInfo

      if (!remove && !(isTrickInfo = drawingPopup && score < 3000 && drawable.text.includes('points')))
        remove =
          player.x - drawable.x >
          (Particle.prototype.isPrototypeOf(drawable) || (player.grounded && player.xSpeed < 0.25)
            ? random(25, 200)
            : random(100, 400))
      else if (isTrickInfo) remove = drawable.y < -15

      if (remove) {
        ;(drawingPopup ? player.popups : player.debris).splice(objIndex, 1)
        continue
      }

      if (isTrickInfo) {
        drawable.y -= player.xSpeed / 2 + 0.2
      } else {
        drawable.x -= player.xSpeed * random(1, 5) + 0.5
        drawable.y -= 0.1
      }

      // Draw debris
      if (!drawingPopup) {
        ctx.beginPath()
        ctx.arc(drawable.x, drawable.y, drawable.size, 0, Math.PI * 2, true)
        ctx.fill()
      } else {
        if (isTrickInfo) ctx.fillStyle = 'gray'

        // Draw popups
        ctx.fillText(drawable.text, drawable.x, drawable.y)

        if (isTrickInfo) ctx.fillStyle = 'black'
      }
    }

    // Init terrain generation
    ctx.beginPath()
    ctx.moveTo(0, c.height)

    // Generate terrain
    for (let drawX = 0; drawX < c.width; drawX++) {
      const disX = distanceTraveled + drawX
      const doff = disX - player.x

      var seed = doff < runwayLength ? 100 : -1

      if (seed == -1) {
        seed = c.height - noise(disX) * (0.25 * (disMultiplier < 1 ? 1 : disMultiplier))

        if (seedX == -1 || drawX == Math.round(player.x)) {
          seedX = seed
        }
        ctx.lineTo(drawX, seed)
      } else {
        ctx.lineTo(drawX, seed)
      }
    }

    // Draw terrain
    ctx.lineTo(c.width, c.height)
    ctx.fill()

    // Draw game objects
    const diagrams = controlDiagrams.length
    const objsToDraw = diagrams + cloudCount + canCount

    for (var toDraw = 0; toDraw < objsToDraw; toDraw++) {
      const drawingDiagrams = diagrams > 0 && toDraw < diagrams
      const drawingClouds = cloudCount > 0 && toDraw - diagrams < cloudCount

      const objIndex = drawingDiagrams ? toDraw : drawingClouds ? toDraw - diagrams : toDraw - diagrams - cloudCount
      const gameObject = (drawingDiagrams ? controlDiagrams : drawingClouds ? clouds : jerryCans)[objIndex]

      // Remove object if out of view
      if (gameObject == undefined || gameObject.x + gameObject.w <= 10) {
        ;(drawingDiagrams ? controlDiagrams : drawingClouds ? clouds : jerryCans).splice(objIndex, 1)
        continue
      }

      // Jerry can collision detection
      if (!gameObject.cloud) {
        if (player.x > gameObject.x - 30 && player.x < gameObject.x + 30) {
          if (player.y > gameObject.y - 30 && player.y < gameObject.y + 30) {
            jerryCans.splice(objIndex, 1)
            gasoline = gasoline + 50 > 125 ? 125 : gasoline + 50
            continue
          }
        }
      }

      // width == 60 is audio diagram, jerry cans width are 30
      gameObject.x -= (player.xSpeed + gameObject.speed) * (gameObject.cloud ? 2.5 : gameObject.w == 60 ? 6 : 4)
      ctx.drawImage(gameObject.img, gameObject.x, gameObject.y, gameObject.w, gameObject.h)
    }

    // Canvas border
    ctx.lineWidth = 10
    ctx.strokeStyle = 'black'
    ctx.strokeRect(0, 0, c.width, c.height)

    // Draw player
    player.update()

    // Draw controls
    if (usingMobile) {
      ctx.drawImage(upImg, upPos.x, upPos.y, 60, 60)
      ctx.drawImage(downImg, downPos.x, downPos.y, 60, 60)

      ctx.drawImage(leftImg, leftPos.x, leftPos.y, 60, 60)
      ctx.drawImage(rightImg, rightPos.x, rightPos.y, 60, 60)
    }

    // Draw score
    ctx.font = 'Verdana Bold'
    ctx.fillText('SCORE: ' + Math.round(score), 10, 65)

    // Draw fuel level
    ctx.fillStyle = 'gray'
    ctx.fillRect(10, 16, gasoline, 25)

    ctx.fillStyle = 'black'
    ctx.font = '22px Verdana'
    ctx.fillText('GASOLINE', 14, 35)

    // Draw fuel guage
    ctx.lineWidth = 2
    ctx.strokeRect(10, 15, 125, 25)

    ctx.font = '18px Verdana'
  }

  // Update canvas
  requestAnimationFrame(loop)
}

// Reset game
function replay() {
  ;(player.imgBiker = null), (player.backdrop = new Image()), (player.img = new Image())
  ;(player.popups = new Array()), (player.debris = new Array()), (clouds = new Array()), (jerryCans = new Array())
  player.popups[0] = new Popup(
    (usingMobile ? 'Double-tap and Hold' : 'Hold Spacebar') + ' in the air for extra points!',
    upPos.x,
    115
  )

  controls = { Up: 0, Down: 0, Left: 0, Right: 0, Trick: 0 }
  player.backdrop.src = '/resources/etc/highlight_drop.png'
  player.img.src = '/resources/biker/biker.png'

  ;(player.w = 30), (player.h = 30), (player.x = c.width / 2), (player.y = 0)
  ;(player.doingTrick = false), (player.grounded = false), (gameOver = false)
  ;(player.trickCounter = 0), (player.xSpeed = 0), (this.ySpeed = 0)

  ;(player.rotation = 0), (player.rotationSpeed = 0)
  ;(cloudSeed = -1), (distanceTraveled = 0), (crashOffset = 0), (gasoline = 125), (score = 0)

  leaderboard.style.display = 'none'
  audio.currentTime = 0
  audio.loop = true

  // Restore control diagrams
  controlDiagrams[0] = new GameObject(false, audioImg, 0, rightPos.x, 130, 60, 60)

  if (!usingMobile)
    controlDiagrams[1] = new GameObject(false, this.keysImg, 0, downPos.x, c.height - c.height / 2, 200, 200)

  // Restore submit score form
  const savedForm = document.getElementById('form_holder').innerHTML
  if (savedForm != '') {
    document.getElementById('leaderboard_title').innerHTML = '<u>Hiscores</u>'
    document.getElementById('hiscores').innerHTML = savedForm
  }
}

// It's alive!
loop()

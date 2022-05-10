import { GameObject } from './world/entity/entities.js'
import { Player } from './world/entity/player.js'

import * as Audio from './world/audio.js'
import * as World from './world/world.js'
import * as Controls from './world/controls.js'
import * as Diagrams from './world/diagrams.js'

export var random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// Cache Canvas and 2D graphics elements
const canvas = document.getElementById('canvas'),
  ctx = canvas.getContext('2d')

var height = canvas.height,
  width = canvas.width

var sizeCanvas = () => {
  const cW = window.innerWidth > 0 ? window.innerWidth : screen.width
  const cH = (window.innerWidth > 0 ? window.innerHeight : screen.height) / (usingMobile ? 1 : 1.5)

  width = cW < 300 ? 300 : cW
  canvas.width = width

  height = cH < 150 ? 150 : cH
  canvas.height = height
}

// FPS stats
var lastFrameTime = 1000,
  fpsCounter = 0,
  frames = 0

// Background - gradient
const gradient = ctx.createLinearGradient(0, 0, 0, 170)
gradient.addColorStop(0, '#ff99cc')
gradient.addColorStop(1, '#33ccff')

// Game Objects
var clouds = new Array(),
  jerryCans = new Array()

// Game stats
var cloudSeed = -1
var distanceTraveled = 0

/* STARTING... */
var [audio, sfx] = Audio.init()

var [controls, usingMobile] = Controls.init(audio)
controls.audio = audio
controls.sfx = sfx

var player = new Player(controls, width, height)
controls.player = player

sizeCanvas()

var controlDiagrams = Diagrams.init(player, usingMobile, width, height)
controls.audio_btn = controlDiagrams[0]

// Detect mobile orientation change
var usingPortait = false

window.onresize = () => {
  if (usingMobile) {
    if (usingPortait) {
      // User has rotated phone to landscape
      window.location.reload()
    } else if (score < 1) {
      sizeCanvas()
    }
  }
}

// Game/Animation-loop
function loop() {
  if (player.gameOver) {
    // Game Over - player has crashed
    if (player.xSpeed <= 0.015) {
      // Player is moving very slow/stopped

      // Terminate render loop, GAME OVER
      return
    }
    // else
    /*
      Player has crashed but still moving quickly
      allow player to come to stop before closing loop
      (Nice cinematic on crash, looks pretty cool)
    */
  }

  // Canvas background
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  if (usingMobile && (usingPortait || (window.innerHeight > window.innerWidth && score < 1))) {
    // Mobile device is in portait mode (boo) - require landscape to play game

    // Inform user
    ctx.fillStyle = 'Black'
    ctx.font = '40px Verdana Bold'

    ctx.save()
    ctx.translate(width / 2, height / 2)
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
    player.grounded || player.xSpeed > 0.15 ? controls.up - (player.grounded ? controls.down : 0) : 0
  player.xSpeed -= (player.xSpeed - speedMultiplier) * 0.015

  const momentum = 10 * player.xSpeed
  distanceTraveled += momentum

  // Calculate distance traveled
  const traveled = distanceTraveled - width

  // Update score if player has not crashed
  if (!player.gameOver) player.score = traveled < 1 ? 0 : player.score + momentum

  // Spawn clouds + jerry cans
  var laps = distanceTraveled / 500

  var cloudCount = clouds.length
  var noClouds = cloudCount == 0

  var canCount = jerryCans.length

  if (noClouds || cloudSeed < laps) {
    // Spawn jerry cans
    if (!noClouds) {
      const spawnCan = player.gasoline / 25 < random(-1, 4)

      if (spawnCan) {
        // Spawn random jerry can
        var canImg = new Image()
        canImg.src = '/src/resources/etc/jerrycan.png'

        jerryCans[canCount] = new GameObject(false, canImg, 0, width, random(50 / disMultiplier, height / 2), 30, 30)
        canCount += 1
      }
    }

    // Spawn clouds
    const spawnCloud = noClouds || cloudSeed == -1 ? 1 : Math.round(Math.random()) == 1
    cloudSeed++

    if (spawnCloud) {
      // Generate random cloud
      var cimg = new Image()
      cimg.src = '/src/resources/etc/cloud_' + Math.round(Math.random()) + '.png'

      const cloudY = random(random(-25, 0), traveled > 0 ? 100 : 25)
      const cWidth = random(0, 100) + 50
      const cHeight = random(0, 25) + 25

      clouds[cloudCount] = new GameObject(true, cimg, random(3, 12) / 100, width, cloudY, cWidth, cHeight)
      cloudCount += 1
    }
  }

  // Draw debris + popups
  World.fillPopups(player, player.score, ctx)
  World.fillDebris(player, ctx)

  // Draw terrain
  World.fillTerrain(player, distanceTraveled, disMultiplier, width, height, ctx)

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
          player.gasoline = player.gasoline + 50 > 125 ? 125 : player.gasoline + 50
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
  ctx.strokeRect(0, 0, width, height)

  // Draw player
  player.update(ctx)

  // Draw controls (mobile)
  if (usingMobile) Diagrams.drawMobileControls(ctx)

  // Draw score
  ctx.font = 'Verdana Bold'
  ctx.fillText('SCORE: ' + Math.round(player.score), 10, 65)

  // Draw fuel level
  ctx.fillStyle = 'gray'
  ctx.fillRect(10, 16, player.gasoline, 25)

  ctx.fillStyle = 'black'
  ctx.font = '22px Verdana'
  ctx.fillText('GASOLINE', 14, 35)

  // Draw fuel guage
  ctx.lineWidth = 2
  ctx.strokeRect(10, 15, 125, 25)

  ctx.font = '18px Verdana'

  // Draw/count fps
  var now = Date.now()

  if (now - lastFrameTime > 999) {
    fpsCounter = frames
    lastFrameTime = now
    frames = 0
  } else frames++

  ctx.fillStyle = 'white'
  ctx.fillText('FPS: ' + fpsCounter, width - 100, 35)

  // Update canvas
  requestAnimationFrame(loop)
}

// Reset game
function replay() {
  // TODO
  leaderboard.style.display = 'none'
  audio.currentTime = 0
  audio.loop = true

  // Restore submit score form
  const savedForm = document.getElementById('form_holder').innerHTML
  if (savedForm != '') {
    document.getElementById('leaderboard_title').innerHTML = '<u>Hiscores</u>'
    document.getElementById('hiscores').innerHTML = savedForm
  }

  // Restart loop
  loop()
}

// It's alive!
loop()

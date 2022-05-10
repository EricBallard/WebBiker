import { Player } from './world/entity/player.js'
import { drawStats } from './stats.js'

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

// Background - gradient
const gradient = ctx.createLinearGradient(0, 0, 0, 170)
gradient.addColorStop(0, '#ff99cc')
gradient.addColorStop(1, '#33ccff')

/* STARTING... */
var [audio, sfx] = Audio.init()

var [controls, usingMobile] = Controls.init(audio)
controls.audio = audio
controls.sfx = sfx

sizeCanvas()

var player = new Player(controls, width, height)
controls.player = player

var [controlDiagrams, positions] = Diagrams.init(player, usingMobile, width, height)
controls.audio_btn = controlDiagrams[0]
controls.up_pos = positions[0]
controls.down_pos = positions[1]
controls.left_pos = positions[2]
controls.right_pos = positions[3]

// Detect mobile orientation change
var usingPortait = false

window.onresize = () => {
  if (usingMobile && usingPortait) {
    // User has rotated phone to landscape
    window.location.reload()
  } else if (player && player.score < 1) {
    sizeCanvas()
  }
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

// Game/Animation-loop
function loop() {
  if (player.gameOver) {
    // Game Over - player has crashed
    if (player.xSpeed <= 0.015) {
      // Player is moving very slow/stopped
      // Terminate render loop, GAME OVER
      return
    }
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
  var distance = player.traveledDistance - width,
    disMultiplier = distance / 20000

  // Calculate player speed/momentum
  var speedMultiplier =
    player.grounded || player.xSpeed > 0.15 ? controls.up - (player.grounded ? controls.down : 0) : 0

  player.xSpeed -= (player.xSpeed - speedMultiplier) * 0.015

  // Calculate distance traveled
  var momentum = player.xSpeed * 10
  player.traveledDistance += momentum

  // Update score if player has not crashed
  if (!player.gameOver) player.score = distance < 1 ? 0 : player.score + momentum

  // Manage when to spawn clouds + jerry cans
  World.spawnCloudAndCans(player, width, height, distance, disMultiplier)

  // Draw debris + popups
  World.fillFX(player, ctx)

  // Draw terrain
  World.fillTerrain(player, disMultiplier, width, height, ctx)

  // Draw game objects
  World.fillObjects(player, controlDiagrams, ctx)

  // Draw player
  player.update(ctx, player.traveledDistance)

  // Draw controls (mobile)
  if (usingMobile) Diagrams.drawMobileControls(ctx)

  // Draw stats
  drawStats(ctx, width, height, player.score, player.gasoline)

  // Loop
  requestAnimationFrame(loop)
}

// It's alive!
loop()

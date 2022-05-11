import { Player } from './world/entity/player.js'

import { drawStats } from './stats.js'
import { initAudio } from './world/audio.js'
import { initControls } from './world/controls.js'

import * as World from './world/world.js'
import * as Hiscores from './hiscores.js'
import * as Diagrams from './world/diagrams.js'

export var random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// Wrap in function to prevent global scope access
const App = () => {
  /* INITIATING... */

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
  sizeCanvas()

  var [audio, sfx] = initAudio()

  var [controls, usingMobile] = initControls(audio)
  controls.audio = audio
  controls.sfx = sfx

  var player = new Player(controls, width, height)
  controls.player = player

  var [controlDiagrams, positions] = Diagrams.init(player, usingMobile, width, height)
  controls.audio_btn = controlDiagrams[0]
  controls.up_pos = positions[0]
  controls.down_pos = positions[1]
  controls.left_pos = positions[2]
  controls.right_pos = positions[3]

  // Mobile device is in portait mode (boo) - require landscape to play game
  var paused = false

  var isPortaitMode = () => {
    return usingMobile && window.innerHeight > window.innerWidth
  }

  var pauseGame = () => {
    // Resize canvas
    sizeCanvas()

    // Draw background
    ctx.fillStyle = gradient

    console.log(width + ', ' + height)
    ctx.fillRect(0, 0, width, height)

    // Inform user
    ctx.fillStyle = 'White'
    ctx.font = '40px Verdana Bold'

    ctx.save()
    ctx.translate(width / 2, height / 2)
    ctx.rotate(Math.PI / 2)
    ctx.textAlign = 'center'

    ctx.fillText('Rotate your device to play!', 0, 0)
    ctx.restore()

    // Pause game
    paused = true
  }

  // Init check for portait
  if (isPortaitMode()) pauseGame()

  // Listen for resize, recheck
  window.onresize = () => {
    setTimeout(() => {
      if (paused) {
        // Game is paused

        if (player && player.score > 0) {
          // Game is in progress - RESUME

          sizeCanvas()
          paused = false
        } else {
          // Game has not started
          // Page was likely loaded in portait, reload to reconfigure
          location.reload()
        }
      } else {
        // Device orientation has changed
        if (isPortaitMode()) pauseGame()
      }
    }, 100)
  }

  // Reset game
  function replay() {
    console.log('clicked')
    player = new Player(controls, width, height)
    controls.player = player

    // TODO - RE-add diagrams

    // Hide hiscores
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

  // Attach handlers to buttons
  document.getElementById('restart_game').onclick = () => replay()
  document.getElementById('view_scores').onclick = () => Hiscores.fetch()
  document.getElementById('submit_input').onclick = () => Hiscores.submit(player)

  // Validate entered initials
  document.getElementById('name_input').oninput = () => Hiscores.updateSubmitBtn()

  // Game/Animation-loop
  function loop() {
    // Game Over - player has crashed
    if (player.gameOver) {
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
    } else {
      // Honor pause
      if (paused) {
        requestAnimationFrame(loop)
        return
      }
    }

    // Canvas background
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

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
    player.update(ctx)

    // Draw controls (mobile)
    if (usingMobile) Diagrams.drawMobileControls(ctx)

    // Draw stats
    drawStats(ctx, width, height, player.score, player.gasoline)

    // Loop
    requestAnimationFrame(loop)
  }

  // Start loop
  loop()
}

// It's alive!
App()

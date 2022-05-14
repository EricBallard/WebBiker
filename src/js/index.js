import { Player } from './world/entity/player.js'
import { isCookieValid } from './util/util.js'

import { initControls } from './world/controls.js'
import { initAudio } from './world/audio.js'

import * as Stats from './util/stats.js'
import * as World from './world/world.js'
import * as Hiscores from './util/hiscores.js'
import * as Diagrams from './world/diagrams.js'

// Wrap in function to prevent global scope access
const App = () => {
  /* INITIATING... */

  // Cache Canvas and 2D graphics elements
  const canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d')

  let height = canvas.height,
    width = canvas.width

  let sizeCanvas = () => {
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
  let [audio, sfx] = initAudio()

  let [controls, usingMobile] = initControls(audio)
  controls.audio = audio
  controls.sfx = sfx

  sizeCanvas()

  let player = new Player(controls, width, height)
  controls.player = player

  let [controlDiagrams, positions] = Diagrams.init(player, usingMobile, width, height)
  controls.audio_btn = controlDiagrams[0]
  controls.up_pos = positions[0]
  controls.down_pos = positions[1]
  controls.left_pos = positions[2]
  controls.right_pos = positions[3]

  // Mute/Resume audio on focus
  window.addEventListener('blur', () => audio.pause())

  window.addEventListener('focus', () => {
    if (isCookieValid()) {
      if (!controls.muteAudio) audio.play()
    } else window.location.href = 'index.php'
  })

  // Mobile device is in portait mode (boo) - require landscape to play game
  let paused = false

  let isPortaitMode = () => {
    return usingMobile && window.innerHeight > window.innerWidth
  }

  let pauseGame = () => {
    // Resize canvas
    sizeCanvas()

    // Draw background
    ctx.fillStyle = gradient
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
          window.location.reload()
        }
      } else {
        // Device orientation has changed
        if (isPortaitMode()) pauseGame()
      }
    }, 100)
  }

  // Track current rendered FPS
  let lastFrameTime = 1000,
    fpsCounter = 0,
    frames = 0

  // Track animation IDs
  let renderLoop = undefined,
    childLoop = undefined

  // Reset game
  function replay() {
    let useChild = childLoop != undefined

    // Stop prev loop - if applicable
    if (renderLoop) window.cancelAnimationFrame(renderLoop)
    if (childLoop) window.cancelAnimationFrame(childLoop)

    // Reset player
    player = new Player(controls, width, height)
    controls.player = player

    // Re-add control diagram/audio toggle
    let [cd, ignored] = Diagrams.init(player, usingMobile, width, height)
    controlDiagrams = cd
    controls.audio_btn = controlDiagrams[0]

    // Reset controls
    controls.trick = 0
    ;(controls.up = 0), (controls.down = 0)
    ;(controls.left = 0), (controls.right = 0)

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

    // Re-bind actions
    bindBtnActions()

    // Restart loop(s)
    window.setTimeout(loop(true), 0)
    if (useChild) window.setTimeout(loop(false), 15)
  }

  // Attach handlers to buttons
  let bindBtnActions = () => {
    // Replay/View leaderboard
    document.getElementById('restart_game').onclick = () => replay()
    document.getElementById('view_scores').onclick = () => Hiscores.fetch()

    // Submit score
    document.getElementById('submit_input').onclick = () => Hiscores.submit(player)

    // Validate entered initials
    document.getElementById('name_input').oninput = () => Hiscores.updateSubmitBtn()
  }

  bindBtnActions()

  let render = () => {
    // Canvas background
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Calculate players speed and relative distance traveled
    let distance = player.traveledDistance - width,
      disMultiplier = distance / 20000

    // Calculate player speed/momentum
    let speedMultiplier =
      player.grounded || player.xSpeed > 0.15 ? controls.up - (player.grounded ? controls.down : 0) : 0

    player.xSpeed -= (player.xSpeed - speedMultiplier) * 0.015

    // Calculate distance traveled
    let momentum = player.xSpeed * 10
    player.traveledDistance += momentum

    // Update score if player has not crashed
    if (!player.gameOver) player.score = distance < 1 ? 0 : player.score + momentum

    // Manage when to spawn clouds + jerry cans
    World.spawnCloudAndCans(player, width, height, distance)

    // Draw terrain
    World.fillTerrain(player, disMultiplier, width, height, ctx)

    // Draw game objects
    World.fillObjects(player, controlDiagrams, ctx)

    // Draw debris + popups
    World.fillFX(player, ctx)

    // Draw player/update position/etc
    player.update(ctx)

    // Draw controls (mobile)
    if (usingMobile) Diagrams.drawMobileControls(ctx)

    // Draw stats
    Stats.draw(player, width, height, ctx)
  }

  // Game/Animation-loop
  let loop = main => {
    // Game Over - player has crashed
    if (player.gameOver) {
      // Kill child on crash
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
        if (main) renderLoop = requestAnimationFrame(() => loop(true))
        else childLoop = requestAnimationFrame(() => loop(false))
        return
      }
    }

    // Render scene
    // Drop extra frames
    if (frames < 61) render()

    // Count fps
    let now = performance.now()

    if (now - lastFrameTime > 999) {
      fpsCounter = frames
      lastFrameTime = now
      frames = 0
    } else frames++

    //ctx.fillStyle = 'white'
    //ctx.fillText('FPS: ' + fpsCounter, width - 100, 35)

    // Loop - cache request id
    if (main) renderLoop = requestAnimationFrame(() => loop(true))
    else childLoop = requestAnimationFrame(() => loop(false))
  }

  // Detect native framerate
  let framerate = {}
  Stats.detectNativeFrameRate(framerate)

  // Draw 1 frame
  if (paused) {
    // Mobile - page loaded in portrait
  } else {
    requestAnimationFrame(render)
    // Slide-in canvas while detecting framerate
    canvas.style.bottom = height * 2 + 'px'
    canvas.style.transition = 'bottom 0.6s linear'
  }

  canvas.style.bottom = '0px'

  // Detected framerate
  window.setTimeout(() => {
    // Start main loop async
    window.setTimeout(() => loop(true), 0)

    // Detected low framerate
    if (framerate.target < 50) {
      // Spawn child renderer (bypass 30fps RAF lock)
      window.setTimeout(() => loop(false), 16.7)
    }
  }, 1050)
}

// Verify authorization
if (isCookieValid()) {
  // It's alive!
  App()
} else {
  // Deny access, retry authentication
  window.location.href = 'index.php'
}

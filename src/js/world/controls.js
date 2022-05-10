import { fadeOut } from './audio.js'

// Player control - tracks status of button press
var controls = {
  up: 0,
  down: 0,
  left: 0,
  right: 0,
  trick: 0,
  player: undefined,
  audio_btn: undefined,
  audio: undefined,
  sfx: undefined,
  up_pos: undefined,
  down_pos: undefined,
  left_pos: undefined,
  right_pos: undefined,
}

// Determine if browser is mobile by useragent
var isMobile = {
  Android: function () {
    return navigator.userAgent.match(/Android/i)
  },
  BlackBerry: function () {
    return navigator.userAgent.match(/BlackBerry/i)
  },
  iOS: function () {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i)
  },
  Opera: function () {
    return navigator.userAgent.match(/Opera Mini/i)
  },
  Windows: function () {
    return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i)
  },
  any: function () {
    return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()
  },
}

const usingMobile = isMobile.any()

// Track double-taps on mobile
var lastTouch = undefined
var doubleTapping = false

// PC hover status/audio status
var hoveringControl = false,
  muteAudio = false

// Accelerate and play sfx
function accelerate(status) {
  if (controls.player.gasoline < 1) status = 0
  else {
    // Play music when user interacts with page
    if (!muteAudio && controls.audio.currentTime == 0) controls.audio.play()

    // Accelerate sfx
    if (!muteAudio && status == 1) {
      controls.sfx.currentTime = 0
      controls.sfx.volume = 0.4
      controls.sfx.play()
    } else if (!controls.sfx.paused) {
      fadeOut(controls.sfx)
    }
  }

  controls.up = status
}

function updateKey(key, status) {
  if (!controls.player.gameOver) {
    switch (key) {
      case 'ArrowUp':
        accelerate(status)
        break
      case 'ArrowDown':
        controls.down = status
        break
      case 'ArrowLeft':
        controls.left = status
        break
      case 'ArrowRight':
        controls.right = status
        break
      case ' ':
        if (controls.player.grounded && status == 1) break

        controls.trick = status
        break
    }
  }
}

// Returns position of mouse/touches
function getMousePos(e) {
  var rect = canvas.getBoundingClientRect()
  return {
    x: (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) - rect.left,
    y: (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) - rect.top,
  }
}

// Validate if mouse x/y is within bounds of UI element x/y
function isHovering(mx, my, x, y, w, h) {
  if (mx < x + w && mx > x - w / 3) if (my < y + h && my > y - h / 3) return true
  return false
}

// Track cursor position relative to canvas
function move(evt) {
  hoveringControl = false

  var mousePos = getMousePos(evt)
  var x = mousePos.x,
    y = mousePos.y

  // Hover control diagrams (audio toggle)
  var xx = controls.audio_btn.x,
    yy = controls.audio_btn.y

  var w = controls.audio_btn.w,
    h = controls.audio_btn.h

  if (!hoveringControl && isHovering(x, y, xx, yy, w, h)) hoveringControl = 'AUDIO'

  // Hover static control displays (mobile controls)
  if (usingMobile) {
    if (!hoveringControl) {
      evt.preventDefault()

      if (isHovering(x, y, controls.up_pos.x, controls.up_pos.y, 60, 60)) {
        hoveringControl = 'UP'
      } else if (isHovering(x, y, controls.down_pos.x, controls.down_pos.y, 60, 60)) {
        hoveringControl = 'DOWN'
      } else if (isHovering(x, y, controls.left_pos.x, controls.left_pos.y, 60, 60)) {
        hoveringControl = 'LEFT'
      } else if (isHovering(x, y, controls.right_pos.x, controls.right_pos.y, 60, 60)) {
        hoveringControl = 'RIGHT'
      }
    }
  } else {
    canvas.style.cursor = hoveringControl ? 'pointer' : 'default'
  }
}
// Click UI elements
function click(evt, down) {
  if (usingMobile) move(evt)

  if (hoveringControl == false) {
    if (usingMobile) {
      if (!down) {
        if (doubleTapping) {
          doubleTapping = false
          controls.trick = 0
        }
        return
      }

      // Listen for double-taps
      const now = new Date().getTime()

      if (lastTouch == undefined) {
        lastTouch = now
        return
      }

      let timeDiff = now - lastTouch

      // User has double-tapped
      if (timeDiff > 0 && timeDiff < 500) {
        doubleTapping = true
        controls.trick = 1
      }

      lastTouch = undefined
    }
    return
  } else {
    switch (hoveringControl) {
      case 'AUDIO':
        if (down) return

        if ((muteAudio = !muteAudio)) controls.audio.pause()
        else controls.audio.play()

        controls.audio_btn.img.src = '/src/resources/controls/audio_' + (muteAudio ? 'off' : 'on') + '.png'
        break
      case 'UP':
        accelerate(down ? 1 : 0)
        break
      case 'DOWN':
        controls.down = down ? 1 : 0
        break
      case 'LEFT':
        controls.left = down ? 1 : 0
        break
      case 'RIGHT':
        controls.right = down ? 1 : 0
        break
    }
  }
}

export var init = () => {
  // Register control listeners
  if (usingMobile) {
    // Mobile
    canvas.addEventListener('touchstart', event => click(event, true))
    canvas.addEventListener('touchend', event => click(event, false))
  } else {
    // PC
    canvas.addEventListener('mousemove', event => move(event, false))

    canvas.addEventListener('mouseup', event => click(event, false))
    canvas.addEventListener('mousedown', event => click(event, true))

    onkeydown = e => {
      updateKey(e.key, 1)
    }
    onkeyup = e => {
      updateKey(e.key, 0)
    }
  }

  return [controls, usingMobile]
}

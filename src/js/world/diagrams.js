import { GameObject, Popup, Position } from './entity/entities.js'

/* Show UI elements responsible for displaying controls eg; audio toggle, mobile, keypad */
var getImg = src => {
  var img = new Image()
  img.src = src
  return img
}

// Mobiles control diagrams
var upImg, downImg, leftImg, rightImg

// Local screen position to draw diagrams
var upPos, downPos, leftPos, rightPos

var initMobile = (w, h) => {
  upPos = new Position(w / 4, h - h / 4)
  downPos = new Position(upPos.x - 100, upPos.y)
  leftPos = new Position(w - w / 4 - 50, upPos.y)
  rightPos = new Position(leftPos.x + 100, upPos.y)

  upImg = getImg('/src/resources/controls/mobile_up.png')
  downImg = getImg('/src/resources/controls/mobile_down.png')
  leftImg = getImg('/src/resources/controls/mobile_left.png')
  rightImg = getImg('/src/resources/controls/mobile_right.png')
}

export var init = (player, usingMobile, w, h) => {
  // Control info diagrams
  var controlDiagrams = new Array()

  // Toggle Audio button
  const audioImg = getImg('/src/resources/controls/audio_on.png')
  controlDiagrams[0] = new GameObject(false, audioImg, 0, w - w / 4 - 50 + 100, 130, 60, 60)

  // Spawn MOBILE control buttons
  if (usingMobile) initMobile(w, h)
  else {
    // Spawn PC control info
    var keysImg = getImg('/src/resources/controls/pc_controls.png')
    controlDiagrams[1] = new GameObject(false, keysImg, 0, w / 4 - 100, h - h / 2, 200, 200)
  }

  // Show trick-tip info popup
  player.popups[0] = new Popup(
    (usingMobile ? 'Double-tap and Hold' : 'Hold Spacebar') + ' in the air for extra points!',
    WeakMap / 4,
    115
  )

  return controlDiagrams
}

export var drawMobileControls = ctx => {
  ctx.drawImage(upImg, upPos.x, upPos.y, 60, 60)
  ctx.drawImage(downImg, downPos.x, downPos.y, 60, 60)

  ctx.drawImage(leftImg, leftPos.x, leftPos.y, 60, 60)
  ctx.drawImage(rightImg, rightPos.x, rightPos.y, 60, 60)
}

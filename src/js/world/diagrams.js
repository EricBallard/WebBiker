import { GameObject, Popup, Position } from './entity/entities.js'

/* Show UI elements responsible for displaying controls eg; audio toggle, mobile, keypad */
import { getImg } from '../util/util.js'

// Mobiles control diagrams
let upImg, downImg, leftImg, rightImg, audioImg, keysImg

// Local screen position to draw diagrams
let upPos, downPos, leftPos, rightPos

let initMobile = (w, h) => {
  // Cache screen coords to draw mobile controls
  leftPos = new Position(11, h - h / 4)
  rightPos = new Position(136, leftPos.y)

  downPos = new Position(w - 200, leftPos.y)
  upPos = new Position(w - 75, leftPos.y)

  // Cache images for control buttons
  if (!upImg) upImg = getImg('https://storage.googleapis.com/webbiker_bucket/controls/mobile_up.png')
  if (!downImg) downImg = getImg('https://storage.googleapis.com/webbiker_bucket/controls/mobile_down.png')
  if (!leftImg) leftImg = getImg('https://storage.googleapis.com/webbiker_bucket/controls/mobile_left.png')
  if (!rightImg) rightImg = getImg('https://storage.googleapis.com/webbiker_bucket/controls/mobile_right.png')
}

export let init = (player, usingMobile, w, h) => {
  // Control info diagrams
  let controlDiagrams = new Array()

  // Toggle Audio button
  if (!audioImg) audioImg = getImg('https://storage.googleapis.com/webbiker_bucket/controls/audio_on.png')
  controlDiagrams[0] = new GameObject(false, audioImg, 0, w - 200, h / 2, 60, 60)

  // Spawn MOBILE control buttons
  if (usingMobile) initMobile(w, h)
  else {
    // Spawn PC control info
    if (!keysImg) keysImg = getImg('https://storage.googleapis.com/webbiker_bucket/controls/pc_controls.png')
    controlDiagrams[1] = new GameObject(false, keysImg, 0, w / 4 - 100, h - h / 2, 200, 200)
  }

  // Show trick-tip info popup
  player.popups[0] = new Popup(
    (usingMobile ? 'Double-tap and Hold' : 'Hold Spacebar') + ' in the air for extra points!',
    w / 4,
    115
  )

  return [controlDiagrams, [upPos, downPos, leftPos, rightPos]]
}

export let drawMobileControls = ctx => {
  ctx.drawImage(upImg, upPos.x, upPos.y, 60, 60)
  ctx.drawImage(downImg, downPos.x, downPos.y, 60, 60)

  ctx.drawImage(leftImg, leftPos.x, leftPos.y, 60, 60)
  ctx.drawImage(rightImg, rightPos.x, rightPos.y, 60, 60)
}

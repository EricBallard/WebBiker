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
  if (!upImg) upImg = getImg('https://www.dropbox.com/s/nty98mddjrlyvix/mobile_up.png?raw=1')
  if (!downImg) downImg = getImg('https://www.dropbox.com/s/uyqtefbfr9ggfky/mobile_down.png?raw=1')
  if (!leftImg) leftImg = getImg('https://www.dropbox.com/s/eo08nfwdemqroy3/mobile_left.png?raw=1')
  if (!rightImg) rightImg = getImg('https://www.dropbox.com/s/2etcrauhjzq6s8k/mobile_right.png?raw=1')
}

export let init = (player, usingMobile, w, h, ctx) => {
  console.log(w + ', ' + h)
  // Control info diagrams
  let controlDiagrams = new Array()

  // Toggle Audio button
  if (!audioImg) audioImg = getImg('https://www.dropbox.com/s/qjyy42gz1xbhdev/audio_on.png?raw=1')
  controlDiagrams[0] = new GameObject(false, audioImg, 0, w - 200, h / 2, 60, 60)

  // Spawn MOBILE control buttons
  if (usingMobile) initMobile(w, h)
  else {
    // Spawn PC control info
    if (!keysImg) keysImg = getImg('https://www.dropbox.com/s/c95jsu398egat3p/pc_controls.png?raw=1')
    controlDiagrams[1] = new GameObject(false, keysImg, 0, w / 4 - 100, h - h / 2, 200, 200)
  }

  // NOTE: c2d#measureText returns value based on font set to canvas
  ctx.font = '18px Verdana'

  // Info txt/dimensions
  let info = (usingMobile ? 'Double-tap and Hold' : 'Hold Spacebar') + ' in the air for extra points!'
  let infoWidth = ctx.measureText(info).width

  // Show trick-tip info popup
  player.popups[0] = new Popup(info, w / 2 - infoWidth / 2, h / 5)
  return [controlDiagrams, [upPos, downPos, leftPos, rightPos]]
}

export let drawMobileControls = ctx => {
  ctx.drawImage(upImg, upPos.x, upPos.y, 60, 60)
  ctx.drawImage(downImg, downPos.x, downPos.y, 60, 60)

  ctx.drawImage(leftImg, leftPos.x, leftPos.y, 60, 60)
  ctx.drawImage(rightImg, rightPos.x, rightPos.y, 60, 60)
}

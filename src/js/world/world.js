import { random } from '../index.js'

// Terrain generation
var perm = []
while (perm.length < 255) {
  var val
  while (perm.includes((val = Math.floor(Math.random() * 255))));
  perm.push(val)
}

var lerp = (a, b, t) => a + ((b - a) * (1 - Math.cos(t * Math.PI))) / 2

export var noise = x => {
  x = (x * 0.01) % 255
  return lerp(perm[Math.floor(x)], perm[Math.ceil(x)], x - Math.floor(x))
}

export var fillTerrain = (player, distance, multiplier, w, h, ctx) => {
  ctx.beginPath()
  ctx.moveTo(0, h)

  // Generate terrain
  for (let drawX = 0; drawX < w; drawX++) {
    const disX = distance + drawX
    const doff = disX - player.x

    var seed = doff < w ? 100 : -1

    if (seed == -1) {
      seed = h - noise(disX) * (0.25 * (multiplier < 1 ? 1 : multiplier))

      if (player.seedX == -1 || drawX == Math.round(player.x)) {
        player.seedX = seed
      }
    }

    ctx.lineTo(drawX, seed)
  }

  // Draw terrain
  ctx.lineTo(w, h)
  ctx.fill()
}

// Motorcycle debris particles
export var fillDebris = (player, ctx) => {
  ctx.fillStyle = 'black'

  player.debris.filter(debris => {
    if (!debris) return true

    var remove =
      player.x - debris.x >
      // Remove debris if is farther than random x from bike, vary by speed
      (player.grounded && player.xSpeed < 0.25 ? random(25, 200) : random(100, 400))

    if (remove) return true
    else {
      // Apply momentum
      debris.x -= player.xSpeed * random(1, 5) + 0.5
      debris.y -= 0.1

      // Draw
      ctx.beginPath()
      ctx.arc(drawable.x, drawable.y, drawable.size, 0, Math.PI * 2, true)
      ctx.fill()
      return false
    }
  })
}

// Tip Info / Trick Score
export var fillPopups = (player, score, ctx) => {
  player.popups.filter(popup => {
    if (!popup) return true

    var isTrickInfo = score < 3000 && popup.text.includes('points')
    var remove

    if (isTrickInfo) remove = popup.y < -15
    else {
      remove =
        player.x - player.debris.x >
        // Remove debris if is farther than random x from bike, vary by speed
        (player.grounded && player.xSpeed < 0.25 ? random(25, 200) : random(100, 400))
    }

    if (remove) return true
    else {
      // Apply momenturm

      // Trick info are meant to drift away
      // While Tip info is meant to slowly rise
      if (isTrickInfo) {
        popup.y -= player.xSpeed / 2 + 0.2
      } else {
        popup.x -= player.xSpeed * random(1, 5) + 0.5
        popup.y -= 0.1
      }

      // Draw popups
      ctx.fillStyle = isTrickInfo ? 'gray' : 'black'
      ctx.fillText(popup.text, popup.x, popup.y)
      return false
    }
  })
}

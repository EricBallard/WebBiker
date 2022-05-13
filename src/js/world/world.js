import { GameObject, Particle } from './entity/entities.js'
import { random, getImg } from '../index.js'

// Spawn objects
var canImg = undefined,
  cloudImgs = new Map()

export var spawnCloudAndCans = (player, w, h, distance) => {
  var canCount = player.jerryCans.length,
    cloudCount = player.clouds.length

  if (cloudCount == 0 || player.cloudSeed < distance / w) {
    player.cloudSeed++

    // Spawn jerry cans
    const spawnCan = player.score > 1 && player.gasoline / 25 < random(-2, 5)

    if (spawnCan) {
      // Spawn random jerry can
      if (!canImg) canImg = getImg('./resources/etc/jerrycan.png')

      player.jerryCans[canCount] = new GameObject(false, canImg, 0, w, random(0, h / 3), 30, 30)
      canCount += 1
    }

    // Spawn clouds
    const spawnCloud = cloudCount == 0 || player.cloudSeed == -1 ? 1 : Math.round(Math.random()) == 1

    if (spawnCloud) {
      // Generate random cloud
      var type = Math.round(Math.random())

      // Check if img is cached
      var cimg = cloudImgs.get(type)

      if (!cimg) {
        // Not cached, load & cache
        cimg = getImg('./resources/etc/cloud_' + type + '.png')
        cloudImgs.set(type, cimg)
      }

      var cWidth = random(0, 100) + 50,
        cHeight = random(0, 25) + 25

      var cloudY = random(random(-25, 0), distance > 0 ? 100 : 25)

      player.clouds[cloudCount] = new GameObject(true, cimg, random(3, 12) / 100, w, cloudY, cWidth, cHeight)
      cloudCount += 1
    }
  }
}

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

export var fillTerrain = (player, multiplier, w, h, ctx) => {
  ctx.beginPath()
  ctx.moveTo(0, h)

  // Generate terrain
  for (let drawX = 0; drawX < w; drawX++) {
    const disX = player.traveledDistance + drawX
    const doff = disX - player.x

    var seed = doff < w ? h * 0.25 : -1

    if (seed == -1) {
      seed = h - noise(disX) * (0.25 * (multiplier < 1 ? 1 : multiplier))
      if (player.seedX == -1 || drawX == Math.round(player.x)) player.seedX = seed
    }

    ctx.lineTo(drawX, seed)
  }

  // Draw terrain
  ctx.lineTo(w, h)
  ctx.fill()
}

export var fillFX = (player, ctx) => {
  const popSize = player.popups.length,
    debSize = player.debris.length

  const amountToDraw = popSize + debSize
  ctx.fillStyle = 'black'

  for (let toDraw = 0; toDraw < amountToDraw; toDraw++) {
    const drawingPopup = popSize > 0 && toDraw < popSize
    const objIndex = drawingPopup ? toDraw : toDraw - popSize

    const drawable = (drawingPopup ? player.popups : player.debris)[objIndex]

    // Remove if out of view

    let remove = drawable == undefined
    let isTrickInfo

    if (!remove && !(isTrickInfo = drawingPopup && player.score < 3000 && drawable.text.includes('points')))
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
}

export var fillObjects = (player, controlDiagrams, ctx) => {
  var diagrams = controlDiagrams.length,
    canCount = player.jerryCans.length,
    cloudCount = player.clouds.length

  var objsToDraw = diagrams + cloudCount + canCount

  for (var toDraw = 0; toDraw < objsToDraw; toDraw++) {
    const drawingDiagrams = diagrams > 0 && toDraw < diagrams
    const drawingClouds = cloudCount > 0 && toDraw - diagrams < cloudCount

    const objIndex = drawingDiagrams ? toDraw : drawingClouds ? toDraw - diagrams : toDraw - diagrams - cloudCount
    const gameObject = (drawingDiagrams ? controlDiagrams : drawingClouds ? player.clouds : player.jerryCans)[objIndex]

    // Remove object if out of view
    if (gameObject == undefined || gameObject.x + gameObject.w <= 10) {
      ;(drawingDiagrams ? controlDiagrams : drawingClouds ? player.clouds : player.jerryCans).splice(objIndex, 1)
      continue
    }

    // Jerry can collision detection
    if (!gameObject.cloud) {
      if (player.x > gameObject.x - 30 && player.x < gameObject.x + 30) {
        if (player.y > gameObject.y - 30 && player.y < gameObject.y + 30) {
          player.jerryCans.splice(objIndex, 1)
          player.gasoline = player.gasoline + 50 > 125 ? 125 : player.gasoline + 50
          continue
        }
      }
    }

    // width == 60 is audio diagram, jerry cans width are 30
    gameObject.x -= (player.xSpeed + gameObject.speed) * (gameObject.cloud ? 2.5 : gameObject.w == 60 ? 6 : 4)
    ctx.drawImage(gameObject.img, gameObject.x, gameObject.y, gameObject.w, gameObject.h)
  }
}

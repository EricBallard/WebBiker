

export var draw = (player, w, h, ctx) => {
  // Canvas border
  ctx.lineWidth = 10
  ctx.fillStyle = 'black'
  ctx.strokeStyle = 'black'
  ctx.strokeRect(0, 0, w, h)

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
}

// Detect native refresh rate of monitor
var rates = {},
  pollTime = 1000,
  lastCall = undefined

export const detectNativeFrameRate = framerate => {
  var now = performance.now()

  var elapsed = lastCall ? now - lastCall : 0
  if (!lastCall) lastCall = now

  if (elapsed != 0) {
    pollTime -= elapsed
    var rate = Math.round(1000 / elapsed)
    var counts = rate in rates ? rates[rate] : 0
    rates[rate] = counts + 1
  }

  lastCall = now

  if (pollTime > 0) window.requestAnimationFrame(() => detectNativeFrameRate(framerate))
  else {
    var avgRate = Object.keys(rates).reduce((a, b) => (rates[a] > rates[b] ? a : b))

    framerate.target = avgRate
    framerate.interval = 1 / (avgRate > 60 ? 60 : avgRate)
  }
}
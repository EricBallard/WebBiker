export let draw = (player, w, h, ctx) => {
  // Canvas border
  ctx.lineWidth = 10
  ctx.strokeStyle = 'black'
  ctx.strokeRect(0, 0, w, h)

  // Draw fuel level
  ctx.fillStyle = 'gray'
  ctx.fillRect(10, 16, player.gasoline, 25)

  ctx.fillStyle = 'black'
  ctx.font = '22px Verdana'
  ctx.fillText('GASOLINE', 14, 35)

  // Draw score
  ctx.font = '18px Verdana'
  ctx.fillText('SCORE: ' + Math.round(player.score), 10, 65)

  // Draw fuel guage
  ctx.lineWidth = 2
  ctx.strokeRect(10, 15, 125, 25)
}

// Detect native refresh rate of monitor
let rates = {},
  pollTime = 1000,
  lastCall = undefined

export const detectNativeFrameRate = framerate => {
  let now = performance.now()

  let elapsed = lastCall ? now - lastCall : 0
  if (!lastCall) lastCall = now

  if (elapsed != 0) {
    pollTime -= elapsed
    let rate = Math.round(1000 / elapsed)
    let counts = rate in rates ? rates[rate] : 0
    rates[rate] = counts + 1
  }

  lastCall = now

  if (pollTime > 0) window.requestAnimationFrame(() => detectNativeFrameRate(framerate))
  else {
    let avgRate = Object.keys(rates).reduce((a, b) => (rates[a] > rates[b] ? a : b))

    framerate.target = avgRate
    framerate.interval = 1 / (avgRate > 60 ? 60 : avgRate)
  }
}

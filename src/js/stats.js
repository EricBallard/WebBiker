// FPS stats
var lastFrameTime = 1000,
  fpsCounter = 0,
  frames = 0

export var drawStats = (ctx, w, h, score, gas) => {
  // Canvas border
  ctx.lineWidth = 10
  ctx.strokeStyle = 'black'
  ctx.strokeRect(0, 0, w, h)

  // Draw score
  ctx.font = 'Verdana Bold'
  ctx.fillText('SCORE: ' + Math.round(score), 10, 65)

  // Draw fuel level
  ctx.fillStyle = 'gray'
  ctx.fillRect(10, 16, gas, 25)

  ctx.fillStyle = 'black'
  ctx.font = '22px Verdana'
  ctx.fillText('GASOLINE', 14, 35)

  // Draw fuel guage
  ctx.lineWidth = 2
  ctx.strokeRect(10, 15, 125, 25)

  ctx.font = '18px Verdana'

  //* Draw + count fps
  var now = performance.now()

  if (now - lastFrameTime > 999) {
    fpsCounter = frames
    lastFrameTime = now
    frames = 0
  } else frames++

  ctx.fillStyle = 'white'
  ctx.fillText('FPS: ' + fpsCounter, w - 100, 35)
  //*/
}

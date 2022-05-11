// Game Audio
export var initAudio = () => {
  const audio = new Audio('./resources/audio/background_music_compressed.mp3')
  audio.volume = 0.35
  audio.loop = true

  const sfx = new Audio('./resources/audio/motobike_accelerate.mp3')
  sfx.loop = true
  return [audio, sfx]
}

export var fadeOut = audio => {
  var actualVolume = audio.volume
  var fadeOutInterval = setInterval(function () {
    actualVolume = (parseFloat(actualVolume) - 0.1).toFixed(1)
    if (actualVolume >= 0) {
        audio.volFume = actualVolume
    } else {
        audio.pause()
      clearInterval(fadeOutInterval)
    }
  }, 100)
}

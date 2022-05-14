// Game Audio
export let initAudio = () => {
  const audio = new Audio('https://storage.googleapis.com/webbiker_bucket/audio/background_music_compressed.mp3')
  audio.volume = 0.35
  audio.loop = true

  const sfx = new Audio('https://storage.googleapis.com/webbiker_bucket/audio/motobike_accelerate.mp3')
  sfx.loop = true
  return [audio, sfx]
}

export let fadeOut = audio => {
  let actualVolume = audio.volume
  let fadeOutInterval = setInterval(function () {
    actualVolume = (parseFloat(actualVolume) - 0.1).toFixed(1)
    if (actualVolume >= 0) {
      audio.volume = actualVolume
    } else {
      audio.pause()
      clearInterval(fadeOutInterval)
    }
  }, 100)
}

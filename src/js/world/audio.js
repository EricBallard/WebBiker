// Game Audio
export let initAudio = () => {
  const audio = new Audio('https://www.dropbox.com/s/gygsj7ho4pn77fd/background_music_compressed.mp3?raw=1')
  audio.volume = 0.35
  audio.loop = true

  const sfx = new Audio('https://www.dropbox.com/s/sry2e6ov9o1op04/motobike_accelerate.mp3?raw=1')
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

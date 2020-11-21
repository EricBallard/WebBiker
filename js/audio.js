// Game Audio
const audio = new Audio('/resources/audio/background_music_compressed.mp3');
audio.volume = 0.35;
audio.loop = true;

const accel_sfx = new Audio('/resources/audio/motobike_accelerate.mp3');
accel_sfx.loop = true;

function fadeOut(p_audio){  
    var actualVolume = p_audio.volume;
    var fadeOutInterval = setInterval(function(){
        actualVolume = (parseFloat(actualVolume) - 0.1).toFixed(1);
        if(actualVolume >= 0){
            p_audio.volume = actualVolume;
        } else {
            p_audio.pause();
            clearInterval(fadeOutInterval);
        }
    }, 100);
}
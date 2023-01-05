  // TUNING PERFORMANCE
var audio1;
var worker;
var canvas = document.getElementById("canvas").transferControlToOffscreen();
var audioEl = document.getElementById('audio')
var container = document.getElementById('container')
// canvas.width = 750;
// canvas.height = 500;
canvas.width = window.innerWidth
canvas.height = window.innerHeight

document.getElementById('upload_audio').addEventListener('click', function(e) {
    if (!navigator.getUserMedia)
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                  navigator.mozGetUserMedia || navigator.msGetUserMedia;

    if (navigator.getUserMedia){

        navigator.getUserMedia({audio:true}, async function(stream){
            url = stream
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // for safari browser // I need to explain the browser restrictions & CORS issues here
            if(!worker){
                worker = new Worker(new URL("./worker.js", window.location));
                worker.postMessage({ canvas }, [canvas]);
            }

            let analyser = null;
            const filter = audioCtx.createBiquadFilter();// creates an filter node from the audio source
            filter.type = 'highshelf'
            filter.gain.value = 10
            filter.frequency.value = 400;
            source = audioCtx.createMediaStreamSource(url)

            analyser = audioCtx.createAnalyser();
            source.connect(analyser)

            analyser.fftSize = 2**12; // controls the size of the FFT. The FFT is a fast fourier transform. Basically the number of sound samples. Will be used to draw bars in the canvas

            const bufferLength = 128;
            const dataArray = new Uint8Array(bufferLength); // coverting to unsigned 8-bit integer array format because that's the format we need

            function animate() {
            analyser.getByteFrequencyData(dataArray); // copies the frequency data into the dataArray in place. Each item contains a number between 0 and 255
            worker.postMessage({ bufferLength, dataArray }, {});
            requestAnimationFrame(animate); // calls the animate function again. This method is built in
            }

            animate();
        },function(e) {
            alert('Error capturing audio.');
          })
    }
  });

/*basic*/
document.getElementById('upload_bg').addEventListener('change', function(e) {
    var file = this.files[0]
    var reader = new FileReader();
    reader.onload = function(evt) {
        url = evt.target.result;
        if(file.type.startsWith('image')){
            container.style = `background-image: url(${url}); background-repeat:no-repeat;background-size:contain;background-position:center`
        } else {
            let videoBlob = new Blob([new Uint8Array(url)], { type: file.type });// The blob gives us a URL to the video file:
            url = window.URL.createObjectURL(videoBlob);
            const videoElem = document.createElement('video')
            var sourceMP4 = document.createElement("source");
            sourceMP4.type = file.type;
            sourceMP4.src = url;
            videoElem.appendChild(sourceMP4);
            let videoExists = container.querySelector('video')
            if(videoExists){
                container.removeChild(videoExists)
            }
            container.style = `background-image:none`
            videoElem.style="position: absolute;object-fit: cover;width: 100vw;height: 100vh;z-index: -1;left: 0;right: 0;top: 0;bottom: 0;"
            videoElem.autoplay = true
            videoElem.muted = true
            videoElem.loop = true
            container.appendChild(videoElem)
        }
    }
    if(file.type.startsWith('image')){
        reader.readAsDataURL(file);
    } else {
        reader.readAsArrayBuffer(file)
    }
})
document.getElementById('upload_logo').addEventListener('change', function(e) {
    var file = this.files[0]
    var reader = new FileReader();
    reader.onload = function(evt) {
        url = evt.target.result;
        // const logo_img = document.createElement('img')
        const logo_img = document.querySelector('img.logo_img')
        logo_img.src = url;
        // logo_img.width=256
        // logo_img.height=256
        // logo_img.classList.add('logo_img')
        // logo_img.style = 'position:absolute;'
        // let logoExists = container.querySelector('.logo_img')
        // if(logoExists){
        //     container.removeChild(logoExists)
        // }
        // container.appendChild(logo_img)
    }
    reader.readAsDataURL(file);

})
document.getElementById('stroke_color').addEventListener('change', function(e) {
    var stroke_color = e.target.value
    worker.postMessage({ stroke_color }, {});
})
document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
        e.preventDefault()
        audioEl.paused ? audio.play() : audio.pause();
    }
  })
container.addEventListener('click',(e)=>{
    audioEl.paused ? audio.play() : audio.pause();
})
function showAudiocontrols(){
    document.getElementById('container-config').style.visibility='visible'
    container.style.cursor='auto'
}
function hideAudiocontrols(){
    document.getElementById('container-config').style.visibility='hidden'
    container.style.cursor='none'

}
var timer = null
container.addEventListener('mousemove',()=>{
    clearTimeout(timer)
    showAudiocontrols()
    timer = setTimeout(()=>{
        hideAudiocontrols()
    },3000)
})
document.getElementById('fullscreen').addEventListener('click',toggleFullScreen)
function cancelFullScreen() {
    var el = document;
    var requestMethod = el.cancelFullScreen||el.webkitCancelFullScreen||el.mozCancelFullScreen||el.exitFullscreen||el.webkitExitFullscreen;
    if (requestMethod) { // cancel full screen.
        requestMethod.call(el);
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}

function requestFullScreen(el) {
    // Supports most browsers and their versions.
    var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;

    if (requestMethod) { // Native full screen.
        requestMethod.call(el);
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
    return false
}

function toggleFullScreen(e) {
    e.stopPropagation();
    el = document.body; // Make the body go full screen.
    var isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) ||  (document.mozFullScreen || document.webkitIsFullScreen);

    let img = document.getElementById('fullscreen').querySelector('img')
    if (isInFullScreen) {
        img.src = '/img/fullscreen.png'
        cancelFullScreen();
    } else {
        img.src = '/img/exitscreen.png'
        requestFullScreen(el);
    }
}
//utility
function convertAudioBufferToBlob(audioBuffer) {
// Float32Array samples
    const [left, right] =  [audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)]

    // interleaved
    const interleaved = new Float32Array(left.length + right.length)
    for (let src=0, dst=0; src < left.length; src++, dst+=2) {
    interleaved[dst] =   left[src]
    interleaved[dst+1] = right[src]
    }

    // get WAV file bytes and audio params of your audio source
    const wavBytes = getWavBytes(interleaved.buffer, {
    isFloat: true,       // floating point or 16-bit integer
    numChannels: 2,
    sampleRate: 48000,
    })
    const wav = new Blob([wavBytes], { type: 'audio/wav' })
    return wav
  }


  // Returns Uint8Array of WAV bytes
function getWavBytes(buffer, options) {
    const type = options.isFloat ? Float32Array : Uint16Array
    const numFrames = buffer.byteLength / type.BYTES_PER_ELEMENT

    const headerBytes = getWavHeader(Object.assign({}, options, { numFrames }))
    const wavBytes = new Uint8Array(headerBytes.length + buffer.byteLength);

    // prepend header, then add pcmBytes
    wavBytes.set(headerBytes, 0)
    wavBytes.set(new Uint8Array(buffer), headerBytes.length)

    return wavBytes
  }

  // adapted from https://gist.github.com/also/900023
  // returns Uint8Array of WAV header bytes
  function getWavHeader(options) {
    const numFrames =      options.numFrames
    const numChannels =    options.numChannels || 2
    const sampleRate =     options.sampleRate || 44100
    const bytesPerSample = options.isFloat? 4 : 2
    const format =         options.isFloat? 3 : 1

    const blockAlign = numChannels * bytesPerSample
    const byteRate = sampleRate * blockAlign
    const dataSize = numFrames * blockAlign

    const buffer = new ArrayBuffer(44)
    const dv = new DataView(buffer)

    let p = 0

    function writeString(s) {
      for (let i = 0; i < s.length; i++) {
        dv.setUint8(p + i, s.charCodeAt(i))
      }
      p += s.length
    }

    function writeUint32(d) {
      dv.setUint32(p, d, true)
      p += 4
    }

    function writeUint16(d) {
      dv.setUint16(p, d, true)
      p += 2
    }

    writeString('RIFF')              // ChunkID
    writeUint32(dataSize + 36)       // ChunkSize
    writeString('WAVE')              // Format
    writeString('fmt ')              // Subchunk1ID
    writeUint32(16)                  // Subchunk1Size
    writeUint16(format)              // AudioFormat https://i.stack.imgur.com/BuSmb.png
    writeUint16(numChannels)         // NumChannels
    writeUint32(sampleRate)          // SampleRate
    writeUint32(byteRate)            // ByteRate
    writeUint16(blockAlign)          // BlockAlign
    writeUint16(bytesPerSample * 8)  // BitsPerSample
    writeString('data')              // Subchunk2ID
    writeUint32(dataSize)            // Subchunk2Size

    return new Uint8Array(buffer)
  }

window.addEventListener('resize', () => {
  document.querySelector('img.logo_img').width = Math.min(window.innerWidth,window.innerHeight) / 1.5
  document.querySelector('img.logo_img').height = Math.min(window.innerWidth,window.innerHeight) / 1.5
  if (worker) {
    let resize_canvas = [window.innerWidth, window.innerHeight]
    worker.postMessage({ resize_canvas })
  }
})

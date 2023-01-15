  
  // TUNING PERFORMANCE
var audio1;
var worker;
var canvas = document.getElementById("canvas").transferControlToOffscreen();
var audioEl = document.getElementById('audio') 
var container = document.getElementById('container')
var local_stream= null
const normalize = (val, threshold=200) => ((val > threshold) ? val - threshold : 0);
const normalize1 = (val, max, min) => ((val-min)/(max-min))
canvas.width = window.innerWidth
canvas.height = window.innerHeight
var defaultState= {
    radius: 128,
    color: '#000000',
    showParticles: true,
    displayType: 0,
    bufferLength: 128,
    fftSize: 2**14,
    bounceMultiplier: 300,
    beatDetection: false,
    bounce: 0
}
if (!navigator.getUserMedia)
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia || navigator.msGetUserMedia;

var config= {...defaultState}
function upload_audio(e, file=false) {
    if(file) {
        var file = e.target.files[0]
        var reader = new FileReader();
        if(local_stream) local_stream.getAudioTracks()[0].enabled = false;
        reader.onload = async function(evt) {
            url = evt.target.result;
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // for safari browser // I need to explain the browser restrictions & CORS issues here
            // let origblob = new Blob(, { type: file.type });// The blob gives us a URL to the video file:
            // var arrayBuffer = await new Response(origblob).arrayBuffer();
            let audioBuffer = await audioCtx.decodeAudioData(url);
            let audioBlob = convertAudioBufferToBlob(audioBuffer)// The blob gives us a URL to the video file:
            url = window.URL.createObjectURL(audioBlob);
            audioEl.pause()
            audioEl.src = url
      
            if(!worker){
                worker = new Worker(new URL("./worker.js", window.location));
                worker.postMessage({ canvas }, [canvas]);
            }
            
            let analyser = null;
            let filter = audioCtx.createBiquadFilter();// creates an filter node from the audio source
            filter.type = 'highshelf'
            filter.gain.value = 10
            filter.frequency.value = 400;
    
            // var gainNode = audioCtx.createGain()
            let lowpass = audioCtx.createBiquadFilter()
            let highpass = audioCtx.createBiquadFilter()
    
            let source = audioCtx.createMediaElementSource(audioEl)
            source.connect(lowpass)
            lowpass.connect(highpass)
            source.connect(audioCtx.destination)
            
            lowpass.type = "lowpass"
            lowpass.frequency.value = 200
            lowpass.gain.value = -1
            highpass.type = "highpass"
            highpass.frequency.value = 10
            highpass.gain.value = -1
            analyser = audioCtx.createAnalyser();
            highpass.connect(analyser)
           
            analyser.fftSize = defaultState.fftSize // controls the size of the FFT. The FFT is a fast fourier transform. Basically the number of sound samples. Will be used to draw bars in the canvas
    
            // const bufferLength = analyser.frequencyBinCount; // the number of data values that dictate the number of bars in the canvas. Always exactly one half of the fft size
            const bufferLength = defaultState.bufferLength;
            const dataArray = new Uint8Array(bufferLength); // coverting to unsigned 8-bit integer array format because that's the format we need
        
            function animate() {
                analyser.getByteFrequencyData(dataArray); // copies the frequency data into the dataArray in place. Each item contains a number between 0 and 255
                const setBounce = ()=>{
                    let bassArr = dataArray.slice(0,config.bufferLength)
                    let max = Math.max(...bassArr)
                    let min = Math.min(...bassArr)
                    let threshold2 = min+ (max-min)*0.7
                    let newNorm = bassArr.map(val=>normalize(val, threshold2))
                    let threshold1 = newNorm.reduce((acc,crr)=>acc+crr/bassArr.length,0)
                    let bounce = threshold1 * 0.01
                    let bounced =defaultState.radius + Math.floor(bounce*defaultState.bounceMultiplier)
                    let height =bounced*2>window.innerHeight ?window.innerHeight/2:bounced
                    let width =bounced*2>window.innerWidth ?window.innerWidth/2:bounced
                    config.radius = Math.min(height,width)
                    config.bounce = bounce
                    
                }
                const setLogo = ()=>{
                    let logoExists = container.querySelector('.logo_img')
                    if(logoExists) {
                        logoExists.height = config.radius *2
                        logoExists.width = config.radius *2
                    }
                }
                setBounce()
                worker.postMessage({ bufferLength, dataArray, config }, {});
                setTimeout(setLogo,200)
                requestAnimationFrame(animate); // calls the animate function again. This method is built in
            }
            animate();
           
        };
        reader.readAsArrayBuffer(file);
    }
    else {
       
        if (navigator.getUserMedia){
            // local_stream.getAudioTracks()[0].enabled = true;
            navigator.getUserMedia({audio:true}, async function(stream){
                local_stream = stream
                url = stream
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // for safari browser // I need to explain the browser restrictions & CORS issues here
                if(!worker){
                    worker = new Worker(new URL("./worker.js", window.location));
                    worker.postMessage({ canvas }, [canvas]);
                }
                audioEl.src= ''
                let analyser = null;
                let source = audioCtx.createMediaStreamSource(url)
    
                analyser = audioCtx.createAnalyser();
                source.connect(analyser)
                
                analyser.fftSize = defaultState.fftSize // controls the size of the FFT. The FFT is a fast fourier transform. Basically the number of sound samples. Will be used to draw bars in the canvas
    
                const bufferLength = defaultState.bufferLength;
                const dataArray = new Uint8Array(bufferLength); // coverting to unsigned 8-bit integer array format because that's the format we need
    
                function animate() {
                analyser.getByteFrequencyData(dataArray);
                const setBounce = ()=>{
                    let max = Math.max(...dataArray.slice(0,config.bufferLength/2))
                    let bounce =normalize1(max,255,0);
                    let bounced =defaultState.radius + Math.floor(bounce*defaultState.bounceMultiplier)
                    let height =bounced*2>window.innerHeight ?window.innerHeight/2:bounced
                    let width =bounced*2>window.innerWidth ?window.innerWidth/2:bounced
                    config.radius = Math.min(height,width)
                    config.bounce = bounce
                }
                console.log(config.radius)
                const setLogo = ()=>{

                    let logoExists = container.querySelector('.logo_img')
                    if(logoExists) {
                        logoExists.height = config.radius *2
                        logoExists.width = config.radius *2
                    }
                }
                setBounce()
                worker.postMessage({ bufferLength, dataArray, config }, {});
                setTimeout(setLogo,250)
                requestAnimationFrame(animate); // calls the animate function again. This method is built in
                }
    
                animate();
            },function(e) {
                alert('Error capturing audio.');
              })
        }
    }
    
}
  
/*basic*/
document.getElementById('upload_bg').addEventListener('change', function(e) {
    var file = this.files[0]
    var reader = new FileReader();
    reader.onload = function(evt) {
        url = evt.target.result;
        if(file.type.startsWith('image')){
            let videoExists = container.querySelector('video')
            if(videoExists){
                container.removeChild(videoExists)
            }
            container.style = `background-image: url(${url}); background-repeat:no-repeat;background-size:contain;background-position:center;`
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
        const logo_img = document.createElement('img')
        logo_img.src = url;
        logo_img.width=config.radius * 2
        logo_img.height=config.radius * 2
        logo_img.classList.add('logo_img')
        logo_img.style = 'position:absolute;'
        let logoExists = container.querySelector('.logo_img')
        if(logoExists){
            container.removeChild(logoExists)
        }
        container.appendChild(logo_img)
    }
    reader.readAsDataURL(file);

})
document.getElementById('stroke_color').addEventListener('change', function(e) {
    var stroke_color = e.target.value
    config.color = stroke_color
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
function displayChange(event){
    let val = event.target.value
    defaultState.displayType = parseInt(val)
    config.displayType = parseInt(val)
}
function radiusChange(event){
    let val = event.target.value
    let logoExists = container.querySelector('.logo_img')
    let width = val*2>window.innerWidth ?window.innerWidth/2: val
    let height =  val*2>window.innerHeight ?window.innerHeight/2: val
    defaultState.radius = Math.min(height,width)
    if(logoExists) {
        logoExists.height = defaultState.radius *2
        logoExists.width = defaultState.radius * 2
    }

}
function setFFTSize(event){
    let val = event.target.value
    defaultState.fftSize = parseInt(val)
    config.fftSize = parseInt(val)
}
function setBufferLength(event){
    let val = event.target.value
    defaultState.bufferLength = parseInt(val)
    config.bufferLength = parseInt(val)
}
function setBeatDetection(event){
    let val = event.target.value === 'true'
    defaultState.beatDetection = Boolean(val)
    config.beatDetection = Boolean(val)
}
function setBounceMultiplier(event){
    let val = event.target.value
    defaultState.bounceMultiplier = parseInt(val)
    config.bounceMultiplier = parseInt(val)
}
function setShowParticles(event){
    let val = event.target.value === 'true'
    defaultState.showParticles = val
    config.showParticles = val
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
    if (worker) {
        let height = defaultState.radius*2>window.innerHeight ?window.innerHeight/2: defaultState.radius
        let width = defaultState.radius*2>window.innerWidth ?window.innerWidth/2: defaultState.radius
        config.radius = Math.min(height,width)
        let resize_canvas = [window.innerWidth, window.innerHeight]
        maxDistributionX = window.innerWidth / 8;
        maxDistributionY = window.innerHeight / 4;
        worker.postMessage({ resize_canvas })
    }
  })
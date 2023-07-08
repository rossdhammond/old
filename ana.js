const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();





// Setup Canvas
var canvas = document.createElement("CANVAS");
document.body.appendChild(canvas);

var canvasCtx = canvas.getContext("2d");
canvas.width = window.innerWidth/8;
canvas.height = 50;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth/8;
})




analyser.fftSize = 2048;
const bufferLength = analyser.fftSize;
const dataArray = new Uint8Array(bufferLength);

// draw an oscilloscope of the current audio source
function draw() {
  drawVisual = requestAnimationFrame(draw);
  analyser.getByteTimeDomainData(dataArray);

  canvasCtx.fillStyle = 'rgb(200, 200, 200)';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

  const sliceWidth = canvas.width * 1.0 / bufferLength;
  let x = 0;

  canvasCtx.beginPath();
  for(var i = 0; i < bufferLength; i++) {
    const v = dataArray[i]/128.0;
    const y = v * canvas.height/2;

    if(i === 0)
      canvasCtx.moveTo(x, y);
    else
      canvasCtx.lineTo(x, y);

    x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, canvas.height/2);
  canvasCtx.stroke();
};

draw();





var source = null;
var source_playing = false;
var a_offset = 0;
var a_start = 0;

const playButton = document.querySelector('.transport-play');
playButton.addEventListener('click', function() {

      if (source_playing == false) {
        a_start = playSource(a_start,'song1short.wav');
        source_playing = true;
        playButton.textContent = 'Pause';
      } else {
        a_offset = pauseSource(a_offset,a_start);
        source_playing = false;
        playButton.textContent = 'Play';
      }
    })





    function createSource(context,url) {
      source = context.createBufferSource();
      request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';

      request.onload = function() {
        var audioData = request.response;

        context.decodeAudioData(audioData, function(buffer) {
            myBuffer = buffer;
            source.buffer = myBuffer;
            source.loop = true;
          },
          function(e){"Error with decoding audio data" + e.err});
      }

      request.send();
      return source;
    }

    function playSource(offset,url) {
      startTime = audioCtx.currentTime;
      source = createSource(audioCtx, url);
      source.connect(analyser);
      source.connect(audioCtx.destination);
      source.start(0,offset);
      return startTime
    }

    function pauseSource(offset,startTime) {
      source.stop();
      offset += audioCtx.currentTime - startTime;
      return offset;
    }

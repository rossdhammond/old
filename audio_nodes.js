// Creates primary audio context
function createAudioContext() {
  try {
    return new (window.AudioContext || window.webkitAudioContext)();
  } catch (error) {
    window.alert('Sorry, but your browser does not support this web application.');
  }
}

////////// Audio Nodes

// Parent Node class
class Node {
  constructor(context) {
    this.context = context;
  }
  connectTo(node) {
    this.node.connect(node);
  }
  disconnectFrom(num) {
    try {
      this.node.disconnect(num);  // First node is 0
    } finally {
      return
    }
  }
}

// Stereo Splitter
class Splitter extends Node {
  constructor(context) {
    super(context);
    this.node = this.context.createChannelSplitter(2);
  }
  connectTo(node,channel) {
    this.node.connect(node,channel);
  }
}

// Basic Audio-File Player
class AudioFilePlayer extends Node {
  constructor(context, url) {
    super(context);
    this.url = url;
    this.audio = new Audio(this.url);
    this.audio.crossOrigin = 'anonymous';
    this.audio.load();
    this.node = this.context.createMediaElementSource(this.audio);
    this.playing = 'false';
  }
  play() {
    this.audio.play();
  }
  pause() {
    this.audio.pause();
  }
}

// Oscillator
class Oscillator extends Node {
  constructor(context){
    super(context);
    this.node = this.context.createOscillator();
    this.freq = 1000;
    this.node.frequency.value = this.freq;
    this.type = 'sine';
    this.node.type = this.type;
  }
  setFrequency(freq) {
    this.freq = freq;
    this.node.frequency.value = this.freq;
  }
  setWaveform(type) {
    this.type = type;
    this.node.type = this.type;
  }
  play(freq,type) {
    if (freq != null) {
      this.setFrequency(freq);
    }
    if (type != null) {
          this.setWaveform(type);
    }
    this.node.start();
  }
  stop(){
    this.node.stop();
  }
}

// Gain Node
class Gain extends Node {
  constructor(context) {
    super(context);
    this.node = this.context.createGain();
    this.node.gain.value = 1;
  }
  setGain(level) {
    this.node.gain.value = level;
  }
}

// Stereo Pan Node
class StereoPan extends Node {
  constructor(context) {
    super(context);
    this.node = this.context.createStereoPanner();
    this.node.pan.value = 0;
  }
  setPan(level) {
    this.node.pan.value = level;
  }
}

// Delay Node
class Delay extends Node {
  constructor(context) {
    super(context);
    this.node = this.context.createDelay();
  }
  setDelay(delay) {
    this.node.delayTime = delay;
  }
}

// Compressor Node
class Compressor extends Node {
  constructor(context) {
    super(context);
    this.node = this.context.createDynamicsCompressor();
  }
  setAttack(value) {
    this.node.attack = value;
  }
  setRatio(value) {
    this.node.ratio = value;
  }
  setRelease(value) {
    this.node.release = value;
  }
  setThreshold(value) {
    this.node.threshold = value;
  }
}



////////// Create Source

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
        source.loop = false;
      },
      function(e){"Error with decoding audio data" + e.err});
  }

  request.send();
  return source;
}





function playSource(offset) {
  startTime = audioContext.currentTime;
  source = createSource(audioContext, 'song1.wav');
  source.connect(masterGain.node);
  source.start(0,offset);
  return startTime
}

function pauseSource(offset,startTime) {
  source.stop();
  offset += audioContext.currentTime - startTime;
  return offset;
}


////////// Create Impulse Response buffer for convolution

function createIR(context,url) {
  let convolver = context.createConvolver();
  let ajaxRequest = new XMLHttpRequest();
  ajaxRequest.open('GET', url, true);
  ajaxRequest.responseType = 'arraybuffer';

  ajaxRequest.onload = function() {
    let impulseData = ajaxRequest.response;

    context.decodeAudioData(impulseData, function(buffer) {
        myImpulseBuffer = buffer;
        convolver.buffer = myImpulseBuffer;
        convolver.loop = true;
      	convolver.normalize = true;
      },

      function(e){"Error with decoding audio data" + e.err});

  }
  ajaxRequest.send();
  return convolver;
}






////////// To Do: Real-Time audio processing
// class AudioProcessor extends Node {
//   constructor(context) {
//     super(context);
//     this.node = this.context.createScriptProcessor(2048);
//   }
// }
//
// class InOutBuffer extends AudioProcessor {
//   constructor(context) {
//     super(context);
//     this.node.onaudioprocess = this.onProcess;
//   }
//   onProcess(e) {
//
//     //Buffer input
//     var leftIn = e.inputBuffer.getChannelData(0);
//     var rightIn = e.inputBuffer.getChannelData(1);
//
//     //Buffer output
//     var leftOut = e.outputBuffer.getChannelData(0);
//     var rightOut = e.outputBuffer.getChannelData(1);
//
//     //Process Buffer
//     for (var i = 0; i < leftOut.length; i++) {
//       leftOut[i] = leftIn[i];
//       rightOut[i] = rightIn[i];
//     }
//   }
// }

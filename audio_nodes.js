////////// Set Up

// Creates primary audio context
function createAudioContext() {
  try {
    return new (window.AudioContext || window.webkitAudioContext)();
  } catch (error) {
    window.alert('Sorry, but your browser does not support this web application.');
  }
}

////////// Primary Audio Nodes

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

// Stereo Splitter
class Splitter extends Node {
  constructor(context) {
    super(context);
    this.node = this.context.createChannelSplitter(2);
  }
  connectTo(node,channel,channel2) {
    this.node.connect(node,channel,channel2);
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
    this.setThreshold(0);
    this.setRatio(1);
  }
  setAttack(value) {
    this.node.attack.value = value;
  }
  setRatio(value) {
    this.node.ratio.value = value;
  }
  setRelease(value) {
    this.node.release.value = value;
  }
  setThreshold(value) {
    this.node.threshold.value = value;
  }
}

// Convolver Node

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
      	convolver.normalize = false;
      },

      function(e){"Error with decoding audio data" + e.err});

  }
  ajaxRequest.send();
  return convolver;
}

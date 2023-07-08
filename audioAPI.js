//// To do:
// Stereo Splitter
// Master Channel
// Sub Groups (x4)
// FX groups (x2)
// Solo group buttons
// dynamics
// EQ
// Master EQ

///// Low Priority
// Multi-tracks option
// Display timecode

//////////////// Global variables ////////////////

let select_channel;

//////////////// On page load ////////////////
document.addEventListener('DOMContentLoaded', function() {

  // Primary audio context
  audioContext = createAudioContext();

  // Channel Names and URLs
  ChannelNames = ["Snare",
                  "DI1",
                  "DI4"];

  ChannelUrls = [ 'SzymonSkiba_SomeTrashyThrashIGuess_Full/02_Snare.wav',
                  'SzymonSkiba_SomeTrashyThrashIGuess_Full/09_ElecGtrDI1.wav',
                  'SzymonSkiba_SomeTrashyThrashIGuess_Full/12_ElecGtrDI4.wav'];

  // Create and populate channels array
  channels = new Array();

  for (var i = 0; i < ChannelNames.length; i++) {
    channels.push(new ChannelStrip(audioContext,ChannelNames[i],ChannelUrls[i],i+1));
  }


  // Create html elements
  stripEmpty = document.createElement("DIV");
  stripEmpty.className = "channel_strip";
  stripEmpty.style.backgroundColor = (34,46,60);
  document.getElementById("channels_container").appendChild(stripEmpty);


  sub1 = new SubStrip(audioContext,"Sub 1",17);

  channels[0].connectTo(sub1.gainNode.node);
  channels[1].connectTo(sub1.gainNode.node);
  channels[2].connectTo(sub1.gainNode.node);
  channels[3].connectTo(sub1.gainNode.node);
  channels[5].connectTo(sub1.gainNode.node);

  sub2 = new SubStrip(audioContext,"Sub 2",18);

  channels[4].connectTo(sub2.gainNode.node);
  channels[6].connectTo(sub2.gainNode.node);
  channels[7].connectTo(sub2.gainNode.node);

  sub3 = new SubStrip(audioContext,"Sub 3",19);

  channels[9].connectTo(sub3.gainNode.node);
  channels[10].connectTo(sub3.gainNode.node);

  sub4 = new SubStrip(audioContext,"Sub 4",20);

  channels[8].connectTo(sub4.gainNode.node);

  Master = new MasterStrip(audioContext,"Master");

  Master.connectSubGroup(sub1);
  Master.connectSubGroup(sub2);
  Master.connectSubGroup(sub3);
  Master.connectSubGroup(sub4);


})


//////////////// Top Controls ////////////////

const gainKnob = document.getElementById('channel_gain');
gainKnob.addEventListener('input', function() {
  channels[select_channel-1].control_gain.setGain(this.value);
})

const gateKnob = document.getElementById('channel_gate');
gateKnob.addEventListener('input', function() {
  channels[select_channel-1].gateThres = this.value;
})

const thresKnob = document.getElementById('channel_thres');
thresKnob.addEventListener('input', function() {
  channels[select_channel-1].control_compressor.setThreshold(this.value);
})

const ratioKnob = document.getElementById('channel_ratio');
ratioKnob.addEventListener('input', function() {
  channels[select_channel-1].control_compressor.setRatio(0.0001);
})

const attackKnob = document.getElementById('channel_attack');
attackKnob.addEventListener('input', function() {
  channels[select_channel-1].control_compressor.setAttack(this.value);
})

const releaseKnob = document.getElementById('channel_release');
releaseKnob.addEventListener('input', function() {
  channels[select_channel-1].control_compressor.setRelease(this.value);
})


//////////////// Transport Control: Play/Pause

let source_playing = false;
let offset = 0;
let startTime = 0;

const playButton = document.querySelector('.transport-play');
playButton.addEventListener('click', function() {

      if (source_playing == false) {
        source_playing = true;
        playButton.textContent = 'Pause';

        // Start audio in x seconds so audio loads in time (where x is number of tracks to load/1 second per track)
        var syncTime = audioContext.currentTime + channels.length;

        for (var i = 0; i<channels.length; i++) {
          channels[i].source.start(syncTime,offset);
        }

        startTime = audioContext.currentTime;
      } else {

        for (var i = 0; i<channels.length;i++) {
          channels[i].source.stop();
        }

        offset += audioContext.currentTime - startTime;
        source_playing = false;
        playButton.textContent = 'Play';

        for (var i = 0; i<channels.length;i++) {
          channels[i].createSource();
        }

      }
    })














class ChannelStrip {
  constructor(audioContext, name, url, channel_number){

    this.context = audioContext;    // Set audio context
    this.channel = channel_number;  // Set channel number
    this.createHTMLElements(name);      // Create html elements and append to document

    // Control Nodes
    this.control_gain = new Gain(audioContext);

    this.control_gate = audioContext.createAnalyser();
    this.control_gate.fftSize = 2048;
    this.control_buffer = new Float32Array(this.control_gate.fftSize);
    this.control_compressor = new Compressor(audioContext);
    this.gateThres = 0;

    // Channel Nodes
    this.faderGain = new Gain(audioContext);
    this.panNode = new StereoPan(audioContext);

    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.sampleBuffer = new Float32Array(this.analyser.fftSize);

    // Connect Nodes
    this.control_gain.connectTo(this.control_compressor.node);
    this.control_compressor.connectTo(this.faderGain.node);

    this.faderGain.connectTo(this.panNode.node);
    this.panNode.connectTo(audioContext.destination);
    this.panNode.connectTo(this.analyser);

    ////// Other functions /////
    this.animate();
    this.source = null;
    this.url = url;
    this.createSource();

    ////////// Event listeners //////////
    // Fader listener
    this.fader.addEventListener("input", ev => {
      if (!this.mute.toggle){
        this.faderGain.setGain(this.fader.value);
      }
    });

    // Pan listener
    this.pan.addEventListener("input", ev => {
      this.panNode.setPan(this.pan.value);
    });

    // Mute button listener
    this.mute.addEventListener("click", ev => {
      if (this.mute.toggle) {
        this.mute.toggle = false;
        this.faderGain.setGain(this.fader.value);
        this.mute.style.backgroundColor="darkred";
      } else {
        this.mute.toggle = true;
        this.faderGain.setGain(0);
        this.mute.style.backgroundColor="red";
      }
    })

    // Solo button listener
    this.solo.addEventListener("click", ev => {
      if (this.solo.toggle) {
        this.solo.toggle = false;
        for(var i=0;i<channels.length;i++) {
          channels[i].solo.style.backgroundColor="blue";
          channels[i].faderGain.setGain(channels[i].fader.value);
        }
      } else {
        for(var i=0;i<channels.length;i++) {
          channels[i].solo.style.backgroundColor="blue";
          channels[i].faderGain.setGain(0);
          channels[i].solo.toggle = false;
        }
        this.solo.toggle = true;
        this.faderGain.setGain(this.fader.value);
        this.solo.style.backgroundColor="green";
      }
    })

    // Select button listener
    this.select.addEventListener("click", ev => {

      for(var i=0;i<channels.length;i++) {
        channels[i].select.style.backgroundColor="blue";
      }

      this.select.style.backgroundColor="green";
      select_channel = this.channel;

      // Set control components
      document.getElementById('channel_gain').value = this.control_gain.node.gain.value;
    })
  }

  ////////// Create HTML Elements //////////
  createHTMLElements(name) {
    this.strip = document.createElement("DIV");
    this.strip.className = "channel_strip";

    this.name_container = document.createElement("DIV");
    this.name_container.className = "name_container";
    this.channel_name = document.createElement("p");
    this.channel_name.innerHTML = name;
    this.name_container.appendChild(this.channel_name);

    this.fader_container = document.createElement("DIV");
    this.fader_container.className = "fader_container";
    this.fader = document.createElement("INPUT");
    this.fader.setAttribute("type", "range");
    this.fader.value = "0.5";
    this.fader.min = "0";
    this.fader.max = "1";
    this.fader.step = "0.01";
    this.fader.className = "custom-range fader";
    this.fader_container.appendChild(this.fader);

    this.pan_container = document.createElement("DIV");
    this.pan_container.className = "pan_container";
    this.pan = document.createElement("INPUT");
    this.pan.setAttribute("type", "range");
    this.pan.value = "0";
    this.pan.min = "-1";
    this.pan.max = "1";
    this.pan.step = "0.01";
    this.pan.className = "custom-range pan";
    this.pan_container.appendChild(this.pan);

    this.mute_container = document.createElement("DIV");
    this.mute_container.className = "mute";
    this.mute = document.createElement("CHECKBOX");
    this.mute.className = "btn btn-danger";
    this.mute.toggle = false;
    this.mute.style.backgroundColor="darkred";
    this.mute_container.appendChild(this.mute);
    this.solo_container = document.createElement("DIV");
    this.solo_container.className = "solo";
    this.solo = document.createElement("BUTTON");
    this.solo.className = "btn btn-success";
    this.solo.toggle = false;
    this.solo_container.appendChild(this.solo);
    this.select_container = document.createElement("DIV");
    this.select_container.className = "select";
    this.select = document.createElement("BUTTON");
    this.select.className = "btn btn-primary";
    this.select_container.appendChild(this.select);

    this.vu_container = document.createElement("DIV");
    this.vu_container.className = "vu_container";
    this.canvas = document.createElement("CANVAS");
    this.canvasCtx = this.canvas.getContext("2d");
    this.canvas.width = 40;
    this.canvas.height = 200;

    this.strip.appendChild(this.name_container);
    this.strip.appendChild(this.canvas);
    this.strip.appendChild(this.fader_container);
    this.strip.appendChild(this.pan_container);
    this.strip.appendChild(this.mute_container);
    this.strip.appendChild(this.solo_container);
    this.strip.appendChild(this.select_container);

    document.getElementById("channels_container").appendChild(this.strip);
  }

  ////////// Create Buffer source //////////
  createSource() {
    let sourcet = audioContext.createBufferSource();
    sourcet.loop = true;
    let request = new XMLHttpRequest();
    request.open('GET', this.url, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      var audioData = request.response;

      audioContext.decodeAudioData(audioData, function(buffer) {
          let myBuffer = buffer;
          sourcet.buffer = myBuffer;
        },
        function(e){"Error with decoding audio data" + e.err});
    }

    request.send();
    this.source = sourcet;
    this.source.connect(this.control_gain.node);
  }

  ////////// Connect this channel //////////
  connectTo(sub) {
    this.panNode.node.disconnect(0);
    this.panNode.connectTo(this.analyser);
    this.panNode.connectTo(sub);
  }

  ////////// Animate VU canvas //////////
  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.canvasCtx.clearRect(0,0,innerWidth,innerHeight);
    this.analyser.getFloatTimeDomainData(this.sampleBuffer);

    // Compute Peak
    let peak = 0;
    peak = Math.max(-Math.min(...this.sampleBuffer), Math.max(...this.sampleBuffer));

    this.canvasCtx.beginPath();
    this.canvasCtx.fillStyle = "blue";
    this.canvasCtx.fillRect(0,0,40,200);
    this.canvasCtx.fillStyle = 'rgb(34,46,60)';
    this.canvasCtx.fillRect(0,0,40,200-(200*(peak)));
    this.canvasCtx.stroke();
  }
}



















class SubStrip {
  constructor(audioContext, name, channel_number){
    // Set audio context
    this.context = audioContext;

    this.channel = channel_number;

    // Create html elements
    this.strip = document.createElement("DIV");
    this.strip.className = "channel_strip";

    this.name_container = document.createElement("DIV");
    this.name_container.className = "name_container";
    this.channel_name = document.createElement("p");
    this.channel_name.innerHTML = name;
    this.name_container.appendChild(this.channel_name);

    this.fader_container = document.createElement("DIV");
    this.fader_container.className = "fader_container";
    this.fader = document.createElement("INPUT");
    this.fader.setAttribute("type", "range");
    this.fader.value = "0.5";
    this.fader.min = "0";
    this.fader.max = "1";
    this.fader.step = "0.01";
    this.fader.className = "custom-range fader";
    this.fader_container.appendChild(this.fader);

    this.pan_container = document.createElement("DIV");
    this.pan_container.className = "pan_container";

    this.mute_container = document.createElement("DIV");
    this.mute_container.className = "mute";
    this.mute = document.createElement("CHECKBOX");
    this.mute.className = "btn btn-danger";
    this.mute.toggle = false;
    this.mute.style.backgroundColor="darkred";
    this.mute_container.appendChild(this.mute);
    this.solo_container = document.createElement("DIV");
    this.solo_container.className = "solo";
    this.solo = document.createElement("BUTTON");
    this.solo.className = "btn btn-success";
    this.solo_container.appendChild(this.solo);
    this.select_container = document.createElement("DIV");
    this.select_container.className = "select";
    this.select = document.createElement("BUTTON");
    this.select.className = "btn btn-primary";
    this.select_container.appendChild(this.select);

    this.vu_container = document.createElement("DIV");
    this.vu_container.className = "vu_container";
    this.canvas = document.createElement("CANVAS");
    this.canvasCtx = this.canvas.getContext("2d");
    this.canvas.width = 40;
    this.canvas.height = 200;

    this.strip.appendChild(this.name_container);
    this.strip.appendChild(this.canvas);
    this.strip.appendChild(this.fader_container);
    this.strip.appendChild(this.pan_container);
    this.strip.appendChild(this.mute_container);
    this.strip.appendChild(this.solo_container);
    this.strip.appendChild(this.select_container);

    document.getElementById("channels_container").appendChild(this.strip);



    // Create Nodes
    this.gainNode = new Gain(audioContext);
    this.split = new Splitter(audioContext);
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.sampleBuffer = new Float32Array(this.analyser.fftSize);

    this.gainNode.connectTo(this.split.node);
    this.split.connectTo(this.analyser,0,0);



    // Event listeners
    this.fader.addEventListener("input", ev => {
      if (!this.mute.toggle){
        this.gainNode.setGain(this.fader.value);
      }
    });

    this.mute.addEventListener("click", ev => {

      if (this.mute.toggle) {
        this.mute.toggle = false;
        this.gainNode.setGain(this.fader.value);
        this.mute.style.backgroundColor="darkred";
      } else {
        this.mute.toggle = true;
        this.gainNode.setGain(0);
        this.mute.style.backgroundColor="red";
      }
    })

    this.select.addEventListener("click", ev => {

        channels[0].select.style.backgroundColor="blue";
        channels[1].select.style.backgroundColor="blue";
        channels[2].select.style.backgroundColor="blue";
        channels[3].select.style.backgroundColor="blue";
        channels[4].select.style.backgroundColor="blue";
        channels[5].select.style.backgroundColor="blue";
        channels[6].select.style.backgroundColor="blue";
        channels[7].select.style.backgroundColor="blue";
        channels[8].select.style.backgroundColor="blue";
        channels[9].select.style.backgroundColor="blue";
        channels[10].select.style.backgroundColor="blue";
        channels[11].select.style.backgroundColor="blue";
        channels[12].select.style.backgroundColor="blue";
        channels[13].select.style.backgroundColor="blue";
        channels[14].select.style.backgroundColor="blue";
        channels[15].select.style.backgroundColor="blue";
        this.select.style.backgroundColor="green";
        select_channel = this.channel;
        document.getElementById('channel_gain').value = this.control_gain.node.gain.value;
    })

    this.animate();

  }
  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.canvasCtx.clearRect(0,0,innerWidth,innerHeight);
    this.analyser.getFloatTimeDomainData(this.sampleBuffer);

    // Compute Peak
    let peak = 0;
    peak = Math.max(-Math.min(...this.sampleBuffer), Math.max(...this.sampleBuffer));

    this.canvasCtx.beginPath();
    this.canvasCtx.fillStyle = "blue";
    this.canvasCtx.fillRect(0,0,40,200);
    this.canvasCtx.fillStyle = 'rgb(34,46,60)';
    this.canvasCtx.fillRect(0,0,40,200-(200*(peak)));
    this.canvasCtx.stroke();
  }
}






class MasterStrip {
  constructor(audioContext, name){
    // Set audio context
    this.context = audioContext;

    // Create html elements
    this.strip = document.createElement("DIV");
    this.strip.className = "channel_strip";

    this.name_container = document.createElement("DIV");
    this.name_container.className = "name_container";
    this.channel_name = document.createElement("p");
    this.channel_name.innerHTML = name;
    this.name_container.appendChild(this.channel_name);

    this.fader_container = document.createElement("DIV");
    this.fader_container.className = "fader_container";
    this.fader = document.createElement("INPUT");
    this.fader.setAttribute("type", "range");
    this.fader.value = "0.5";
    this.fader.min = "0";
    this.fader.max = "1";
    this.fader.step = "0.01";
    this.fader.className = "custom-range fader";
    this.fader_container.appendChild(this.fader);

    this.pan_container = document.createElement("DIV");
    this.pan_container.className = "pan_container";

    this.mute_container = document.createElement("DIV");
    this.mute_container.className = "mute";
    this.mute = document.createElement("CHECKBOX");
    this.mute.className = "btn btn-danger";
    this.mute.toggle = false;
    this.mute.style.backgroundColor="darkred";
    this.mute_container.appendChild(this.mute);

    this.vu_container = document.createElement("DIV");
    this.vu_container.className = "vu_container";
    this.canvas = document.createElement("CANVAS");
    this.canvasCtx = this.canvas.getContext("2d");
    this.canvas.width = 40;
    this.canvas.height = 200;

    this.strip.appendChild(this.name_container);
    this.strip.appendChild(this.canvas);
    this.strip.appendChild(this.fader_container);


    this.theatre = createIR(audioContext,'theatre.wav');
    this.arena = createIR(audioContext,'arena.wav');

    this.theatre.connect(audioContext.destination);
    this.arena.connect(audioContext.destination);

    document.getElementById("channels_container").appendChild(this.strip);

    this.room_select = document.getElementById("room");
    this.room_select.addEventListener("change", ev => {

      if(this.room_select.value === "None") {

        this.gainNode.node.disconnect();
        this.gainNode.connectTo(audioContext.destination);
        this.gainNode.connectTo(this.split.node);


      } else if (this.room_select.value === "Theatre") {
        this.gainNode.node.disconnect();
        this.gainNode.connectTo(this.theatre);
        this.gainNode.connectTo(this.split.node);
      } else {
        this.gainNode.node.disconnect();
        this.gainNode.connectTo(this.arena);
        this.gainNode.connectTo(this.split.node);

      }



    });


    // Create Nodes
    this.gainNode = new Gain(audioContext);
    this.split = new Splitter(audioContext);
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.sampleBuffer = new Float32Array(this.analyser.fftSize);

    this.gainNode.connectTo(audioContext.destination);
    this.gainNode.connectTo(this.split.node);
    this.split.connectTo(this.analyser,0,0);


    // Event listeners
    this.fader.addEventListener("input", ev => {
      if (!this.mute.toggle){
        this.gainNode.setGain(this.fader.value);
      }
    });

    this.mute.addEventListener("click", ev => {

      if (this.mute.toggle) {
        this.mute.toggle = false;
        this.gainNode.setGain(this.fader.value);
        this.mute.style.backgroundColor="darkred";
      } else {
        this.mute.toggle = true;
        this.gainNode.setGain(0);
        this.mute.style.backgroundColor="red";
      }
    })

    this.animate();

  }
  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.canvasCtx.clearRect(0,0,innerWidth,innerHeight);
    this.analyser.getFloatTimeDomainData(this.sampleBuffer);

    // Compute Peak
    let peak = 0;
    peak = Math.max(-Math.min(...this.sampleBuffer), Math.max(...this.sampleBuffer));

    this.canvasCtx.beginPath();
    this.canvasCtx.fillStyle = "blue";
    this.canvasCtx.fillRect(0,0,40,200);
    this.canvasCtx.fillStyle = 'rgb(34,46,60)';
    this.canvasCtx.fillRect(0,0,40,200-(200*(peak)));
    this.canvasCtx.stroke();
  }
  connectSubGroup(sub) {
        sub.gainNode.connectTo(this.gainNode.node);
  }
}











    // var source = null;
    // var source_playing = false;
    // var a_offset = 0;
    // var a_start = 0;
    //
    // const playButton = document.querySelector('.transport-play');
    // playButton.addEventListener('click', function() {
    //
    //       if (source_playing == false) {
    //         a_start = playSource(a_start,'StreetNoise_Revelations_Full/01_Kick.wav');
    //         source_playing = true;
    //         playButton.textContent = 'Pause';
    //       } else {
    //         a_offset = pauseSource(a_offset,a_start);
    //         source_playing = false;
    //         playButton.textContent = 'Play';
    //       }
    //     })

//// To do:
// Multi-track transport controls
// Display timecode
// Display analyser
// Stereo Splitter
// Channel

// // Initialise canvas
// var c = document.getElementById("canvas");
// var ctx = c.getContext("2d");
// let WIDTH = 800;
// let HEIGHT = 400;


// On page load
$(function(){
    // Create Audio Context
    audioContext = createAudioContext();

    masterGain = new Gain(audioContext);

    gain1 = new Gain(audioContext);
    gain2 = new Gain(audioContext);
    gain3 = new Gain(audioContext);
    gain4 = new Gain(audioContext);
    gain5 = new Gain(audioContext);

    masterGain.connectTo(gain1.node);
    masterGain.connectTo(gain2.node);
    masterGain.connectTo(gain3.node);
    masterGain.connectTo(gain4.node);
    masterGain.connectTo(gain5.node);

    //IRs (first bank for trial condition)
    irt1 = createIR(audioContext, 'ir.wav');
    irt2 = createIR(audioContext, 'ir.wav');
    irt3 = createIR(audioContext, 'ir.wav');
    irt4 = createIR(audioContext, 'ir.wav');
    irt5 = createIR(audioContext, 'ir.wav');

    ir1 = createIR(audioContext, 'ir.wav');
    ir2 = createIR(audioContext, 'ir.wav');
    ir3 = createIR(audioContext, 'ir.wav');
    ir4 = createIR(audioContext, 'ir.wav');
    ir5 = createIR(audioContext, 'ir.wav');

    ir6 = createIR(audioContext, 'ir2.wav');
    ir7 = createIR(audioContext, 'ir2.wav');
    ir8 = createIR(audioContext, 'ir2.wav');
    ir9 = createIR(audioContext, 'ir2.wav');
    ir10 = createIR(audioContext, 'ir2.wav');

    ir11 = createIR(audioContext, 'ir3.wav');
    ir12 = createIR(audioContext, 'ir3.wav');
    ir13 = createIR(audioContext, 'ir3.wav');
    ir14 = createIR(audioContext, 'ir3.wav');
    ir15 = createIR(audioContext, 'ir3.wav');

    ir16 = createIR(audioContext, 'ir4.wav');
    ir17 = createIR(audioContext, 'ir4.wav');
    ir18 = createIR(audioContext, 'ir4.wav');
    ir19 = createIR(audioContext, 'ir4.wav');
    ir20 = createIR(audioContext, 'ir4.wav');

    ir21 = createIR(audioContext, 'ir5.wav');
    ir22 = createIR(audioContext, 'ir5.wav');
    ir23 = createIR(audioContext, 'ir5.wav');
    ir24 = createIR(audioContext, 'ir5.wav');
    ir25 = createIR(audioContext, 'ir5.wav');

    // Connect Gain Nodes
    gain1.connectTo(irt1);
    gain2.connectTo(irt2);
    gain3.connectTo(irt3);
    gain4.connectTo(irt4);
    gain5.connectTo(irt5);

    gain1.connectTo(ir1);
    gain2.connectTo(ir2);
    gain3.connectTo(ir3);
    gain4.connectTo(ir4);
    gain5.connectTo(ir5);

    gain1.connectTo(ir6);
    gain2.connectTo(ir7);
    gain3.connectTo(ir8);
    gain4.connectTo(ir9);
    gain5.connectTo(ir10);

    gain1.connectTo(ir11);
    gain2.connectTo(ir12);
    gain3.connectTo(ir13);
    gain4.connectTo(ir14);
    gain5.connectTo(ir15);

    // Connect trial IR bank to output
    irt1.connect(audioContext.destination);
    irt2.connect(audioContext.destination);
    irt3.connect(audioContext.destination);
    irt4.connect(audioContext.destination);
    irt5.connect(audioContext.destination);

    // Set gains
    gain1.setGain(1);
    gain2.setGain(0);
    gain3.setGain(0);
    gain4.setGain(0);
    gain5.setGain(0);

})


// Conditions (and shuffled)
let condition = 0;
let conditions = 5;
let conditions_arr = [1,2,3,4,5];
randomArrayShuffle(conditions_arr);
conditions_arr.unshift(0);

function randomArrayShuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}


// User Variables for form elements
let user = {};
user.order = conditions_arr;
user.answers = {};
console.log(user);

// Page Elements
document.getElementById("intro").style.display = 'block';
document.getElementById("instructions").style.display = 'none';
document.getElementById("test_container").style.display = 'none';
document.getElementById("go_container").style.display = 'none';
document.getElementById("end_container").style.display = 'none';

// Begin Test Button
const beginButton = document.querySelector('.begin_test');
beginButton.addEventListener('click', function() {
    // Load page elements
    document.getElementById("intro").style.display = 'none';
    document.getElementById("instructions").style.display = 'block';
    document.getElementById("test_container").style.display = 'block';
    document.getElementById("go_container").style.display = 'block';

    // Save user data
    user.initial = document.getElementById("user_first_").value;
    user.email = document.getElementById("user_email_").value;
    user.age = document.getElementById("user_age_").value;
    user.hearing = document.getElementById("user_hearing_").value;
    user.consent = document.getElementById("user_consent_").value;

})

// Submit Answer Button
const letsgo_button = document.querySelector('.go');
letsgo_button.addEventListener('click', function() {

    user.answers[condition] = document.getElementById("ir_slider").value;
    console.log(user);

    condition += 1;

    if (condition > conditions) {
      document.getElementById("end_container").style.display = 'block';
      document.getElementById("test_container").style.display = 'none';
      document.getElementById("go_container").style.display = 'none';
      if (source_playing == true) {
        source.stop();
      }

      // SEND RESULTS HERE

    } else {

      if (condition == 1) {
        document.getElementById("instructions").style.display = 'none';
        letsgo_button.textContent = 'Submit Answer';
      }

      document.getElementById("test_title").textContent = 'Condition ' + condition + ' of ' + conditions;

      loadNext(source);
    }
})

// Load Next Test
function loadNext(source){

      // Stop source if playing
      if (source_playing == true) {
        source.stop();
      }

      // Reset Variables
      source_playing = false;
      playButton.textContent = 'Play';
      source = null;
      a_offset = 0;
      a_start = 0;

      //disconnect and set IR conditions for next test
      console.log(conditions_arr[0]);
      disconnectIRs(conditions_arr[condition-1]);
      setIRs(conditions_arr[condition]);

      // Reset Slider/IR convolver
      document.getElementById("ir_slider").value = 0;
      gain1.setGain(1);
      gain2.setGain(0);
      gain3.setGain(0);
      gain4.setGain(0);
      gain5.setGain(0);

}

function setIRs(num) {

  switch(num) {
    case 1:
      // Disconnect Trial IR Nodes
      ir1.connect(audioContext.destination);
      ir2.connect(audioContext.destination);
      ir3.connect(audioContext.destination);
      ir4.connect(audioContext.destination);
      ir5.connect(audioContext.destination);
      break;

    case 2:
      // Disconnect Trial IR Nodes
      ir6.connect(audioContext.destination);
      ir7.connect(audioContext.destination);
      ir8.connect(audioContext.destination);
      ir9.connect(audioContext.destination);
      ir10.connect(audioContext.destination);
      break;

    case 3:
    // Disconnect Trial IR Nodes
      ir11.connect(audioContext.destination);
      ir12.connect(audioContext.destination);
      ir13.connect(audioContext.destination);
      ir14.connect(audioContext.destination);
      ir15.connect(audioContext.destination);
      break;

    case 4:
    // Disconnect Trial IR Nodes
      ir16.connect(audioContext.destination);
      ir17.connect(audioContext.destination);
      ir18.connect(audioContext.destination);
      ir19.connect(audioContext.destination);
      ir20.connect(audioContext.destination);
      break;

    case 5:
    // Disconnect Trial IR Nodes
      ir21.connect(audioContext.destination);
      ir22.connect(audioContext.destination);
      ir23.connect(audioContext.destination);
      ir24.connect(audioContext.destination);
      ir25.connect(audioContext.destination);
      break;

  }
}

function disconnectIRs(num) {
  switch(num) {
    case 0:
      irt1.disconnect(audioContext.destination);
      irt2.disconnect(audioContext.destination);
      irt3.disconnect(audioContext.destination);
      irt4.disconnect(audioContext.destination);
      irt5.disconnect(audioContext.destination);
      break;

    case 1:
      // Disconnect Trial IR Nodes
      ir1.disconnect(audioContext.destination);
      ir2.disconnect(audioContext.destination);
      ir3.disconnect(audioContext.destination);
      ir4.disconnect(audioContext.destination);
      ir5.disconnect(audioContext.destination);
      break;

    case 2:
    // Disconnect Trial IR Nodes
      ir6.disconnect(audioContext.destination);
      ir7.disconnect(audioContext.destination);
      ir8.disconnect(audioContext.destination);
      ir9.disconnect(audioContext.destination);
      ir10.disconnect(audioContext.destination);
      break;

    case 3:
    // Disconnect Trial IR Nodes
      ir11.disconnect(audioContext.destination);
      ir12.disconnect(audioContext.destination);
      ir13.disconnect(audioContext.destination);
      ir14.disconnect(audioContext.destination);
      ir15.disconnect(audioContext.destination);
      break;

    case 4:
    // Disconnect Trial IR Nodes
      ir16.disconnect(audioContext.destination);
      ir17.disconnect(audioContext.destination);
      ir18.disconnect(audioContext.destination);
      ir19.disconnect(audioContext.destination);
      ir20.disconnect(audioContext.destination);
      break;
  }
}




  // if (num == 1) {
  //   irt1.disconnect(audioContext.destination);
  //   irt2.disconnect(audioContext.destination);
  //   irt3.disconnect(audioContext.destination);
  //   irt4.disconnect(audioContext.destination);
  //   irt5.disconnect(audioContext.destination);
  //
  //   ir1.connect(audioContext.destination);
  //   ir2.connect(audioContext.destination);
  //   ir3.connect(audioContext.destination);
  //   ir4.connect(audioContext.destination);
  //   ir5.connect(audioContext.destination);
  //
  // } else if (num == 2) {
  //
  // } else if (num == 3) {
  //
  // } else if (num == 4) {
  //
  // } else if (num == 5) {
  //   console.log('Number 5')
  // }








// Test Elements

const volumeControl = document.querySelector('[name="volume"]');
volumeControl.addEventListener('input', function() {
  masterGain.setGain(this.value);
})

var source = null;
var source_playing = false;
var a_offset = 0;
var a_start = 0;

const playButton = document.querySelector('.transport-play');
playButton.addEventListener('click', function() {
  if (source_playing == false) {
    a_start = playSource(a_start);
    source_playing = true;
    playButton.textContent = 'Pause';
  } else {
    a_offset = pauseSource(a_offset,a_start);
    source_playing = false;
    playButton.textContent = 'Play';
  }
})


// IR Switcher
const irControl = document.querySelector('[name="ir_volume"]');
irControl.addEventListener('input', function() {
  val = this.value;
  spacing = 0.02;
  tc = 5; // total conditions

  if (val < ((1/tc)-spacing)) {
    gain1.setGain(1);
    gain2.setGain(0);
    gain3.setGain(0);
    gain4.setGain(0);
    gain5.setGain(0);
    console.log("1");
  } else if (val < (1/tc)+spacing) {
    range = -(((val - (1/tc)-spacing))/(spacing*2));
    gain2.setGain(Math.cos(range * 0.5*Math.PI));
    gain1.setGain(Math.cos((1.0 - range) * 0.5*Math.PI));
    gain3.setGain(0);
    gain4.setGain(0);
    gain5.setGain(0);
    console.log(range);

  } else if (val < (((1/tc)*2)-spacing)) {
    gain1.setGain(0);
    gain2.setGain(1);
    gain3.setGain(0);
    gain4.setGain(0);
    gain5.setGain(0);
    console.log("2");

  } else if (val < ((1/tc)*2)+spacing) {
    range = -(((val - ((1/tc)*2)-spacing))/(spacing*2));
    gain3.setGain(Math.cos(range * 0.5*Math.PI));
    gain2.setGain(Math.cos((1.0 - range) * 0.5*Math.PI));
    gain1.setGain(0);
    gain4.setGain(0);
    gain5.setGain(0);
    console.log(range)

  } else if (val < (((1/tc)*3)-spacing)) {
    gain1.setGain(0);
    gain2.setGain(0);
    gain3.setGain(1);
    gain4.setGain(0);
    gain5.setGain(0);
    console.log("3");

  } else if (val < ((1/tc)*3)+spacing) {
    range = -(((val - ((1/tc)*3)-spacing))/(spacing*2));
    gain4.setGain(Math.cos(range * 0.5*Math.PI));
    gain3.setGain(Math.cos((1.0 - range) * 0.5*Math.PI));
    gain1.setGain(0);
    gain2.setGain(0);
    gain5.setGain(0);
    console.log(range)

  } else if (val < (((1/tc)*4)-spacing)) {
    gain1.setGain(0);
    gain2.setGain(0);
    gain3.setGain(0);
    gain4.setGain(1);
    gain5.setGain(0);
    console.log("4");

  } else if (val < ((1/tc)*4)+spacing) {
    range = -(((val - ((1/tc)*4)-spacing))/(spacing*2));
    gain5.setGain(Math.cos(range * 0.5*Math.PI));
    gain4.setGain(Math.cos((1.0 - range) * 0.5*Math.PI));
    gain1.setGain(0);
    gain2.setGain(0);
    gain3.setGain(0);
    console.log(range)

  } else {
    gain1.setGain(0);
    gain2.setGain(0);
    gain3.setGain(0);
    gain4.setGain(0);
    gain5.setGain(1);
    console.log("5");
  }
})







// function playNote() {
//
//   // Create Nodes
//   oscSource = new Oscillator(audioContext);
//   gain = new Gain(audioContext);
//   pan = new StereoPan(audioContext);
//
//   // Connect Nodes
//   oscSource.connectTo(gain.node);
//   gain.connectTo(pan.node);
//   pan.connectTo(audioContext.destination);
//
//   // Set parameters
//   oscSource.setWaveform(checkRadioButtons('waveform'));
//   oscSource.setFrequency(getSliderVal('frequency',80,2000));
//   gain.setGain(getSliderVal('gain',0.5,3));
//   pan.setPan(-1);
//
//   // Play oscillator
//   oscSource.play();
//
// }





// Get value of slider between 0 and 1
function getSliderVal(slider_name,min,max){
  let slider = document.getElementsByName(slider_name);
  return (((slider[0].value)/100)*(max-min))+min;
}

// Get the checked radio button from group of radio buttons
function checkRadioButtons(radio_name){
  let radio = document.getElementsByName(radio_name);
  for (let i = 0; i < radio.length; i++) {
    if (radio[i].checked) {
      return radio[i].value;
    }
  }
}

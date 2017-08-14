window.onload = init;

var WIDTH = 640;
var HEIGHT = 360;

// A sound source.
var soundSource = null;
// A sound.
var soundBuffer = null;

// Audio variables.
var audioContext = new AudioContext();;
var gainNode = audioContext.createGain();
var oscillator1 = audioContext.createOscillator();

var gainNode2 = audioContext.createGain();
var oscillator2 = audioContext.createOscillator();

var analyser= audioContext.createAnalyser();


//play/stop flag. True = play, False = stop
var isPlaying = false;

function init() {	
	try {
		// Check if the default naming is enabled, if not use the WebKit naming.
	    if (!window.AudioContext) {
	        window.AudioContext = (window.AudioContext ||
								   window.webkitAudioContext ||
								   window.mozAudioContext ||
								   window.oAudioContext ||
								   window.msAudioContext);
	    }		
	}
	catch(e) {
		alert("Web Audio API is not supported in this browser");
  	}
 addEvents();
// initAnalyser();
}

//************ http://orm-other.s3.amazonaws.com/webaudioapi/samples/oscillator/index.html ****


// Add events to document elements.
function addEvents() {
	
	document.getElementById('volume1').addEventListener('change', function () { gainNode.gain.value = this.value; });
	document.getElementById('pitch1').addEventListener('change', function () { oscillator1.frequency.value = this.value; }); 
	document.getElementById('detune1').addEventListener('change', function () { oscillator1.detune.value = this.value; }); 
	
	document.getElementById('volume2').addEventListener('change', function () { gainNode2.gain.value = this.value; });
	document.getElementById('pitch2').addEventListener('change', function () { oscillator2.frequency.value = this.value; }); 
	document.getElementById('detune2').addEventListener('change', function () { oscillator2.detune.value = this.value; }); 
}

// Initalise the sound.
function initSound(arrayBuffer) {
	audioContext.decodeAudioData(arrayBuffer, 
			function(buffer) {
				// audioBuffer is global to reuse the decoded audio later.
				soundBuffer = buffer;
			}, 
			function(e) {
				console.log('Error decoding file', e);
			}
		); 
}

function showValue(newValue) {
	if (oscillator1)
	var x = document.getElementById("freq1").value = newValue; 
    else if (oscillator2)
	var y = document.getElementById("freq2").value = newValue; 
}


function OscillatorSample() {
	this.isPlaying = false;
    this.canvas = document.querySelector('canvas');
    this.WIDTH = 640;
    this.HEIGHT = 360;
}
// Play the sound.
function playSound1() {
		
	oscillator1.connect(analyser);
	analyser.connect(gainNode);
	gainNode.connect(audioContext.destination);
	
	oscillator1.type = 'sine';	
	var wave1 = document.getElementsByName('waveform1');
	
	for (var i = wave1.length; i--;) {
		wave1[i].onchange = function() {oscillator1.type = this.value;}
	}

	var freq1 = document.getElementById('pitch1').value;
	oscillator1.frequency.value = 440;// value in hertz
	oscillator1.frequency.value = freq1;
	
	var detune1= document.getElementById('detune1').value; 
	oscillator1.detune.value = 100;
	oscillator1.detune.value = detune1;
		
	var volume1 = document.getElementById('volume1').value; 
	gainNode.gain.value = 0.5;
	gainNode.gain.value = volume1*volume1;
		
	oscillator1.start(0);
	isPlaying = true;
   // Start visualizer.
     requestAnimFrame(visualize.bind(this));
}
	
	//===========================
function playSound2 () {
	
	oscillator2.connect(analyser);
	analyser.connect(gainNode2);
	gainNode2.connect(audioContext.destination);
	
	oscillator2.type = 'square';	
	var wave2 = document.getElementsByName('waveform2');
	
	for (var i = wave2.length; i--;) {
		wave2[i].onchange = function() {oscillator2.type = this.value;}
	}

	var freq2 = document.getElementById('pitch2').value;
	oscillator2.frequency.value = 200;// value in hertz
	oscillator2.frequency.value = freq2;
	
	var detune2= document.getElementById('detune2').value; 
	oscillator2.detune.value = 100;
	oscillator2.detune.value = detune2;
		
	var volume2 = document.getElementById('volume2').value; 
	gainNode.gain.value = 0.3;
	gainNode.gain.value = volume2*volume2;
		
	oscillator2.start(2);
	//=======================
	isPlaying = true;
   // Start visualizer.
     requestAnimFrame(visualize.bind(this));	 
}
 
  function playAll() {	 
	playSound1();
	playSound2();	
 } 
 
// Simple stop. Will only stop the last sound if you press play more than once.
function stopSound1() {
	if(oscillator1){
		gainNode.disconnect(audioContext.destination);
		oscillator1.disconnect(analyser);
		analyser.disconnect(gainNode);
		isPlaying = false;
	}	
}

function stopSound2() {
	if(oscillator2){
		gainNode2.disconnect(audioContext.destination);
		oscillator2.disconnect(analyser);
		analyser.disconnect(gainNode2);
		isPlaying = false;
	}	
}

function visualize() {
	
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
  var drawContext = canvas.getContext('2d');

  var times = new Uint8Array(analyser.frequencyBinCount);
 analyser.getByteTimeDomainData(times);
  for (var i = 0; i < times.length; i++) {
    var value = times[i];
    var percent = value / 256;
    var height = HEIGHT * percent;
    var offset = HEIGHT - height - 1;
    var barWidth = WIDTH/times.length;
	
    //drawContext.fillStyle = 'black';
   // drawContext.fillRect(i * barWidth, offset, 1, 1);
   
	var hue = i / times.frequencyBinCount * 360;
	drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
	drawContext.fillRect(i * barWidth, offset, barWidth, height);
	
  }
  requestAnimFrame(visualize.bind(this));
}

//Cross-browser support for requestAnimationFrame
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

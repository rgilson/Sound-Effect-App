window.onload = init;

// Set the width and height of the canvas.
var WIDTH = 640;
var HEIGHT = 320;

// A sound source.
var soundSource = null;
var soundBuffer = null;

// Audio variables.
var audioContext = new AudioContext();

// create and initialize the analyser
var analyser = audioContext.createAnalyser();
analyser.smoothingTimeConstant = 0.8;
analyser.fftSize = 2048;

var	gainNode = audioContext.createGain();
var	gainNode1 = audioContext.createGain();
var gainNode2 = audioContext.createGain();

var oscillator1 = audioContext.createOscillator();
var oscillator2 = audioContext.createOscillator();

var filterNode = audioContext.createBiquadFilter();

//spectrogram canvas
var spectrogramCanvasWidth = 640;
var spectrogramCanvasHeight = 320;

//the current x/draw pixel position
var spectrogramLeftPos = 0;

//play/stop flag. True = play, False = stop
var isPlaying = null;


//chroma library for the colour
var myColor = new chroma.ColorScale({
	colors: ['#000', '#f00', '#ff0','#fff'],
	positions: [0, .25, .75, 1],
	mode: 'rgb',
	limits: [0, 255]
});

function init() {	
	try {
		// Check if the default naming is enabled, if not use the WebKit naming.
	    if (!window.AudioContext) {
	        window.AudioContext = (window.AudioContext ||
				window.webkitAudioContext || window.mozAudioContext ||
				window.oAudioContext || window.msAudioContext);
	    }		
	}
	catch(e) {
		alert("Web Audio API is not supported in this browser");
  	}	
	addEvents();	
}

// Add events to document elements.
function addEvents() {
	document.getElementById("files").addEventListener('change', loadSound, false);	
	document.getElementById('volume').addEventListener('change', function () { gainNode.gain.value = this.value; });
	
	document.getElementById('volume1').addEventListener('change', function () { gainNode1.gain.value = this.value; });
	document.getElementById('pitch1').addEventListener('change', function () { oscillator1.frequency.value = this.value; }); 
	document.getElementById('detune1').addEventListener('change', function () { oscillator1.detune.value = this.value; }); 
	
	document.getElementById('volume2').addEventListener('change', function () { gainNode2.gain.value = this.value; });
	document.getElementById('pitch2').addEventListener('change', function () { oscillator2.frequency.value = this.value; }); 
	document.getElementById('detune2').addEventListener('change', function () { oscillator2.detune.value = this.value; }); 

	document.getElementById('filter').addEventListener("change", function () {filterNode.frequency.value = this.value; });
	document.getElementById('filterType').addEventListener("change", function () {filterNode.type = this.value;});
	document.getElementById('qValue').addEventListener("change", function () {filterNode.Q.value = this.value;});
}

// Load a file when a file is selected.
function loadSound(evt) {	
	var files = evt.target.files; // Get the FileList object.
	// Get the first file in the list
	var fileSelected = files[0];
    // Create a file reader.
	var reader = new FileReader();
	reader.onload = function(e) {
    	initSound(this.result);
  	}; 
	// Read in the image file as a data URL.
  	reader.readAsArrayBuffer(fileSelected);
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

function showValue1(newValue) {
	if (oscillator1)
	var x = document.getElementById("freq1").value = newValue; 
}

function showValue2(newValue) {
	if (oscillator2)
	var y = document.getElementById("freq2").value = newValue; 
}

function playSound(buffer) {
	soundSource = audioContext.createBufferSource(); // creates a sound source.
	soundSource.buffer = buffer; // tell the source which sound to play.
	
	// Connect the source to the analyser 
	soundSource.connect(analyser);
		
	filterOptions();	
    soundSource.start(0); // play the source now.	  
	//set the playing flag
	isPlaying = true;
	
	//clear spectrogram canvas
	var canvas = document.getElementById('canvas2');
	var context  = canvas.getContext('2d');
	context.fillStyle = 'rgb(255,255,255,255)';
	context.fillRect(0,0,spectrogramCanvasWidth, spectrogramCanvasHeight);
    // Start visualizer.
     requestAnimFrame(visualize);
}

function filterOptions() {
	var volume = document.getElementById("volume").value;
	var filter = document.getElementById("filter").value;    
    var filterType = document.getElementById("filterType").value;
    var qValue = document.getElementById("qValue").value;

    // set starting values for the a filter
	filterNode.type.value = 'normal';
    filterNode.type.value = filterType;
    filterNode.gain.value = 40;
    filterNode.Q.value = qValue;
    filterNode.frequency.value = filter;
 	
    gainNode.gain.value = 0.5;
    gainNode.gain.value = volume*volume;

    // connect the nodes together
    soundSource.connect(filterNode);  // connect the source to the filterNode
    filterNode.connect(gainNode);  // connect the filter to the gainNode        
    gainNode.connect(audioContext.destination); // connect the gainNode to the destination
}

// Simple stop. Will only stop the last sound if you press play more than once.
function stopSound() {
	if (soundSource) {
		soundSource.stop(0);
		isPlaying = false;
		spectrogramLeftPos = 0;
	}	
}
	
//-------- Oscillator --------
function playOscillator1() {		
	oscillator1.connect(analyser);
	analyser.connect(gainNode1);
	gainNode1.connect(audioContext.destination);
	
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
	gainNode.gain.value = 0.3;
	gainNode.gain.value = volume1*volume1;
		
	oscillator1.start(0);
	isPlaying = true;
   
	var canvas = document.getElementById('canvas2');
	var context  = canvas.getContext('2d');
	context.fillStyle = 'rgb(255,255,255,255)';
	context.fillRect(0,0,spectrogramCanvasWidth, spectrogramCanvasHeight);
    
    requestAnimFrame(visualize);
}
	
function playOscillator2 () {	
	oscillator2.connect(analyser);
	analyser.connect(gainNode2);
	gainNode2.connect(audioContext.destination);
	
	oscillator2.type = 'sawtooth';	
	
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
	gainNode.gain.value = 0.2;
	gainNode.gain.value = volume2*volume2;
		
	oscillator2.start(2);
	isPlaying = true;
  
	 var canvas = document.getElementById('canvas2');
	var context  = canvas.getContext('2d');
	context.fillStyle = 'rgb(255,255,255,255)';
	context.fillRect(0,0,spectrogramCanvasWidth, spectrogramCanvasHeight);
    // Start visualizer.
     requestAnimFrame(visualize);
}
 
  function playAll() {	 
	playOscillator1();
	playOscillator2();	
 } 
 
// Simple stop. Will only stop the last sound if you press play more than once.
function stopOscillator1() {
	if(oscillator1){
		gainNode1.disconnect(audioContext.destination);
		oscillator1.disconnect(analyser);
		analyser.disconnect(gainNode1);
		isPlaying = false;
	}	
}

function stopOscillator2() {
	if(oscillator2){
		gainNode2.disconnect(audioContext.destination);
		oscillator2.disconnect(analyser);
		analyser.disconnect(gainNode2);
		isPlaying = false;
	}	
}

//----------- Visualisation Functions -----------
function visualize() {
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	canvas.width = WIDTH;
	canvas.height = HEIGHT;

	//Draw the time domain visualisation.
	var timeDomain = new Uint8Array(analyser.frequencyBinCount);
	analyser.getByteTimeDomainData(timeDomain);

	for (var i = 0; i < timeDomain.length; i++) {
		var value = timeDomain[i];
		var percent = value / 256;
		var height = HEIGHT * percent;
		var offset = HEIGHT - height - 1;
		var barWidth = WIDTH/timeDomain.length;		
		context.fillStyle = 'black';
		context.fillRect(i * barWidth, offset, 2, 2);
	  }
	  
	//Draw frequency domain visualisation.
	var freqDomain = new Uint8Array(analyser.frequencyBinCount);
	analyser.getByteFrequencyData(freqDomain);
		
		for (var i = 0; i < analyser.frequencyBinCount; i++) {		
			var value = freqDomain[i]; //get the amplitude of the audio for this bin
			var percent = value/256; // convert the amplitude (0-255) into percentage		
			//convert the audio percentage value into (x,y) coordinates and draw 1x1 rectangle
			var y = HEIGHT * percent;
			var offset = HEIGHT - y -1;
			var barWidth = WIDTH / analyser.frequencyBinCount;
			
			var hue = i / analyser.frequencyBinCount * 360;
			context.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
			context.fillRect(i * barWidth, offset, barWidth, y);
		}
		
	drawSpectrogram();
	requestAnimFrame(visualize);
}


function drawSpectrogram() {
	
	var canvas = document.getElementById('canvas2');
	var context = canvas.getContext('2d');
	
	// stores a copy of the canvas
	var tempCanvas = document.createElement('canvas');
	tempCanvas.width = spectrogramCanvasWidth;
	tempCanvas.height= spectrogramCanvasHeight;
	var tempCtx = tempCanvas.getContext('2d');
	
	//copy the current canvas into the temp canvas
	tempCtx.drawImage(canvas, 0,0, spectrogramCanvasWidth, spectrogramCanvasHeight);
	
	var freqDomain = new Uint8Array(analyser.frequencyBinCount);
	analyser.getByteFrequencyData(freqDomain);
	
	// variables for primitive frequency analysis.
	var highestValue = -1;
	var highestValueIndex = -1;
	var highestValueLength = 1;
		
	// draw the spectrogram if the canvas is full draw on the right side and move the canvas left.
	if (spectrogramLeftPos == spectrogramCanvasWidth) {
		for (var i=0; i < analyser.frequencyBinCount; i++) {
			var value = freqDomain[i];
			
			//frequency analysis
			if (value > highestValue) {
				highestValue = value;
				highestValueIndex = i;
				highestValueLength = 1;
			}else {
				if (value == highestValue && (highestValueIndex + highestValueLength) == i) {
					highestValueLength++;
				}
			}
		    //HSL(hue, saturation, lightness)
			//var hue = (value / 256) * 360;
			//tempCtx.fillStyle = "hsl(" + hue + ", 100%, 50%)";
			
			tempCtx.fillStyle = myColor.getColor(value).hex();
			tempCtx.fillRect(spectrogramCanvasWidth-1, spectrogramCanvasHeight-i,1,1);			
		}
		context.translate(-1, 0);
		context.drawImage(tempCanvas,0,0,spectrogramCanvasWidth, spectrogramCanvasHeight);
		context.setTransform(1,0,0,1,0,0);
		
	}else { // the canvas is not full so draw left to right
		for (i=0; i < analyser.frequencyBinCount; i++) {
			value = freqDomain[i];
			
			//frequency analysis
			if (value > highestValue) {
				highestValue = value;
				highestValueIndex = i;
				highestValueLength = 1;
			}else {
				if (value == highestValue && (highestValueIndex + highestValueLength) == i) {
					highestValueLength++;
				}
			}

			//hue = (value / 256) * 360;
			//tempCtx.fillStyle = "hsl(" + hue + ", 100%, 50%)";
			
			tempCtx.fillStyle = myColor.getColor(value).hex();
			tempCtx.fillRect(spectrogramLeftPos, (spectrogramCanvasHeight-i),1,1);	
		}
		context.drawImage(tempCanvas, 0, 0, spectrogramCanvasWidth, spectrogramCanvasHeight);
		spectrogramLeftPos++;
	}
	//Output some info.
	var highestVal_indexStart = highestValueIndex;
	var highestVal_indexEnd = highestValueIndex + (highestValueLength - 1);
	var tempIndex = Math.round((highestVal_indexStart+highestVal_indexEnd)/2);
	var tmpFreq = getValueToFrequency(tempIndex);
	var tmpIndex = getFrequencyToIndex(tmpFreq);
	
	document.getElementById('debugInfo').innerHTML =
        '<h3>Testing</h3>' +	
		'Frequency Domain Length: ' + freqDomain.length +
		'<br><br> Highest Value: ' + highestValue +
		'<br><br> Highest Value Index: ' + highestValueIndex +
		'<br><br> Highest Value Length: ' + highestValueLength +
		'<br><br> Highest Value Length as Index: ' + highestValueIndex + (highestValueLength - 1) +
		'<br><br> Temp Index: ' + tempIndex +
		'<br><br> Get Value To Frequency: ' + tmpFreq +
		'<br><br> Get Frequency To Index: ' + tmpIndex + '<br>';
}

// get Nyquist frequency, 1/2 of the sampling rate.
	var nyquistFrequency = audioContext.sampleRate/2;
	
function getValueToFrequency(tmpValue) {
	//map the index/bucket to a frequency
	var freq = tmpValue * nyquistFrequency / analyser.frequencyBinCount;
	
	return freq;
}

function getFrequencyToIndex(freq) {
	//map the frequency to the correct bucket.
	var index = Math.round(freq / nyquistFrequency * analyser.frequencyBinCount);
	
	return index;
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
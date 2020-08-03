let backgroundColor = 127;
let textColor = 0;
let defaultTextSize = 18;

// gui elements
let radioDuration;
let radioNotes;
let radioOctave;
let textArea;


let notesList = [];

var frequencies = {
	"-": 0,
	c: 261.6,
	cis: 277.2,
	d: 293.7,
	dis: 311.1,
	e: 329.6,
	f: 349.2,
	fis: 370.0,
	g: 392.0,
	gis: 415.3,
	a: 440.0,
	ais: 466.2,
	b: 493.9
	//523.3
};

// melodies variables
let melodiesDict = {};
let melodies = {};
let melodiesSelect;

// sound objects
let player;
let tune;

// a link to show homepage
let qaotechLink;

function preload() {
	melodies = loadJSON("melodies.json");
}

function setup() {
	// create the canvas
	let canvas = createCanvas(windowWidth, windowHeight);

	// setting font
	textFont('VT323', 40);
	createElements();
	player = new Player();
	tune = new Tune();
}

function draw() {
	// set background color
	background(backgroundColor);

	showTextLabels();
}

function showTextLabels() {
	// duration text
	textSize(defaultTextSize);
	noStroke();
	fill(textColor);
	text("Duration", width/2, 50);

	// notes text
	textSize(defaultTextSize);
	noStroke();
	fill(textColor);
	text("Note", width/2, 115);

	// octave text
	textSize(defaultTextSize);
	noStroke();
	fill(textColor);
	text("Octave", width/2, 215);
}

function createElements() {
	textArea = createElement("textarea");
	textArea.position(10, 40);

	let textAreaWidth = width /2 - 50;
	let textAreaHeight = height /2 - 50;
	textArea.style("width", textAreaWidth + "px");
	textArea.style("height", textAreaHeight + "px");

	// duration
	radioDuration = createRadio();
	radioDuration.option(1);
	radioDuration.option(2);
	radioDuration.option(4);
	radioDuration.option(8);
	radioDuration.option(16);
	radioDuration.position(width/2, 60);
	radioDuration.size(width/2);

	// notes
	radioNotes = createRadio();
	radioNotes.option("c");
	radioNotes.option("#c");
	radioNotes.option("d");
	radioNotes.option("#d");
	radioNotes.option("e");
	radioNotes.option("f");
	radioNotes.option("#f");
	radioNotes.option("g");
	radioNotes.option("#g");
	radioNotes.option("a");
	radioNotes.option("#a");
	radioNotes.option("b");
	radioNotes.option("-");
	radioNotes.position(width/2, 125);
	radioNotes.size(width/2 - 20);

	//octave
	radioOctave = createRadio();
	radioOctave.option(1);
	radioOctave.option(2);
	radioOctave.option(3);
	radioOctave.option(4);
	radioOctave.position(width/2, 225);
	radioOctave.size(width/2);

	// add to list button
	addButton = createButton("ADD");
	addButton.position(100, height-50);
	addButton.mousePressed(addToList);

	// play button
	playButton = createButton("PLAY");
	playButton.position(10, height-50);
	playButton.mousePressed(playSound);

	// melodies list
	melodiesSelect = createSelect();
	melodiesSelect.position(10, 10);


	console.log("Read melodies from json");
	let melodiesData = melodies['melodies'];

	melodiesSelect.option("Melodies");
	for(let i=0; i<melodiesData.length; i++){
		let melodyName = melodiesData[i]['name'];
		let melodyNotes = melodiesData[i]['notes'];
		melodiesSelect.option(melodyName);
		melodiesDict[melodyName] = melodyNotes;
	}
	melodiesSelect.changed(melodyChanged);

	qaotechLink = createA('https://qaotech.com/', 'Composer by Qaotech');
	qaotechLink.position(width - 150, height - 50);
}

function melodyChanged() {
	let selected = melodiesSelect.value();
	if(selected != "Melodies") {
		let notes = melodiesDict[selected];
		textArea.value(notes);
	}
}

function playSound() {

	var code = textArea.value();

	tune.load(code);
	player.play(tune);

}

function addToList() {
	let durationValue = radioDuration.value();
	let noteValue = radioNotes.value();
	let octaveValue = radioOctave.value();


	let e = new Entry(durationValue, noteValue, octaveValue);
	notesList.push(e);

	let textAreaValue = textArea.value();
	if(notesList.length > 0) {
		textAreaValue += " " + e.getText();
	} else {
		textAreaValue += e.getText();
	}
	textArea.value(textAreaValue);

}

class Entry{
	constructor(d, n, o) {
		this.duration = d;
		this.note = n;
		this.octave = o;
	}

	getText() {
		return this.duration + this.note + this.octave;
	}

};

class Note {
	constructor(newNote) {
		this.parts = newNote.match(/^(\d{1,2})(#?)([a-g\-])(\d)?$/);
		this.length = parseInt(this.parts[1], 10);
		this.accidental = this.parts[2] !== "";
		this.note = this.parts[3] + (this.accidental ? "is": "");
		this.octave = parseInt(this.parts[4], 10);

		this.frequency = frequencies[this.note] * Math.pow(2, this.octave - 1);
		this.length = Math.floor(1800 / this.length);
	}

	getFrequency() {
		return this.frequency;
	}

	getLength() {
		return this.length;
	}
};

class Tune {
	constructor() {
		this.notes = [];
		this.index;
	}

	load(code) {
		code = code.trim();
		this.notes = [];

		let splittedNotes = code.split(" ");
		for (let i=0; i<splittedNotes.length; i++) {
			let tmpNote = splittedNotes[i];
			this.notes.push(new Note(tmpNote));
		}
		this.reset();
	}

	reset() {
		this.index = 0;
	}

	getNote() {
		return this.notes[this.index++];
	}

};


class Player {
	constructor() {
		this.tune;
		this.context = new AudioContext();
		this.oscillator;
	}

	play(newTune) {
		this.tune = newTune;
		this.tune.reset();
		this.playNote();
	}

	playNote() {
		console.log("PLAY NOTE");
		let note = this.tune.getNote();

		this.oscillator && this.oscillator.stop();

		this.oscillator = this.context.createOscillator();
		this.oscillator.type = 0;
		// this.oscillator.type = 'square';
		this.oscillator.connect(this.context.destination);
		this.oscillator.start();


		if(!note) {
			console.log("NOTE NOT DEFINED");
			this.oscillator.frequency.value = 0;
		} else {
			console.log("NOTE DEFINED");
			this.oscillator.frequency.value = note.getFrequency() || 0;
			// setTimeout(this.playNote, note.getLength());
			setTimeout(this.playNote.bind(this), note.getLength());
		}
	}

};
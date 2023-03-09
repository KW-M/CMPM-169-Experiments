// sketch.js - purpose and description here
// Author: Your Name
// Date:

// This line is used for auto completion in VSCode
/// <reference path="../../node_modules/@types/p5/global.d.ts" />

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const SHAPE_SIZE_TO_LOUDNESS_RATIO = 0.01;

// Globals
let ShapeTones = [];
let canvasContainer;
let shapeType = -1;

const getPureTone = (waveformType, frequency, volume) => {
    const s = new p5.Oscillator()
    s.setType(waveformType);
    s.freq(frequency)
    s.amp(volume);
    return s;
}


function drawPolygon(x, y, radius, npoints) {
    push();
    translate(x, y)
    rotate(random(0, 360))
    beginShape();
    const angle = TWO_PI / npoints;
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = cos(a) * radius;
        let sy = sin(a) * radius;
        vertex(sx, sy);
    }
    endShape(CLOSE);
    pop();
}

function drawParallelogram(x, y, size, shiftRatio) {
    push();
    translate(x, y)
    rotate(random(0, 360))
    beginShape();
    const shift = size * shiftRatio;
    let sx = -size / 2 - shift;
    let sy = -size / 2;
    vertex(sx, sy);
    sx = size / 2 - shift;
    sy = -size / 2;
    vertex(sx, sy);
    sx = size / 2 + shift;
    sy = size / 2;
    vertex(sx, sy);
    sx = -size / 2 + shift;
    sy = size / 2;
    vertex(sx, sy);
    endShape(CLOSE);
    pop();
}

class ShapeTone {
    // soundSource = "";
    // nextToneLinks = [];
    xPos = 0;
    yPos = 0;
    size = 10;
    rotation = 0;
    color = color(0, 0, 0);
    playing = false;
    sounds = [];

    constructor(x, y, size) {
        this.xPos = x;
        this.yPos = y;
        this.size = size;
    }

    draw() {
        // OVERWRIDE IMPLEMENTATION PER SHAPE/TONE TYPE
        console.warn("draw() not implemented in this MusicTone subclass");
        return this;
    }

    updateSound() {
        // OVERWRIDE IMPLEMENTATION PER SHAPE/TONE TYPE
        console.warn("updateSound() not implemented in this MusicTone subclass");
        return this;
    }


    play() {
        if (this.playing) this.stop();
        for (let i = 0; i < this.sounds.length; i++) {
            try {
                this.sounds[i].start();
            } catch (e) {
                this.sounds[i].loop();
            }
        }
        this.playing = true;
        return this;
    }

    stop() {
        if (this.playing) {
            for (let i = 0; i < this.sounds.length; i++) {
                const sound = this.sounds[i];
                sound.stop();
            }
            this.playing = false;
        }
        return this;
    }

    copy() {
        const copy = { ...this };
        return copy;
    }

    setRotation(angleRad) {
        angleRad = r
    }

    setPosition(x, y) {
        this.xPos = x;
        this.yPos = y;
        this.updateSound();
        return this;
    }

    setSize(size) {
        this.size = size;
        this.updateSound();
        return this;
    }

    // getDistanceTo(x, y) {
    //     x = x - this.xPos;
    //     y = y - this.yPos;
    //     return Math.sqrt(x * x + y * y) // Pythagorean theorem;
    // }

    // addLink(nextTone) {
    //     if (nextToneLinks.indexOf(nextTone) === -1) {
    //         nextToneLinks.push(nextTone);
    //     }
    //     return this;
    // }

    // removeLink(nextTone) {
    //     const i = nextToneLinks.indexOf(nextTone);
    //     if (i !== -1) {
    //         nextToneLinks.splice(i, 1);
    //     }
    //     return this;
    // }

    // playNext() {

    // }
}

class SquareTone extends ShapeTone {
    constructor(x, y, size) {
        super(x, y, size);
        this.color = color(random(255), random(255), random(255));
        this.sounds = [getPureTone('square', 1, 1), getPureTone('square', 1, 1)] // will get changed in update Sound...
        this.updateSound();
        this.play();
    }

    draw() {
        stroke(255);
        strokeWeight(2);
        fill(this.color);
        push();
        translate(this.xPos, this.yPos)
        rotate(random(0, 360))
        square(- this.size / 2, -this.size / 2, this.size);
        pop();
        return this;
    }

    updateSound() {
        const loudness = this.size * SHAPE_SIZE_TO_LOUDNESS_RATIO
        const xFreq = this.xPos / width * 500
        const yFreq = this.yPos / height * 500
        this.sounds[0].freq(xFreq)
        this.sounds[1].freq(yFreq)
        this.sounds[0].amp(loudness)
        this.sounds[1].amp(loudness)
        return this;
    }
}


class CircleTone extends ShapeTone {
    constructor(x, y, size) {
        super(x, y, size);
        this.color = color(random(255), random(255), random(255));
        this.sounds = [getPureTone('sin', 1, 1), getPureTone('sin', 1, 1)] // will get changed in update Sound...
        this.updateSound();
        this.play();
    }

    draw() {
        stroke(255);
        strokeWeight(2);
        fill(this.color);
        circle(this.xPos, this.yPos, this.size);
        return this;
    }

    updateSound() {
        const loudness = this.size * SHAPE_SIZE_TO_LOUDNESS_RATIO
        const xFreq = this.xPos / width * 500
        const yFreq = this.yPos / height * 500
        this.sounds[0].freq(xFreq)
        this.sounds[1].freq(yFreq)
        this.sounds[0].amp(loudness)
        this.sounds[1].amp(loudness)
        return this;
    }
}

class TriangleTone extends ShapeTone {
    constructor(x, y, size) {
        super(x, y, size);
        this.color = color(random(255), random(255), random(255));
        this.sounds = [getPureTone('triangle', 1, 1), getPureTone('triangle', 1, 1)] // will get changed in update Sound...
        this.updateSound();
        this.play();
    }

    draw() {
        stroke(255);
        strokeWeight(2);
        fill(this.color);
        drawPolygon(this.xPos, this.yPos, this.size, 3);
        return this;
    }

    updateSound() {
        const loudness = this.size * SHAPE_SIZE_TO_LOUDNESS_RATIO
        const xFreq = this.xPos / width * 500
        const yFreq = this.yPos / height * 500
        this.sounds[0].freq(xFreq)
        this.sounds[1].freq(yFreq)
        this.sounds[0].amp(loudness)
        this.sounds[1].amp(loudness)
        return this;
    }
}




class ParallelogramTone extends ShapeTone {
    constructor(x, y, size) {
        super(x, y, size);
        this.color = color(random(255), random(255), random(255));
        this.sounds = [getPureTone('sawtooth', 1, 1), getPureTone('sawtooth', 1, 1)] // will get changed in update Sound...
        this.updateSound();
        this.play();
    }

    draw() {
        stroke(255);
        strokeWeight(2);
        fill(this.color);
        drawParallelogram(this.xPos, this.yPos, this.size, 0.2)
        return this;
    }

    updateSound() {
        const loudness = this.size * SHAPE_SIZE_TO_LOUDNESS_RATIO
        const xFreq = this.xPos / width * 500
        const yFreq = this.yPos / height * 500
        this.sounds[0].freq(xFreq)
        this.sounds[1].freq(yFreq)
        this.sounds[0].amp(loudness)
        this.sounds[1].amp(loudness)
        return this;
    }
}


class PentagonTone extends ShapeTone {
    constructor(x, y, size) {
        super(x, y, size);
        let index = Math.round(random(soundClips.length))
        this.color = color((index % 27) / 27 * 255, index / 27 / 4 * 255, 255);
        this.sounds = [random(soundClips)] // will get changed in update Sound...
        this.updateSound();
        this.play();
    }

    draw() {
        stroke(255);
        strokeWeight(2);
        fill(this.color);
        drawPolygon(this.xPos, this.yPos, this.size, 5);
        return this;
    }

    updateSound() {
        const loudness = this.size * SHAPE_SIZE_TO_LOUDNESS_RATIO
        const xFreq = this.xPos / width * 500
        const yFreq = this.yPos / height * 500
        // this.sounds[0].freq(xFreq)
        this.sounds[0].setVolume(loudness)
        return this;
    }
}

soundFilePaths = ["./sounds/bond/beat1.wav", "./sounds/bond/beat2.wav", "./sounds/bond/beat3.wav", "./sounds/bond/chord1.mp3", "./sounds/bond/chord2.mp3", "./sounds/bond/chord3.mp3", "./sounds/bond/clav.mp3", "./sounds/bond/crash.mp3", "./sounds/bond/guitar1.wav", "./sounds/bond/guitar2.wav", "./sounds/bond/hit.mp3", "./sounds/bond/horns1.mp3", "./sounds/bond/horns2.mp3", "./sounds/bond/piano.wav", "./sounds/bond/scratch1.mp3", "./sounds/bond/scratch2.mp3", "./sounds/bond/shout1.mp3", "./sounds/bond/shout2.mp3", "./sounds/bond/shout3.mp3", "./sounds/bond/solo1.mp3", "./sounds/bond/solo2.mp3", "./sounds/bond/solo3.mp3", "./sounds/bond/solo4.mp3", "./sounds/bond/solo5.mp3", "./sounds/bond/vocal1.mp3", "./sounds/bond/vocal2.mp3", "./sounds/bond/vocal3.mp3"]
    .concat(["./sounds/basic1/beat1.wav", "./sounds/basic1/beat2.wav", "./sounds/basic1/beat3.wav", "./sounds/basic1/chord1.mp3", "./sounds/basic1/chord2.mp3", "./sounds/basic1/chord3.mp3", "./sounds/basic1/clav.mp3", "./sounds/basic1/crash.mp3", "./sounds/basic1/guitar1.wav", "./sounds/basic1/guitar2.wav", "./sounds/basic1/hit.mp3", "./sounds/basic1/horns1.mp3", "./sounds/basic1/horns2.mp3", "./sounds/basic1/piano.wav", "./sounds/basic1/scratch1.mp3", "./sounds/basic1/scratch2.mp3", "./sounds/basic1/shout1.mp3", "./sounds/basic1/shout2.mp3", "./sounds/basic1/shout3.mp3", "./sounds/basic1/solo1.mp3", "./sounds/basic1/solo2.mp3", "./sounds/basic1/solo3.mp3", "./sounds/basic1/solo4.mp3", "./sounds/basic1/solo5.mp3", "./sounds/basic1/vocal1.mp3", "./sounds/basic1/vocal2.mp3", "./sounds/basic1/vocal3.mp3"])
    .concat(["./sounds/basic2/beat1.wav", "./sounds/basic2/beat2.wav", "./sounds/basic2/beat3.wav", "./sounds/basic2/chord1.mp3", "./sounds/basic2/chord2.mp3", "./sounds/basic2/chord3.mp3", "./sounds/basic2/clav.mp3", "./sounds/basic2/crash.mp3", "./sounds/basic2/guitar1.wav", "./sounds/basic2/guitar2.wav", "./sounds/basic2/hit.mp3", "./sounds/basic2/horns1.mp3", "./sounds/basic2/horns2.mp3", "./sounds/basic2/piano.wav", "./sounds/basic2/scratch1.mp3", "./sounds/basic2/scratch2.mp3", "./sounds/basic2/shout1.mp3", "./sounds/basic2/shout2.mp3", "./sounds/basic2/shout3.mp3", "./sounds/basic2/solo1.mp3", "./sounds/basic2/solo2.mp3", "./sounds/basic2/solo3.mp3", "./sounds/basic2/solo4.mp3", "./sounds/basic2/solo5.mp3", "./sounds/basic2/vocal1.mp3", "./sounds/basic2/vocal2.mp3", "./sounds/basic2/vocal3.mp3"])
    .concat(["./sounds/basic3/beat1.wav", "./sounds/basic3/beat2.wav", "./sounds/basic3/beat3.wav", "./sounds/basic3/chord1.mp3", "./sounds/basic3/chord2.mp3", "./sounds/basic3/chord3.mp3", "./sounds/basic3/clav.mp3", "./sounds/basic3/crash.mp3", "./sounds/basic3/guitar1.wav", "./sounds/basic3/guitar2.wav", "./sounds/basic3/hit.mp3", "./sounds/basic3/horns1.mp3", "./sounds/basic3/horns2.mp3", "./sounds/basic3/piano.wav", "./sounds/basic3/scratch1.mp3", "./sounds/basic3/scratch2.mp3", "./sounds/basic3/shout1.mp3", "./sounds/basic3/shout2.mp3", "./sounds/basic3/shout3.mp3", "./sounds/basic3/solo1.mp3", "./sounds/basic3/solo2.mp3", "./sounds/basic3/solo3.mp3", "./sounds/basic3/solo4.mp3", "./sounds/basic3/solo5.mp3", "./sounds/basic3/vocal1.mp3", "./sounds/basic3/vocal2.mp3", "./sounds/basic3/vocal3.mp3"]);
soundClips = [];

function preload() {
    soundFilePaths.forEach((path) => {
        let clip = loadSound(path)
        soundClips.push(clip);
    })
}

// setup() function is called once when the program starts
function setup() {

    angleMode(RADIANS)
    // place our canvas, making it fit our container
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    canvas.parent("canvas-container");

    // resize canvas is the page is resized
    $(window).on("resize", function () {
        resizeCanvas(canvasContainer.width(), canvasContainer.height());
    });

    background(0);
    stroke(255);
    strokeWeight(2);
    noFill();

    var centerHorz = windowWidth / 2;
    var centerVert = windowHeight / 2;
}


let frameNum = 0;

function draw() {
    frameNum += 1;
    clear();
    background(0, 0, 0);
    ShapeTones = ShapeTones.filter((shape) => {
        if (shape.size <= 0) {
            shape.stop(); return false;
        } else {
            shape.draw();
            shape.setSize(shape.size - 0.2);
            return true;
        }
    })
}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
    // code to run when mouse is pressed
    let type;
    if (shapeType === 0) {
        type = CircleTone
    } else if (shapeType === 1) {
        type = TriangleTone
    } else if (shapeType === 2) {
        type = SquareTone
    } else if (shapeType === 3) {
        type = ParallelogramTone
    } else if (shapeType === 4) {
        type = PentagonTone
    } else {
        type = random([CircleTone, TriangleTone, SquareTone, ParallelogramTone, PentagonTone])
    }

    var shape = new type(mouseX, mouseY, 80);
    ShapeTones.push(shape);
}

function keyPressed(e) {
    // code to run when a key is pressed
    shapeType = key.charCodeAt(0) - '0'.charCodeAt(0);
    console.log("keyPressed", shapeType);
}

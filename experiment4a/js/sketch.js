
// sketch.js - purpose and description here
// Author: Your Name
// Date: https://rustwasm.github.io/docs/book/game-of-life/implementing.html


// CONSTS
let fftBins = 250;
var contrastConst = 9e-3; // contrast constant



// Globals
let CENTERX = 0;
let CENTERY = 0;
let canvasContainer;
let theShader;
let fingersVideo;
let cam;
let the_image;
let camReady = false;
let fft;
let wasmImage;
let forierMagImage, forierPhaseImage;



let mousePress = false;

async function preload() {
    the_image = loadImage("./assets/bigsur.png")
}


// setup() function is called once when the program starts
function setup() {
    canvasContainer = $("#canvas-container");

    // create a Fast forier transform:
    fft = new p5.FFT();

    // Create an Audio input
    let mic = new p5.AudioIn()

    // start the Audio Input.
    // By default, it does not .connect() (to the computer speakers)
    mic.start();
    mic.connect(fft);

    // place our canvas, making it fit our container
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height(), WEBGL);
    canvas.parent("canvas-container");

    // resize canvas is the page is resized
    const resizeFunc = () => {
        console.log("Resizing...");
        resizeCanvas(canvasContainer.width(), canvasContainer.height());
        CENTERX = width / 2;
        CENTERY = height / 2;
    }; $(window).on("resize", resizeFunc)
    resizeFunc();

}

let avg_spectrum = null
function draw() {
    let topLeftX = -width / 2;
    let topLeftY = -height / 2;
    let mouseXNorm = map(mouseX, 0, width, 0, 1);
    let mouseYNorm = map(mouseY, 0, height, 0, 1);
    let angle = frameCount * Math.PI / 800;

    let scanlineRadius = min(width, height) / 2;
    let scanlineX = sin(angle) * scanlineRadius;
    let scanlineY = cos(angle) * scanlineRadius;

    let scanlineNormalX = sin(angle + (Math.PI / 2)) * 1;
    let scanlineNormalY = cos(angle + (Math.PI / 2)) * 1;


    // get forier transform of sound
    let waveform = fft.waveform();
    let spectrum = fft.analyze();
    fftBins = spectrum.length
    if (avg_spectrum == null) {
        avg_spectrum = spectrum
    }


    // line(-scanlineX, -scanlineY, scanlineX, scanlineY)

    const segmentPct = 1 / fftBins;
    const startX = -scanlineX, startY = -scanlineY
    let x = startX, y = startY;
    const avgRatio = 0.005
    for (let i = 0; i < fftBins; i++) {
        avg_spectrum[i] = (avg_spectrum[i] * (1 - avgRatio) + spectrum[i] * avgRatio)
        const wiggleOffset = random(waveform[i] * 40);
        const newX = lerp(-scanlineX, scanlineX, i * segmentPct) + (scanlineNormalX - 0.5) * wiggleOffset
        const newY = lerp(-scanlineY, scanlineY, i * segmentPct) + (scanlineNormalY - 0.5) * wiggleOffset
        const centerGradient = 255 - abs(segmentPct * i - 0.5) * 255 * 2;
        stroke(centerGradient / 2, (spectrum[i] - avg_spectrum[i]) * 5, centerGradient)
        line(x, y, newX, newY)
        x = newX;
        y = newY;
    }

    // x = startX, y = startY;
    // for (let i = 0; i < waveform.length; i++) {
    //     const wiggleOffset = waveform[i] * 90;
    //     const newX = lerp(-scanlineX, scanlineX, i * segmentPct) + (scanlineNormalX - 0.5) * wiggleOffset
    //     const newY = lerp(-scanlineY, scanlineY, i * segmentPct) + (scanlineNormalY - 0.5) * wiggleOffset

    //     stroke(255, 50);
    //     line(x, y, newX, newY)
    //     x = newX;
    //     y = newY;
    // }

    // fade out gradually
    if (frameCount % 3 == 0) {
        blendMode(SUBTRACT); // Workaround from here: https://stackoverflow.com/questions/6817729/gradual-fading-by-drawing-a-transparent-rectangle-repeatedly
        fill(255, 1);
        rect(topLeftX, topLeftY, width, height);
        blendMode(BLEND);
    }

}


// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
    // code to run when mouse is pressed
    mousePress = true;
}

function mouseReleased() {
    // code to run when mouse is pressed
    mousePress = false;
}

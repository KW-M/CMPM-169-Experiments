
// sketch.js - purpose and description here
// Author: Kyle Worcester-Moore
// Date: Feb 2, 2023



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
let audioGraphic;
let forierMagImage, forierPhaseImage;



let mousePress = false;

async function preload() {
    the_image = loadImage("./assets/bigsur.png")
    await initWasm().then((wasm) => {
        window.wasm_memory = wasm.memory;
        console.log('wasm loaded');
        return true
    })
}

function getGrayscalePixels(targetImage) {
    pixelDensity(1);
    targetImage.loadPixels();
    let pixels = targetImage.pixels;
    let width = targetImage.width;
    let height = targetImage.height;
    let widthInArray = targetImage.width * 4 // RGBA
    let outpixels = new Uint8Array(width * height)
    let pixelGen = getPixelFactory(targetImage)

    for (let y = 0; y < height; y++) {  // rows
        for (let x = 0; x < width; x += 1) {  // pixels in row
            let colorIndex = y * widthInArray + x * 4;
            let greayscaleIndex = y * width + x;
            outpixels[greayscaleIndex] = pixelGen(x, y);
            // outpixels[greayscaleIndex] = (pixels[colorIndex] /* r */ + pixels[colorIndex + 1] /* g */ + pixels[colorIndex + 2] /* b */) / 3
        }
    }
    return outpixels
}

function writeGrayscaleImage(pixels, width, height) {
    const g = createGraphics(width, height)
    for (let y = 0; y < height; y += 1) {  // rows
        for (let x = 0; x < width; x += 1) {  // pixels in row
            let index = y * width + x;
            // if (index < width * 4) console.log(x, y, index)
            g.set(x, y, pixels[index])
        }
    }
    g.updatePixels()
    return g;
}

const getPixelFactory = (targetImage) => {
    pixelDensity(1);
    targetImage.loadPixels();
    let pixels = targetImage.pixels;
    return function (x, y) {
        const colorIndex = y * targetImage.width * 4 + x * 4;
        return (pixels[colorIndex] /* r */ + pixels[colorIndex + 1] /* g */ + pixels[colorIndex + 2] /* b */) / 3;
    }
}

function maxMagnitude(h_hats) {
    // get the largest magnitude (of an array of imagninary numbers)
    let maxMagnitude = 0;
    for (let ai = 0; ai < h_hats.length; ai++) {
        let mag = h_hats[ai].magnitude();
        if (mag > maxMagnitude) maxMagnitude = mag;
    }
    return maxMagnitude;
}

function forierMagToPixels(h_hats, width, height, maxMagnitude) {
    // convert hats to pixels
    const outPixels = new Uint8Array(width * height);
    const logOfMaxMag = Math.log(contrastConst * maxMagnitude + 1);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idxInGrid = (width * y + x);
            let brightness = Math.log(contrastConst * h_hats[idxInGrid].magnitude() + 1);
            brightness = Math.round(255 * (brightness / logOfMaxMag));
            outPixels[idxInGrid] = brightness;
        }
    }
    return outPixels
}

function forierPhaseToPixels(h_hats, width, height) {
    // convert hats to pixels
    const outPixels = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idxInGrid = (width * y + x);
            const im = h_hats[idxInGrid]
            const angle = Math.tan(im.imag, im.real);
            outPixels[idxInGrid] = Math.round(angle * 255 / (2 * PI));
        }
    }
    return outPixels
}

function applyPhaseRotationToHats(h_hats, rotations, width, height) {
    // convert hats to pixels
    const outPixels = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idxInGrid = (width * y + x);
            const im = h_hats[idxInGrid]
            const angle = Math.tan(im.imag, im.real);
            outPixels[idxInGrid] = Math.round(angle * 255 / (2 * PI));
        }
    }
    return outPixels
}

function applyMagOffsetToHats(h_hats, offsets) {
    for (let i = 0; i < h_hats.length; i++) {
        h_hats[i] = h_hats[i].times(offsets[i]);
    }
    return h_hats
}

function forier2d(targetImage) {
    // compute the h hat values for an imput image
    let h_hats = [];
    const pixels = getGrayscalePixels(targetImage);
    Fourier.transform(pixels, h_hats);
    h_hats = Fourier.shift(h_hats, [targetImage.width, targetImage.height]);
    return h_hats;
}

function forier2dInverse(h_hats, width, height) {
    // compute the h hat values for an imput image
    let h_primes = [];
    h_hats = Fourier.unshift(h_hats, [width, height]);
    Fourier.invert(h_hats, h_primes);
    return h_primes;
}

function computeForierImageTransform(targetImage, offsets) {
    let h_hats = forier2d(targetImage);
    h_hats = applyMagOffsetToHats(h_hats, offsets)
    let magPixels = forierMagToPixels(h_hats, targetImage.width, targetImage.height, maxMagnitude(h_hats));
    let phasePixels = forierPhaseToPixels(h_hats, targetImage.width, targetImage.height)
    let transformedPixels = forier2dInverse(h_hats, targetImage.width, targetImage.height)
    return { magPixels, phasePixels, transformedPixels };
}

// setup() function is called once when the program starts
function setup() {
    // wasm.greet();

    wasmImage = create2dfftImage(the_image.width, the_image.height, getGrayscalePixels(the_image));
    canvasContainer = $("#canvas-container");
    audioGraphic = createGraphics(the_image.width, the_image.height, WEBGL);
    // audioGraphic.translate(the_image.width / 2, the_image.height / 2);

    // video source
    // fingersVideo = createVideo(['assets/fingers.mov', 'assets/fingers.webm']);
    // fingersVideo.loop();

    // // camera source
    // cam = createCapture(VIDEO, () => { console.log(camReady); camReady = true });
    // cam.size(canvasContainer.width() / 2, canvasContainer.height() / 2);
    // cam.hide();

    // canvasContainer.html("<h2>Allow camera to see demo 📹</h2>")

    // let i_id = setInterval(() => {
    //     if (!camReady) return;
    //     clearInterval(i_id)
    //     $("#canvas-container>h2").remove();
    // }, 10)


    // create a Fast forier transform:
    fft = new p5.FFT();

    // Create an Audio input
    window.mic = new p5.AudioIn()

    // start the Audio Input.
    // By default, it does not .connect() (to the computer speakers)
    mic.start();
    mic.connect(fft);
    mic.connect


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
    const squareWidth = the_image.width;
    const squareHeight = the_image.height;
    let topLeftX = -width / 2;
    let topLeftY = -height / 2;
    let mouseXNorm = map(mouseX, 0, width, 0, 1);
    let mouseYNorm = map(mouseY, 0, height, 0, 1);
    let angle = frameCount * Math.PI / 800;

    let scanlineRadius = min(squareWidth, squareHeight) / 2;
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
    const startX = 0, startY = 0;// -scanlineX, startY = -scanlineY
    let x = startX, y = startY;
    const avgRatio = 0.05
    for (let i = 0; i < fftBins; i++) {
        avg_spectrum[i] = (avg_spectrum[i] * (1 - avgRatio) + spectrum[i] * avgRatio)
        const wiggleOffset = 0; // random(waveform[i] * 40);
        const newX = lerp(0, scanlineX, i * segmentPct) + (scanlineNormalX - 0.5) * wiggleOffset
        const newY = lerp(0, scanlineY, i * segmentPct) + (scanlineNormalY - 0.5) * wiggleOffset
        // const centerGradient = 255 - abs(segmentPct * i - 0.5) * 255 * 2;
        // audioGraphic.stroke(centerGradient / 2, (spectrum[i] - avg_spectrum[i]) * 5, centerGradient)
        audioGraphic.stroke((spectrum[i] - avg_spectrum[i]) * 5)
        audioGraphic.line(x, y, newX, newY)
        x = newX;
        y = newY;
    }


    audioGraphic.fill(0, 255);
    audioGraphic.circle(0, 0, 100);

    // fade out gradually
    if (frameCount % 1 == 0) {
        audioGraphic.blendMode(SUBTRACT); // Workaround from here: https://stackoverflow.com/questions/6817729/gradual-fading-by-drawing-a-transparent-rectangle-repeatedly
        audioGraphic.fill(255, 100);
        audioGraphic.rect(-squareWidth / 2, -squareHeight / 2, squareWidth, squareHeight);
        audioGraphic.blendMode(BLEND);
    }




    // let h_offsets = new Array(the_image.width * the_image.height + 1)
    // for (let i = 0; i < h_offsets.length; i++) {
    //     h_offsets[i] = sin((i * mouseYNorm) / (mouseXNorm + 300)) * 0.5 + 1;
    // }

    h_offsets = getGrayscalePixels(audioGraphic)

    wasmImage.fft()
    applyFFTAdjustmentWeights(wasmImage, h_offsets)
    const logMaxMagnitude = wasmImage.fft_pixels_mag();
    // console.log("Log of max FFT magnitude:", logMaxMagnitude)
    forierMagImage = writeGrayscaleImage(getPixels(wasmImage), the_image.width, the_image.height)
    wasmImage.ifft()
    forierPhaseImage = writeGrayscaleImage(getPixels(wasmImage), the_image.width, the_image.height)

    translate(-CENTERX, -CENTERY);
    image(forierMagImage, 0, 0, image.width, image.height)
    image(forierPhaseImage, forierMagImage.width, 0, image.width, image.height)


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

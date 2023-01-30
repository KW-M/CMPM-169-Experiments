// sketch.js - purpose and description here
// Author: Your Name
// Date:


// CONSTS
let fftBins = 250;


// Globals
let canvasContainer;
let theShader;
let fingersVideo;
let cam;
let camReady = false;
let fft;
let graphics



let mousePress = false;

function preload() {

}

function getGrayscalePixels(image) {
    pixelDensity(1);
    image.loadPixels();
    let pixels = image.pixels;
    let width = image.width;
    let height = image.height;
    let widthInArray = image.width * 4 // RGBA
    let outpixels = new ArrayBuffer(width * height)
    let counter = 0;
    for (let i = 0; i < pixels.length; i += widthInArray) {  // rows
        for (let j = i; j < i + widthInArray; j += 4) {  // pixels in row
            let index = i + j;
            ArrayBuffer[counter] = (pixels[index] /* r */ + pixels[index + 1] /* g */ + pixels[index + 2] /* b */) / 3
            counter++;
        }
    }
    return outpixels
}

function writeGrayscaleImage(pixels, width, height) {
    const g = createGraphics(width, height)
    for (let y = 0; y < pixels.length; y += width) {  // rows
        for (let x = y; x < y + width; x += 1) {  // pixels in row
            let index = y + x;
            g.set(x, y, pixels[index])
        }
    }
    g.updatePixels()
    return g;
}

const getPixelFactory = (image) => {
    pixelDensity(1);
    image.loadPixels();
    let pixels = image.pixels;
    return function (x, y) {
        if (arguments.length === 0) return h_es;

        const index = y * image.width * 4 + x * 4;
        return (pixels[index] /* r */ + pixels[index + 1] /* g */ + pixels[index + 2] /* b */) / 3;
    }
}

function forier2d(image) {
    let width = image.width;
    let height = image.height;
    let getPixel = getPixelFactory(image)

    // compute the h hat values
    let h_hats = [];

    Fourier.transform(getPixel, h_hats);
    h_hats = Fourier.shift(h_hats, [width, height]);
    // get the largest magnitude
    // var maxMagnitude = 0;
    // for (var ai = 0; ai < h_hats.length; ai++) {
    //     var mag = h_hats[ai].magnitude();
    //     if (mag > maxMagnitude) {
    //         maxMagnitude = mag;
    //     }
    // }

    return h_hats
}

// setup() function is called once when the program starts
function setup() {
    canvasContainer = $("#canvas-container");

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
    let mic = new p5.AudioIn()

    // start the Audio Input.
    // By default, it does not .connect() (to the computer speakers)
    mic.start();
    mic.connect(fft);

    let image = loadImage("./assets/bigsur.png")
    // let h_hats = forier2d(image);
    let h_hats = new Array(wi)
    graphics = writeGrayscaleImage(h_hats, image.width, image.height)



    // for (let i = 0; i < d; i++) {  // rows
    //     for (let j = 0; j < d; j++) {  // pixels in row
    //         // loop over
    //         let index = 4 * ((y * d + j) * width * d + (x * d + i));
    //         (pixels[index] /* r */ + pixels[index + 1] /* g */ + pixels[index + 2] /* b */) / 3
    //     }
    // }



    // place our canvas, making it fit our container
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height(), WEBGL);
    canvas.parent("canvas-container");

    // resize canvas is the page is resized
    $(window).on("resize", function () {
        console.log("Resizing...");
        resizeCanvas(canvasContainer.width(), canvasContainer.height());
    });


}

let avg_spectrum = null
function draw() {

    image(graphics, 0, 0, image.width, image.height)
    return;

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

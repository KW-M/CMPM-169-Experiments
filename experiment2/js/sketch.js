// sketch.js - purpose and description here
// Author: Kyle Worcester-Moore
// Date: Jan 23, 2023

/*
 * @name Video GPU Tests
 * @description Uniforms are the way in which information is passed from p5 to the shader.
 * <br> To learn more about using shaders in p5.js: <a href="https://itp-xstory.github.io/p5js-shaders/">p5.js Shaders</a>
 */

// Globals
let canvasContainer;
let theShader;
let fingersVideo;
let cam;
let camReady = false;

let mousePress = false;

function preload() {
    // load the shader
    theShader = loadShader('assets/shader.vert', 'assets/shader.frag');
}

// setup() function is called once when the program starts
function setup() {
    canvasContainer = $("#canvas-container");

    // video source
    // fingersVideo = createVideo(['assets/fingers.mov', 'assets/fingers.webm']);
    // fingersVideo.loop();

    // camera source
    cam = createCapture(VIDEO, () => { console.log(camReady); camReady = true });
    cam.size(canvasContainer.width() / 2, canvasContainer.height() / 2);
    cam.hide();

    canvasContainer.html("<h2>Allow camera to see demo 📹</h2>")

    let i_id = setInterval(() => {
        if (!camReady) return;
        clearInterval(i_id)
        $("#canvas-container>h2").remove();
    }, 10)

    // place our canvas, making it fit our container
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height(), WEBGL);
    canvas.parent("canvas-container");

    // resize canvas is the page is resized
    $(window).on("resize", function () {
        console.log("Resizing...");
        resizeCanvas(canvasContainer.width(), canvasContainer.height());
    });
}

let mousePressTransition = 0;
function draw() {
    // shader() sets the active shader with our shader
    shader(theShader);

    // rect gives us some geometry on the screen
    rect(0, 0, width, height);

    let mouseXNorm = map(mouseX, 0, width, 0, 1);
    let mouseYNorm = map(mouseY, 0, height, 0, 1)
    // lets send the resolution, mouse, and time to our shader
    // before sending mouse + time we modify the data so it's more easily usable by the shader
    theShader.setUniform('resolution', [width, height]);
    theShader.setUniform('mousex', mouseXNorm);
    theShader.setUniform('mousey', mouseYNorm);
    theShader.setUniform('mousedown', mousePressTransition);
    theShader.setUniform('time', frameCount * 0.01);
    theShader.setUniform('tex0', cam);

    mousePressTransition = constrain(mousePressTransition + (mousePress ? 0.08 : -0.01), 0, 1)
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

/*

// // sketch.js - purpose and description here
// Author: Your Name
// Date:

// Globals
let canvasContainer;
let theShader;
let fingersVideo;
let cam;
let shaderGraphics;
let canvas;

let mousePress = false;

function preload() {
    // load the shader
    theShader = loadShader('assets/shader.vert', 'assets/shader.frag');
}

// setup() function is called once when the program starts
function setup() {
    // place our canvas, making it fit our container
    canvasContainer = $("#canvas-container");
    canvas = createCanvas(canvasContainer.width(), canvasContainer.height(), WEBGL);
    canvas.parent("canvas-container");

    // shaders require WEBGL mode to work
    shaderGraphics = createGraphics(canvasContainer.width(), canvasContainer.height(), WEBGL);
    shaderGraphics.noStroke();


    // video source
    // fingersVideo = createVideo(['assets/fingers.mov', 'assets/fingers.webm']);
    // fingersVideo.loop();

    // camera source
    cam = createCapture(VIDEO);
    cam.size(canvasContainer.width() / 2, canvasContainer.height() / 2);
    cam.hide();

    // resize canvas is the page is resized
    $(window).on("resize", function () {
        console.log("Resizing...");
        resizeCanvas(canvasContainer.width(), canvasContainer.height());
        delete shaderGraphics
        shaderGraphics = createGraphics(canvasContainer.width(), canvasContainer.height(), WEBGL);
        shaderGraphics.noStroke();
    });



}


function draw() {
    // shader() sets the active shader with our shader
    shaderGraphics.shader(theShader);
    // rect gives us some geometry on the screen
    shaderGraphics.rect(0, 0, width, height);

    let mouseXNorm = map(mouseX, 0, width, 0, 1);
    let mouseYNorm = map(mouseY, 0, height, 0, 1)
    // lets send the resolution, mouse, and time to our shader
    // before sending mouse + time we modify the data so it's more easily usable by the shader
    theShader.setUniform('resolution', [width, height]);
    theShader.setUniform('mousex', mouseXNorm);
    theShader.setUniform('mousey', mouseYNorm);
    theShader.setUniform('mousedown', mousePress);
    theShader.setUniform('time', frameCount * 0.01);
    theShader.setUniform('tex0', cam);

    // rect gives us some geometry on the screen
    translate(-canvasContainer.width() / 2, -canvasContainer.height() / 2);
    image(shaderGraphics, 0, 0, width, height);

    stroke(255, 0, 0, 1)
    strokeWeight(5)
    fill(1, 1, 1, 1)
    circle(mouseX, mouseY, 30)
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
*/

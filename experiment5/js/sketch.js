// sketch.js - Webgl Vertex Shader Play
// Author: Kyle Worcester-Moore
// Date: Feb 10, 2023


// This line is used for auto completion in VSCode
/// <reference path="../../node_modules/@types/p5/global.d.ts" />

// global variables
let myShader, sphereHiRez, heightMap, colorTexture;

function preload() {
    // a shader is composed of two parts, a vertex shader, and a fragment shader
    // the vertex shader prepares the vertices and geometry to be drawn
    // the fragment shader renders the actual pixel colors
    // loadShader() is asynchronous so it needs to be in preload
    // loadShader() first takes the filename of a vertex shader, and then a frag shader
    // these file types are usually .vert and .frag, but you can actually use anything. .glsl is another common one
    myShader = loadShader("assets/shader.vert", "assets/shader.frag");
    sphereHiRez = loadModel("assets/IsoSphere_Detail7.obj");
    heightMap = loadImage("assets/heightMap.png");
    colorTexture = loadImage("assets/earthBluemarble.png");
}


// setup() function is called once when the program starts
function setup() {

    // place our canvas, making it fit our container
    canvasContainer = $("#canvas-container");

    // shaders require WEBGL mode to work
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height(), WEBGL);
    canvas.parent("canvas-container");

    // resize canvas is the page is resized
    const resizeFunc = () => {
        resizeCanvas(canvasContainer.width(), canvasContainer.height());
        CENTERX = width / 2;
        CENTERY = height / 2;
    }; $(window).on("resize", resizeFunc)
    resizeFunc();
    noStroke();
}


function draw() {
    background(0);

    // Map the fov to the mouse x-axis
    let fov = PI / 2; //map(mouseX, 0, width, 0, PI);
    let camZ = (height / 2.0) / tan((PI / 3) / 2.0);
    const nearPlane = camZ / 10;
    const farPlane = camZ * 10;
    const sphereRadius = min(width, height) / 2.0;

    // shader() sets the active shader with our shader
    shader(myShader);

    // Send the frameCount to the shader
    myShader.setUniform("uFrameCount", frameCount);

    // Send the frameCount to the shader
    myShader.setUniform("uNear", nearPlane);

    // Send the frameCount to the shader
    myShader.setUniform("uFar", farPlane);

    // Send the frameCount to the shader
    myShader.setUniform("height", height);

    // Send the frameCount to the shader
    myShader.setUniform("width", width);

    // Send the sphereRadius to the shader
    myShader.setUniform("sphereRadius", sphereRadius);

    // Send the camDistance to the shader
    myShader.setUniform("camDistance", camZ);

    // send the textures
    myShader.setUniform("uHeightTexture", heightMap);
    myShader.setUniform("uColorTexture", colorTexture);


    // Set the camera and perspective to the fov
    camera(0, 0, camZ, 0, 0, 0, 0, 1, 0);
    perspective(fov, float(width) / float(height),
        nearPlane, farPlane);

    // Rotate our geometry on the X and Y axes
    // rotateX(frameCount * 0.01);
    // rotateY(frameCount * 0.005);

    rotateX((-mouseY / height + 0.5) * PI);
    rotateY(mouseX / width * PI * 2);

    // Draw some geometry to the screen
    scale(sphereRadius);
    model(sphereHiRez)

}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const VALUE1 = 1;
const VALUE2 = 2;

// Globals
let myInstance;
let canvasContainer;

class MyClass {
    constructor(param1, param2) {
        this.property1 = param1;
        this.property2 = param2;
    }

    myMethod() {
        // code to run when method is called
    }
}

// setup() function is called once when the program starts
function setup() {
    // place our canvas, making it fit our container
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    canvas.parent("canvas-container");
    // resize canvas is the page is resized
    $(window).on("resize", function () {
        console.log("Resizing...");
        resizeCanvas(canvasContainer.width(), canvasContainer.height());
    });
    // create an instance of the class
    myInstance = new MyClass(VALUE1, VALUE2);

    background(0);
    stroke(255);
    strokeWeight(2);
    noFill();

    var centerHorz = windowWidth / 2;
    var centerVert = windowHeight / 2;
}
/*
This script is using the Sierpinski triangle algorithm to generate a fractal pattern. The script first sets up some variables, such as the number of iterations (n) and the initial points of the triangle. It then uses a recursive function called "sierpinski" to divide the triangle into smaller triangles until the desired number of iterations is reached. Finally, it adds random noise to the points and draws lines between them to create the final fractal pattern.
*/

let points = [];
let n = 4;
let size;
let frameNum = 0;

function draw() {
    frameNum += 3;
    clear();
    background(0);
    points = points.slice(0, 100);
    points[0] = createVector(width / 2, 50);
    points[1] = createVector(50, height - 50);
    points[2] = createVector(width - 50, height - 50);
    size = createVector(width, height).mag();
    sierpinski(points[0], points[1], points[2], n);
    background(0);
    for (let i = 0; i < points.length; i++) {
        points[i].x += random(-1, 1);
        points[i].y += random(-1, 1);
    }
    push();
    for (let i = 0; i < points.length - 1; i++) {
        line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
        push();
        translate(width / 2, height / 2)
        rotate(max((i + frameNum * 0.0001) * (cos(frameNum * 0.001) + 0.99) * 0.001, 0));
        translate(-width / 2, -height / 2)
        stroke(random(0, i % 256), random(0, -i % 256 + 256), random(0, 256));
    }
    pop();
    line(points[points.length - 1].x, points[points.length - 1].y, points[0].x, points[0].y);

}


function sierpinski(a, b, c, n) {
    if (n > 0) {
        let ab = p5.Vector.lerp(a, b, 0.5);
        let ac = p5.Vector.lerp(a, c, 0.5);
        let bc = p5.Vector.lerp(b, c, 0.5);
        sierpinski(a, ab, ac, n - 1);
        sierpinski(ab, b, bc, n - 1);
        sierpinski(ac, bc, c, n - 1);
    } else {
        points.push(a, b, c);
    }
}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
    // code to run when mouse is pressed
    stroke(255);
    noFill();
    beginShape();
    for (let x = 0; x <= width; x += 10) {
        let y = noise(x * 0.01, 0.01) * height;
        vertex(x, y);
    }
    endShape();
}

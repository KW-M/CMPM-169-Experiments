// sketch.js - purpose and description here
// Author: Your Name
// Date:


// Inspired by: https://openprocessing.org/sketch/1769288
// Inspired by: https://openprocessing.org/sketch/1752310

// CONSTS
let START_REGION = { top: 0, bottom: 0, left: 0, right: 0 }
let START_REGION_SIZE = 100;
let PARTICLE_COUNT = 2000;
let PARTICLE_COLORS = [];
let PARTICLE_SPEED = 10;
let RANDOM_JITTER = 0.0;
let NOISESCALE = 0.01;
let NOISEOFFSET = 3992;

let CENTERX = 0;
let CENTERY = 0;

let GRID_CELL_SIZE = 20;
let gridZones;

// Globals
let canvasContainer;
let particles = [];

function getNoise(x, y) {
    return noise(x * NOISESCALE + NOISEOFFSET, y * NOISESCALE - NOISEOFFSET)
}


class gridZone {
    gridCells = [];
    width = 0;
    height = 0;
    constructor(width, height) {
        this.width = width
        this.height = height
        this.gridCells = Array(Math.ceil(width / GRID_CELL_SIZE * height / GRID_CELL_SIZE));
    }

    getIndex(x, y) {
        y = Math.ceil(y);
        x = Math.ceil(x);
        if (x < 0 || x > this.width || y < 0 || y > this.height) console.warn("Invalid grid index x,y : ", x, y, this.width, this.height);
        return Math.floor(y / GRID_CELL_SIZE) * Math.ceil(this.width / GRID_CELL_SIZE) + Math.floor(x / GRID_CELL_SIZE);
    }

    getValues(x, y) {
        return this.gridCells[this.getIndex(x, y)] || [];
    }

    add(index, value) {
        const cell = this.gridCells[index] || [];
        cell.push(value);
        this.gridCells[index] = cell;
        return index;
    }

    remove(index, value) {
        const cell = this.gridCells[index];
        if (cell === undefined || cell.length === 0) return index;
        const valueIndex = cell.indexOf(value);
        if (valueIndex != -1) { this.gridCells[index].splice(valueIndex, 1); }
        return index;
    }

    move(index, x, y, value) {
        const newIndex = this.getIndex(x, y)
        if (newIndex === index) return index;
        this.remove(index, value)
        this.add(newIndex, value)
        return newIndex;
    }

    getAllCells() {
        return this.gridCells
    }
}

class particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.aliveTime = 0;
        this.bounds = { top: y, bottom: y, left: x, right: x }
        this.gridZoneIndex = -5;
    }

    reset() {
        this.x = random(START_REGION.left, START_REGION.right);
        this.y = random(START_REGION.top, START_REGION.bottom);
        this.aliveTime = 0;
        this.bounds = { top: this.y, bottom: this.y, left: this.x, right: this.x }
    }

    updateBounds() {
        if (this.x < this.bounds.left) {
            this.bounds.left = this.x;
        } else if (this.x > this.bounds.right) {
            this.bounds.right = this.x;
        }
        if (this.y < this.bounds.top) {
            this.bounds.top = this.y;
        } else if (this.y > this.bounds.bottom) {
            this.bounds.bottom = this.y;
        }
    }

    getBoundsArea() {
        return (this.bounds.right - this.bounds.left) * (this.bounds.bottom - this.bounds.top);
    }

    update(timestep) {
        this.aliveTime += timestep;
        let noiseHere = getNoise(this.x, this.y);
        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height || noiseHere < 0.01 || noiseHere > 0.99) this.reset();
        let mouseYNorm = mouseY / height;
        let noiseGradientX = noiseHere - getNoise(this.x + 1, this.y);
        let noiseGradientY = noiseHere - getNoise(this.x, this.y + 1);
        let gradientVector = createVector(noiseGradientX, noiseGradientY).rotate((90 + (mouseYNorm - 0.5) * 20 - (noiseHere - 0.5) * 10) * Math.PI / 180) //(90 + (noiseHere - 0.5) * 100)
        const JITTER = RANDOM_JITTER * this.aliveTime / (this.getBoundsArea() + 1);
        let velocityX = gradientVector.x * PARTICLE_SPEED + random(JITTER, -JITTER);
        let velocityY = gradientVector.y * PARTICLE_SPEED + random(JITTER, -JITTER);
        this.x += velocityX * timestep;
        this.y += velocityY * timestep;
        this.updateBounds();
        this.gridZoneIndex = gridZones.move(this.gridZoneIndex, this.x, this.y, this)
        return noiseHere;

    }
}

function preload() {

}

// setup() function is called once when the program starts
function setup() {

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
        START_REGION = { top: CENTERY - START_REGION_SIZE, bottom: CENTERY + START_REGION_SIZE, left: CENTERX - START_REGION_SIZE, right: CENTERX + START_REGION_SIZE }
    }; $(window).on("resize", resizeFunc)
    resizeFunc();

    // START_REGION = { top: -height / 2, bottom: height / 2, left: -width / 2, right: width / 2 };
    PARTICLE_COLORS = [color(200, 10, 90), color(90, 80, 80), color(0, 100, 80), color(0, 110, 200)];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new particle())
        particles[i].reset();
    }

    gridZones = new gridZone(width, height);

}


function draw() {

    translate(-CENTERX, -CENTERY);

    for (let x = 0; x < Math.ceil(width / GRID_CELL_SIZE); x++) {
        for (let y = 0; y < Math.ceil(height / GRID_CELL_SIZE); y++) {
            const zone = gridZones.getValues(x * GRID_CELL_SIZE + 1, y * GRID_CELL_SIZE + 1)
            if (zone.length != 0) {
                fill(255, zone.length)
            } else {
                fill(0, 0)
            }
            rect(x * GRID_CELL_SIZE, y * GRID_CELL_SIZE, GRID_CELL_SIZE, GRID_CELL_SIZE)
        }
    }

    stroke(255, 255)
    rect(START_REGION.left, START_REGION.top, START_REGION.right - START_REGION.left, START_REGION.bottom - START_REGION.top)

    stroke(0, 0)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        fill(PARTICLE_COLORS[i % PARTICLE_COLORS.length])
        // fill(255, 255, 255, 255)
        particles[i].update(deltaTime)
        circle(particles[i].x, particles[i].y, 5)
    }

    // fade out gradually
    if (frameCount % 2 === 0) {
        console.log("CENTERX", CENTERX)
        blendMode(SUBTRACT); // Workaround from here: https://stackoverflow.com/questions/6817729/gradual-fading-by-drawing-a-transparent-rectangle-repeatedly
        fill(255, 3);
        rect(0, 0, width, height);
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

// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Globals
let canvasContainer;
const grammar = tracery.createGrammar(window.g);
const instructionsAreaElem = document.getElementById("assembly-instruction-area")
const instructionsTitleElem = document.getElementById("assembly-title")
let currentTraceryText = "";
let possibleQuestions = ["What is this?", "How does it work?", "How do I use it?", "What are the common uses of this equipment?", "Explain the physics behind this."]
let currentAvailableQuestions = possibleQuestions;


// "setPronouns": ["[heroThey:they][heroThem:them][heroTheir:their][heroTheirs:theirs]", "[heroThey:she][heroThem:her][heroTheir:her][heroTheirs:hers]", "[heroThey:he][heroThem:him][heroTheir:his][heroTheirs:his]"],
// "setOccupation": ["[occupation:baker][didStuff:baked bread,decorated cupcakes,folded dough,made croissants,iced a cake]", "[occupation:warrior][didStuff:fought #monster.a#,saved a village from #monster.a#,battled #monster.a#,defeated #monster.a#]"],
// "origin": ["#[#setPronouns#][#setOccupation#][hero:#name#]story#"]


/*  ----- prompt ------ */
// Assembly instrucitons:
// ...

// Explanation of what a [main product] does when in use:

const capitalize = (str) => {
    return str.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function getTraceryText() {
    grammar.addModifiers(baseEngModifiers);
    grammar.clearState();
    const root = grammar.expand("#origin#");
    console.log("root: ", root);
    return root.finishedText;

}

function addButton(name, clickCallback) {
    const btn = document.createElement("button");
    btn.classList.add("choice-button")
    btn.onclick = clickCallback;
    btn.innerHTML = name;
    instructionsAreaElem.appendChild(btn);
    return btn;
}

function addResponseBox() {
    const p = document.createElement("p");
    instructionsAreaElem.appendChild(p);
    return p;
}

function listQuestionButtons(title) {
    currentAvailableQuestions.forEach((bText, i) => {
        addButton(bText, () => {
            currentAvailableQuestions.splice(i, 1);
            const p = addResponseBox()
            handleAiCompletionRequest(p, title + "\n" + currentTraceryText + "\n" + bText, title)
        })
    })
}

function scrollInstructionsArea() {
    instructionsAreaElem.scrollBy({
        behavior: "smooth",
        left: 0,
        top: 999999,
    })
}


const loadingPartA = ["Loading ", "Checking ", "Thinking about ", "Reasoning about ", "Plotting ", "Spinning ", "Playing with ", "Carving ", "Melting "]
const loadingPartB = ["tables", "theories", "tools", "ideas", "concepts", "plans", "cube"]

function handleAiCompletionRequest(p, prompt, title) {
    scrollInstructionsArea()
    p.innerHTML = "Understanding request...";
    let i = setInterval(() => p.innerHTML = random(loadingPartA) + random(loadingPartB) + "...", 1000);
    getAiText(prompt).then((response) => {
        clearInterval(i);
        p.innerHTML = response;
        console.info("prompt: ", prompt, "response: ", response)
        listQuestionButtons(title);
        scrollInstructionsArea();
    })
}

function regenTraceryText() {
    currentTraceryText = getTraceryText();
    const thingName = currentTraceryText.substring(12, currentTraceryText.indexOf(",", 13))
    const title = capitalize(thingName + " assembly instructions:");
    instructionsTitleElem.innerHTML = title;
    instructionsAreaElem.innerHTML = `<p>${currentTraceryText}</p>`;
    currentAvailableQuestions = new Array(...possibleQuestions);
    listQuestionButtons(title);
}


// setup() function is called once when the program starts
function setup() {
    // place our canvas, making it fit our container
    // canvasContainer = $("#canvas-container");
    // let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    // canvas.parent("canvas-container");
    // // resize canvas is the page is resized
    // $(window).on("resize", function () {
    //     console.log("Resizing...");
    //     resizeCanvas(canvasContainer.width(), canvasContainer.height());
    // });

    // var centerHorz = windowWidth / 2;
    // var centerVert = windowHeight / 2;
    regenTraceryText()
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
    background(220);

    // Put drawings here
    var centerHorz = canvasContainer.width() / 2 - 125;
    var centerVert = canvasContainer.height() / 2 - 125;
    fill(234, 31, 81);
    noStroke();
    rect(centerHorz, centerVert, 250, 250);
    fill(255);
    textStyle(BOLD);
    textSize(140);
    text("p5*", centerHorz + 10, centerVert + 200);
}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
    // code to run when mouse is pressed
}

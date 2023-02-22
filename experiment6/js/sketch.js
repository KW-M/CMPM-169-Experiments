// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Globals
let canvasContainer;
const grammar = tracery.createGrammar(window.g);
const instructionsAreaElem = document.getElementById("assembly-instruction-area")
const instructionsTitleElem = document.getElementById("assembly-title")
const instructionsContainerElem = document.getElementById("canvas-container")
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
    let buttons = [];
    currentAvailableQuestions.forEach((bText, i) => {
        const b = addButton(bText, () => {
            currentAvailableQuestions.splice(i, 1);
            const p = addResponseBox()
            handleAiCompletionRequest(p, title + "\n" + currentTraceryText + "\n" + bText, title)
            buttons.forEach((button) => {
                button.setAttribute("disabled", "true");
            })
            b.classList.add("selected-btn");
            b.setAttribute("disabled", "false");

            console.log(buttons, b)
        })
        buttons.push(b)
    })
}

function scrollInstructionsArea() {
    instructionsContainerElem.scrollTo({
        behavior: "smooth",
        left: 0,
        top: instructionsContainerElem.scrollHeight,
    })
}


const loadingPartA = ["Loading ", "Checking ", "Thinking about ", "Reasoning about ", "Plotting ", "Spinning ", "Playing with ", "Carving ", "Melting "]
const loadingPartB = ["tables", "theories", "tools", "ideas", "concepts", "plans", "cube"]

function handleAiCompletionRequest(p, prompt, title) {
    setTimeout(scrollInstructionsArea, 1);
    p.innerHTML = "Understanding request...";
    let i = setInterval(() => p.innerHTML = random(loadingPartA) + random(loadingPartB) + "...", 1000);
    getAiText(prompt).then((response) => {
        clearInterval(i);
        p.innerHTML = response;
        console.info("prompt: ", prompt, "response: ", response)
        listQuestionButtons(title);
        setTimeout(scrollInstructionsArea, 1);
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
    regenTraceryText()
}

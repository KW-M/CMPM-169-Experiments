import co from "./cohere.js"
import g from "./grammar.js"

co.init('BBf3aGEh58aFte5bwyLtu6PJa36ZKO0cFCbtmO3i')
window.g = g;
window.getAiText = (prompt) => {
    return co.generate({
        // model: "",
        prompt: prompt,
        max_tokens: 200,
        temperature: 0.95,
        k: 0,
        p: 0.75,
        frequency_penalty: 0.1,
        presence_penalty: 0,
        stop_sequences: [],
        return_likelihoods: 'NONE'
    }).then((response) => {
        console.log("co:here response: ", response);
        if (response.statusCode === 200) {
            return response.body.generations[0].text;
        } else {
            return JSON.stringify(response.body).slice(1, -1).trim().replace("\"", "").replace(":", ": ");
        }
    })
}

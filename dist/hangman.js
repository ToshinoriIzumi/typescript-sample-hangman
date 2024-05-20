"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const figlet_1 = __importDefault(require("figlet"));
const promises_1 = __importDefault(require("readline/promises"));
const rl = promises_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
class Quiz {
    questions;
    constructor(questions) {
        this.questions = questions;
    }
    hasNext() {
        return this.questions.length > 0;
    }
    getNext() {
        const idx = Math.floor(Math.random() * this.questions.length);
        const [question] = this.questions.splice(idx, 1);
        return question;
    }
    lefts() {
        return this.questions.length;
    }
}
const CLI = {
    async input() {
        const input = await rl.question("文字または単語を入力してください: ");
        return input.replaceAll(" ", "").toLowerCase();
    },
    clear() {
        console.clear();
    },
    destroy() {
        rl.close();
    },
    output(message, color = "white") {
        console.log(chalk_1.default[color](message), "\n");
    },
    outputAnswer(message) {
        console.log(figlet_1.default.textSync(message, { font: "Big" }), "\n");
    }
};
async function testQuestion() {
    CLI.clear();
    const userInput = await CLI.input();
    CLI.output(userInput, "red");
    CLI.outputAnswer(userInput);
    CLI.destroy();
}
testQuestion();
// const questions: Question[] = rawData;
// const quiz = new Quiz(questions);
// console.log("Game Start!!!");

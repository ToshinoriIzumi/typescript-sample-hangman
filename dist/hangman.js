"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const figlet_1 = __importDefault(require("figlet"));
const questions_test_json_1 = __importDefault(require("./data/questions.test.json"));
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
class Stage {
    answer;
    leftAttempts = 5;
    question;
    constructor(question) {
        this.question = question;
        this.answer = new Array(question.word.length).fill("_").join("");
    }
    updateAnswer(userInput = "") {
        if (!userInput)
            return;
        const regex = new RegExp(userInput, "g");
        const answerArry = this.answer.split("");
        let matches;
        while (matches = regex.exec(this.question.word)) {
            const idx = matches.index;
            answerArry.splice(idx, userInput.length, ...userInput);
            this.answer = answerArry.join("");
        }
    }
    isToolLong(userInput) {
        return userInput.length > this.question.word.length;
    }
    isIncludes(userInput) {
        return this.question.word.includes(userInput);
    }
    isCorrect() {
        return this.answer === this.question.word;
    }
    decrementAttempts() {
        return --this.leftAttempts;
    }
    isGameOver() {
        return this.leftAttempts === 0;
    }
}
class Message {
    ui;
    constructor(ui) {
        this.ui = ui;
    }
    askQuestion(stage) {
        this.ui.output(`Hint: ${stage.question.hint}`, "yellow");
        this.ui.outputAnswer(stage.answer.replaceAll("", " ").trim());
        this.ui.output(`(残り試行回数: ${stage.leftAttempts})`);
    }
    leftQuestions(quiz) {
        this.ui.output(`残り${quiz.lefts() + 1}問`);
    }
    start() {
        this.ui.output("\nGame Start!");
    }
    enterSomething() {
        this.ui.output("何か入力してください", "red");
    }
    notInculede(input) {
        this.ui.output(`"${input}は単語に含まれてません。`, "red");
    }
    notCorrect(input) {
        this.ui.output(`残念! "${input}"は正解ではありません。`, "red");
    }
    hit(input) {
        this.ui.output(`"${input}"がHit!`, "green");
    }
    correct(question) {
        this.ui.output(`正解! 単語は"${question.word}"でした。`, "green");
    }
    gameover(question) {
        this.ui.output(`残念! 正解は"${question.word}"でした。`, "red");
    }
    end() {
        this.ui.output("ゲーム終了です!お疲れ様でした!");
    }
}
class Game {
    quiz;
    message;
    stage;
    ui;
    constructor(quiz, message, ui) {
        this.quiz = quiz;
        this.message = message;
        this.ui = ui;
        this.stage = new Stage(this.quiz.getNext());
    }
    shouldEnd() {
        if (this.stage.isGameOver()) {
            return true;
        }
        if (!this.quiz.hasNext() && this.stage.isCorrect()) {
            return true;
        }
        return false;
    }
    next(isCorrect) {
        if (!isCorrect) {
            this.stage.decrementAttempts();
        }
        if (this.shouldEnd()) {
            return { stage: this.stage, done: true };
        }
        if (isCorrect) {
            this.stage = new Stage(this.quiz.getNext());
        }
        return { stage: this.stage, done: false };
    }
    async start() {
        this.ui.clear();
        this.message.start();
        let state = {
            stage: this.stage,
            done: false
        };
        while (!state.done) {
            if (state.stage === undefined)
                break;
            const { stage } = state;
            this.message.leftQuestions(this.quiz);
            this.message.askQuestion(stage);
            const userInput = await this.ui.input();
            if (!userInput) {
                this.message.enterSomething();
                state = this.next(false);
                continue;
            }
            stage.updateAnswer(userInput);
            if (stage.isCorrect()) {
                this.message.correct(stage.question);
                state = this.next(true);
                continue;
            }
            if (stage.isToolLong(userInput)) {
                this.message.notCorrect(userInput);
                state = this.next(false);
                continue;
            }
            if (stage.isIncludes(userInput)) {
                this.message.hit(userInput);
                continue;
            }
            this.message.notInculede(userInput);
            state = this.next(false);
        }
        if (state.stage.isGameOver()) {
            this.message.gameover(state.stage.question);
        }
        this.message.end();
        this.ui.destroy();
    }
}
const questions = questions_test_json_1.default;
const quiz = new Quiz(questions);
const message = new Message(CLI);
const game = new Game(quiz, message, CLI);
game.start();

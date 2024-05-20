import chalk from "chalk";
import figlet from "figlet";
import rawData from "./data/questions.test.json"
import readlinePromise from "readline/promises";

const rl = readlinePromise.createInterface({
    input: process.stdin,
    output: process.stdout
});

interface Question {
    word: string,
    hint: string
}

class Quiz {
    questions: Question[];
    constructor(questions: Question[]) {
        this.questions = questions;
    }

    hasNext(): boolean {
        return this.questions.length > 0;
    }

    getNext(): Question {
        const idx = Math.floor(Math.random() * this.questions.length);
        const [question] = this.questions.splice(idx, 1);
        return question;
    }

    lefts(): number {
        return this.questions.length;
    }
}

type Color = "red" | "green" | "yellow" | "white";

interface UserInterface {
    input(): Promise<string>;
    clear(): void;
    destroy(): void;
    output(message: string, color?: Color): void;
    outputAnswer(message: string): void;
}

const CLI: UserInterface = {
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
    output(message: string, color: Color = "white") {
        console.log(chalk[color](message), "\n");
    },
    outputAnswer(message: string) {
        console.log(figlet.textSync(message, { font: "Big" }), "\n");
    }
}

async function testQuestion() {
    CLI.clear();
    const userInput = await CLI.input();
    CLI.output(userInput, "red");
    CLI.outputAnswer(userInput);
    CLI.destroy();
}

testQuestion();
import { describe, it, expect } from "vitest";
import { Lexer } from "../src/lexer";
import { Parser } from "../src/parser";
import { Interpreter } from "../src/interpreter";

describe("OOP Features", () => {
    describe("Class and Trait", () => {
        it("should support class inheritance", () => {
            const input = `
                class Animal {
                    name = "Animal"
                    speak() { return "Generic sound" }
                }
                class Dog extends Animal {
                    name = "Dog"
                    speak() { return "Woof" }
                }
                let d = Dog()
                let sound = d.speak()
                let name = d.name
            `;
            const tokens = new Lexer(input).tokenize();
            const program = new Parser(tokens).parse();
            const interpreter = new Interpreter();
            interpreter.interpret(program);
            expect(interpreter.env.get("sound")).toBe("Woof");
            expect(interpreter.env.get("name")).toBe("Dog");
        });

        it("should support trait default methods", () => {
            const input = `
                trait Logger {
                    log(msg) { return "Log: " + msg }
                }
                class MyClass implements Logger {}
                let c = MyClass()
                let r = c.log("hello")
            `;
            const tokens = new Lexer(input).tokenize();
            const program = new Parser(tokens).parse();
            const interpreter = new Interpreter();
            interpreter.interpret(program);
            expect(interpreter.env.get("r")).toBe("Log: hello");
        });

        it("should support trait method overrides", () => {
            const input = `
                trait Logger {
                    log(msg) { return "Log: " + msg }
                }
                class MyClass implements Logger {
                    log(msg) { return "MyLog: " + msg }
                }
                let c = MyClass()
                let r = c.log("hello")
            `;
            const tokens = new Lexer(input).tokenize();
            const program = new Parser(tokens).parse();
            const interpreter = new Interpreter();
            interpreter.interpret(program);
            expect(interpreter.env.get("r")).toBe("MyLog: hello");
        });

        it("should support self reference", () => {
            const input = `
                class Counter {
                    count = 0
                    increment() {
                        self.count = self.count + 1
                        return self.count
                    }
                }
                let c = Counter()
                let r1 = c.increment()
                let r2 = c.increment()
            `;
            const tokens = new Lexer(input).tokenize();
            const program = new Parser(tokens).parse();
            const interpreter = new Interpreter();
            interpreter.interpret(program);
            expect(interpreter.env.get("r1")).toBe(1);
            expect(interpreter.env.get("r2")).toBe(2);
        });

        it("should support multiple traits", () => {
            const input = `
                trait Flyable {
                    fly() { return "flying" }
                }
                trait Swimable {
                    swim() { return "swimming" }
                }
                class Duck implements Flyable, Swimable {}
                let d = Duck()
                let r1 = d.fly()
                let r2 = d.swim()
            `;
            const tokens = new Lexer(input).tokenize();
            const program = new Parser(tokens).parse();
            const interpreter = new Interpreter();
            interpreter.interpret(program);
            expect(interpreter.env.get("r1")).toBe("flying");
            expect(interpreter.env.get("r2")).toBe("swimming");
        });
    });
});

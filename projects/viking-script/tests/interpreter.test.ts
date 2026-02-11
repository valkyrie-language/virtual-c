import { describe, it, expect } from "vitest";
import { Lexer } from "../src/lexer";
import { Parser } from "../src/parser";
import { Interpreter, Environment } from "../src/interpreter";

describe("Interpreter", () => {
  it("should evaluate simple expressions", () => {
    const source = "1 + 2 * 3";
    const lexer = new Lexer(source);
    const parser = new Parser(lexer.tokenize());
    const interpreter = new Interpreter();
    const result = interpreter.interpret(parser.parse());
    
    expect(result).toBe(7);
  });

  it("should handle variables", () => {
    const source = "let x = 10; let y = 20; x + y";
    const lexer = new Lexer(source);
    const parser = new Parser(lexer.tokenize());
    const interpreter = new Interpreter();
    const result = interpreter.interpret(parser.parse());
    
    expect(result).toBe(30);
  });

  it("should handle if statements", () => {
    const source = "let x = 10; if x > 5 { 100 } else { 200 }";
    const lexer = new Lexer(source);
    const parser = new Parser(lexer.tokenize());
    const interpreter = new Interpreter();
    const result = interpreter.interpret(parser.parse());
    
    expect(result).toBe(100);
  });

  it("should handle loop in iteration", () => {
    // Note: Our current interpreter is very simple, we need to test basic iteration
    // We don't have a way to easily aggregate results in this simple language yet
    // but we can check if it executes without error.
    const source = "loop i in [1, 2, 3] { let x = i }";
    const lexer = new Lexer(source);
    const parser = new Parser(lexer.tokenize());
    const interpreter = new Interpreter();
    // Pre-define an array for the interpreter since it doesn't have array literals yet
    interpreter.env.define("list", [1, 2, 3]);
    const result = interpreter.interpret(new Parser(new Lexer("loop i in list { let x = i }").tokenize()).parse());
    expect(result).toBeNull();
  });
});

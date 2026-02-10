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
});

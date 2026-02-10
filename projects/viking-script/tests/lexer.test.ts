import { describe, it, expect } from "vitest";
import { Lexer } from "../src/lexer";
import { SyntaxKind } from "../src/kind";

describe("Lexer", () => {
  it("should tokenize keywords", () => {
    const source = "let x = 42;";
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].kind).toBe(SyntaxKind.Let);
    expect(tokens[1].kind).toBe(SyntaxKind.Identifier);
    expect(tokens[1].text).toBe("x");
    expect(tokens[2].kind).toBe(SyntaxKind.Equal);
    expect(tokens[3].kind).toBe(SyntaxKind.Integer);
    expect(tokens[3].text).toBe("42");
    expect(tokens[4].kind).toBe(SyntaxKind.Semicolon);
  });

  it("should tokenize strings", () => {
    const source = '"hello world"';
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].kind).toBe(SyntaxKind.String);
    expect(tokens[0].text).toBe('"hello world"');
  });

  it("should skip comments", () => {
    const source = "# line comment\nlet x = 1; /* block\ncomment */";
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    
    expect(tokens[0].kind).toBe(SyntaxKind.Let);
    expect(tokens[1].kind).toBe(SyntaxKind.Identifier);
    expect(tokens[2].kind).toBe(SyntaxKind.Equal);
    expect(tokens[3].kind).toBe(SyntaxKind.Integer);
    expect(tokens[4].kind).toBe(SyntaxKind.Semicolon);
    expect(tokens[5].kind).toBe(SyntaxKind.EndOfFile);
  });
});

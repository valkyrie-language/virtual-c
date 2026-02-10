import { describe, it, expect } from "vitest";
import { Lexer } from "../src/lexer";
import { Parser } from "../src/parser";
import { SyntaxKind } from "../src/kind";

describe("Parser", () => {
  it("should parse let statements", () => {
    const source = "let x = 42;";
    const lexer = new Lexer(source);
    const parser = new Parser(lexer.tokenize());
    const program = parser.parse();
    
    expect(program.body.length).toBe(1);
    const stmt = program.body[0];
    expect(stmt.kind).toBe("LetStatement");
    if (stmt.kind === "LetStatement") {
      expect(stmt.name).toBe("x");
      expect(stmt.value.kind).toBe("Literal");
    }
  });

  it("should parse binary expressions with precedence", () => {
    const source = "1 + 2 * 3";
    const lexer = new Lexer(source);
    const parser = new Parser(lexer.tokenize());
    const program = parser.parse();
    
    expect(program.body.length).toBe(1);
    const stmt = program.body[0];
    expect(stmt.kind).toBe("ExpressionStatement");
    if (stmt.kind === "ExpressionStatement") {
      const expr = stmt.expression;
      expect(expr.kind).toBe("BinaryExpression");
      if (expr.kind === "BinaryExpression") {
        expect(expr.operator).toBe(SyntaxKind.Plus);
        expect(expr.right.kind).toBe("BinaryExpression");
        if (expr.right.kind === "BinaryExpression") {
          expect(expr.right.operator).toBe(SyntaxKind.Star);
        }
      }
    }
  });
});

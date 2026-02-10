import { SyntaxKind } from "./kind";

export interface Token {
  kind: SyntaxKind;
  start: number;
  end: number;
  text: string;
}

export class Lexer {
  private source: string;
  private pos = 0;

  constructor(source: string) {
    this.source = source;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];
    while (this.pos < this.source.length) {
      const token = this.nextToken();
      tokens.push(token);
      if (token.kind === SyntaxKind.EndOfFile) break;
    }
    return tokens;
  }

  private nextToken(): Token {
    this.skipWhitespaceAndComments();

    if (this.pos >= this.source.length) {
      return this.createToken(SyntaxKind.EndOfFile, this.pos, this.pos);
    }

    const start = this.pos;
    const char = this.source[this.pos];

    // Numbers
    if (/[0-9]/.test(char)) {
      return this.lexNumber();
    }

    // Identifiers and Keywords
    if (/[a-zA-Z_]/.test(char)) {
      return this.lexIdentifierOrKeyword();
    }

    // Strings
    if (char === '"' || char === "'") {
      return this.lexString(char);
    }

    // Multi-char operators
    const nextChar = this.source[this.pos + 1];
    if (char === "=" && nextChar === "=") return this.lexMultiChar(SyntaxKind.EqualEqual, 2);
    if (char === "!" && nextChar === "=") return this.lexMultiChar(SyntaxKind.NotEqual, 2);
    if (char === "<" && nextChar === "=") return this.lexMultiChar(SyntaxKind.LessEqual, 2);
    if (char === ">" && nextChar === "=") return this.lexMultiChar(SyntaxKind.GreaterEqual, 2);
    if (char === "-" && nextChar === ">") return this.lexMultiChar(SyntaxKind.Arrow, 2);
    if (char === "=" && nextChar === ">") return this.lexMultiChar(SyntaxKind.FatArrow, 2);
    if (char === "." && nextChar === ".") return this.lexMultiChar(SyntaxKind.DotDot, 2);

    // Single-char tokens
    switch (char) {
      case "+":
        return this.lexSingleChar(SyntaxKind.Plus);
      case "-":
        return this.lexSingleChar(SyntaxKind.Minus);
      case "*":
        return this.lexSingleChar(SyntaxKind.Star);
      case "/":
        return this.lexSingleChar(SyntaxKind.Slash);
      case "%":
        return this.lexSingleChar(SyntaxKind.Percent);
      case "&":
        return this.lexSingleChar(SyntaxKind.Ampersand);
      case "|":
        return this.lexSingleChar(SyntaxKind.Pipe);
      case "^":
        return this.lexSingleChar(SyntaxKind.Caret);
      case "!":
        return this.lexSingleChar(SyntaxKind.Exclamation);
      case "?":
        return this.lexSingleChar(SyntaxKind.Question);
      case "=":
        return this.lexSingleChar(SyntaxKind.Equal);
      case "<":
        return this.lexSingleChar(SyntaxKind.LessThan);
      case ">":
        return this.lexSingleChar(SyntaxKind.GreaterThan);
      case ".":
        return this.lexSingleChar(SyntaxKind.Dot);
      case ",":
        return this.lexSingleChar(SyntaxKind.Comma);
      case ":":
        return this.lexSingleChar(SyntaxKind.Colon);
      case ";":
        return this.lexSingleChar(SyntaxKind.Semicolon);
      case "(":
        return this.lexSingleChar(SyntaxKind.OpenParen);
      case ")":
        return this.lexSingleChar(SyntaxKind.CloseParen);
      case "[":
        return this.lexSingleChar(SyntaxKind.OpenBracket);
      case "]":
        return this.lexSingleChar(SyntaxKind.CloseBracket);
      case "{":
        return this.lexSingleChar(SyntaxKind.OpenBrace);
      case "}":
        return this.lexSingleChar(SyntaxKind.CloseBrace);
    }

    this.pos++;
    return this.createToken(SyntaxKind.Error, start, this.pos);
  }

  private lexNumber(): Token {
    const start = this.pos;
    let hasDot = false;
    while (this.pos < this.source.length) {
      const char = this.source[this.pos];
      if (char === ".") {
        if (hasDot || !/[0-9]/.test(this.source[this.pos + 1])) break;
        hasDot = true;
      } else if (!/[0-9]/.test(char)) {
        break;
      }
      this.pos++;
    }
    return this.createToken(hasDot ? SyntaxKind.Float : SyntaxKind.Integer, start, this.pos);
  }

  private lexIdentifierOrKeyword(): Token {
    const start = this.pos;
    while (this.pos < this.source.length && /[a-zA-Z0-9_]/.test(this.source[this.pos])) {
      this.pos++;
    }
    const text = this.source.substring(start, this.pos);
    const kind = KEYWORDS[text] || SyntaxKind.Identifier;
    return this.createToken(kind, start, this.pos);
  }

  private lexString(quote: string): Token {
    const start = this.pos;
    this.pos++; // skip opening quote
    while (this.pos < this.source.length && this.source[this.pos] !== quote) {
      if (this.source[this.pos] === "\\") this.pos++;
      this.pos++;
    }
    if (this.pos < this.source.length) this.pos++; // skip closing quote
    return this.createToken(SyntaxKind.String, start, this.pos);
  }

  private lexSingleChar(kind: SyntaxKind): Token {
    const start = this.pos;
    this.pos++;
    return this.createToken(kind, start, this.pos);
  }

  private lexMultiChar(kind: SyntaxKind, len: number): Token {
    const start = this.pos;
    this.pos += len;
    return this.createToken(kind, start, this.pos);
  }

  private skipWhitespaceAndComments(): void {
    while (this.pos < this.source.length) {
      const char = this.source[this.pos];
      if (/\s/.test(char)) {
        this.pos++;
        continue;
      }
      if (char === "#") {
        while (this.pos < this.source.length && this.source[this.pos] !== "\n") {
          this.pos++;
        }
        continue;
      }
      if (char === "/" && this.source[this.pos + 1] === "*") {
        this.pos += 2;
        while (this.pos < this.source.length && !(this.source[this.pos] === "*" && this.source[this.pos + 1] === "/")) {
          this.pos++;
        }
        if (this.pos < this.source.length) this.pos += 2;
        continue;
      }
      break;
    }
  }

  private createToken(kind: SyntaxKind, start: number, end: number): Token {
    return {
      kind,
      start,
      end,
      text: this.source.substring(start, end),
    };
  }
}

const KEYWORDS: Record<string, SyntaxKind> = {
  namespace: SyntaxKind.Namespace,
  using: SyntaxKind.Using,
  class: SyntaxKind.Class,
  singleton: SyntaxKind.Singleton,
  trait: SyntaxKind.Trait,
  flags: SyntaxKind.Flags,
  enums: SyntaxKind.Enums,
  union: SyntaxKind.Union,
  micro: SyntaxKind.Micro,
  mezzo: SyntaxKind.Mezzo,
  macro: SyntaxKind.Macro,
  widget: SyntaxKind.Widget,
  let: SyntaxKind.Let,
  if: SyntaxKind.If,
  else: SyntaxKind.Else,
  match: SyntaxKind.Match,
  for: SyntaxKind.For,
  while: SyntaxKind.While,
  loop: SyntaxKind.Loop,
  return: SyntaxKind.Return,
  break: SyntaxKind.Break,
  continue: SyntaxKind.Continue,
  type: SyntaxKind.Type,
  as: SyntaxKind.As,
  is: SyntaxKind.Is,
  in: SyntaxKind.In,
  true: SyntaxKind.Boolean,
  false: SyntaxKind.Boolean,
};

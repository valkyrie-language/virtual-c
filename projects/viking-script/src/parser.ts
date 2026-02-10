import { SyntaxKind } from "./kind";
import { Lexer, Token } from "./lexer";
import * as AST from "./ast";

export class Parser {
    private tokens: Token[];
    private pos = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    public parse(): AST.Program {
        const body: AST.Statement[] = [];
        while (this.pos < this.tokens.length && this.tokens[this.pos].kind !== SyntaxKind.EndOfFile) {
            const stmt = this.parseStatement();
            if (stmt) body.push(stmt);
        }
        return { kind: "Program", body };
    }

    private parseStatement(): AST.Statement | null {
        const token = this.current();
        switch (token.kind) {
            case SyntaxKind.Let:
                return this.parseLetStatement();
            case SyntaxKind.Return:
                return this.parseReturnStatement();
            case SyntaxKind.If:
                return this.parseIfStatement();
            case SyntaxKind.For:
                return this.parseForStatement();
            case SyntaxKind.While:
                return this.parseWhileStatement();
            case SyntaxKind.OpenBrace:
                // For simplicity, let's treat braces as a block expression or statement
                // In a real Valkyrie, it would be more complex
                return this.parseExpressionStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    private parseLetStatement(): AST.LetStatement {
        this.consume(SyntaxKind.Let);
        const nameToken = this.consume(SyntaxKind.Identifier);
        this.consume(SyntaxKind.Equal);
        const value = this.parseExpression();
        this.optionalConsume(SyntaxKind.Semicolon);
        return { kind: "LetStatement", name: nameToken.text, value };
    }

    private parseReturnStatement(): AST.ReturnStatement {
        this.consume(SyntaxKind.Return);
        let argument: AST.Expression | undefined;
        if (this.current().kind !== SyntaxKind.Semicolon && this.current().kind !== SyntaxKind.EndOfFile) {
            argument = this.parseExpression();
        }
        this.optionalConsume(SyntaxKind.Semicolon);
        return { kind: "ReturnStatement", argument };
    }

    private parseIfStatement(): AST.IfStatement {
        this.consume(SyntaxKind.If);
        const condition = this.parseExpression();
        const thenBranch = this.parseBlockOrStatement();
        let elseBranch: AST.Statement | undefined;
        if (this.current().kind === SyntaxKind.Else) {
            this.consume(SyntaxKind.Else);
            elseBranch = this.parseBlockOrStatement();
        }
        return { kind: "IfStatement", condition, thenBranch, elseBranch };
    }

    private parseForStatement(): AST.ForStatement {
        this.consume(SyntaxKind.For);
        const iterator = this.consume(SyntaxKind.Identifier).text;
        this.consume(SyntaxKind.In);
        const iterable = this.parseExpression();
        const body = this.parseBlockOrStatement();
        return { kind: "ForStatement", iterator, iterable, body };
    }

    private parseWhileStatement(): AST.WhileStatement {
        this.consume(SyntaxKind.While);
        const condition = this.parseExpression();
        const body = this.parseBlockOrStatement();
        return { kind: "WhileStatement", condition, body };
    }

    private parseBlockOrStatement(): AST.Statement {
        if (this.current().kind === SyntaxKind.OpenBrace) {
            // Simplification: just parse the expression inside as a statement
            this.consume(SyntaxKind.OpenBrace);
            const stmt = this.parseStatement()!;
            this.consume(SyntaxKind.CloseBrace);
            return stmt;
        }
        return this.parseStatement()!;
    }

    private parseExpressionStatement(): AST.ExpressionStatement {
        const expression = this.parseExpression();
        this.optionalConsume(SyntaxKind.Semicolon);
        return { kind: "ExpressionStatement", expression };
    }

    private parseExpression(precedence = 0): AST.Expression {
        let left = this.parsePrimary();

        while (true) {
            const token = this.current();
            const opPrecedence = this.getPrecedence(token.kind);
            if (opPrecedence <= precedence) break;

            this.pos++;
            const right = this.parseExpression(opPrecedence);
            left = {
                kind: "BinaryExpression",
                left,
                operator: token.kind,
                right,
            };
        }

        return left;
    }

    private parsePrimary(): AST.Expression {
        const token = this.current();
        this.pos++;

        switch (token.kind) {
            case SyntaxKind.Identifier:
                return { kind: "Identifier", name: token.text };
            case SyntaxKind.Integer:
                return { kind: "Literal", value: parseInt(token.text), literalType: "number" };
            case SyntaxKind.Float:
                return { kind: "Literal", value: parseFloat(token.text), literalType: "number" };
            case SyntaxKind.String:
                return { kind: "Literal", value: token.text.slice(1, -1), literalType: "string" };
            case SyntaxKind.Boolean:
                return { kind: "Literal", value: token.text === "true", literalType: "boolean" };
            case SyntaxKind.OpenParen: {
                const expr = this.parseExpression();
                this.consume(SyntaxKind.CloseParen);
                return expr;
            }
            default:
                throw new Error(`Unexpected token: ${token.text} at ${token.start}`);
        }
    }

    private getPrecedence(kind: SyntaxKind): number {
        switch (kind) {
            case SyntaxKind.Equal:
                return 1;
            case SyntaxKind.EqualEqual:
            case SyntaxKind.NotEqual:
                return 2;
            case SyntaxKind.LessThan:
            case SyntaxKind.LessEqual:
            case SyntaxKind.GreaterThan:
            case SyntaxKind.GreaterEqual:
                return 3;
            case SyntaxKind.Plus:
            case SyntaxKind.Minus:
                return 4;
            case SyntaxKind.Star:
            case SyntaxKind.Slash:
                return 5;
            default:
                return 0;
        }
    }

    private current(): Token {
        return this.tokens[this.pos] || { kind: SyntaxKind.EndOfFile, text: "", start: this.pos, end: this.pos };
    }

    private consume(kind: SyntaxKind): Token {
        const token = this.current();
        if (token.kind !== kind) {
            throw new Error(`Expected ${SyntaxKind[kind]}, got ${SyntaxKind[token.kind]} at ${token.start}`);
        }
        this.pos++;
        return token;
    }

    private optionalConsume(kind: SyntaxKind): boolean {
        if (this.current().kind === kind) {
            this.pos++;
            return true;
        }
        return false;
    }
}

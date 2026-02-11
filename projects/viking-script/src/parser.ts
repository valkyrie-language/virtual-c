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
            case SyntaxKind.Loop:
                return this.parseLoopStatement();
            case SyntaxKind.Class:
                return this.parseClassDeclaration();
            case SyntaxKind.Trait:
                return this.parseTraitDeclaration();
            case SyntaxKind.OpenBrace:
                return this.parseBlock();
            default:
                return this.parseExpressionStatement();
        }
    }

    private parseBlock(): AST.BlockStatement {
        this.consume(SyntaxKind.OpenBrace);
        const body: AST.Statement[] = [];
        while (this.current().kind !== SyntaxKind.CloseBrace && this.current().kind !== SyntaxKind.EndOfFile) {
            const stmt = this.parseStatement();
            if (stmt) body.push(stmt);
        }
        this.consume(SyntaxKind.CloseBrace);
        return { kind: "BlockStatement", body };
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

    private parseLoopStatement(): AST.LoopStatement {
        this.consume(SyntaxKind.Loop);
        let pattern: string | undefined;
        let iterable: AST.Expression | undefined;

        if (this.current().kind !== SyntaxKind.OpenBrace) {
            pattern = this.consume(SyntaxKind.Identifier).text;
            this.consume(SyntaxKind.In);
            iterable = this.parseExpression();
        }

        const body = this.parseBlock();
        return { kind: "LoopStatement", pattern, iterable, body };
    }

    private parseClassDeclaration(): AST.ClassDeclaration {
        this.consume(SyntaxKind.Class);
        const name = this.consume(SyntaxKind.Identifier).text;

        let superClass: string | undefined;
        if (this.optionalConsume(SyntaxKind.Extends)) {
            superClass = this.consume(SyntaxKind.Identifier).text;
        }

        const implementsTraits: string[] = [];
        if (this.optionalConsume(SyntaxKind.Implements)) {
            do {
                implementsTraits.push(this.consume(SyntaxKind.Identifier).text);
            } while (this.optionalConsume(SyntaxKind.Comma));
        }

        this.consume(SyntaxKind.OpenBrace);
        const members: AST.ClassMember[] = [];
        while (this.current().kind !== SyntaxKind.CloseBrace && this.current().kind !== SyntaxKind.EndOfFile) {
            members.push(this.parseClassMember());
        }
        this.consume(SyntaxKind.CloseBrace);

        return {
            kind: "ClassDeclaration",
            name,
            superClass,
            implements: implementsTraits.length > 0 ? implementsTraits : undefined,
            members,
        };
    }

    private parseClassMember(): AST.ClassMember {
        const name = this.consume(SyntaxKind.Identifier).text;
        if (this.current().kind === SyntaxKind.OpenParen) {
            // Method
            this.consume(SyntaxKind.OpenParen);
            const params: string[] = [];
            if (this.current().kind !== SyntaxKind.CloseParen) {
                do {
                    params.push(this.consume(SyntaxKind.Identifier).text);
                } while (this.optionalConsume(SyntaxKind.Comma));
            }
            this.consume(SyntaxKind.CloseParen);
            const body = this.parseBlockOrStatement();
            return { kind: "MethodDefinition", name, params, body };
        }
        // Property
        let value: AST.Expression | undefined;
        if (this.optionalConsume(SyntaxKind.Equal)) {
            value = this.parseExpression();
        }
        this.optionalConsume(SyntaxKind.Semicolon);
        return { kind: "PropertyDefinition", name, value };
    }

    private parseTraitDeclaration(): AST.TraitDeclaration {
        this.consume(SyntaxKind.Trait);
        const name = this.consume(SyntaxKind.Identifier).text;

        this.consume(SyntaxKind.OpenBrace);
        const members: AST.TraitMember[] = [];
        while (this.current().kind !== SyntaxKind.CloseBrace && this.current().kind !== SyntaxKind.EndOfFile) {
            members.push(this.parseTraitMember());
        }
        this.consume(SyntaxKind.CloseBrace);

        return { kind: "TraitDeclaration", name, members };
    }

    private parseTraitMember(): AST.TraitMember {
        const name = this.consume(SyntaxKind.Identifier).text;
        this.consume(SyntaxKind.OpenParen);
        const params: string[] = [];
        if (this.current().kind !== SyntaxKind.CloseParen) {
            do {
                params.push(this.consume(SyntaxKind.Identifier).text);
            } while (this.optionalConsume(SyntaxKind.Comma));
        }
        this.consume(SyntaxKind.CloseParen);

        let body: AST.Statement | undefined;
        if (this.current().kind === SyntaxKind.OpenBrace) {
            body = this.parseBlockOrStatement();
        } else {
            this.optionalConsume(SyntaxKind.Semicolon);
        }

        return { kind: "TraitMember", name, params, body };
    }

    private parseBlockOrStatement(): AST.Statement {
        if (this.current().kind === SyntaxKind.OpenBrace) {
            return this.parseBlock();
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
            const right = this.parseExpression(opPrecedence - (this.isAssignmentOperator(token.kind) ? 1 : 0));
            if (this.isAssignmentOperator(token.kind)) {
                left = {
                    kind: "AssignmentExpression",
                    left,
                    operator: token.kind,
                    right,
                };
            } else {
                left = {
                    kind: "BinaryExpression",
                    left,
                    operator: token.kind,
                    right,
                };
            }
        }

        return left;
    }

    private isAssignmentOperator(kind: SyntaxKind): boolean {
        return (
            kind === SyntaxKind.Equal ||
            kind === SyntaxKind.PlusEqual ||
            kind === SyntaxKind.MinusEqual ||
            kind === SyntaxKind.StarEqual ||
            kind === SyntaxKind.SlashEqual
        );
    }

    private parsePrimary(): AST.Expression {
        let expr = this.parseBasePrimary();

        while (true) {
            if (this.optionalConsume(SyntaxKind.Dot)) {
                const property = this.consume(SyntaxKind.Identifier).text;
                expr = {
                    kind: "MemberExpression",
                    object: expr,
                    property,
                };
            } else if (this.optionalConsume(SyntaxKind.OpenParen)) {
                const args: AST.Expression[] = [];
                if (this.current().kind !== SyntaxKind.CloseParen) {
                    do {
                        args.push(this.parseExpression());
                    } while (this.optionalConsume(SyntaxKind.Comma));
                }
                this.consume(SyntaxKind.CloseParen);
                expr = {
                    kind: "CallExpression",
                    callee: expr,
                    arguments: args,
                };
            } else {
                break;
            }
        }

        return expr;
    }

    private parseBasePrimary(): AST.Expression {
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

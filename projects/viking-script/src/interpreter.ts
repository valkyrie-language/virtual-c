import * as AST from "./ast";
import { SyntaxKind } from "./kind";

export class Environment {
  private values: Map<string, any> = new Map();
  private parent?: Environment;

  constructor(parent?: Environment) {
    this.parent = parent;
  }

  public define(name: string, value: any): void {
    this.values.set(name, value);
  }

  public get(name: string): any {
    if (this.values.has(name)) {
      return this.values.get(name);
    }
    if (this.parent) {
      return this.parent.get(name);
    }
    throw new Error(`Undefined variable: ${name}`);
  }

  public assign(name: string, value: any): void {
    if (this.values.has(name)) {
      this.values.set(name, value);
      return;
    }
    if (this.parent) {
      this.parent.assign(name, value);
      return;
    }
    throw new Error(`Undefined variable: ${name}`);
  }
}

export class Interpreter {
  private env: Environment;

  constructor(env: Environment = new Environment()) {
    this.env = env;
  }

  public interpret(program: AST.Program): any {
    let result: any = null;
    for (const stmt of program.body) {
      result = this.execute(stmt);
    }
    return result;
  }

  private execute(stmt: AST.Statement): any {
    switch (stmt.kind) {
      case "LetStatement":
        this.env.define(stmt.name, this.evaluate(stmt.value));
        return null;
      case "ExpressionStatement":
        return this.evaluate(stmt.expression);
      case "ReturnStatement":
        return this.evaluate(stmt.argument || { kind: "Literal", value: null, literalType: "null" });
      case "IfStatement":
        if (this.evaluate(stmt.condition)) {
          return this.execute(stmt.thenBranch);
        } else if (stmt.elseBranch) {
          return this.execute(stmt.elseBranch);
        }
        return null;
      case "WhileStatement":
        while (this.evaluate(stmt.condition)) {
          this.execute(stmt.body);
        }
        return null;
      case "ForStatement": {
        const iterable = this.evaluate(stmt.iterable);
        if (Array.isArray(iterable)) {
          for (const item of iterable) {
            const innerEnv = new Environment(this.env);
            innerEnv.define(stmt.iterator, item);
            const interpreter = new Interpreter(innerEnv);
            interpreter.execute(stmt.body);
          }
        }
        return null;
      }
    }
  }

  private evaluate(expr: AST.Expression): any {
    switch (expr.kind) {
      case "Literal":
        return expr.value;
      case "Identifier":
        return this.env.get(expr.name);
      case "BinaryExpression": {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);
        switch (expr.operator) {
          case SyntaxKind.Plus:
            return left + right;
          case SyntaxKind.Minus:
            return left - right;
          case SyntaxKind.Star:
            return left * right;
          case SyntaxKind.Slash:
            return left / right;
          case SyntaxKind.EqualEqual:
            return left === right;
          case SyntaxKind.NotEqual:
            return left !== right;
          case SyntaxKind.LessThan:
            return left < right;
          case SyntaxKind.LessEqual:
            return left <= right;
          case SyntaxKind.GreaterThan:
            return left > right;
          case SyntaxKind.GreaterEqual:
            return left >= right;
          default:
            throw new Error(`Unsupported operator: ${SyntaxKind[expr.operator]}`);
        }
      }
      case "UnaryExpression": {
        const val = this.evaluate(expr.argument);
        switch (expr.operator) {
          case SyntaxKind.Minus:
            return -val;
          case SyntaxKind.Exclamation:
            return !val;
          default:
            throw new Error(`Unsupported unary operator: ${SyntaxKind[expr.operator]}`);
        }
      }
      case "CallExpression": {
        const callee = this.evaluate(expr.callee);
        const args = expr.arguments.map((arg) => this.evaluate(arg));
        if (typeof callee === "function") {
          return callee(...args);
        }
        throw new Error("Callee is not a function");
      }
      case "MemberExpression": {
        const object = this.evaluate(expr.object);
        return object[expr.property];
      }
    }
  }
}

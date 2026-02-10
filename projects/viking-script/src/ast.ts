import { SyntaxKind } from "./kind";

export type Node = Expression | Statement | Program;

export interface Program {
  kind: "Program";
  body: Statement[];
}

export type Statement =
  | LetStatement
  | ExpressionStatement
  | ReturnStatement
  | IfStatement
  | ForStatement
  | WhileStatement;

export interface LetStatement {
  kind: "LetStatement";
  name: string;
  value: Expression;
}

export interface ExpressionStatement {
  kind: "ExpressionStatement";
  expression: Expression;
}

export interface ReturnStatement {
  kind: "ReturnStatement";
  argument?: Expression;
}

export interface IfStatement {
  kind: "IfStatement";
  condition: Expression;
  thenBranch: Statement;
  elseBranch?: Statement;
}

export interface ForStatement {
  kind: "ForStatement";
  iterator: string;
  iterable: Expression;
  body: Statement;
}

export interface WhileStatement {
  kind: "WhileStatement";
  condition: Expression;
  body: Statement;
}

export type Expression =
  | IdentifierExpression
  | LiteralExpression
  | BinaryExpression
  | UnaryExpression
  | CallExpression
  | MemberExpression;

export interface IdentifierExpression {
  kind: "Identifier";
  name: string;
}

export interface LiteralExpression {
  kind: "Literal";
  value: string | number | boolean | null;
  literalType: "string" | "number" | "boolean" | "null";
}

export interface BinaryExpression {
  kind: "BinaryExpression";
  left: Expression;
  operator: SyntaxKind;
  right: Expression;
}

export interface UnaryExpression {
  kind: "UnaryExpression";
  operator: SyntaxKind;
  argument: Expression;
}

export interface CallExpression {
  kind: "CallExpression";
  callee: Expression;
  arguments: Expression[];
}

export interface MemberExpression {
  kind: "MemberExpression";
  object: Expression;
  property: string;
}

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
    | LoopStatement
    | ClassDeclaration
    | TraitDeclaration
    | BlockStatement;

export interface BlockStatement {
    kind: "BlockStatement";
    body: Statement[];
}

export interface LoopStatement {
    kind: "LoopStatement";
    pattern?: string;
    iterable?: Expression;
    body: BlockStatement;
}

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

export interface ClassDeclaration {
    kind: "ClassDeclaration";
    name: string;
    superClass?: string;
    implements?: string[];
    members: ClassMember[];
}

export type ClassMember = MethodDefinition | PropertyDefinition;

export interface MethodDefinition {
    kind: "MethodDefinition";
    name: string;
    params: string[];
    body: Statement;
}

export interface PropertyDefinition {
    kind: "PropertyDefinition";
    name: string;
    value?: Expression;
}

export interface TraitDeclaration {
    kind: "TraitDeclaration";
    name: string;
    members: TraitMember[];
}

export interface TraitMember {
    kind: "TraitMember";
    name: string;
    params: string[];
    // body is optional for traits
    body?: Statement;
}

export type Expression =
    | IdentifierExpression
    | LiteralExpression
    | BinaryExpression
    | UnaryExpression
    | CallExpression
    | MemberExpression
    | AssignmentExpression;

export interface AssignmentExpression {
    kind: "AssignmentExpression";
    left: Expression;
    operator: SyntaxKind;
    right: Expression;
}

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

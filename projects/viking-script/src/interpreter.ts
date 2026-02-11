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

export class VikingClass {
    constructor(
        public name: string,
        public superClass: VikingClass | undefined,
        public traits: VikingTrait[],
        public members: AST.ClassMember[],
        public env: Environment,
    ) {}

    public getMethod(name: string): AST.MethodDefinition | AST.TraitMember | undefined {
        // 1. Check own methods
        const method = this.members.find((m) => m.kind === "MethodDefinition" && m.name === name) as
            | AST.MethodDefinition
            | undefined;
        if (method) return method;

        // 2. Check superclass methods
        if (this.superClass) {
            const superMethod = this.superClass.getMethod(name);
            if (superMethod) return superMethod;
        }

        // 3. Check trait default methods
        for (const trait of this.traits) {
            const traitMethod = trait.members.find((m) => m.name === name && m.body);
            if (traitMethod) return traitMethod;
        }

        return undefined;
    }
}

export class VikingInstance {
    private properties: Map<string, any> = new Map();

    constructor(public klass: VikingClass) {
        // Initialize properties from class and superclasses
        this.initializeProperties(klass);
    }

    private initializeProperties(klass: VikingClass) {
        if (klass.superClass) {
            this.initializeProperties(klass.superClass);
        }
        for (const member of klass.members) {
            if (member.kind === "PropertyDefinition") {
                const interpreter = new Interpreter(klass.env);
                this.properties.set(member.name, member.value ? interpreter.evaluate(member.value) : null);
            }
        }
    }

    public get(name: string): any {
        if (this.properties.has(name)) return this.properties.get(name);
        const method = this.klass.getMethod(name);
        if (method) {
            return (...args: any[]) => {
                const methodEnv = new Environment(this.klass.env);
                methodEnv.define("self", this);
                for (let i = 0; i < method.params.length; i++) {
                    methodEnv.define(method.params[i], args[i]);
                }
                const interpreter = new Interpreter(methodEnv);
                return interpreter.execute(method.body!);
            };
        }
        throw new Error(`Undefined property or method: ${name}`);
    }

    public set(name: string, value: any): void {
        this.properties.set(name, value);
    }
}

export class VikingTrait {
    constructor(public name: string, public members: AST.TraitMember[]) {}
}

export class Interpreter {
    public env: Environment;

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

    public execute(stmt: AST.Statement): any {
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
            case "BlockStatement": {
                let result: any = null;
                for (const s of stmt.body) {
                    result = this.execute(s);
                }
                return result;
            }
            case "LoopStatement": {
                if (stmt.iterable && stmt.pattern) {
                    const iterable = this.evaluate(stmt.iterable);
                    if (Array.isArray(iterable)) {
                        for (const item of iterable) {
                            const innerEnv = new Environment(this.env);
                            innerEnv.define(stmt.pattern, item);
                            const interpreter = new Interpreter(innerEnv);
                            interpreter.execute(stmt.body);
                        }
                    }
                } else {
                    while (true) {
                        this.execute(stmt.body);
                    }
                }
                return null;
            }
            case "ClassDeclaration": {
                const superClass = stmt.superClass ? this.env.get(stmt.superClass) : undefined;
                if (superClass && !(superClass instanceof VikingClass)) {
                    throw new Error(`Superclass ${stmt.superClass} is not a class`);
                }

                const traits: VikingTrait[] = [];
                if (stmt.implements) {
                    for (const traitName of stmt.implements) {
                        const trait = this.env.get(traitName);
                        if (!(trait instanceof VikingTrait)) {
                            throw new Error(`Trait ${traitName} is not a trait`);
                        }
                        traits.push(trait);
                    }
                }

                const klass = new VikingClass(stmt.name, superClass, traits, stmt.members, this.env);
                this.env.define(stmt.name, klass);
                return null;
            }
            case "TraitDeclaration": {
                const trait = new VikingTrait(stmt.name, stmt.members);
                this.env.define(stmt.name, trait);
                return null;
            }
        }
    }

    public evaluate(expr: AST.Expression): any {
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

                if (callee instanceof VikingClass) {
                    return new VikingInstance(callee);
                }

                if (typeof callee === "function") {
                    return callee(...args);
                }
                throw new Error("Callee is not a function or class");
            }
            case "MemberExpression": {
                const object = this.evaluate(expr.object);
                if (object instanceof VikingInstance) {
                    return object.get(expr.property);
                }
                return object[expr.property];
            }
            case "AssignmentExpression": {
                const right = this.evaluate(expr.right);
                if (expr.left.kind === "Identifier") {
                    this.env.assign(expr.left.name, right);
                    return right;
                } else if (expr.left.kind === "MemberExpression") {
                    const object = this.evaluate(expr.left.object);
                    if (object instanceof VikingInstance) {
                        object.set(expr.left.property, right);
                        return right;
                    }
                    object[expr.left.property] = right;
                    return right;
                }
                throw new Error("Invalid assignment target");
            }
        }
    }
}

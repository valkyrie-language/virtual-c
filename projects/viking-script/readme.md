# @valkyrie-language/viking-script

[![NPM Version](https://img.shields.io/npm/v/@valkyrie-language/viking-script.svg)](https://www.npmjs.com/package/@valkyrie-language/viking-script)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE.md)

A lightweight, pure TypeScript implementation of the Valkyrie language. Viking Script provides a portable and efficient runtime for Valkyrie syntax, optimized for browser environments and embedding.

## Features

- **🚀 Lightweight**: Minimal footprint, zero external dependencies.
- **🌐 Browser Compatible**: Runs anywhere TypeScript/JavaScript runs.
- **⚡ Fast**: Optimized Lexer and Pratt Parser for high-performance execution.
- **🛠 Scoped Environment**: Robust variable shadowing and scope management.

## Installation

```bash
pnpm add @valkyrie-language/viking-script
```

## Quick Start

```typescript
import { Lexer, Parser, Interpreter } from '@valkyrie-language/viking-script';

const code = `
    let x = 10;
    let y = 20;
    if x < y {
        x + y
    } else {
        0
    }
`;

const tokens = new Lexer(code).tokenize();
const ast = new Parser(tokens).parse();
const result = new Interpreter().interpret(ast);

console.log(result); // 30
```

## API Reference

### `Lexer`
Converts source code strings into a stream of tokens.

### `Parser`
Transforms tokens into an Abstract Syntax Tree (AST). Supports operator precedence and common control flow structures.

### `Interpreter`
Executes the AST. Can be provided with a custom `Environment` for pre-defined variables or functions.

## Development

```bash
# Run unit tests
pnpm test

# Build for production
pnpm run build

# Linting & Formatting
pnpm run lint
pnpm run format
```

## License

MIT © [Valkyrie Language](https://github.com/valkyrie-language)

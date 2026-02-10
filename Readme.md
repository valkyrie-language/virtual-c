# Valkyrie TypeScript Monorepo

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Biome](https://img.shields.io/badge/formatter-biome-6370E5.svg)](https://biomejs.dev/)

A collection of TypeScript packages for the Valkyrie language ecosystem, managed with pnpm workspaces.

## Project Overview

This monorepo contains the TypeScript implementation of the Valkyrie language components, including a lightweight script engine, numerical libraries, and utility tools.

### Packages

- **[@valkyrie-language/viking-script](./projects/viking-script)**: A lightweight, browser-compatible script engine for Valkyrie.
- **[@valkyrie-language/nyar-number](./projects/nyar-number)**: High-precision numerical computations.
- **[@valkyrie-language/nyar-prime](./projects/nyar-prime)**: Prime number utilities and shared global cache.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) (v8 or later)

### Installation

```bash
pnpm install
```

### Common Commands

```bash
# Run tests for all packages
pnpm test

# Lint and format all packages
pnpm lint
pnpm format

# Build all packages
pnpm run build
```

## Contributing

Please see our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

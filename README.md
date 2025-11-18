# Cevi WIE Chilbi POS

Point-of-Sales für Cevi WIE Chilbi.

## Getting Started with Development

First make sure you meet these requirements:

- Use **NodeJS v22**. This is important. Newer versions break Electron. You can use
  [`fnm`](https://github.com/Schniz/fnm) if you want an easy way to manage multiple NodeJS versions.
- Install `prek`: https://prek.j178.dev/installation/. Then enable in repository by running
  `prek install`. This runs pre-commit hooks when you commit new changes.

Then, run:

```sh
pnpm install
pnpm run dev:pos  # Or pnpm run dev:butler for the order display app
```

This will launch the application in development mode.

### PNPM Scripts (Root)

| Script         | Description                                           |
| -------------- | ----------------------------------------------------- |
| `dev:butler`   | Runs the Order Display App in development mode.       |
| `dev:pos`      | Runs the POS App in development mode.                 |
| `dev:shared`   | Just live-compiles the shared library code.           |
| `build:butler` | Builds and packages the Order Display electron app.   |
| `build:pos`    | Builds and packages the POS electron app.             |
| `build:shared` | Compiles the shared library.                          |
| `lint`         | Runs linter and formatter on all projects in codebase |

## Editor Support

Recommended editors/IDEs: VS Code, IntelliJ IDEA or WebStorm, or Zed.

For ease of development, set up your editor with plugins/support for the following tools:

- Eslint
- Prettier

Prettier should be able to handle most languages used in this codebase.

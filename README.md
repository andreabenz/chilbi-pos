# Cevi WIE Chilbi POS

Point-of-Sales für Cevi WIE Chilbi.

## Getting Started with Development

First make sure you meet these requirements:

- Use **NodeJS v20**. This is important. Newer versions break Electron. You can use
  [`fnm`](https://github.com/Schniz/fnm) if you want an easy way to manage multiple NodeJS versions.
- Install `prek`: https://prek.j178.dev/installation/. Then enable in repository by running
  `prek install`. This runs pre-commit hooks when you commit new changes.

Then, run:

```sh
npm install
npm run dev:pos  # Or dev:butler for the order display app
```

This will launch the application in development mode.

### NPM Scripts (Root)

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

- BiomeJS
- Prettier

Then set up the formatters for various languages:

- **BiomeJS:** Use for JS/TS, HTML, CSS (not SCSS or Sass), JSON, JSONC, Vue, GraphQL
- **Prettier:** Use for SCSS, Sass, YAML, Markdown

## Linting

We are using BiomeJS as our linter and formatter of choice. This might be a bit opinionated, and
it's still in development, but it's 10-100x faster than traditional methods like ESLint. You might
encounter some bugs here and there, so be weary.

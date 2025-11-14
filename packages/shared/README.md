# Cevi WIE Chilbi `shared` Module

Add shared functionality between POS and Butler.

To do so, add to `package.json` `exports` array like so:

```json
// package.json
{
  // ...
  "exports": {
    ".": "./src/index.js",
    "./types": "./src/types/index.js",
    "./utils": "./src/utils/index.js",
    "./components": "./src/components/index.js"
  }
}
```

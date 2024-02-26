# VS Code grammar builder

see [`vscode-grammar-builder-bootstrap`](https://github.com/noxabellus/vscode-grammar-builder-bootstrap) for a template

## Usage

+ set up your `package.json` like a regular VSCode Grammar contribution package

+ add `"vscode-grammar-builder": "github:noxabellus/vscode-grammar-builder"`
to your dev dependencies

+ create an entry in your scripts section
`"build": "vscgb --name YourLang path/to/YourLang`

+ add `"@types/vscode-grammar": "github:noxabellus/vscode-grammar-types"`
to your dev dependencies

+ create an `index.ts` in `path/to/YourLang`
that exports a `TMGrammar` as `default`

+ create a `YourLang.config.json` that contributes the usual
VSCode Grammar `autoClosingPairs` etc

+ run `npm run build`

+ run `vsce package`

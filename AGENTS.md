# AGENTS.md

Context for any AI agent working in this repository.

## What this is

`social-card-action`: a composite GitHub Action that draws a 1200 by 630 PNG social card from a project's name and description, in the
dark style of docs-sitekit. MIT, written from scratch. Do not add code, text or configuration copied from other projects, and do
not depend on private packages. It exists so that docs-sitekit sites (and any repository) get a social image without adding
image dependencies to a site: the 40 MB of `satori`, `resvg` and Geist live here, in the runner of the action.

## Layout (Domain-Driven Design, barrel exports)

```text
action.yml                the composite action: setup-node, npm ci --omit=dev in the action folder, node --import src/register-alias.mjs src/cli.ts
src/
  domain/                 pure rules: the card input and colors, truncateAtWord, the request parsed from the inputs
  application/            generateCard (draw, compare with the file there, write only on change) and its ports
  infrastructure/         adapters: satori and resvg (renderCard), node:fs (nodeFiles)
  presentation/           run(): reads SOCIAL_CARD_* variables, writes the outputs; cli.ts is the entry point
  register-alias.mjs      resolves the `@/` alias at run time, loaded with `node --import`
  __tests__/              node:test, one file per layer
docs/example.png          the card of this repository, shown in the README
```

Dependencies point inward. Every layer has an `index.ts`, and other layers import it, not its files: `import { parseRequest } from "@/domain"`.

## Rules learned the hard way

- **No build step.** The action runs the TypeScript with Node's own type stripping (22.18 and newer). So: no enums, no namespaces,
  no parameter properties (`erasableSyntaxOnly`), and a sibling import (`./card.ts`) ends in `.ts`. Do not add a bundler or a `dist/`.
- **Names and imports.** File and folder names are lowercase kebab-case (`generate-card.ts`), and only the names of exports are CamelCase.
  An import that leaves its folder is `@/domain`, the `src/` folder, through the barrel. Node does not read the `paths` of tsconfig, so
  `src/register-alias.mjs` resolves `@/` at run time. The action, `npm test` and any script load it with `node --import ./src/register-alias.mjs`.
- **An input never reaches a shell.** `action.yml` passes every input as an environment variable, `SOCIAL_CARD_<INPUT>`, and the
  script reads them from `process.env`. Never interpolate `${{ inputs.* }}` into a `run:` line.
- **The action writes only inside the workspace.** `outputPathProblem` refuses an absolute path, `..` and a name that is not `.png`.
  Test each.
- **The card is deterministic.** The same input gives the same bytes, and `changed` depends on it. Nothing in the picture may
  read the time, a random number or the machine (`loadSystemFonts: false`).
- **`satori` reads `.woff`, not `.woff2`.** The fonts come from `@fontsource/geist/files/*.woff`, Latin subset. A character outside
  it is a box: that is documented, not a bug to chase.
- **A new input is in four places that agree:** `action.yml` with its default, `parseRequest` and `run`, the README table, and a test.
- **Pin by tag or commit.** Tags `v*` are immutable (a ruleset). There is no floating `v1`; the README names the exact tag.
- Credential-shaped test values are built at run time, never written as literals.

## Tests

`npm test` runs `node --test` on the TypeScript files. Unit tests for the rules, a test of the use case with in-memory files, and a
test of `run()` that draws a real PNG in a temporary folder and reads its size. CI also runs the action itself on a runner and checks
the outputs (job "Action smoke test").

## TSDoc

Every export of our own code has a TSDoc comment, enforced in CI by the jsdoc-to-tsdoc action. Tests are excluded.

## Releasing

A `v*` tag runs the Release workflow: the tag must match `package.json`, the checks pass, and the GitHub Release is made from the
CHANGELOG section of the version. There is nothing to publish to npm (the package is private). A release is the version bump pull
request (`package.json`, `package-lock.json`, CHANGELOG, the tag in the README), then the annotated tag:
`git tag -a vX.Y.Z -m vX.Y.Z`. Tags are immutable, so a tag is pushed only after CI is green on `main`.

## Commits

Plain messages in the imperative. No attribution trailers.

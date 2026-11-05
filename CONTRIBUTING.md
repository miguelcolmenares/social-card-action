# Contributing

Thanks for helping. This is a small action with strict checks, so most of the work of reviewing is done by the tests.

## Set up

You need Node 22.18 or newer, which runs the TypeScript sources without a build step.

```bash
git clone https://github.com/miguelcolmenares/social-card-action.git
cd social-card-action
npm ci
npm test
```

## Before you open a pull request

Run `npm run lint`, `npm run format:check`, `npm run typecheck` and `npm test`. CI runs them on Node 22, 24 and 26, checks that every
export has a TSDoc comment, and runs the action itself on a runner.

## What a change needs

- **A test at the right level.** Rules get unit tests, the use case gets a test with in-memory files, and the run as a whole gets a
  test that draws a real PNG in a temporary folder.
- **`action.yml` and the README agree.** A new input or output is in both, with the same default.
- **File names are kebab-case**, only the names of exports are CamelCase, and an import that leaves its folder is `@/domain`.
- **No code copied from elsewhere**, and no dependency on a private package.

## Commits and pull requests

Plain, imperative messages. One idea per pull request. The `main` branch needs the CI checks to pass.

## Reporting bugs

Use the bug report form, with the step of your workflow and its log.

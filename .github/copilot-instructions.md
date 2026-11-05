# Copilot repository instructions: social-card-action

These instructions apply to every Copilot request in this repository. The full context is in [`AGENTS.md`](../AGENTS.md); read it
before non-trivial work.

- A composite GitHub Action that draws a 1200 by 630 PNG social card. TypeScript run with Node's type stripping: no enums, no
  namespaces, no parameter properties, sibling imports end in `.ts`, no build step, no `dist/`. File names are kebab-case, and an import that
  leaves its folder is `@/domain` (resolved at run time by `src/register-alias.mjs`).
- DDD layers (`domain`, `application`, `infrastructure`, `presentation`), one barrel `index.ts` each; import the barrel.
- Inputs reach the script as `SOCIAL_CARD_*` environment variables. Never interpolate `${{ inputs.* }}` into a `run:` line.
- Every export has a TSDoc comment. `strict`, `noUncheckedIndexedAccess`, no `any`.
- A fix comes with a regression test. Run `npm run lint`, `npm run format:check`, `npm run typecheck` and `npm test` before pushing.
- Commits: plain, imperative, no attribution trailers.

// Lets Node run the TypeScript sources with the `@/` alias, which is the `src/` folder. Node strips the types by itself
// but does not read the `paths` of tsconfig.json, so this resolves `@/domain` to `src/domain/index.ts` and `@/a/b` to
// `src/a/b.ts`. It is loaded with `node --import ./src/register-alias.mjs`, by the action and by the tests.
import { existsSync, statSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = new URL("./", import.meta.url);

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith("@/")) return nextResolve(specifier, context);
    const base = fileURLToPath(new URL(specifier.slice(2), SRC));
    const found = [`${base}.ts`, `${base}/index.ts`].find(
      (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
    );
    if (!found) throw new Error(`Cannot find the module "${specifier}" in src/.`);
    return nextResolve(pathToFileURL(found).href, context);
  },
});

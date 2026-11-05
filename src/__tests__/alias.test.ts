import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";

const ALIAS = new URL("../register-alias.mjs", import.meta.url).pathname;

/** Runs a one-line module in a new Node with the alias loaded, so the result does not depend on this process. */
function run(code: string) {
  return spawnSync(process.execPath, ["--import", ALIAS, "--input-type=module", "-e", code], {
    encoding: "utf8",
  });
}

describe("the @/ alias", () => {
  it("resolves a layer to its barrel and a file to its path", () => {
    const result = run(
      `import { truncateAtWord } from "@/domain"; import * as text from "@/domain/text"; console.log(typeof truncateAtWord, truncateAtWord === text.truncateAtWord);`,
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), "function true");
  });

  it("fails with a message that names the module when the file is not in src/", () => {
    const result = run(`import "@/nothing-here";`);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Cannot find the module "@\/nothing-here"/);
  });
});

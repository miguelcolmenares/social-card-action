import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { run } from "../presentation/index.ts";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

let workspace = "";
beforeEach(() => void (workspace = mkdtempSync(join(tmpdir(), "social-card-"))));
afterEach(() => rmSync(workspace, { recursive: true, force: true }));

function env(extra: Record<string, string> = {}): Record<string, string> {
  return {
    GITHUB_WORKSPACE: workspace,
    GITHUB_OUTPUT: join(workspace, "output.txt"),
    SOCIAL_CARD_NAME: "Acme",
    SOCIAL_CARD_DESCRIPTION: "Acme runs background jobs for your app.",
    SOCIAL_CARD_REPOSITORY: "me/acme",
    SOCIAL_CARD_PATH: "public/social.png",
    ...extra,
  };
}

/** The width and height from the IHDR chunk of a PNG. */
function pngSize(bytes: Buffer): { width: number; height: number } {
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe("run", () => {
  it("draws a PNG of 1200 by 630 at the path, and reports it as changed", async () => {
    const lines: string[] = [];
    writeFileSync(join(workspace, "output.txt"), "");
    const code = await run(env(), (line) => lines.push(line));
    assert.equal(code, 0, lines.join("\n"));
    const png = readFileSync(join(workspace, "public/social.png"));
    assert.deepEqual([...png.subarray(0, 8)], PNG_SIGNATURE);
    assert.deepEqual(pngSize(png), { width: 1200, height: 630 });
    assert.equal(
      readFileSync(join(workspace, "output.txt"), "utf8"),
      "path=public/social.png\nchanged=true\n",
    );
  });

  it("draws the same bytes twice, so the second run reports no change", async () => {
    writeFileSync(join(workspace, "output.txt"), "");
    await run(env(), () => {});
    writeFileSync(join(workspace, "output.txt"), "");
    await run(env(), () => {});
    assert.equal(
      readFileSync(join(workspace, "output.txt"), "utf8"),
      "path=public/social.png\nchanged=false\n",
    );
  });

  it("cuts a long name and a long description, and works with letters outside Latin", async () => {
    const code = await run(
      env({
        SOCIAL_CARD_NAME:
          "A very long name that goes on well past the point where it could ever fit on one line, 東京 Ελληνικά",
        SOCIAL_CARD_DESCRIPTION: "word ".repeat(400),
      }),
      () => {},
    );
    assert.equal(code, 0);
    assert.deepEqual(pngSize(readFileSync(join(workspace, "public/social.png"))), {
      width: 1200,
      height: 630,
    });
  });

  it("fails with an annotation and writes nothing for a path that leaves the repository", async () => {
    const lines: string[] = [];
    const code = await run(env({ SOCIAL_CARD_PATH: "../escape.png" }), (line) => lines.push(line));
    assert.equal(code, 1);
    assert.match(lines.join("\n"), /^::error title=social-card-action::.*leaves the repository/);
    assert.throws(() => readFileSync(join(workspace, "../escape.png")));
  });

  it("fails for a color that is not hex", async () => {
    const lines: string[] = [];
    assert.equal(await run(env({ SOCIAL_CARD_ACCENT: "blue" }), (line) => lines.push(line)), 1);
    assert.match(lines.join("\n"), /accent/);
  });

  it("works without GITHUB_OUTPUT", async () => {
    const rest = env();
    delete rest.GITHUB_OUTPUT;
    assert.equal(await run(rest, () => {}), 0);
  });
});

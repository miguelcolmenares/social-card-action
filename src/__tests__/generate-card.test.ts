import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateCard } from "@/application";
import type { CardRenderer, FileStore } from "@/application";
import { DEFAULT_COLORS } from "@/domain";

const request = {
  path: "public/social.png",
  card: { name: "Acme", description: "Jobs.", host: "acme.example", colors: DEFAULT_COLORS },
};

function memory(): FileStore & { files: Map<string, Uint8Array> } {
  const files = new Map<string, Uint8Array>();
  return {
    files,
    read: (path) => files.get(path),
    write: (path, bytes) => void files.set(path, bytes),
  };
}

const draws = (bytes: number[]): CardRenderer => ({ render: async () => Uint8Array.from(bytes) });

describe("generateCard", () => {
  it("writes the card and says it changed when the file is new", async () => {
    const files = memory();
    const result = await generateCard({ renderer: draws([1, 2, 3]), files }, request);
    assert.deepEqual(result, { path: "public/social.png", changed: true });
    assert.deepEqual([...(files.files.get("public/social.png") ?? [])], [1, 2, 3]);
  });

  it("leaves a file with the same bytes alone, and says it did not change", async () => {
    const files = memory();
    files.files.set("public/social.png", Uint8Array.from([1, 2, 3]));
    let writes = 0;
    const counting: FileStore = { ...files, read: files.read, write: () => void writes++ };
    const result = await generateCard({ renderer: draws([1, 2, 3]), files: counting }, request);
    assert.equal(result.changed, false);
    assert.equal(writes, 0);
  });

  it("replaces a file with other bytes", async () => {
    const files = memory();
    files.files.set("public/social.png", Uint8Array.from([9]));
    const result = await generateCard({ renderer: draws([1, 2, 3]), files }, request);
    assert.equal(result.changed, true);
    assert.deepEqual([...(files.files.get("public/social.png") ?? [])], [1, 2, 3]);
  });
});

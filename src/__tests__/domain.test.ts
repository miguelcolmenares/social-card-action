import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_COLORS,
  hostFrom,
  isHexColor,
  outputPathProblem,
  parseRequest,
  truncateAtWord,
} from "@/domain";

describe("truncateAtWord", () => {
  it("returns a text that fits, with its spaces collapsed", () => {
    assert.equal(truncateAtWord("  Background   jobs.\n Done. ", 100), "Background jobs. Done.");
  });

  it("cuts at a word and ends with an ellipsis, within the limit", () => {
    const cut = truncateAtWord("one two three four five six seven eight nine ten", 20);
    assert.equal(cut, "one two three four…");
    assert.ok(Array.from(cut).length <= 20);
  });

  it("cuts a single long word where it must, and keeps the limit", () => {
    assert.equal(truncateAtWord("a".repeat(50), 10), `${"a".repeat(9)}…`);
  });

  it("counts characters, not UTF-16 units", () => {
    const cut = truncateAtWord("ñandú ".repeat(10), 12);
    assert.ok(Array.from(cut).length <= 12);
    assert.ok(cut.endsWith("…"));
  });
});

describe("isHexColor", () => {
  for (const ok of ["#fff", "#4fc1ff", "#4FC1FF"]) {
    it(`accepts ${ok}`, () => assert.equal(isHexColor(ok), true));
  }
  for (const bad of ["fff", "#ffff", "#gggggg", "red", "rgb(0,0,0)", "#4fc1ff;"]) {
    it(`refuses ${bad}`, () => assert.equal(isHexColor(bad), false));
  }
});

describe("outputPathProblem", () => {
  for (const ok of [
    "public/social.png",
    "social.png",
    "site/public/social.PNG",
    ".github/social-preview.png",
  ]) {
    it(`accepts ${ok}`, () => assert.equal(outputPathProblem(ok), undefined));
  }
  for (const bad of [
    "",
    "public/",
    "/etc/social.png",
    "C:\\x\\social.png",
    "../social.png",
    "a/../../social.png",
    "social.jpg",
    "a.png\nchanged=true\n.png",
    "a\r.png",
    "a\u0000.png",
    "social",
  ]) {
    it(`refuses "${bad}", and says why`, () => assert.match(outputPathProblem(bad) ?? "", /\S/));
  }
});

describe("hostFrom", () => {
  it("is the host and path of the homepage", () => {
    assert.equal(
      hostFrom("https://miguelcolmenares.com/docs-sitekit/", "me/docs-sitekit"),
      "miguelcolmenares.com/docs-sitekit",
    );
    assert.equal(hostFrom("https://acme.example", "me/acme"), "acme.example");
  });

  it("is the repository when the homepage is empty, not an address, or not http", () => {
    for (const homepage of ["", "acme", "javascript:alert(1)", "ftp://acme.example"]) {
      assert.equal(hostFrom(homepage, "me/acme"), "github.com/me/acme");
    }
  });
});

describe("parseRequest", () => {
  const base = { name: "Acme", description: "Jobs.", repository: "me/acme" };

  it("fills the defaults: public/social.png, the dark colors and the host of the repository", () => {
    const parsed = parseRequest(base);
    assert.ok(parsed.ok);
    assert.equal(parsed.request.path, "public/social.png");
    assert.equal(parsed.request.card.host, "github.com/me/acme");
    assert.deepEqual(parsed.request.card.colors, DEFAULT_COLORS);
  });

  it("takes an empty input as left out", () => {
    const parsed = parseRequest({ ...base, path: "", host: " ", accent: "" });
    assert.ok(parsed.ok);
    assert.equal(parsed.request.path, "public/social.png");
    assert.equal(parsed.request.card.colors.accent, DEFAULT_COLORS.accent);
  });

  it("uses what the workflow sets", () => {
    const parsed = parseRequest({
      ...base,
      path: "a/b.png",
      host: "acme.example",
      accent: "#f00",
      homepage: "https://x.example",
    });
    assert.ok(parsed.ok);
    assert.equal(parsed.request.path, "a/b.png");
    assert.equal(parsed.request.card.host, "acme.example");
    assert.equal(parsed.request.card.colors.accent, "#f00");
  });

  it("refuses a missing name, a bad color and a bad path, naming the input", () => {
    for (const [env, pattern] of [
      [{ ...base, name: "" }, /name/],
      [{ ...base, accent: "blue" }, /accent/],
      [{ ...base, path: "../x.png" }, /leaves the repository/],
    ] as const) {
      const parsed = parseRequest(env);
      assert.equal(parsed.ok, false);
      if (!parsed.ok) assert.match(parsed.error, pattern);
    }
  });
});

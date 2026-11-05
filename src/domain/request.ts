import { DEFAULT_COLORS, isHexColor } from "./card.ts";
import type { CardColors, CardInput } from "./card.ts";

/** What the action was asked to do: draw this card and write it at `path`, relative to the workspace. */
export interface Request {
  path: string;
  card: CardInput;
}

/** A request that could be read, or the sentence that says what is wrong with it. */
export type ParsedRequest = { ok: true; request: Request } | { ok: false; error: string };

/** The inputs of the action as the workflow gave them. An empty string means the input was left out. */
export type RequestEnv = Readonly<Record<string, string | undefined>>;

const COLOR_INPUTS = ["background", "title", "text", "muted", "accent"] as const;

/**
 * Why a path cannot be written, or undefined when it can. The path stays inside the workspace and names a PNG file.
 *
 * @param path - The value of the `path` input.
 * @returns A sentence for the person who wrote the workflow, or undefined.
 */
export function outputPathProblem(path: string): string | undefined {
  // A line break would let the path write other lines into the outputs file and the log.
  if (Array.from(path).some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127))
    return "The path has a control character in it. Use a plain file name.";
  if (path === "" || path.endsWith("/"))
    return "The path is not a file. Name the file, such as public/social.png.";
  if (path.startsWith("/") || /^[a-z]:[\\/]/i.test(path) || path.startsWith("\\")) {
    return "The path is absolute. Use a path relative to the repository, such as public/social.png.";
  }
  if (path.split(/[\\/]/).some((part) => part === "..")) {
    return "The path leaves the repository. Use a path inside it, such as public/social.png.";
  }
  if (!/\.png$/i.test(path))
    return "The path is not a PNG. The card is written as a PNG, so the name ends in .png.";
  return undefined;
}

/**
 * The host shown at the foot of the card: the host and path of the homepage of the repository when it has one,
 * and `github.com/owner/repo` when it does not.
 *
 * @param homepage - The homepage of the repository, which may be empty.
 * @param repository - The `owner/repo` name of the repository.
 * @returns The text for the foot of the card.
 */
export function hostFrom(homepage: string, repository: string): string {
  try {
    const url = new URL(homepage);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return `${url.host}${url.pathname.replace(/\/$/, "")}`;
    }
  } catch {
    // Not an address: fall through to the repository.
  }
  return `github.com/${repository}`;
}

/**
 * Reads the inputs of the action into a request. The first problem found is returned as a sentence.
 *
 * @param env - The inputs, by the names the action passes them with (`path`, `name`, `description`, `host`, `homepage`, `repository` and the five colors).
 * @returns The request, or what is wrong.
 */
export function parseRequest(env: RequestEnv): ParsedRequest {
  const get = (key: string): string => (env[key] ?? "").trim();
  const path = get("path") || "public/social.png";
  const problem = outputPathProblem(path);
  if (problem) return { ok: false, error: problem };

  const name = get("name");
  if (name === "") {
    return {
      ok: false,
      error: "The card needs a name. Set the `name` input, or give the repository one.",
    };
  }
  const colors: CardColors = { ...DEFAULT_COLORS };
  for (const key of COLOR_INPUTS) {
    const value = get(key);
    if (value === "") continue;
    if (!isHexColor(value))
      return {
        ok: false,
        error: `The ${key} color is not a hex color such as #4fc1ff.`,
      };
    colors[key] = value;
  }
  const host = get("host") || hostFrom(get("homepage"), get("repository"));
  return {
    ok: true,
    request: { path, card: { name, description: get("description"), host, colors } },
  };
}

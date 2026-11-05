import type { Request } from "../domain/index.ts";
import type { CardRenderer, FileStore } from "./ports.ts";

/** What a run did: where the card is, and whether the file is new or different from the one that was there. */
export interface GenerateResult {
  path: string;
  changed: boolean;
}

/**
 * Draws the card and writes it at the path of the request. A file that already has the same bytes is left alone, so a
 * workflow that commits only on change makes no empty commits.
 *
 * @param deps - The renderer that draws the card and the files of the workspace it is written to.
 * @param request - The card and where it goes.
 * @returns The path and whether the file changed.
 */
export async function generateCard(
  deps: { renderer: CardRenderer; files: FileStore },
  request: Request,
): Promise<GenerateResult> {
  const png = await deps.renderer.render(request.card);
  const before = deps.files.read(request.path);
  if (before && Buffer.from(before).equals(Buffer.from(png)))
    return { path: request.path, changed: false };
  deps.files.write(request.path, png);
  return { path: request.path, changed: true };
}

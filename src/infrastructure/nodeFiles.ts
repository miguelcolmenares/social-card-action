import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { FileStore } from "../application/index.ts";

/**
 * The files under a root folder, which is the workspace of the job.
 *
 * @param root - The folder every path is relative to.
 * @returns A file store that reads and writes with `node:fs`.
 */
export function nodeFiles(root: string): FileStore {
  return {
    read(path) {
      try {
        return readFileSync(join(root, path));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
        throw error;
      }
    },
    write(path, bytes) {
      const target = join(root, path);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, bytes);
    },
  };
}

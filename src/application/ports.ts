import type { CardInput } from "@/domain";

/** Draws a card as the bytes of a PNG. */
export interface CardRenderer {
  render(input: CardInput): Promise<Uint8Array>;
}

/** The files of the workspace. Paths are relative to its root. */
export interface FileStore {
  /** The bytes of a file, or undefined when it does not exist. */
  read(path: string): Uint8Array | undefined;
  /** Writes a file, making the folders it needs. */
  write(path: string, bytes: Uint8Array): void;
}

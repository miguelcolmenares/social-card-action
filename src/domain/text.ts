/**
 * Shortens a text to at most `limit` characters for the card. The cut falls on a word boundary when there is one
 * in the second half of the text, and an ellipsis marks it. A text that fits is returned with its spaces collapsed.
 *
 * @param text - The text to shorten.
 * @param limit - The most characters the result may have, the ellipsis included.
 * @returns The text, or the text cut at a word and followed by an ellipsis.
 */
export function truncateAtWord(text: string, limit: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const characters = Array.from(clean);
  if (characters.length <= limit) return clean;
  const head = characters.slice(0, limit - 1).join("");
  const space = head.lastIndexOf(" ");
  const kept = space > (limit - 1) / 2 ? head.slice(0, space) : head;
  return `${kept.replace(/[\s.,;:!?-]+$/, "")}…`;
}

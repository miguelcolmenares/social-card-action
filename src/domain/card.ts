/** Width of the card in pixels. Every social network shows a card of this proportion large. */
export const CARD_WIDTH = 1200;

/** Height of the card in pixels, so the card is 1200 by 630. */
export const CARD_HEIGHT = 630;

/** Most characters of the description the card shows: about three lines at the size the card uses. */
export const DESCRIPTION_LIMIT = 150;

/** Most characters of the name the card shows, before it is cut with an ellipsis. */
export const NAME_LIMIT = 60;

/** The colors of the card. Each is a hex color such as `#4fc1ff`. */
export interface CardColors {
  /** The background of the card. */
  background: string;
  /** The color of the name. */
  title: string;
  /** The color of the description. */
  text: string;
  /** The color of the host at the foot of the card. */
  muted: string;
  /** The color of the bar and of the mark. */
  accent: string;
}

/** What the card says: the name and the description, the host at the foot, and its colors. */
export interface CardInput {
  name: string;
  description: string;
  /** The host shown at the foot, for example `user.github.io/project`. */
  host: string;
  colors: CardColors;
}

/** The colors of the dark theme of docs-sitekit, which the card uses unless the workflow sets its own. */
export const DEFAULT_COLORS: Readonly<CardColors> = {
  background: "#09090b",
  title: "#ffffff",
  text: "#a1a1aa",
  muted: "#87878d",
  accent: "#4fc1ff",
};

/**
 * Whether a text is a hex color of three or six digits, with the `#`.
 *
 * @param value - The text to test.
 * @returns True for `#abc` and `#aabbcc`, in any case.
 */
export function isHexColor(value: string): boolean {
  return /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value);
}

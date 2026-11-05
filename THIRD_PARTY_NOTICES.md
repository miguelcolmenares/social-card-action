# Third-party notices

social-card-action is MIT licensed. The action installs these packages from the public npm registry when it runs. They are not copied into
this repository, and each keeps its own license.

| Package                                                         | License | Used for                   |
| --------------------------------------------------------------- | ------- | -------------------------- |
| [Satori](https://github.com/vercel/satori)                      | MPL-2.0 | Laying out the card as SVG |
| [resvg](https://github.com/yisibl/resvg-js) (`@resvg/resvg-js`) | MPL-2.0 | Turning the SVG into a PNG |
| [Geist](https://vercel.com/font) via `@fontsource/geist`        | OFL-1.1 | The letters of the card    |

The cube at the foot of the card is the mark of docs-sitekit, by the same author.

Development and test only, never loaded by the action: ESLint, typescript-eslint, Prettier, TypeScript, Husky.

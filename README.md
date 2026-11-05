# social-card-action

A GitHub Action that draws the social card of a project: a 1200 by 630 PNG with the name, the description and the host, in the dark
style of [docs-sitekit](https://github.com/miguelcolmenares/docs-sitekit). It reads the repository, needs no image service and no
design tool, and writes the file where you say.

![A dark card with a blue bar, the name social-card-action in large white letters, its description in grey, and the address of the repository at the foot.](docs/example.png)

Use the picture for the link preview of a documentation site (`og:image`), or upload it as the social preview of the repository.

## Use

```yaml
- uses: actions/checkout@v7
- id: card
  uses: miguelcolmenares/social-card-action@v0.1.0
  with:
    path: public/social.png
```

With nothing else set, the name is the name of the repository, the description is its description, and the host at the foot is the
homepage of the repository, or `github.com/owner/repo` when it has none. Pin the action to a tag, or to the commit of the tag.

## Inputs

| Input                                            | Default                                                    | What it does                                                                                             |
| ------------------------------------------------ | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `path`                                           | `public/social.png`                                        | Where the PNG is written, relative to the repository. It stays inside the repository and ends in `.png`. |
| `name`                                           | the name of the repository                                 | The big text. Cut with an ellipsis after 60 characters.                                                  |
| `description`                                    | the description of the repository                          | The text under the name, cut at a word after about 150 characters, three lines at most.                  |
| `host`                                           | the homepage of the repository, or `github.com/owner/repo` | The text at the foot of the card.                                                                        |
| `background`, `title`, `text`, `muted`, `accent` | the dark colors of docs-sitekit                            | Hex colors such as `#4fc1ff`: the background, the name, the description, the host, and the bar and mark. |
| `node-version`                                   | `24`                                                       | The Node.js that runs the action. It needs 22.18 or newer.                                               |

## Outputs

| Output    | What it is                                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------------- |
| `path`    | The path of the card, relative to the repository.                                                          |
| `changed` | `true` when the file is new or different from the one that was there, `false` when the bytes are the same. |

The card is drawn the same way every time, so `changed` is `false` unless the text or the colors changed. A workflow that commits
only on change makes no empty commits.

## Keep the card up to date

The action writes the file and does not commit it, so you choose what happens to it. This workflow commits the card when you run it
by hand, and only if the picture changed, for example after you edit the description of the repository.

```yaml
name: Social card

on:
  workflow_dispatch:

permissions:
  contents: write

jobs:
  card:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - id: card
        uses: miguelcolmenares/social-card-action@v0.1.0
        with:
          path: site/public/social.png
      - if: steps.card.outputs.changed == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add site/public/social.png
          git commit -m "Update the social card"
          git push
```

A repository that protects `main` needs a pull request instead of the push: open one with the file that changed.

## With docs-sitekit

Draw the card into the `public/` folder of the site, and name it with `site.image` in `sitekit.config.json`:

```json
{ "site": { "image": "/social.png" } }
```

```yaml
- uses: miguelcolmenares/social-card-action@v0.1.0
  with:
    path: site/public/social.png
```

## The repository thumbnail

GitHub has no API to set the social preview of a repository. Draw the card to a path such as `.github/social-preview.png`, then
upload it once in **Settings → General → Social preview**.

## Limits

- The card uses the Latin letters of Geist. A character the font does not have is drawn as a box, so a name in another alphabet
  needs a picture of your own.
- A very long name or description is cut with an ellipsis, so the layout never leaves the picture.
- The action installs its own dependencies (`satori`, `@resvg/resvg-js` and Geist) in the job, about 40 MB, in a few seconds. They
  are never added to your repository or to your site.

## License

MIT. The third-party packages and fonts are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

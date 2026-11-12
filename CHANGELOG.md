# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **The README commits the card with npm-auto-build.** The hand-written `git commit` step is replaced by `mode: commit`, with `mode: pr` for a protected branch, and `paths: site/public/social.png`. The repository has the same flow in `.github/workflows/social-card.yml`, run by hand, which opens a pull request when the card of the repository changed. npm-auto-build has no v3 release yet, so both pin the commit of its `main` branch.

### Security

- **`minimatch` is 11.0.5 in the development dependencies.** Versions 7.0.0 to 11.0.0 allow a denial of service through glob parts amplification (GHSA-g3hv-75wg-m249, patched in 11.0.1). An `overrides` entry in `package.json` moves the 10.x and 9.x copies that `eslint`, `glob` and the test tooling pull in to 11.0.5. It is a development dependency only, so the shipped package does not change.

## [0.1.0] - 2026-11-05

### Added

- **A GitHub Action that draws the social card of a project.** A 1200 by 630 PNG with the name, the description and the host, in the
  dark style of docs-sitekit, written at `path` (`public/social.png` by default). The name, the description and the host default to
  those of the repository, and the five colors can be set. The output `changed` says whether the file is new or different, so a
  workflow commits only when there is something to commit. A path outside the repository, a path that is not a PNG and a color that
  is not hex fail the step with a message.
  The log never repeats the values of the inputs, and a path with a control character is refused, so a value with a line break cannot
  write workflow commands or extra lines of the outputs file.

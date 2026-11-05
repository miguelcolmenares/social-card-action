# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-11-05

### Added

- **A GitHub Action that draws the social card of a project.** A 1200 by 630 PNG with the name, the description and the host, in the
  dark style of docs-sitekit, written at `path` (`public/social.png` by default). The name, the description and the host default to
  those of the repository, and the five colors can be set. The output `changed` says whether the file is new or different, so a
  workflow commits only when there is something to commit. A path outside the repository, a path that is not a PNG and a color that
  is not hex fail the step with a message.
- **It is called "Social Card Action" in the Marketplace, and the repository is `social-card-action`.** The name `social-card` belongs to a
  GitHub account, and the Marketplace needs a name that no action, user or organization has.
- **The log never repeats the values of the inputs, and a path with a control character is refused.** A value with a line break could
  otherwise write workflow commands or extra lines of the outputs file. The messages name the input, not its value.

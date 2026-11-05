# Security policy

## Supported versions

The latest released version gets fixes. While the version is below 1.0, that means the latest minor.

## Reporting a vulnerability

Please do not open a public issue for a security problem.

Report it privately through GitHub: **Security → Report a vulnerability** on this repository. If that is not available to you,
write to me@miguelcolmenares.com with the version, what you found and how to reproduce it. You will get an answer within a week.

## What counts

- A value of an input that runs as a command, or reaches a shell.
- A way to make the action write outside the repository it runs in.
- A dependency vulnerability that the action loads when it runs.

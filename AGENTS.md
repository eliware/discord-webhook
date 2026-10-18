# AGENTS.md

## Project

Build `@eliware/discord-webhook` with Node.js 26 and native ESM.

## Scope and boundaries

Keep changes in this repository. Keep the public API and Discord payload limits.

## Layout

- Put runtime code in `src/`.
- Put tests in `tests/` and mirror source file names.
- Put user guides in `docs/`.

## Development

Use native Node.js APIs. Keep TypeScript declarations in sync with the public API.

## Validation

- Run `npm test`.
- Run `npm run lint`.
- Run `npm run audit`.
- Run `npm run format`.
- Run `npm run format:check`.
- Run `npm run typecheck`.
- Run `npm run pack`.

## Security

Keep webhook URLs and tokens secret. Do not add credentials to code, logs, or docs.

## Changes

Do not publish or deploy without user authorization.

## Library

Export the public API from `src/index.mjs`. Keep its type declarations in `src/index.d.ts`.

Run focused tests first during development.
Run one test file with `npm test -- tests/path/to/example.test.mjs`.
Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.
Prevent repeated full-suite runs during development.
Run the full `npm test` suite for final validation before a commit, milestone, or release.

## npm publication

Keep package files and metadata correct. Run `npm run pack` before publication.

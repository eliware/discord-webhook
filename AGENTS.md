# AGENTS.md

## Project

Build `@eliware/discord-webhook` with Node.js 26 and native ESM.

## Scope and boundaries

Keep changes within this repository. Keep the public API and Discord payload limits.

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
- Run `npm run format` and `npm run format:check`.
- Run `npm run typecheck` and `npm run pack`.

## Security

Keep webhook URLs and tokens secret. Do not add credentials to code, logs, or docs.

## Changes

Do not publish or deploy without user authorization.

## Library

Export the public API from `src/index.mjs`. Keep its type declarations in `src/index.d.ts`.

## npm publication

Keep package files and metadata correct. Run `npm run pack` before publication.

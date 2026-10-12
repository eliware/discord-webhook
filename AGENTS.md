# AGENTS.md

## Project

Build a Discord webhook library with Node.js 26 and native ESM.

## Scope and boundaries

This repository owns the webhook library and its public package. Keep credentials out of source files and logs.

## Layout

Keep runtime modules and declarations under `src/`. Mirror each runtime module with one test under `tests/`.
Keep user guides under `docs/`, examples under `examples/`, and specifications under `specs/`.

## Development

Use Node.js 26 and npm 12 or newer. Keep each source and test module focused. Preserve the public API and Discord limits.

## Validation

Run `npm test` for aggregate validation.
Run `npm run lint` for lint checks.
Run `npm run audit` for dependency audit checks.
Run `npm run format` to format files.
Run `npm run format:check` to check file format.
Run `npm run pack` to check package contents.
Run `npm run typecheck` to check TypeScript declarations.

## Security

Protect webhook URLs as credentials. Use placeholders in examples. Do not commit real URLs or tokens.

## Changes

Keep docs, examples, tests, and specifications aligned with the public API. Do not deploy or publish without release authorization.

## Library

Keep the package ESM-only. Export only supported API items from `src/index.mjs`.

## npm publication

Keep the package public. Use the shared package check before publication. Follow the approved release process.

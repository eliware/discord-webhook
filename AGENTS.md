# AGENTS.md

## Project

`@eliware/discord-webhook` is an ESM Discord webhook sender with payload validation, rate-limit retries, timeout, cancellation, threads, and optional wait responses.

## API and security

- Preserve `sendMessage()` options and TypeScript declarations.
- Keep fetch injection and AbortSignal cancellation testable.
- Never log or commit webhook URLs, tokens, or sensitive payloads.
- Preserve Discord payload-size validation and bounded retry behavior.

## Validation

Run `npm test`, `npm run test:gaps`, `npm run lint`, `npm run typecheck`, and `npm run pack`. Maintain 100% coverage without Istanbul ignore directives.

## Changes

Update README and examples with API changes. Do not bump versions, tag, publish, or push unless explicitly requested.

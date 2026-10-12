# Release Notes

## 12.0.0 — 2026-10-12

### Added

- Add repository metadata with ID `E-201`.
- Add end user guides for setup, API options, payload limits, security, and common errors.
- Add examples, specifications, and shared CI and publish workflows.
- Split request transport, response handling, and retry coordination into focused modules.

### Changed

- Move runtime code and type declarations into `src/`.
- Use canonical package metadata, scripts, and Prettier settings.
- Use the shared `@eliware/test` v12 harness.
- Keep the existing API, retry rules, cancellation, and payload checks.
- Rewrite repository guidance and user docs in clear, direct English.
- Set the knit checkout path to `/eliware/discord-webhook`.
- Include docs, examples, specifications, and repository guidance in the package.
- Set the license copyright year to 2026.

### Fixed

- Reject webhook URLs that do not use HTTP or HTTPS.
- Remove abort listeners after retry waits.
- Reject arrays where Discord expects embed fields.
- Stop response body reads when the caller aborts.

## 2.0.0 — 2026-08-25

### Changed

- Use the shared `@eliware/test` harness for tests and lint checks.
- Require Node.js 26 and keep the package ESM-only.
- Run CI on Ubuntu and Windows. Publish only from version tags.

## 1.1.8 — 2026-08-07

### Changed

- Align repository layout, scripts, docs, release notes, and package contents with Eliware library conventions.
- Use native Node.js `fetch` and remove the `node-fetch` runtime dependency.

### Added

- Add TypeScript declaration checks and a runnable example.

## 1.1.7 — 2026-08-07

### Fixed

- Report only incomplete coverage rows as coverage gaps.

## 1.1.6 — 2026-08-06

### Added

- Export `DISCORD_LIMITS` and `validateWebhookBody()`.
- Check Discord message, embed, field, and text limits before each request.

## 1.1.5 — 2026-08-06

### Added

- Add request time limits, caller cancellation, thread options, and `wait` responses.
- Add bounded rate limit retries and detailed HTTP errors.

## 1.1.4 — 2026-08-06

### Added

- Add workflow dispatch, retry and time limit checks, caller cancellation, and response details.

## 1.1.3 — 2026-08-06

### Changed

- Add the standard lint command and Node.js 26 workflow.

## 1.1.2 — 2026-08-06

### Changed

- Standardize the Node.js CI workflow and Jest coverage commands.

## 1.1.1 — 2025-12-09

### Added

- Add the first documented release.

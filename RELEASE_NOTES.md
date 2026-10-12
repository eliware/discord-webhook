# Release Notes

## 12.0.0 — 2026-10-12

### Changed

- Align package metadata, source layout, documentation, and workflows with shared conventions.
- Preserve the webhook API, rate-limit retries, cancellation, and payload checks.

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

- Add request timeouts, caller cancellation, thread targeting, and `wait` responses.
- Add bounded retries for rate limits and detailed HTTP errors.

## 1.1.4 — 2026-08-06

### Added

- Add workflow dispatch, retry and timeout checks, caller cancellation, and response details.

## 1.1.3 — 2026-08-06

### Changed

- Add the standard lint command and Node.js 26 workflow.

## 1.1.2 — 2026-08-06

### Changed

- Standardize the Node.js CI workflow and Jest coverage commands.

## 1.1.1 — 2025-12-09

### Added

- Add the first documented release.

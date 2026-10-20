# Release Notes

## 13.0.0 — 2026-10-17

### Added

- Retry HTTP 429 responses after Discord's interval, with no more than `maxRetries` retries.
- Set a timeout for each request and cancel requests or retry waits with an `AbortSignal`.
- Validate message content, embed, and field shapes and text limits before each request.
- Set `threadId` to target an existing forum or media channel discussion.
- Set `threadName` to create a forum or media channel discussion.

### Changed

- Update package metadata and validation for Convention v13.
- Group webhook transport modules under `src/webhook/` and matching test paths.
- Convention v13 defines the repository rules.
- Use the canonical npm publication workflow.
- Use the complete Discord webhook route in `.env.example`.
- Change the retry limit error text.

## 12.0.0 — 2026-10-12

### Added

- Add repository metadata with ID `E-201`.
- Add end user guides for setup, API options, payload limits, and common errors.
- Add examples, specifications, and shared CI and publish workflows.
- Split request transport, response handling, and retry coordination into focused modules.

### Changed

- Move runtime code and type declarations into `src/`.
- Use canonical package metadata, scripts, and Prettier settings.
- Use the shared `@eliware/test` v12 harness.
- Keep the existing API, retry rules, cancellation, and payload checks.
- Rewrite repository guidance and user docs in direct English.
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

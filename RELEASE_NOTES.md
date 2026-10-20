# Release Notes

## 13.0.0 — 2026-10-19

### Added

- Reject empty message bodies before a network request.
- Validate content types, embed and field shapes, and Discord text limits before each request.
- Check combined embed text across the full message.
- Retry only HTTP 429 responses, with `maxRetries` retries at most.
- Document setup, options, payload checks, rate limits, timeouts, cancellation, and common errors.
- Add a runnable example for the current package version.

### Changed

- Move `threadName` into the JSON body as `thread_name`. Keep `threadId` in the `thread_id` query value.
- Honor Discord's full rate-limit interval when it exceeds `timeoutMs`.
- Keep request timeouts active while the package reads rate-limit and HTTP error bodies.
- Return `Rate limit retry count exceeded.` when the package reaches the retry limit.
- Set the package and specification version to 13.0.0 and use `@eliware/test` v13.
- Group request, response, and transport code under `src/webhook/` with matching tests.
- Use the canonical npm workflow. Validate version tags before publication and publish with provenance.
- Use checkout v7 and full Git history in validation workflows.
- Use `git pull` in the Knit deployment workflow.
- Use the complete Discord webhook route in `.env.example`.
- Align repository guidance, the README, user guides, and example with the current package behavior.

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

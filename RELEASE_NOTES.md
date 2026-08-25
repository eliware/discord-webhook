# Release Notes

## 2.0.0 — August 25, 2026

- Adopted the shared `@eliware/test` harness for testing and linting with strict
  100×4 coverage and removed direct Jest/Oxlint dependencies.
- Updated package metadata with Node.js `>=26` support, public publishing
  configuration, and the release-notes package allowlist.
- Modernized CI validation for Ubuntu and Windows, added production dependency
  auditing, and separated validation from tag-only publishing.
- Breaking: the standard `test` and `lint` scripts now delegate to
  `@eliware/test`; the package remains ESM-only.
- Verification: local and exact-HEAD Ubuntu/Windows CI passed; `tagit preflight`
  passed with 100×4 coverage, zero-warning lint, audit, and package validation.

## 1.1.8 — August 7, 2026

- Aligned repository layout, scripts, CI, documentation, release notes, and package contents with Eliware library conventions.
- Added TypeScript declaration checking and standardized package validation.
- Moved tests under `tests/` and included a runnable `examples/` file in the package.
- Switched to Node.js 26 native `fetch`, removing the `node-fetch` runtime dependency.
- Verification: tests, coverage, gap checks, lint, typecheck, smoke test, and package dry-run pass.

## 1.1.7 — August 7, 2026

- Fixed coverage-gap filtering so only genuinely incomplete coverage rows are reported.
- Verification: tests, coverage, gap checks, lint, typecheck, and package dry-run pass.

## 1.1.6 — August 6, 2026

- Added preflight validation for Discord webhook payload limits before network requests.
- Rejects oversized message content, embeds, fields, titles, descriptions, footers, authors, and aggregate embed text.
- Exported `DISCORD_LIMITS` and `validateWebhookBody()`.
- Updated README documentation for validation, timeouts, cancellation, thread targeting, and `wait` responses.
- Expanded TypeScript definitions and validation tests.
- Verification: tests pass with 100% coverage.

## 1.1.5 — August 6, 2026

- Added complete coverage for timeout, cancellation, retry, and HTTP error paths.
- Improved webhook delivery validation and bounded rate-limit retries.
- Added request timeout, `AbortSignal`, `wait`, `thread_id`, and `thread_name` support.
- Expanded TypeScript definitions.
- Verification: tests pass with 100% coverage; lint passes.

## 1.1.4 — August 6, 2026

- Added manual GitHub Actions workflow dispatch support.
- Added retry and timeout validation with bounded rate-limit retries.
- Added request cancellation and detailed Discord response errors.
- Expanded webhook options and TypeScript definitions.
- Expanded automated coverage.

## 1.1.3 — August 6, 2026

- Added the standardized Oxlint command.
- Updated package metadata and lockfiles for the Node.js 26 workflow conventions.

## 1.1.2 — August 6, 2026

- Standardized the Node.js 26 CI workflow.
- Normalized Jest coverage and gap-testing scripts.
- Added AgentX artifact ignore rules.
- Updated dependencies and lockfiles.

## 1.1.1 — December 9, 2025

- Initial documented release.

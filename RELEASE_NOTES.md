# Release Notes

## 1.1.2 — Current changes

- Standardized Node.js 26 CI workflow.
- Normalized Jest coverage and gap-testing scripts.
- Added AgentX artifact ignore rules.
- Updated dependencies and lockfiles.

## Version history

- `1.1.1` — Version 1.1.1 - 12-09-2025.


## 1.1.3

- Added the standardized Oxlint command.
- Updated package metadata and lockfiles for the latest maintenance pass.
- Synchronized the package with the current Eliware Node.js 26 workflow conventions.

## 1.1.4

- Added manual GitHub Actions workflow dispatch support.
- Added retry and timeout validation with bounded rate-limit retries.
- Added request cancellation through `AbortSignal`.
- Added detailed errors for failed Discord responses.
- Added webhook options for `wait`, `thread_id`, and `thread_name`.
- Expanded TypeScript definitions for Discord messages and embeds.
- Expanded automated coverage for delivery, retry, validation, and error paths.

## 1.1.5

- Added complete coverage for timeout, cancellation, retry, and HTTP error paths.
- Improved webhook delivery validation and bounded rate-limit retries.
- Added request timeout and `AbortSignal` cancellation support.
- Added `wait`, `thread_id`, and `thread_name` webhook options.
- Expanded TypeScript definitions for Discord messages and embeds.
- Confirmed clean linting and 100% test coverage across all metrics.

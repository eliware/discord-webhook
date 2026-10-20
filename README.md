# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/discord-webhook [![npm](https://img.shields.io/npm/v/@eliware/discord-webhook)](https://www.npmjs.com/package/@eliware/discord-webhook) [![License](https://img.shields.io/github/license/eliware/discord-webhook)](https://github.com/eliware/discord-webhook/blob/main/LICENSE) [![CI](https://github.com/eliware/discord-webhook/actions/workflows/ci.yaml/badge.svg)](https://github.com/eliware/discord-webhook/actions/workflows/ci.yaml)

A simple, promise-based Discord webhook sender for Node.js with built-in rate limit handling.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Setup](#setup)
- [Usage](#usage)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [API](#api)
- [Packaging](#packaging)
- [Examples](#examples)
- [Support](#support)
- [Links](#links)
- [License](#license)

## Features

- Send JSON messages through Discord webhooks.
- Retry HTTP 429 responses.
- Check message limits before each request.

## Requirements

Use Node.js 26 or later. The package uses native ESM.

## Setup

Run `npm install @eliware/discord-webhook`. Set `DISCORD_WEBHOOK` or pass the URL with `url`.

## Usage

Read the [usage guide](docs/usage.md) for setup and API options. Read [release notes](RELEASE_NOTES.md) for changes.

## Development

Read [specifications](specs/README.md) for repository requirements.

## Testing

Run `npm test` for aggregate validation.

## Troubleshooting

Read the [troubleshooting guide](docs/troubleshooting.md).

## Security

Keep webhook URLs and tokens private.

## API

The package exports `sendMessage`, `validateWebhookBody`, and `DISCORD_LIMITS` from `src/index.mjs`.
TypeScript declarations are in `src/index.d.ts`. Read the [documentation index](docs/README.md) and [usage guide](docs/usage.md) for API details.

## Packaging

The npm package includes these paths:

- `src/`
- `docs/`
- `README.md`
- `AGENTS.md`
- `LICENSE`
- `RELEASE_NOTES.md`
- `examples/`
- `specs/`
- `.env.example`

Use numeric `MAJOR.MINOR.PATCH` versions and matching `v<version>` tags.
The npm workflow tests a matching tag and publishes with provenance.
Eli approves each release candidate. Operations hands an approved candidate to DevOps for publication.
Run `npm run pack` to check package contents.

## Examples

Read the [examples index](examples/README.md) for prerequisites and the run command.

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)[![eliware.org](https://eliware.org/logos/eliware_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## Links

- [Home Page](https://eliware.org)
- [GitHub Org](https://github.com/eliware)
- [GitHub Repo](https://github.com/eliware/discord-webhook)
- [Bug Reports](https://github.com/eliware/discord-webhook/issues)
- [npm](https://www.npmjs.com/package/@eliware/discord-webhook)
- [Discord](https://discord.gg/M6aTR9eTwN)

## License

[MIT © Eliware](LICENSE)

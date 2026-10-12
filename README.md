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

- Send Discord webhook messages as JSON.
- Retry rate limit responses.
- Check message and embed limits before each request.

## Requirements

Use Node.js 26 or later. This package uses native ESM.

## Setup

Run `npm install @eliware/discord-webhook`. Set `DISCORD_WEBHOOK` to your private webhook URL.

## Usage

Read the [usage guide](docs/usage.md) for setup, options, limits, and errors. Read [release notes](RELEASE_NOTES.md) for changes.

## Development

Read [AGENTS.md](AGENTS.md) before you change this repository.

## Testing

Run `npm test`.

## Troubleshooting

Read the [troubleshooting guide](docs/troubleshooting.md).

## Security

Keep webhook URLs private. Do not commit URLs or print them in logs.

## API

Read the [documentation index](docs/README.md) and [usage guide](docs/usage.md) for API details. Read [specifications](specs/README.md) for package requirements.

## Packaging

Run `npm run pack` to check package contents.

## Examples

Read the [examples index](examples/README.md).

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

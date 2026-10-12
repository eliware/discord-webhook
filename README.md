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

- Send a JSON message to a Discord webhook.
- Retry HTTP 429 responses up to the set retry count.
- Check Discord message and embed limits before each request.
- Set a request timeout or pass an `AbortSignal`.
- Send a message to a thread or request its response.

## Requirements

- Node.js 26 or newer.
- Native ESM support and the built-in `fetch` function.

## Setup

Install the package:

```bash
npm install @eliware/discord-webhook
```

Set `DISCORD_WEBHOOK` or pass the webhook URL to `sendMessage`. Use only a placeholder URL in configuration files.

## Usage

```js
import { sendMessage } from "@eliware/discord-webhook";

const response = await sendMessage({
  body: { content: "Hello from Node.js!" },
  url: process.env.DISCORD_WEBHOOK,
});

if (!response.ok) {
  throw new Error(`Discord returned HTTP ${response.status}`);
}
```

See [usage details](docs/usage.md) and [release notes](RELEASE_NOTES.md).

## Development

Use Node.js 26 or newer. Run commands from the repository root.

## Testing

Run the aggregate checks:

```bash
npm test
npm run lint
npm run format:check
npm run audit
npm run typecheck
npm run pack
```

## Troubleshooting

Check the webhook URL and its permissions. Read the [troubleshooting guide](docs/troubleshooting.md) for error details.

## Security

Treat webhook URLs as credentials. Store them in a secret store or in `DISCORD_WEBHOOK`. Do not commit real URLs or log credentials.

## API

`sendMessage` accepts a message body and these optional settings:

- `url`: webhook URL. Defaults to `DISCORD_WEBHOOK`.
- `maxRetries`: retry count for HTTP 429 responses. Defaults to `3`. The maximum is `10`.
- `fetchFn`: request function. Defaults to the built-in `fetch` function.
- `timeoutMs`: request timeout in milliseconds. Defaults to `30000`.
- `signal`: `AbortSignal` for caller cancellation.
- `wait`: request the created message in the response.
- `threadId` and `threadName`: select a Discord thread.

The call returns the `Response` from `fetch`. It throws an `Error` for invalid input, failed requests, timeouts, cancellation, or exhausted retries.

`validateWebhookBody(body)` checks Discord limits before a request. `DISCORD_LIMITS` exports the supported limits.

## Packaging

The package includes runtime modules, TypeScript declarations, documentation, examples, and specifications. Run `npm run pack` to check package contents.

Read the [specification index](specs/README.md), [documentation index](docs/README.md), and [example index](examples/README.md).

## Examples

Use the [basic example](examples/example.mjs). It uses placeholder credentials and a message body.

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

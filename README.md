# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/discord-webhook [![npm version](https://img.shields.io/npm/v/@eliware/discord-webhook.svg)](https://www.npmjs.com/package/@eliware/discord-webhook)[![license](https://img.shields.io/github/license/eliware/discord-webhook.svg)](LICENSE)[![build status](https://github.com/eliware/discord-webhook/actions/workflows/nodejs.yml/badge.svg)](https://github.com/eliware/discord-webhook/actions)

> A simple, promise-based Discord webhook sender for Node.js with built-in rate limit handling.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [TypeScript](#typescript)
- [License](#license)

## Features

- Send messages to Discord webhooks with a single function
- Handles Discord rate limits automatically (HTTP 429)
- ESM-first, TypeScript types included
- Customizable fetch for testing/mocking
- Supports default webhook URL from `process.env.DISCORD_WEBHOOK`
- Validates Discord payload size limits before making a request
- Supports request timeouts, cancellation, threads, and `wait` responses

## Installation

```bash
npm install @eliware/discord-webhook
```

## Usage

### ESM Example

```js
import { sendMessage } from '@eliware/discord-webhook';

const webhookUrl = 'https://discord.com/api/webhooks/your-webhook-id/your-webhook-token';
const messageBody = { content: 'Hello from discord-webhook!' };

(async () => {
  try {
    const response = await sendMessage({ url: webhookUrl, body: messageBody });
    if (response.ok) {
      console.log('Message sent successfully!');
    } else {
      console.error('Failed to send message:', response.status, await response.text());
    }
  } catch (err) {
    console.error('Error sending message:', err);
  }
})();
```

## API

### sendMessage({ body, url = process.env.DISCORD_WEBHOOK, maxRetries = 3, fetchFn = fetch, timeoutMs, signal, wait, threadId, threadName })

Sends a message to a Discord webhook URL, handling rate limits with automatic retry.

**Parameters:**

- `body` (object): The JSON body to send (e.g., `{ content: 'Hello!' }`).
- `url` (string, optional): The Discord webhook URL. Defaults to `process.env.DISCORD_WEBHOOK`.
- `maxRetries` (number, optional): Maximum number of retries on rate limit (default: 3).
- `fetchFn` (function, optional): Custom fetch function for testing/mocking (default: `fetch`).
- `timeoutMs` (number, optional): Request timeout in milliseconds.
- `signal` (AbortSignal, optional): Cancels an in-flight request.
- `wait` (boolean, optional): Requests the created Discord message response.
- `threadId` / `threadName` (string, optional): Sends to a Discord thread.

**Returns:**

- `Promise<Response>`: The fetch response.

**Throws:**

- Error if the URL or body is invalid.
- Error if content or embed fields exceed Discord limits; validation happens before `fetch`.
- Error if max retries are exceeded due to rate limiting.

## Payload limits

The library rejects payloads that Discord will refuse, including content over 2,000 characters, more than 10 embeds, more than 25 fields per embed, and embed text over 6,000 characters. It also validates title, description, field, footer, and author limits.

## TypeScript

Type definitions are included:

```ts
export declare function sendMessage(params?: {
  body: object;
  url?: string;
  maxRetries?: number;
  fetchFn?: typeof fetch;
}): Promise<Response>;
```

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)[![eliware.org](https://eliware.org/logos/eliware_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## License

[MIT © 2025 Eli Sterling, eliware.org](LICENSE)

## Links

- [Home Page](https://eliware.org)
- [GitHub](https://github.com/eliware/discord-webhook)
- [npm](https://www.npmjs.com/package/@eliware/discord-webhook)
- [Discord](https://discord.gg/M6aTR9eTwN)

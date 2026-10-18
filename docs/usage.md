# Usage

## Requirements

Use Node.js 26 or later. This package uses native ESM and the built-in `fetch` API.

## Install

Run `npm install @eliware/discord-webhook` in your project.

Set `DISCORD_WEBHOOK` to your Discord webhook URL. Keep this URL secret. You can also pass the URL with the `url` option.

## Send a message

```js
import { sendMessage } from "@eliware/discord-webhook";

const response = await sendMessage({
  url: process.env.DISCORD_WEBHOOK,
  body: { content: "Hello from Node.js" },
});

if (!response.ok) {
  throw new Error(`Request failed: ${response.status}`);
}
```

`sendMessage` returns the native `Response` object when the request succeeds. The request sends JSON with the `Content-Type: application/json` header.

## Options

Pass one object to `sendMessage`.

| Option       | Default            | Description                                                         |
| ------------ | ------------------ | ------------------------------------------------------------------- |
| `body`       | Required           | Discord webhook message object.                                     |
| `url`        | `DISCORD_WEBHOOK`  | Discord webhook URL.                                                |
| `maxRetries` | `3`                | Retry count for HTTP 429 responses. Use an integer from 0 to 10.    |
| `fetchFn`    | `globalThis.fetch` | Fetch function for the request.                                     |
| `timeoutMs`  | `30000`            | Time limit in milliseconds for each request. Use a positive number. |
| `signal`     | None               | `AbortSignal` that can cancel the request.                          |
| `wait`       | None               | Set Discord's `wait` query value to `true` or `false`.              |
| `threadId`   | None               | Add the Discord `thread_id` query value.                            |
| `threadName` | None               | Add the Discord `thread_name` query value.                          |

The `wait`, `threadId`, and `threadName` values become URL query values. The package sends JSON only. It does not send file uploads.

## Payload limits

`validateWebhookBody(body)` checks these Discord limits before a request. It returns `true` when the payload passes.

| Message field             |          Maximum |
| ------------------------- | ---------------: |
| Message content           | 2,000 characters |
| Embeds for each message   |               10 |
| Embed title               |   256 characters |
| Embed description         | 4,096 characters |
| Embed footer text         | 2,048 characters |
| Embed author name         |   256 characters |
| Fields for each embed     |               25 |
| Field name                |   256 characters |
| Field value               | 1,024 characters |
| Total text for each embed | 6,000 characters |

The validator checks embed objects and field objects. It checks string values for the listed text limits.

## Retries and errors

The package retries HTTP 429 responses no more than `maxRetries` times. It reads the `retry-after` response header as seconds. It caps each wait at `timeoutMs`.

If the header is missing or invalid, the package waits one second. After the last retry, the package throws `Rate limit retry count exceeded.`

For other failed HTTP responses, the package throws an error with the status code and response text, when available. A request timeout throws `Webhook request timed out.` A pre-aborted signal throws `Webhook request aborted.`

## Security

Store the webhook URL in an environment variable or a secret store. Do not put it in source files, commits, logs, or support messages.

# Usage

## Requirements

Use Node.js 26 or later. The package uses ECMAScript modules and the built-in `fetch` API.
The package includes TypeScript declarations.

## Install and configure

Run this command in your project:

```sh
npm install @eliware/discord-webhook
```

Set `DISCORD_WEBHOOK` in the shell or runtime that starts your Node.js application.
The package reads this variable when `sendMessage` does not receive a `url` option.
The package does not read `.env` files. Use your runtime or a separate environment-file package to load them.

## Send a message

Import `sendMessage` and pass a Discord message object as `body`:

```js
import { sendMessage } from "@eliware/discord-webhook";

const response = await sendMessage({
  body: {
    content: "Deployment completed.",
    embeds: [{ title: "Build", description: "All checks passed." }],
    allowed_mentions: { parse: [] },
  },
  wait: true,
});

const message = await response.json();
console.log(message.id);
```

Discord returns the created message when `wait` is `true`.
Discord returns an empty `204` response when `wait` is `false`.
The default value is `false`. The function returns the native `Response` object for each `2xx` response.

The function rejects with an `Error` when local validation fails, the request fails, or Discord returns an HTTP error.
Catch the error when the application must show a failure message.

## Options

Pass one object to `sendMessage`.

| Option       | Default            | Description                                                            |
| ------------ | ------------------ | ---------------------------------------------------------------------- |
| `body`       | Required           | Discord message data.                                                  |
| `url`        | `DISCORD_WEBHOOK`  | Absolute webhook URL with the `http:` or `https:` scheme.              |
| `maxRetries` | `3`                | Number of retries for HTTP 429 responses. Use an integer from 0 to 10. |
| `fetchFn`    | `globalThis.fetch` | Fetch-compatible function for the request.                             |
| `timeoutMs`  | `30000`            | Time limit in milliseconds for each request. Use a positive number.    |
| `signal`     | None               | `AbortSignal` that can cancel a request or retry wait.                 |
| `wait`       | `false`            | Ask Discord to return the created message.                             |
| `threadId`   | None               | Send the message to a `thread` by its ID.                              |
| `threadName` | None               | Create a `thread` with this name in a forum or media channel.          |

The `wait` and `threadId` options become URL query values. The `threadName` option becomes the `thread_name` JSON field.
Discord requires `thread_id` or `thread_name` when a webhook posts in a forum or media channel.
Discord creates a `thread` when the request uses `threadName`.
Discord sends a message to an existing `thread` when the request uses `threadId`.

The package sends JSON. It does not upload files. Do not use `files` to upload binary data.
Discord validates the message fields that this package does not check.

## Payload checks

Call `validateWebhookBody(body)` to run the same local checks that `sendMessage` runs before each request.
The function returns `true` when the checks pass. It throws an `Error` when a checked limit or object shape fails.

| Message field                |          Maximum |
| ---------------------------- | ---------------: |
| Message content              | 2,000 characters |
| Embeds for each message      |               10 |
| Embed title                  |   256 characters |
| Embed description            | 4,096 characters |
| Embed footer text            | 2,048 characters |
| Embed author name            |   256 characters |
| Fields for each embed        |               25 |
| Field name                   |   256 characters |
| Field value                  | 1,024 characters |
| Combined text for all embeds | 6,000 characters |

The local check counts JavaScript string length. It does not remove spaces at the start or end.
Discord removes leading and trailing whitespace when it checks embed text limits.

The local check requires a string for `content` when you include it.
It requires arrays for `embeds` and `fields` when you include them.
It checks embed and field object shapes, listed text limits, and supported string values.
It does not validate every Discord field.
The body must include non-empty `content`, a non-empty `embeds` array, a non-empty `components` array, or a `poll` object.

`DISCORD_LIMITS` exports a frozen object with the supported limit values.

## Retries, timeouts, and errors

The package retries HTTP 429 rate-limit responses a maximum of `maxRetries` times.
The first request does not count as a retry. The package does not retry other HTTP errors.
The package reads the `Retry-After` response header in seconds.
If that value is missing or invalid, the package reads `retry_after` from the response body.

The package waits for the full interval that Discord provides.
The request timeout does not limit the retry wait.
If both retry values are missing or invalid, the package waits one second.
After the final rate-limit response, the package throws `Rate limit retry count exceeded.`

The timeout applies to each network request. It does not include time spent waiting between retries.
The package throws `Webhook request timed out.` when the timeout ends the request.
The package throws `Webhook request aborted.` when the caller cancels before or during a request.
The package includes the HTTP status and response text in errors for other HTTP errors, when available.
Network errors from `fetch` can also reject the request.

## Security

Keep the webhook URL secret because it contains a private token.
Store the URL in an environment variable or secret store. Do not put it in source files, commits, logs, or support messages.

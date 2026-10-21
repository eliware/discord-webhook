# Troubleshooting

## The package does not install

Check that Node.js 26 or later is active. Run `node --version` to check the version.
Then run `npm install @eliware/discord-webhook` in your project directory.

## The import fails

Use Node.js 26 or later and import the package from an ECMAScript module.
Use a `.mjs` file or set `"type": "module"` in your `package.json`.

## The webhook URL error appears

Set `DISCORD_WEBHOOK` before the application starts, or pass the URL with the `url` option.
Use an absolute URL with the `https:` scheme for Discord webhooks.
Check that the URL contains the correct webhook ID and token. Keep the URL secret.

## The local body check fails

Pass a message object as the `body` option. Do not pass a string, `null`, or an array.
Check the content and embed limits in the [usage guide](usage.md).
The local check does not validate every Discord field. Read the HTTP error when Discord rejects a field that the package does not check.

## Discord returns an HTTP error

The error includes the HTTP status and response text when Discord provides them.
Check the webhook URL, channel access, and message fields.
Discord does not retry most HTTP errors. Fix the cause before you send the message again.

## Discord reports a rate limit

The package retries HTTP 429 responses a maximum of `maxRetries` times. The default is 3 retries.
The package waits for the full interval in Discord's response. A retry wait can last longer than `timeoutMs`.
After the final rate-limit response, the package throws `Rate limit retry count exceeded.`
Set `maxRetries` from 0 to 10 to set the retry count.

## The request times out

Set a larger positive `timeoutMs` value. This limit applies to each network request.
The timeout does not include time spent waiting between rate-limit retries.
Check network access and Discord access if the request continues to time out.

## The request stops after cancellation

If the signal has aborted, create a new `AbortController` before you call `sendMessage`.
Call `abort()` when the request must stop.
The package throws `Webhook request aborted.` when the signal cancels a request or retry wait.

## The response has no message body

Discord returns an empty `204` response when `wait` is `false`, which is the default.
Set `wait: true` when the application needs Discord to include the created message in the response body.
Call `response.json()` to read the message from the returned `Response` object.

## A custom fetch function fails

Pass a function that accepts the standard `fetch` URL and options arguments.
Make sure the function respects the supplied `AbortSignal` and returns a response object with `status` and `text()` behavior for errors.
The package uses `ok` when the response provides it. The package reads `headers.get("retry-after")` when that method is available.

## The logger receives no events

Pass the logger in the `logger` option for each `sendMessage` call.
Check that the logger has methods for the levels that the application displays.
Check the logger's level filter because it can hide lower-priority events.

## A logger method causes the request to fail

Make sure each logger method does not throw an error.
The package calls logger methods while it processes the message and does not suppress logger errors.

# Troubleshooting

## The package does not install

Check that Node.js 26 or later is active. Run `node --version`. Then run `npm install @eliware/discord-webhook`.

## The URL error appears

Set `DISCORD_WEBHOOK` or pass a valid URL with the `url` option. Check that the URL is a string and includes its scheme.

## The body error appears

Pass a message object with the `body` option. Do not pass an array or a string. Check message and embed text limits in the [usage guide](usage.md).

## Discord returns an HTTP error

Read the status code and response text in the error. Check the webhook URL, channel access, and message fields. Keep the URL secret while you debug.

## The request reaches a rate limit

The package retries HTTP 429 responses. Set `maxRetries` from 0 to 10 to change the retry count. The default is 3.

## The request times out

Set a larger positive `timeoutMs` value. This limit applies to each request attempt. Check your network connection and Discord service access.

## The request stops after cancellation

Check whether the supplied `AbortSignal` is already aborted. Do not abort it until the request can stop.

## The request cannot reach Discord

Check your network access and the webhook URL. If you pass a custom `fetchFn`, check that it accepts the standard `fetch` arguments.

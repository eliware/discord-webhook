# Usage

Install `@eliware/discord-webhook` with npm. Set `DISCORD_WEBHOOK` or pass an authorized webhook URL to `sendMessage`.

Pass a Discord message body in the `body` option. The call returns the HTTP `Response` from the request.
Use `maxRetries`, `timeoutMs`, and `signal` to control retries, timeout, and caller cancellation.
Use `wait`, `threadId`, or `threadName` to set Discord webhook query options.

Keep real webhook URLs and credentials out of source files and documentation. Use placeholders in examples.

import { validateWebhookBody } from "./validate-webhook-body.mjs";
import { requestWithRetries } from "./webhook-request.mjs";
import { addQueryOptions, validateOptions } from "./request-options.mjs";

const DEFAULT_TIMEOUT = 30_000;

/** Send a Discord webhook message with retry, timeout, and useful errors. */
export async function sendMessage({
  body,
  url = process.env.DISCORD_WEBHOOK,
  maxRetries = 3,
  fetchFn = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT,
  signal,
  wait,
  threadId,
  threadName,
} = {}) {
  validateOptions({ body, url, maxRetries, timeoutMs, signal });
  validateWebhookBody(body);
  const target = new URL(url);
  addQueryOptions(target, { wait, threadId, threadName });
  return requestWithRetries(target, { body, maxRetries, fetchFn, timeoutMs, signal });
}

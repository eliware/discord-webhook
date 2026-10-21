import { validateWebhookBody } from "./validate-webhook-body.mjs";
import { requestWithRetries } from "./webhook/request.mjs";
import { validateOptions } from "./request-options.mjs";
import { addQueryOptions } from "./webhook/query-options.mjs";
import { writeLog } from "./logging.mjs";

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
  logger,
} = {}) {
  writeLog(logger, "silly", "webhook.message.received", { operation: "sendMessage" });
  validateOptions({ body, url, maxRetries, fetchFn, timeoutMs, signal });
  validateWebhookBody(body);
  const target = new URL(url);
  addQueryOptions(target, { wait, threadId });
  const payload = threadName === undefined ? body : { ...body, thread_name: threadName };
  writeLog(logger, "debug", "webhook.message.validated", { operation: "sendMessage" });
  return requestWithRetries(target, {
    body: payload,
    maxRetries,
    fetchFn,
    timeoutMs,
    signal,
    logger,
  });
}

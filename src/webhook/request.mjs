import { requestOnce } from "./transport.mjs";
import { writeLog } from "../logging.mjs";

const MAX_TIMER_DELAY = 2_147_483_647;

export async function requestWithRetries(target, options) {
  let attempt = 0;
  while (attempt <= options.maxRetries) {
    writeLog(options.logger, "verbose", "webhook.request.attempt", { attempt: attempt + 1 });
    const result = await requestOnce(target, options);
    writeLog(options.logger, "http", "webhook.response.received", {
      attempt: attempt + 1,
      status: result.response.status,
    });
    if (result.retryAfter === null) {
      writeLog(options.logger, "info", "webhook.request.succeeded", {
        attempt: attempt + 1,
        status: result.response.status,
      });
      return result.response;
    }
    writeLog(options.logger, "warn", "webhook.rate_limit.received", {
      attempt: attempt + 1,
      retryAfterMs: result.retryAfter,
    });
    if (attempt === options.maxRetries) break;
    writeLog(options.logger, "debug", "webhook.retry.scheduled", {
      attempt: attempt + 1,
      retryAfterMs: result.retryAfter,
    });
    await waitForRetry(result.retryAfter, options.signal);
    attempt++;
  }
  writeLog(options.logger, "error", "webhook.retry_limit.exceeded", {
    attempts: attempt + 1,
  });
  throw new Error("Rate limit retry count exceeded.");
}

export function waitForRetry(waitMs, signal) {
  return new Promise((resolve, reject) => {
    let timerId;
    let remaining = waitMs;
    const cleanup = () => {
      clearTimeout(timerId);
      signal?.removeEventListener("abort", onAbort);
    };
    const schedule = () => {
      const delay = Math.min(remaining, MAX_TIMER_DELAY);
      timerId = setTimeout(() => {
        remaining -= delay;
        if (remaining > 0) schedule();
        else {
          cleanup();
          resolve();
        }
      }, delay);
    };
    const onAbort = () => {
      cleanup();
      reject(new Error("Webhook request aborted."));
    };
    schedule();
    signal?.addEventListener("abort", onAbort, { once: true });
    if (signal?.aborted) onAbort();
  });
}

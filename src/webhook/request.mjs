import { requestOnce } from "./transport.mjs";

const MAX_TIMER_DELAY = 2_147_483_647;

export async function requestWithRetries(target, options) {
  let attempt = 0;
  while (attempt <= options.maxRetries) {
    const result = await requestOnce(target, options);
    if (result.retryAfter === null) return result.response;
    if (attempt === options.maxRetries) break;
    await waitForRetry(result.retryAfter, options.signal);
    attempt++;
  }
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

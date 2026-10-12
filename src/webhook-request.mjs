import { requestOnce } from "./webhook-transport.mjs";

export async function requestWithRetries(target, options) {
  let attempt = 0;
  while (attempt <= options.maxRetries) {
    const result = await requestOnce(target, options);
    if (result.retryAfter === null) return result.response;
    if (attempt === options.maxRetries) break;
    await waitForRetry(result.retryAfter, options.signal);
    attempt++;
  }
  throw new Error("Rate limited: max retries exceeded");
}

function waitForRetry(waitMs, signal) {
  return new Promise((resolve, reject) => {
    const timerId = setTimeout(resolve, waitMs);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timerId);
        reject(new Error("Webhook request aborted."));
      },
      { once: true },
    );
  });
}

const MAX_TIMER_DELAY = 2_147_483_647;

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

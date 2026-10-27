export function createAbortControl(timeoutMs, callerSignal) {
  const controller = new AbortController();
  let rejectAbort;
  const aborted = new Promise((_, reject) => {
    rejectAbort = () => {
      const error = new Error("Request aborted.");
      error.name = "AbortError";
      reject(error);
    };
    controller.signal.addEventListener("abort", rejectAbort, { once: true });
  });
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  if (callerSignal?.aborted) controller.abort();
  else callerSignal?.addEventListener("abort", onAbort, { once: true });

  return {
    signal: controller.signal,
    aborted,
    cleanup() {
      clearTimeout(timer);
      controller.signal.removeEventListener("abort", rejectAbort);
      callerSignal?.removeEventListener("abort", onAbort);
    },
  };
}

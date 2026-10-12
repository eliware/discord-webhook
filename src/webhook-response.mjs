export async function readResponse(response, timeoutMs, signal) {
  if (response.status === 429) return { response, retryAfter: getRetryDelay(response, timeoutMs) };
  if (!(response.ok ?? (response.status >= 200 && response.status < 300))) {
    let detail = "";
    try {
      detail = await readBody(response, signal);
    } catch (error) {
      if (error?.name === "AbortError") throw error;
    }
    throw new Error(
      `Discord webhook request failed (${response.status})${detail ? `: ${detail}` : ""}`,
    );
  }
  return { response, retryAfter: null };
}

function readBody(response, signal) {
  const text = response.text();
  if (!signal) return text;
  return new Promise((resolve, reject) => {
    const cleanup = () => signal.removeEventListener("abort", onAbort);
    const onAbort = () => {
      cleanup();
      const error = new Error("Request aborted.");
      error.name = "AbortError";
      reject(error);
    };
    signal.addEventListener("abort", onAbort, { once: true });
    if (signal.aborted) onAbort();
    text.then(
      (value) => {
        cleanup();
        resolve(value);
      },
      (error) => {
        cleanup();
        reject(error);
      },
    );
  });
}

function getRetryDelay(response, timeoutMs) {
  const seconds = Number.parseFloat(response.headers?.get?.("retry-after"));
  return Number.isFinite(seconds) && seconds >= 0 ? Math.min(seconds * 1000, timeoutMs) : 1000;
}

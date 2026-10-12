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

async function requestOnce(target, { body, fetchFn, timeoutMs, signal }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort, { once: true });
  try {
    const response = await fetchFn(target.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return await readResponse(response, timeoutMs);
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("Webhook request timed out.");
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

async function readResponse(response, timeoutMs) {
  if (response.status === 429) return { response, retryAfter: getRetryDelay(response, timeoutMs) };
  if (!(response.ok ?? (response.status >= 200 && response.status < 300))) {
    let detail = "";
    try {
      detail = await response.text();
    } catch {}
    throw new Error(
      `Discord webhook request failed (${response.status})${detail ? `: ${detail}` : ""}`,
    );
  }
  return { response, retryAfter: null };
}

function getRetryDelay(response, timeoutMs) {
  const seconds = Number.parseFloat(response.headers?.get?.("retry-after"));
  return Number.isFinite(seconds) && seconds >= 0 ? Math.min(seconds * 1000, timeoutMs) : 1000;
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

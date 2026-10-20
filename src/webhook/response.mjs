export async function readResponse(response, timeoutMs, signal) {
  if (response.status === 429) {
    let body = "";
    try {
      body = await readBody(response, signal);
    } catch (error) {
      if (error?.name === "AbortError") throw error;
    }
    return { response, retryAfter: getRetryDelay(response, body) };
  }
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

function getRetryDelay(response, body) {
  const headerDelay = parseSeconds(response.headers?.get?.("retry-after"));
  if (headerDelay !== null) return headerDelay;
  try {
    const bodyDelay = parseSeconds(JSON.parse(body).retry_after);
    if (bodyDelay !== null) return bodyDelay;
  } catch {}
  return 1000;
}

function parseSeconds(value) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds < 0) return null;
  const delayMs = seconds * 1000;
  return Number.isFinite(delayMs) ? delayMs : null;
}

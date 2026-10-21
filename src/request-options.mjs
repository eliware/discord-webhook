const MAX_RETRIES = 10;

export function validateOptions({ body, url, maxRetries, timeoutMs, signal }) {
  if (!url || typeof url !== "string") throw new Error("A valid webhook URL is required.");
  try {
    const target = new URL(url);
    if (target.protocol !== "https:") {
      throw new Error("Unsupported webhook URL scheme.");
    }
  } catch {
    throw new Error("A valid webhook URL is required.");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("A valid body object is required.");
  }
  if (!Number.isInteger(maxRetries) || maxRetries < 0 || maxRetries > MAX_RETRIES) {
    throw new Error(`maxRetries must be an integer from 0 to ${MAX_RETRIES}.`);
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error("timeoutMs must be a positive number.");
  }
  if (signal?.aborted) throw new Error("Webhook request aborted.");
}

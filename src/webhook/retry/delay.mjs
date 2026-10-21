export function getRetryDelay(response, body) {
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

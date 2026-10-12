export async function readResponse(response, timeoutMs) {
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

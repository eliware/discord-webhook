import { parseRetrySeconds } from "./seconds.mjs";

export function getRetryDelay(response, body) {
  const headerDelay = parseRetrySeconds(response.headers?.get?.("retry-after"));
  if (headerDelay !== null) return headerDelay;
  try {
    const bodyDelay = parseRetrySeconds(JSON.parse(body).retry_after);
    if (bodyDelay !== null) return bodyDelay;
  } catch {}
  return 1000;
}

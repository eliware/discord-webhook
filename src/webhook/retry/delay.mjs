import { parseRetrySeconds } from "./seconds.mjs";
import { parseRetryDate } from "./date.mjs";

export function getRetryDelay(response, body) {
  const header = response.headers?.get?.("retry-after");
  const headerDelay = parseRetrySeconds(header) ?? parseRetryDate(header);
  if (headerDelay !== null) return headerDelay;
  try {
    const bodyDelay = parseRetrySeconds(JSON.parse(body).retry_after);
    if (bodyDelay !== null) return bodyDelay;
  } catch {}
  return 1000;
}

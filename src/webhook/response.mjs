import { readBody } from "./body-reader.mjs";
import { getRetryDelay } from "./retry/delay.mjs";

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

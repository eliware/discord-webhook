import { readBody } from "./body-reader.mjs";
import { getRetryDelay } from "./retry/delay.mjs";
import { throwHttpError } from "./http-error.mjs";

export async function readResponse(response, signal) {
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
    await throwHttpError(response, signal);
  }
  return { response, retryAfter: null };
}

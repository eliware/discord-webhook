import { readResponse } from "./response.mjs";
import { writeLog } from "../logging.mjs";

export async function requestOnce(target, { body, fetchFn, timeoutMs, signal, logger }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  let rejectOnAbort;
  const aborted = new Promise((_, reject) => {
    rejectOnAbort = () => {
      const error = new Error("Request aborted.");
      error.name = "AbortError";
      reject(error);
    };
    controller.signal.addEventListener("abort", rejectOnAbort, { once: true });
  });
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener("abort", onAbort, { once: true });
  try {
    if (controller.signal.aborted) return await aborted;
    writeLog(logger, "http", "webhook.request.sent", { timeoutMs });
    const request = async () => {
      const response = await fetchFn(target.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      return readResponse(response, timeoutMs, controller.signal);
    };
    return await Promise.race([request(), aborted]);
  } catch (error) {
    writeLog(logger, "error", "webhook.request.failed", {
      errorType: error instanceof Error ? "Error" : "UnknownError",
    });
    if (signal?.aborted) throw new Error("Webhook request aborted.");
    if (error?.name === "AbortError") throw new Error("Webhook request timed out.");
    throw error;
  } finally {
    clearTimeout(timer);
    controller.signal.removeEventListener("abort", rejectOnAbort);
    signal?.removeEventListener("abort", onAbort);
  }
}

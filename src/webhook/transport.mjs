import { readResponse } from "./response.mjs";
import { writeLog } from "../logging.mjs";
import { createAbortControl } from "./transport/abort-control.mjs";

export async function requestOnce(target, { body, fetchFn, timeoutMs, signal, logger }) {
  const abortControl = createAbortControl(timeoutMs, signal);
  try {
    if (abortControl.signal.aborted) return await abortControl.aborted;
    writeLog(logger, "http", "webhook.request.sent", { timeoutMs });
    const response = await Promise.race([
      fetchFn(target.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortControl.signal,
      }),
      abortControl.aborted,
    ]);
    return await Promise.race([readResponse(response, abortControl.signal), abortControl.aborted]);
  } catch (error) {
    writeLog(logger, "error", "webhook.request.failed", {
      errorType: error instanceof Error ? "Error" : "UnknownError",
    });
    if (signal?.aborted) throw new Error("Webhook request aborted.");
    if (error?.name === "AbortError") throw new Error("Webhook request timed out.");
    throw error;
  } finally {
    abortControl.cleanup();
  }
}

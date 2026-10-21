import { requestOnce } from "./transport.mjs";
import { writeLog } from "../logging.mjs";
import { waitForRetry } from "./retry/wait.mjs";

export async function requestWithRetries(target, options) {
  let attempt = 0;
  while (attempt <= options.maxRetries) {
    writeLog(options.logger, "verbose", "webhook.request.attempt", { attempt: attempt + 1 });
    const result = await requestOnce(target, options);
    writeLog(options.logger, "http", "webhook.response.received", {
      attempt: attempt + 1,
      status: result.response.status,
    });
    if (result.retryAfter === null) {
      writeLog(options.logger, "info", "webhook.request.succeeded", {
        attempt: attempt + 1,
        status: result.response.status,
      });
      return result.response;
    }
    writeLog(options.logger, "warn", "webhook.rate_limit.received", {
      attempt: attempt + 1,
      retryAfterMs: result.retryAfter,
    });
    if (attempt === options.maxRetries) break;
    writeLog(options.logger, "debug", "webhook.retry.scheduled", {
      attempt: attempt + 1,
      retryAfterMs: result.retryAfter,
    });
    await waitForRetry(result.retryAfter, options.signal);
    attempt++;
  }
  writeLog(options.logger, "error", "webhook.retry_limit.exceeded", {
    attempts: attempt + 1,
  });
  throw new Error("Rate limit retry count exceeded.");
}

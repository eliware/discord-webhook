import { readResponse } from "./webhook-response.mjs";

export async function requestOnce(target, { body, fetchFn, timeoutMs, signal }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort, { once: true });
  try {
    const response = await fetchFn(target.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return await readResponse(response, timeoutMs);
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("Webhook request timed out.");
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

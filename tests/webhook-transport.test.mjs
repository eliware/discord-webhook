import { expect, test } from "@jest/globals";
import { requestOnce } from "../src/webhook-transport.mjs";

test("sends a JSON request and returns its response result", async () => {
  const response = { status: 204, ok: true };
  const fetchFn = async () => response;
  const result = await requestOnce(new URL("https://example.com"), {
    body: { content: "hello" },
    fetchFn,
    timeoutMs: 1000,
  });
  expect(result).toEqual({ response, retryAfter: null });
});

test("maps an abort error to the timeout error", async () => {
  const error = new Error("aborted");
  error.name = "AbortError";
  await expect(
    requestOnce(new URL("https://example.com"), {
      body: {},
      fetchFn: async () => {
        throw error;
      },
      timeoutMs: 1000,
    }),
  ).rejects.toThrow("Webhook request timed out.");
});

test("aborts an in-flight request when its timeout expires", async () => {
  await expect(
    requestOnce(new URL("https://example.com"), {
      body: {},
      timeoutMs: 1,
      fetchFn: async (_url, { signal }) =>
        new Promise((resolve, reject) => {
          signal.addEventListener(
            "abort",
            () => {
              const error = new Error("aborted");
              error.name = "AbortError";
              reject(error);
            },
            { once: true },
          );
        }),
    }),
  ).rejects.toThrow("Webhook request timed out.");
});

test("aborts an in-flight request from the caller signal", async () => {
  const controller = new AbortController();
  const pending = requestOnce(new URL("https://example.com"), {
    body: {},
    signal: controller.signal,
    fetchFn: async (_url, { signal }) =>
      new Promise((resolve, reject) => {
        signal.addEventListener("abort", () => reject(new Error("cancelled")), { once: true });
        setImmediate(() => controller.abort());
      }),
    timeoutMs: 1000,
  });
  await expect(pending).rejects.toThrow("cancelled");
});

test("aborts an in-flight response body read from the caller signal", async () => {
  const controller = new AbortController();
  const pending = requestOnce(new URL("https://example.com"), {
    body: {},
    signal: controller.signal,
    fetchFn: async () => ({ status: 400, ok: false, text: () => new Promise(() => {}) }),
    timeoutMs: 1000,
  });
  setImmediate(() => controller.abort());
  await expect(pending).rejects.toThrow("Webhook request aborted.");
});

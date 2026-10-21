import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { requestOnce } from "../../src/webhook/transport.mjs";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

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

test("passes through non-abort request errors", async () => {
  await expect(
    requestOnce(new URL("https://example.com"), {
      body: {},
      fetchFn: async () => {
        throw new Error("network failed");
      },
      timeoutMs: 1000,
    }),
  ).rejects.toThrow("network failed");
});

test("logs a safe error type when fetch rejects with a non-error value", async () => {
  const error = jest.fn();
  await expect(
    requestOnce(new URL("https://example.com/private"), {
      body: {},
      fetchFn: async () => {
        throw "private failure";
      },
      timeoutMs: 1000,
      logger: { error },
    }),
  ).rejects.toBe("private failure");
  expect(error).toHaveBeenCalledWith("webhook.request.failed", { errorType: "UnknownError" });
  expect(JSON.stringify(error.mock.calls)).not.toContain("private failure");
});

test("does not log an error name that could contain sensitive data", async () => {
  const error = new Error("private failure");
  error.name = "private token";
  const logError = jest.fn();
  await expect(
    requestOnce(new URL("https://example.com/private"), {
      body: {},
      fetchFn: async () => {
        throw error;
      },
      timeoutMs: 1000,
      logger: { error: logError },
    }),
  ).rejects.toBe(error);
  expect(logError).toHaveBeenCalledWith("webhook.request.failed", { errorType: "Error" });
  expect(JSON.stringify(logError.mock.calls)).not.toContain("private token");
  expect(JSON.stringify(logError.mock.calls)).not.toContain("private failure");
});

test("rejects a request when the caller signal is already aborted", async () => {
  const controller = new AbortController();
  controller.abort();
  const fetchFn = jest.fn();
  await expect(
    requestOnce(new URL("https://example.com"), {
      body: {},
      fetchFn,
      timeoutMs: 1000,
      signal: controller.signal,
    }),
  ).rejects.toThrow("Webhook request aborted.");
  expect(fetchFn).not.toHaveBeenCalled();
});

test("aborts an in-flight request when its timeout expires", async () => {
  const pending = requestOnce(new URL("https://example.com"), {
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
  });
  const assertion = expect(pending).rejects.toThrow("Webhook request timed out.");
  await jest.advanceTimersByTimeAsync(1);
  await assertion;
});

test("aborts an in-flight request from the caller signal", async () => {
  const controller = new AbortController();
  const pending = requestOnce(new URL("https://example.com"), {
    body: {},
    signal: controller.signal,
    fetchFn: async (_url, { signal }) =>
      new Promise((resolve, reject) => {
        signal.addEventListener("abort", () => reject(new Error("cancelled")), { once: true });
        setTimeout(() => controller.abort(), 1);
      }),
    timeoutMs: 1000,
  });
  const assertion = expect(pending).rejects.toThrow("Webhook request aborted.");
  await jest.advanceTimersByTimeAsync(1);
  await assertion;
});

test("aborts an in-flight response body read from the caller signal", async () => {
  const controller = new AbortController();
  const pending = requestOnce(new URL("https://example.com"), {
    body: {},
    signal: controller.signal,
    fetchFn: async () => ({ status: 400, ok: false, text: () => new Promise(() => {}) }),
    timeoutMs: 1000,
  });
  const assertion = expect(pending).rejects.toThrow("Webhook request aborted.");
  setTimeout(() => controller.abort(), 1);
  await jest.advanceTimersByTimeAsync(1);
  await assertion;
});

test("aborts a stalled rate limit response body when the timeout expires", async () => {
  const pending = requestOnce(new URL("https://example.com"), {
    body: {},
    timeoutMs: 1,
    fetchFn: async () => ({
      status: 429,
      headers: { get: () => null },
      text: () => new Promise(() => {}),
    }),
  });
  const assertion = expect(pending).rejects.toThrow("Webhook request timed out.");
  await jest.advanceTimersByTimeAsync(1);
  await assertion;
});

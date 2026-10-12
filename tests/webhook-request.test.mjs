import { expect, jest, test } from "@jest/globals";
import { requestWithRetries } from "../src/webhook-request.mjs";

test("returns a successful webhook response", async () => {
  const response = { status: 204, ok: true };
  const result = await requestWithRetries(new URL("https://example.com"), {
    body: {},
    maxRetries: 0,
    fetchFn: async () => response,
    timeoutMs: 1000,
  });
  expect(result).toBe(response);
});

test("retries a rate limit response and returns the next response", async () => {
  const responses = [
    { status: 429, headers: { get: () => "0" } },
    { status: 204, ok: true },
  ];
  const fetchFn = jest.fn(async () => responses.shift());
  const result = await requestWithRetries(new URL("https://example.com"), {
    body: {},
    maxRetries: 1,
    fetchFn,
    timeoutMs: 1000,
  });
  expect(result.status).toBe(204);
  expect(fetchFn).toHaveBeenCalledTimes(2);
});

test("throws after the retry limit", async () => {
  const fetchFn = async () => ({ status: 429, headers: { get: () => "0" } });
  await expect(
    requestWithRetries(new URL("https://example.com"), {
      body: {},
      maxRetries: 1,
      fetchFn,
      timeoutMs: 1000,
    }),
  ).rejects.toThrow("Rate limited: max retries exceeded");
});

test("cancels a rate limit wait when the caller signal aborts", async () => {
  const controller = new AbortController();
  const removeListener = jest.spyOn(controller.signal, "removeEventListener");
  const pending = requestWithRetries(new URL("https://example.com"), {
    body: {},
    maxRetries: 1,
    signal: controller.signal,
    fetchFn: async () => ({ status: 429, headers: { get: () => "1" } }),
    timeoutMs: 1000,
  });
  setImmediate(() => controller.abort());
  await expect(pending).rejects.toThrow("Webhook request aborted.");
  expect(removeListener).toHaveBeenCalledWith("abort", expect.any(Function));
});

test("rejects a rate limit wait when its caller signal is already aborted", async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(
    requestWithRetries(new URL("https://example.com"), {
      body: {},
      maxRetries: 1,
      signal: controller.signal,
      fetchFn: async () => ({ status: 429, headers: { get: () => "1" } }),
      timeoutMs: 1000,
    }),
  ).rejects.toThrow("Webhook request aborted.");
});

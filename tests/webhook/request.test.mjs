import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { requestWithRetries } from "../../src/webhook/request.mjs";

const MAX_TIMER_DELAY = 2_147_483_647;

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test("returns a successful webhook response", async () => {
  const response = { status: 204, ok: true };
  const pending = requestWithRetries(new URL("https://example.com"), {
    body: {},
    maxRetries: 0,
    fetchFn: async () => response,
    timeoutMs: 1000,
  });
  await jest.runAllTimersAsync();
  const result = await pending;
  expect(result).toBe(response);
});

test("retries a rate limit response and returns the next response", async () => {
  const responses = [
    { status: 429, headers: { get: () => "0" } },
    { status: 204, ok: true },
  ];
  const fetchFn = jest.fn(async () => responses.shift());
  const pending = requestWithRetries(new URL("https://example.com"), {
    body: {},
    maxRetries: 1,
    fetchFn,
    timeoutMs: 1000,
  });
  await jest.runAllTimersAsync();
  const result = await pending;
  expect(result.status).toBe(204);
  expect(fetchFn).toHaveBeenCalledTimes(2);
});

test("throws after the retry limit", async () => {
  const fetchFn = async () => ({ status: 429, headers: { get: () => "0" } });
  const pending = requestWithRetries(new URL("https://example.com"), {
    body: {},
    maxRetries: 1,
    fetchFn,
    timeoutMs: 1000,
  });
  const assertion = expect(pending).rejects.toThrow("Rate limit retry count exceeded.");
  await jest.runAllTimersAsync();
  await assertion;
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
  const assertion = expect(pending).rejects.toThrow("Webhook request aborted.");
  setTimeout(() => controller.abort(), 1);
  await jest.advanceTimersByTimeAsync(1);
  await assertion;
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

test("waits through retry intervals that exceed the timer limit", async () => {
  const responses = [
    {
      status: 429,
      headers: { get: () => String((MAX_TIMER_DELAY + 10) / 1000) },
    },
    { status: 204, ok: true },
  ];
  const fetchFn = jest.fn(async () => responses.shift());
  const pending = requestWithRetries(new URL("https://example.com"), {
    body: {},
    maxRetries: 1,
    fetchFn,
    timeoutMs: 1000,
  });
  await jest.advanceTimersByTimeAsync(MAX_TIMER_DELAY);
  expect(fetchFn).toHaveBeenCalledTimes(1);
  await jest.advanceTimersByTimeAsync(10);
  await expect(pending).resolves.toEqual({ status: 204, ok: true });
});

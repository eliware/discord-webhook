import { sendMessage } from "../src/send-message.mjs";
import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

// Mock fetch function
function createMockFetch(responses) {
  let call = 0;
  return jest.fn(async () => {
    const res = responses[call] || responses[responses.length - 1];
    call++;
    return res;
  });
}

test("sendMessage sends successfully on first try", async () => {
  const mockResponse = { status: 204, ok: true, headers: { get: () => null } };
  const fetchFn = createMockFetch([mockResponse]);
  const res = await sendMessage({ body: { content: "hi" }, url: "http://test", fetchFn });
  expect(res).toBe(mockResponse);
});

test("sendMessage retries on rate limit and succeeds", async () => {
  const rateLimitResponse = {
    status: 429,
    ok: false,
    headers: { get: () => "0" },
  };
  const successResponse = { status: 204, ok: true, headers: { get: () => null } };
  const fetchFn = createMockFetch([rateLimitResponse, successResponse]);
  const pending = sendMessage({
    body: { content: "hi" },
    url: "http://test",
    fetchFn,
    maxRetries: 2,
  });
  await jest.runAllTimersAsync();
  const res = await pending;
  expect(res).toBe(successResponse);
});

test("sendMessage throws after exceeding max retries", async () => {
  const rateLimitResponse = {
    status: 429,
    ok: false,
    headers: { get: () => "0" },
  };
  const fetchFn = createMockFetch([
    rateLimitResponse,
    rateLimitResponse,
    rateLimitResponse,
    rateLimitResponse,
  ]);
  const pending = sendMessage({
    body: { content: "hi" },
    url: "http://test",
    fetchFn,
    maxRetries: 2,
  });
  const assertion = expect(pending).rejects.toThrow("Rate limit retry count exceeded.");
  await jest.runAllTimersAsync();
  await assertion;
});

test("sendMessage rejects missing or invalid URL", async () => {
  await expect(sendMessage()).rejects.toThrow("A valid webhook URL is required.");
});

test("sendMessage uses environment URL and retries with default delay for invalid retry-after", async () => {
  const previousWebhook = process.env.DISCORD_WEBHOOK;
  process.env.DISCORD_WEBHOOK = "http://env-test";
  const rateLimitResponse = { status: 429, headers: { get: () => "invalid" } };
  const successResponse = { status: 200 };
  const fetchFn = createMockFetch([rateLimitResponse, successResponse]);
  const setTimeoutSpy = jest.spyOn(globalThis, "setTimeout");
  const pending = sendMessage({ body: { content: "hi" }, fetchFn, maxRetries: 1 });
  await jest.advanceTimersByTimeAsync(1000);
  await expect(pending).resolves.toBe(successResponse);
  expect(fetchFn).toHaveBeenCalledWith("http://env-test/", expect.any(Object));
  expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

  setTimeoutSpy.mockRestore();
  if (previousWebhook === undefined) delete process.env.DISCORD_WEBHOOK;
  else process.env.DISCORD_WEBHOOK = previousWebhook;
});

test("sendMessage handles a zero retry limit", async () => {
  const rateLimitResponse = { status: 429, headers: { get: () => "0" } };
  const fetchFn = createMockFetch([rateLimitResponse]);
  await expect(
    sendMessage({ body: { content: "hi" }, url: "http://test", fetchFn, maxRetries: 0 }),
  ).rejects.toThrow("Rate limit retry count exceeded.");
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test("sends thread names in the body and thread IDs in the query", async () => {
  const response = { status: 204, ok: true };
  const fetchFn = jest.fn(async () => response);
  await expect(
    sendMessage({
      body: { content: "hi" },
      url: "https://test/hook",
      fetchFn,
      wait: true,
      threadId: "42",
      threadName: "Updates",
    }),
  ).resolves.toBe(response);
  expect(fetchFn.mock.calls[0][0]).toContain("wait=true");
  expect(fetchFn.mock.calls[0][0]).toContain("thread_id=42");
  expect(fetchFn.mock.calls[0][0]).not.toContain("thread_name");
  expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({
    content: "hi",
    thread_name: "Updates",
  });
});

test("aborts a rate-limit wait from the caller signal", async () => {
  const controller = new AbortController();
  const pending = sendMessage({
    body: { content: "hi" },
    url: "https://test",
    signal: controller.signal,
    fetchFn: async () => ({ status: 429, headers: { get: () => "1" } }),
  });
  const assertion = expect(pending).rejects.toThrow("Webhook request aborted.");
  setTimeout(() => controller.abort(), 1);
  await jest.advanceTimersByTimeAsync(1);
  await assertion;
});

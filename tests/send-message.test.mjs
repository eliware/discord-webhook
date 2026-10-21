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
  const res = await sendMessage({
    body: { content: "hi" },
    url: "https://discord.com/api/webhooks/123/token",
    fetchFn,
  });
  expect(res).toBe(mockResponse);
});

test("sendMessage injects a logger and emits safe structured events", async () => {
  const response = { status: 204, ok: true, headers: { get: () => null } };
  const calls = [];
  const logger = Object.fromEntries(
    ["error", "warn", "info", "http", "verbose", "debug", "silly"].map((level) => [
      level,
      (event, context) => calls.push({ level, event, context }),
    ]),
  );
  await sendMessage({
    body: { content: "private message" },
    url: "https://discord.com/api/webhooks/123/private-token",
    fetchFn: createMockFetch([response]),
    logger,
  });
  expect(calls.map(({ level }) => level)).toEqual([
    "silly",
    "debug",
    "verbose",
    "http",
    "http",
    "info",
  ]);
  expect(JSON.stringify(calls)).not.toContain("private-token");
  expect(JSON.stringify(calls)).not.toContain("private message");
  expect(calls.at(-1)).toEqual({
    level: "info",
    event: "webhook.request.succeeded",
    context: { attempt: 1, status: 204 },
  });
});

test("sendMessage logs rate limits and retry exhaustion", async () => {
  const calls = [];
  const logger = Object.fromEntries(
    ["error", "warn", "info", "http", "verbose", "debug", "silly"].map((level) => [
      level,
      (event, context) => calls.push({ level, event, context }),
    ]),
  );
  await expect(
    sendMessage({
      body: { content: "hi" },
      url: "https://discord.com/api/webhooks/123/secret",
      fetchFn: createMockFetch([{ status: 429, headers: { get: () => "0" } }]),
      maxRetries: 0,
      logger,
    }),
  ).rejects.toThrow("Rate limit retry count exceeded.");
  expect(calls.map(({ level }) => level)).toContain("warn");
  expect(calls.at(-1)).toEqual({
    level: "error",
    event: "webhook.retry_limit.exceeded",
    context: { attempts: 1 },
  });
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
    url: "https://discord.com/api/webhooks/123/token",
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
    url: "https://discord.com/api/webhooks/123/token",
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

test("sendMessage rejects an untrusted host or webhook path before sending the body", async () => {
  const fetchFn = jest.fn();
  for (const url of [
    "https://example.com/api/webhooks/123/token",
    "https://discord.com/messages/123/token",
  ]) {
    await expect(sendMessage({ body: { content: "private" }, url, fetchFn })).rejects.toThrow(
      "A valid webhook URL is required.",
    );
  }
  expect(fetchFn).not.toHaveBeenCalled();
});

test("sendMessage uses environment URL and retries with default delay for invalid retry-after", async () => {
  const previousWebhook = process.env.DISCORD_WEBHOOK;
  process.env.DISCORD_WEBHOOK = "https://discord.com/api/webhooks/123/token";
  const rateLimitResponse = { status: 429, headers: { get: () => "invalid" } };
  const successResponse = { status: 200 };
  const fetchFn = createMockFetch([rateLimitResponse, successResponse]);
  const setTimeoutSpy = jest.spyOn(globalThis, "setTimeout");
  const pending = sendMessage({ body: { content: "hi" }, fetchFn, maxRetries: 1 });
  await jest.advanceTimersByTimeAsync(1000);
  await expect(pending).resolves.toBe(successResponse);
  expect(fetchFn).toHaveBeenCalledWith(
    "https://discord.com/api/webhooks/123/token",
    expect.any(Object),
  );
  expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

  setTimeoutSpy.mockRestore();
  if (previousWebhook === undefined) delete process.env.DISCORD_WEBHOOK;
  else process.env.DISCORD_WEBHOOK = previousWebhook;
});

test("sendMessage handles a zero retry limit", async () => {
  const rateLimitResponse = { status: 429, headers: { get: () => "0" } };
  const fetchFn = createMockFetch([rateLimitResponse]);
  await expect(
    sendMessage({
      body: { content: "hi" },
      url: "https://discord.com/api/webhooks/123/token",
      fetchFn,
      maxRetries: 0,
    }),
  ).rejects.toThrow("Rate limit retry count exceeded.");
  expect(fetchFn).toHaveBeenCalledTimes(1);
});

test("sends thread names in the body and thread IDs in the query", async () => {
  const response = { status: 204, ok: true };
  const fetchFn = jest.fn(async () => response);
  await expect(
    sendMessage({
      body: { content: "hi" },
      url: "https://discord.com/api/webhooks/123/token",
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
    url: "https://discord.com/api/webhooks/123/token",
    signal: controller.signal,
    fetchFn: async () => ({ status: 429, headers: { get: () => "1" } }),
  });
  const assertion = expect(pending).rejects.toThrow("Webhook request aborted.");
  setTimeout(() => controller.abort(), 1);
  await jest.advanceTimersByTimeAsync(1);
  await assertion;
});

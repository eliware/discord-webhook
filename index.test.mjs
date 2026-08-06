import { sendMessage } from './index.mjs';
import { jest, test, expect } from '@jest/globals';

// Mock fetch function
function createMockFetch(responses) {
  let call = 0;
  return jest.fn(async () => {
    const res = responses[call] || responses[responses.length - 1];
    call++;
    return res;
  });
}

test('sendMessage sends successfully on first try', async () => {
  const mockResponse = { status: 204, ok: true, headers: { get: () => null } };
  const fetchFn = createMockFetch([mockResponse]);
  const res = await sendMessage({ body: { content: 'hi' }, url: 'http://test', fetchFn });
  expect(res).toBe(mockResponse);
});

test('sendMessage retries on rate limit and succeeds', async () => {
  const rateLimitResponse = {
    status: 429,
    ok: false,
    headers: { get: () => '0' },
  };
  const successResponse = { status: 204, ok: true, headers: { get: () => null } };
  const fetchFn = createMockFetch([rateLimitResponse, successResponse]);
  const res = await sendMessage({ body: { content: 'hi' }, url: 'http://test', fetchFn, maxRetries: 2 });
  expect(res).toBe(successResponse);
});

test('sendMessage throws after exceeding max retries', async () => {
  const rateLimitResponse = {
    status: 429,
    ok: false,
    headers: { get: () => '0' },
  };
  const fetchFn = createMockFetch([rateLimitResponse, rateLimitResponse, rateLimitResponse, rateLimitResponse]);
  await expect(
    sendMessage({ body: { content: 'hi' }, url: 'http://test', fetchFn, maxRetries: 2 })
  ).rejects.toThrow('Rate limited: max retries exceeded');
});

test('sendMessage rejects missing or invalid URL', async () => {
  await expect(sendMessage()).rejects.toThrow('A valid webhook URL is required.');
  await expect(sendMessage({ body: {} })).rejects.toThrow('A valid webhook URL is required.');
  await expect(sendMessage({ body: {}, url: 123 })).rejects.toThrow('A valid webhook URL is required.');
});

test('sendMessage rejects missing or invalid body', async () => {
  await expect(sendMessage({ url: 'http://test' })).rejects.toThrow('A valid body object is required.');
  await expect(sendMessage({ url: 'http://test', body: null })).rejects.toThrow('A valid body object is required.');
  await expect(sendMessage({ url: 'http://test', body: 'not an object' })).rejects.toThrow('A valid body object is required.');
});

test('sendMessage uses environment URL and retries with default delay for invalid retry-after', async () => {
  const previousWebhook = process.env.DISCORD_WEBHOOK;
  process.env.DISCORD_WEBHOOK = 'http://env-test';
  const rateLimitResponse = { status: 429, headers: { get: () => 'invalid' } };
  const successResponse = { status: 200 };
  const fetchFn = createMockFetch([rateLimitResponse, successResponse]);
  const setTimeoutSpy = jest.spyOn(globalThis, 'setTimeout').mockImplementation(callback => {
    callback();
    return 0;
  });

  await expect(sendMessage({ body: { content: 'hi' }, fetchFn, maxRetries: 1 })).resolves.toBe(successResponse);
  expect(fetchFn).toHaveBeenCalledWith('http://env-test/', expect.any(Object));
  expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

  setTimeoutSpy.mockRestore();
  if (previousWebhook === undefined) delete process.env.DISCORD_WEBHOOK;
  else process.env.DISCORD_WEBHOOK = previousWebhook;
});

test('sendMessage handles a zero retry limit', async () => {
  const rateLimitResponse = { status: 429, headers: { get: () => '0' } };
  const fetchFn = createMockFetch([rateLimitResponse]);
  await expect(sendMessage({ body: {}, url: 'http://test', fetchFn, maxRetries: 0 }))
    .rejects.toThrow('Rate limited: max retries exceeded');
  expect(fetchFn).toHaveBeenCalledTimes(1);
});


test('validates retry and timeout options', async () => {
  const fetchFn = createMockFetch([{ status: 204, ok: true }]);
  await expect(sendMessage({ body: {}, url: 'https://test', fetchFn, maxRetries: -1 })).rejects.toThrow('maxRetries');
  await expect(sendMessage({ body: {}, url: 'https://test', fetchFn, maxRetries: 11 })).rejects.toThrow('maxRetries');
  await expect(sendMessage({ body: {}, url: 'https://test', fetchFn, timeoutMs: 0 })).rejects.toThrow('timeoutMs');
  await expect(sendMessage({ body: {}, url: 'bad', fetchFn })).rejects.toThrow('valid webhook URL');
});

test('supports webhook query options and reports HTTP errors', async () => {
  const response = { status: 400, ok: false, text: async () => 'bad payload' };
  const fetchFn = jest.fn(async () => response);
  await expect(sendMessage({ body: {}, url: 'https://test/hook', fetchFn, wait: true, threadId: '42', threadName: 'thread' }))
    .rejects.toThrow('400): bad payload');
  expect(fetchFn.mock.calls[0][0]).toContain('wait=true');
});

test('supports abort signal', async () => {
  const controller = new AbortController(); controller.abort();
  await expect(sendMessage({ body: {}, url: 'https://test', signal: controller.signal })).rejects.toThrow('aborted');
});

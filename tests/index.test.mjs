import { sendMessage } from '../index.mjs';
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

test('reports HTTP errors without a response body', async () => {
  const response = { status: 500, ok: false, text: async () => '' };
  await expect(sendMessage({ body: {}, url: 'https://test', fetchFn: async () => response }))
    .rejects.toThrow('Discord webhook request failed (500)');
});

test('reports request timeouts', async () => {
  const error = new Error('aborted');
  error.name = 'AbortError';
  await expect(sendMessage({ body: {}, url: 'https://test', timeoutMs: 1, fetchFn: async () => { throw error; } }))
    .rejects.toThrow('Webhook request timed out.');
});

test('aborts an in-flight request when timeout expires', async () => {
  await expect(sendMessage({ body: {}, url: 'https://test', timeoutMs: 1, fetchFn: async (_url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => { const error = new Error('aborted'); error.name = 'AbortError'; reject(error); }, { once: true });
  }) })).rejects.toThrow('Webhook request timed out.');
});

test('aborts an in-flight request from the caller signal', async () => {
  const controller = new AbortController();
  const pending = sendMessage({ body: {}, url: 'https://test', signal: controller.signal, fetchFn: async (_url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('cancelled')), { once: true });
    setImmediate(() => controller.abort());
  }) });
  await expect(pending).rejects.toThrow('cancelled');
});

test('aborts a rate-limit wait from the caller signal', async () => {
  const controller = new AbortController();
  const pending = sendMessage({ body: {}, url: 'https://test', signal: controller.signal, fetchFn: async () => ({ status: 429, headers: { get: () => '1' } }) });
  setImmediate(() => controller.abort());
  await expect(pending).rejects.toThrow('Webhook request aborted.');
});

test('rejects payloads that exceed Discord limits before fetch', async () => {
  const fetchFn = jest.fn();
  await expect(sendMessage({ body: { content: 'x'.repeat(2001) }, url: 'https://test', fetchFn })).rejects.toThrow(/content exceeds 2000/);
  await expect(sendMessage({ body: { embeds: [{ description: 'x'.repeat(4097) }] }, url: 'https://test', fetchFn })).rejects.toThrow(/description exceeds 4096/);
  expect(fetchFn).not.toHaveBeenCalled();
});

test('rejects excessive fields, embeds, and aggregate embed text', async () => {
  const fetchFn = jest.fn();
  await expect(sendMessage({ body: { embeds: Array.from({ length: 11 }, () => ({})) }, url: 'https://test', fetchFn })).rejects.toThrow(/at most 10 embeds/);
  await expect(sendMessage({ body: { embeds: [{ fields: Array.from({ length: 26 }, () => ({ name: 'n', value: 'v' })) }] }, url: 'https://test', fetchFn })).rejects.toThrow(/at most 25 fields/);
  await expect(sendMessage({ body: { embeds: [{ title: 'x'.repeat(256), description: 'x'.repeat(4096), footer: { text: 'x'.repeat(2048) } }] }, url: 'https://test', fetchFn })).rejects.toThrow(/text exceeds 6000/);
});

test('validates field shapes and field-specific limits', async () => {
  const fetchFn = jest.fn();
  await expect(sendMessage({ body: { embeds: [{ fields: [null] }] }, url: 'https://test', fetchFn })).rejects.toThrow(/field 1 must be an object/);
  await expect(sendMessage({ body: { embeds: [{ fields: [{ name: 'x'.repeat(257), value: 'ok' }] }] }, url: 'https://test', fetchFn })).rejects.toThrow(/field 1 name exceeds 256/);
  await expect(sendMessage({ body: { embeds: [{ fields: [{ name: 'ok', value: 'x'.repeat(1025) }] }] }, url: 'https://test', fetchFn })).rejects.toThrow(/field 1 value exceeds 1024/);
});

test('accepts a valid embed payload', async () => {
  const response = { status: 204, ok: true };
  await expect(sendMessage({ body: { embeds: [{ title: 'ok', fields: [{ name: 'n', value: 'v' }] }] }, url: 'https://test', fetchFn: async () => response })).resolves.toBe(response);
});

test('rejects malformed embeds and non-string text properties', async () => {
  const fetchFn = jest.fn();
  await expect(sendMessage({ body: { embeds: [[]] }, url: 'https://test', fetchFn })).rejects.toThrow(/embed 1 must be an object/);
  await expect(sendMessage({ body: { embeds: [{ title: 42 }] }, url: 'https://test', fetchFn })).rejects.toThrow(/title must be a string/);
});

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

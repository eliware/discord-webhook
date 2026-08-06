import fetch from 'node-fetch';

const DEFAULT_TIMEOUT = 30_000;
const MAX_RETRIES = 10;

/** Send a Discord webhook message with retry, timeout, and useful errors. */
export async function sendMessage({
  body,
  url = process.env.DISCORD_WEBHOOK,
  maxRetries = 3,
  fetchFn = fetch,
  timeoutMs = DEFAULT_TIMEOUT,
  signal,
  wait,
  threadId,
  threadName,
} = {}) {
  if (!url || typeof url !== 'string') throw new Error('A valid webhook URL is required.');
  try { new URL(url); } catch { throw new Error('A valid webhook URL is required.'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('A valid body object is required.');
  if (!Number.isInteger(maxRetries) || maxRetries < 0 || maxRetries > MAX_RETRIES) throw new Error(`maxRetries must be an integer from 0 to ${MAX_RETRIES}.`);
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('timeoutMs must be a positive number.');
  if (signal?.aborted) throw new Error('Webhook request aborted.');

  const target = new URL(url);
  if (wait !== undefined) target.searchParams.set('wait', String(Boolean(wait)));
  if (threadId !== undefined) target.searchParams.set('thread_id', String(threadId));
  if (threadName !== undefined) target.searchParams.set('thread_name', String(threadName));

  let attempt = 0;
  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const onAbort = () => controller.abort();
    signal?.addEventListener('abort', onAbort, { once: true });
    try {
      const response = await fetchFn(target.toString(), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: controller.signal,
      });
      if (response.status !== 429) {
        if (!(response.ok ?? (response.status >= 200 && response.status < 300))) {
          let detail = '';
          try { detail = await response.text(); } catch {}
          throw new Error(`Discord webhook request failed (${response.status})${detail ? `: ${detail}` : ''}`);
        }
        return response;
      }
      const raw = response.headers?.get?.('retry-after');
      const seconds = Number.parseFloat(raw);
      const waitMs = Number.isFinite(seconds) && seconds >= 0 ? Math.min(seconds * 1000, timeoutMs) : 1000;
      if (attempt === maxRetries) break;
      await new Promise((resolve, reject) => {
        const timerId = setTimeout(resolve, waitMs);
        signal?.addEventListener('abort', () => { clearTimeout(timerId); reject(new Error('Webhook request aborted.')); }, { once: true });
      });
      attempt++;
    } catch (error) {
      if (error?.name === 'AbortError') throw new Error('Webhook request timed out.');
      throw error;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  }
  throw new Error('Rate limited: max retries exceeded');
}

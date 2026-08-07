const DEFAULT_TIMEOUT = 30_000;
const MAX_RETRIES = 10;

export const DISCORD_LIMITS = Object.freeze({
  content: 2000,
  embeds: 10,
  title: 256,
  description: 4096,
  fields: 25,
  fieldName: 256,
  fieldValue: 1024,
  footerText: 2048,
  authorName: 256,
  totalEmbedText: 6000,
});

const stringLength = value => typeof value === 'string' ? value.length : 0;

/** Validate payloads against Discord limits before making a network request. */
export function validateWebhookBody(body) {
  if (typeof body.content === 'string' && body.content.length > DISCORD_LIMITS.content) {
    throw new Error(`Discord webhook content exceeds ${DISCORD_LIMITS.content} characters.`);
  }
  if (!Array.isArray(body.embeds)) return true;
  if (body.embeds.length > DISCORD_LIMITS.embeds) throw new Error(`Discord webhook supports at most ${DISCORD_LIMITS.embeds} embeds.`);
  for (const [index, embed] of body.embeds.entries()) {
    if (!embed || typeof embed !== 'object' || Array.isArray(embed)) throw new Error(`Discord embed ${index + 1} must be an object.`);
    const check = (value, limit, name) => {
      if (value !== undefined && typeof value !== 'string') throw new Error(`Discord embed ${index + 1} ${name} must be a string.`);
      if (stringLength(value) > limit) throw new Error(`Discord embed ${index + 1} ${name} exceeds ${limit} characters.`);
    };
    check(embed.title, DISCORD_LIMITS.title, 'title');
    check(embed.description, DISCORD_LIMITS.description, 'description');
    check(embed.footer?.text, DISCORD_LIMITS.footerText, 'footer text');
    check(embed.author?.name, DISCORD_LIMITS.authorName, 'author name');
    if (Array.isArray(embed.fields)) {
      if (embed.fields.length > DISCORD_LIMITS.fields) throw new Error(`Discord embed ${index + 1} supports at most ${DISCORD_LIMITS.fields} fields.`);
      for (const [fieldIndex, field] of embed.fields.entries()) {
        if (!field || typeof field !== 'object') throw new Error(`Discord embed ${index + 1} field ${fieldIndex + 1} must be an object.`);
        check(field.name, DISCORD_LIMITS.fieldName, `field ${fieldIndex + 1} name`);
        check(field.value, DISCORD_LIMITS.fieldValue, `field ${fieldIndex + 1} value`);
      }
    }
    const total = stringLength(embed.title) + stringLength(embed.description) + stringLength(embed.footer?.text) + stringLength(embed.author?.name) + (embed.fields || []).reduce((sum, field) => sum + stringLength(field.name) + stringLength(field.value), 0);
    if (total > DISCORD_LIMITS.totalEmbedText) throw new Error(`Discord embed ${index + 1} text exceeds ${DISCORD_LIMITS.totalEmbedText} characters.`);
  }
  return true;
}

/** Send a Discord webhook message with retry, timeout, and useful errors. */
export async function sendMessage({
  body,
  url = process.env.DISCORD_WEBHOOK,
  maxRetries = 3,
  fetchFn = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT,
  signal,
  wait,
  threadId,
  threadName,
} = {}) {
  if (!url || typeof url !== 'string') throw new Error('A valid webhook URL is required.');
  try { new URL(url); } catch { throw new Error('A valid webhook URL is required.'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('A valid body object is required.');
  validateWebhookBody(body);
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

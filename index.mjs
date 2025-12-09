import fetch from 'node-fetch';

/**
 * Sends a message to a Discord webhook URL, handling rate limits with automatic retry.
 *
 * @param {Object} params - The parameters for sending the message.
 * @param {Object} params.body - The JSON body to send (e.g., { content: 'Hello!' }).
 * @param {string} [params.url=process.env.DISCORD_WEBHOOK] - The Discord webhook URL. Defaults to the DISCORD_WEBHOOK environment variable.
 * @param {number} [params.maxRetries=3] - Maximum number of retries on rate limit.
 * @param {Function} [params.fetchFn=fetch] - Custom fetch function for testing/mocking.
 * @returns {Promise<Response>} The fetch response.
 * @throws {Error} If the URL or body is invalid, or if max retries are exceeded.
 */
export async function sendMessage({ 
  body,
  url = process.env.DISCORD_WEBHOOK,
  maxRetries = 3,
  fetchFn = fetch,
} = {}) {
  if (!url || typeof url !== 'string') throw new Error('A valid webhook URL is required.')
  if (!body || typeof body !== 'object') throw new Error('A valid body object is required.')

  let attempt = 0
  while (attempt <= maxRetries) {
    const response = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (response.status !== 429) {
      return response
    }
    // Handle rate limit
    const retryAfter = parseInt(response.headers.get('retry-after'))
    const waitMs = isNaN(retryAfter) ? 1000 : retryAfter * 1000
    await new Promise(res => setTimeout(res, waitMs))
    attempt++
  }
  throw new Error('Rate limited: max retries exceeded')
}
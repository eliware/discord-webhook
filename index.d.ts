/**
 * Sends a message to a Discord webhook URL, handling rate limits with automatic retry.
 * @param params - The parameters for the message.
 * @param params.body - The JSON body to send (e.g., { content: string }).
 * @param params.url - The Discord webhook URL. Defaults to process.env.DISCORD_WEBHOOK.
 * @param params.maxRetries - Maximum number of retries on rate limit (default 3).
 * @param params.fetchFn - Custom fetch function for testing/mocking.
 * @returns A Promise resolving to the fetch Response.
 */
export declare function sendMessage(params?: {
  body: object;
  url?: string;
  maxRetries?: number;
  fetchFn?: typeof fetch;
}): Promise<Response>;
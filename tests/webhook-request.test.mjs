import { expect, test } from "@jest/globals";
import { requestWithRetries } from "../src/webhook-request.mjs";

test("returns a successful webhook response", async () => {
  const response = { status: 204, ok: true };
  const result = await requestWithRetries(new URL("https://example.com"), {
    body: {},
    maxRetries: 0,
    fetchFn: async () => response,
    timeoutMs: 1000,
  });
  expect(result).toBe(response);
});

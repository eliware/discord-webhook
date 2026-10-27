import { expect, test } from "@jest/globals";
import { readResponse } from "../../src/webhook/response.mjs";

test("returns a successful response without retry", async () => {
  const response = { status: 204, ok: true };
  await expect(readResponse(response)).resolves.toEqual({ response, retryAfter: null });
});

test("returns retry delay from the rate limit header", async () => {
  const response = { status: 429, headers: { get: () => "2" } };
  await expect(readResponse(response)).resolves.toEqual({ response, retryAfter: 2000 });
});

import { expect, test } from "@jest/globals";
import { getRetryDelay } from "../../../src/webhook/retry/delay.mjs";

test("uses the retry-after header before the response body", () => {
  const response = { headers: { get: () => "2" } };
  expect(getRetryDelay(response, JSON.stringify({ retry_after: 5 }))).toBe(2000);
});

test("uses the retry_after body value when the header is missing", () => {
  const response = { headers: { get: () => null } };
  expect(getRetryDelay(response, JSON.stringify({ retry_after: 2.5 }))).toBe(2500);
});

test("uses the default delay when the retry values are invalid", () => {
  const response = { headers: { get: () => "invalid" } };
  expect(getRetryDelay(response, "invalid JSON")).toBe(1000);
  expect(getRetryDelay(response, "{}")).toBe(1000);
});

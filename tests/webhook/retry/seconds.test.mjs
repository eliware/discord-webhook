import { expect, test } from "@jest/globals";
import { parseRetrySeconds } from "../../../src/webhook/retry/seconds.mjs";

test("converts valid seconds to milliseconds", () => {
  expect(parseRetrySeconds("2.5")).toBe(2500);
  expect(parseRetrySeconds(0)).toBe(0);
});

test("returns null for invalid or out-of-range seconds", () => {
  for (const value of [undefined, null, "", " ", "invalid", -1, Infinity, Number.MAX_VALUE]) {
    expect(parseRetrySeconds(value)).toBeNull();
  }
});

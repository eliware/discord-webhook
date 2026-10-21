import { expect, test } from "@jest/globals";
import { validateOptions } from "../src/request-options.mjs";

const validOptions = {
  body: {},
  url: "https://discord.com/api/webhooks/123456789012345678/token_value-123",
  maxRetries: 3,
  fetchFn: async () => {},
  timeoutMs: 1000,
};

test("accepts valid request options", () => {
  expect(validateOptions(validOptions)).toBeUndefined();
});

test("rejects invalid URLs and message bodies", () => {
  for (const url of [
    undefined,
    123,
    "bad",
    "http://example.com",
    "file:///tmp/webhook",
    "ftp://example.com",
    "https://example.com/api/webhooks/123456789012345678/token",
    "https://discord.com/messages/123456789012345678/token",
    "https://discord.com.evil.com/api/webhooks/123456789012345678/token",
    "https://discord.com:8443/api/webhooks/123456789012345678/token",
    "https://user@discord.com/api/webhooks/123456789012345678/token",
  ]) {
    expect(() => validateOptions({ ...validOptions, url })).toThrow("valid webhook URL");
  }
  for (const body of [undefined, null, "text", []]) {
    expect(() => validateOptions({ ...validOptions, body })).toThrow("valid body object");
  }
});

test("rejects invalid retry and timeout values", () => {
  for (const maxRetries of [-1, 11, 1.5]) {
    expect(() => validateOptions({ ...validOptions, maxRetries })).toThrow("maxRetries");
  }
  for (const timeoutMs of [0, Infinity]) {
    expect(() => validateOptions({ ...validOptions, timeoutMs })).toThrow("timeoutMs");
  }
});

test("rejects a missing or invalid fetch function", () => {
  for (const fetchFn of [undefined, null, "fetch"]) {
    expect(() => validateOptions({ ...validOptions, fetchFn })).toThrow(
      "fetchFn must be a function.",
    );
  }
});

test("rejects an aborted caller signal", () => {
  const controller = new AbortController();
  controller.abort();
  expect(() => validateOptions({ ...validOptions, signal: controller.signal })).toThrow("aborted");
});

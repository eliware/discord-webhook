import { expect, test } from "@jest/globals";
import { addQueryOptions, validateOptions } from "../src/request-options.mjs";

const validOptions = { body: {}, url: "https://test", maxRetries: 3, timeoutMs: 1000 };

test("accepts valid request options", () => {
  expect(validateOptions(validOptions)).toBeUndefined();
});

test("rejects invalid URLs and message bodies", () => {
  for (const url of [undefined, 123, "bad", "file:///tmp/webhook", "ftp://example.com"]) {
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

test("rejects an aborted caller signal", () => {
  const controller = new AbortController();
  controller.abort();
  expect(() => validateOptions({ ...validOptions, signal: controller.signal })).toThrow("aborted");
});

test("adds wait and thread ID query options", () => {
  const target = new URL("https://test/hook");
  addQueryOptions(target, { wait: true, threadId: 42, threadName: "updates" });
  expect(target.searchParams.get("wait")).toBe("true");
  expect(target.searchParams.get("thread_id")).toBe("42");
  expect(target.searchParams.has("thread_name")).toBe(false);
});

test("keeps the URL when no query options are set", () => {
  const target = new URL("https://test/hook");
  addQueryOptions(target, {});
  expect(target.toString()).toBe("https://test/hook");
});

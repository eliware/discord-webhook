import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { waitForRetry } from "../../../src/webhook/retry/wait.mjs";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test("rejects a retry wait when its caller signal is already aborted", async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(waitForRetry(1000, controller.signal)).rejects.toThrow("Webhook request aborted.");
});

test("resolves after the retry interval", async () => {
  const pending = waitForRetry(1000);
  await jest.advanceTimersByTimeAsync(1000);
  await expect(pending).resolves.toBeUndefined();
});

test("clears its timer when the caller aborts", async () => {
  const controller = new AbortController();
  const pending = waitForRetry(1000, controller.signal);
  const assertion = expect(pending).rejects.toThrow("Webhook request aborted.");
  controller.abort();
  await assertion;
  expect(jest.getTimerCount()).toBe(0);
});

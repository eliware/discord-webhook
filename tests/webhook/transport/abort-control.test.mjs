import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { createAbortControl } from "../../../src/webhook/transport/abort-control.mjs";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test("aborts when its timeout expires", async () => {
  const control = createAbortControl(10);
  const assertion = expect(control.aborted).rejects.toThrow("Request aborted.");
  await jest.advanceTimersByTimeAsync(10);
  await assertion;
  expect(control.signal.aborted).toBe(true);
  control.cleanup();
});

test("forwards caller cancellation and cleans up its listeners", async () => {
  const caller = new AbortController();
  const removeListener = jest.spyOn(caller.signal, "removeEventListener");
  const control = createAbortControl(1000, caller.signal);
  const assertion = expect(control.aborted).rejects.toThrow("Request aborted.");
  caller.abort();
  await assertion;
  expect(control.signal.aborted).toBe(true);
  control.cleanup();
  expect(removeListener).toHaveBeenCalledWith("abort", expect.any(Function));
});

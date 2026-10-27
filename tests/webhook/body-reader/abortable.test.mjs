import { expect, test } from "@jest/globals";
import { readAbortable } from "../../../src/webhook/body-reader/abortable.mjs";

test("rejects when the caller cancels a pending read", async () => {
  const controller = new AbortController();
  const pending = readAbortable(new Promise(() => {}), controller.signal);
  const assertion = expect(pending).rejects.toThrow("Request aborted.");
  controller.abort();
  await assertion;
});

test("rejects when the signal is already aborted", async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(readAbortable(Promise.resolve("response body"), controller.signal)).rejects.toThrow(
    "Request aborted.",
  );
});

test("preserves a rejected body read", async () => {
  const controller = new AbortController();
  await expect(
    readAbortable(Promise.reject(new Error("body read failed")), controller.signal),
  ).rejects.toThrow("body read failed");
});

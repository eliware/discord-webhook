import { expect, test } from "@jest/globals";
import { readBody } from "../../src/webhook/body-reader.mjs";

test("reads a response body without a signal", async () => {
  const response = { text: async () => "response body" };
  await expect(readBody(response)).resolves.toBe("response body");
});

test("rejects when the caller cancels a pending body read", async () => {
  const controller = new AbortController();
  const response = { text: () => new Promise(() => {}) };
  const pending = readBody(response, controller.signal);
  const assertion = expect(pending).rejects.toThrow("Request aborted.");
  controller.abort();
  await assertion;
});

test("rejects when the signal is already aborted", async () => {
  const controller = new AbortController();
  controller.abort();
  const response = { text: async () => "response body" };
  await expect(readBody(response, controller.signal)).rejects.toThrow("Request aborted.");
});

test("preserves response body read errors", async () => {
  const response = {
    text: async () => {
      throw new Error("body read failed");
    },
  };
  await expect(readBody(response, new AbortController().signal)).rejects.toThrow(
    "body read failed",
  );
});

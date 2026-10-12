import { expect, test } from "@jest/globals";
import { readResponse } from "../src/webhook-response.mjs";

test("returns a successful response without retry", async () => {
  const response = { status: 204, ok: true };
  await expect(readResponse(response, 1000)).resolves.toEqual({ response, retryAfter: null });
});

test("returns retry delay from the rate limit header", async () => {
  const response = { status: 429, headers: { get: () => "2" } };
  await expect(readResponse(response, 5000)).resolves.toEqual({ response, retryAfter: 2000 });
});

test("caps retry delay at the request timeout", async () => {
  const response = { status: 429, headers: { get: () => "8" } };
  await expect(readResponse(response, 3000)).resolves.toEqual({ response, retryAfter: 3000 });
});

test("uses the default retry delay for an invalid header", async () => {
  const response = { status: 429, headers: { get: () => "invalid" } };
  await expect(readResponse(response, 3000)).resolves.toEqual({ response, retryAfter: 1000 });
});

test("includes the response body in an HTTP error", async () => {
  const response = { status: 400, ok: false, text: async () => "bad payload" };
  await expect(readResponse(response, 1000)).rejects.toThrow(
    "Discord webhook request failed (400): bad payload",
  );
});

test("reports an HTTP error without a response body", async () => {
  const response = { status: 500, ok: false, text: async () => "" };
  await expect(readResponse(response, 1000)).rejects.toThrow(
    "Discord webhook request failed (500)",
  );
});

test("rejects response body reads when the signal is already aborted", async () => {
  const controller = new AbortController();
  controller.abort();
  const response = { status: 400, ok: false, text: async () => "bad payload" };
  await expect(readResponse(response, 1000, controller.signal)).rejects.toThrow("Request aborted.");
});

test("reports an HTTP error when response body reading fails", async () => {
  const controller = new AbortController();
  const response = {
    status: 400,
    ok: false,
    text: async () => {
      throw new Error("body read failed");
    },
  };
  await expect(readResponse(response, 1000, controller.signal)).rejects.toThrow(
    "Discord webhook request failed (400)",
  );
});

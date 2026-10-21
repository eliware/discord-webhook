import { expect, test } from "@jest/globals";
import { readResponse } from "../../src/webhook/response.mjs";

test("returns a successful response without retry", async () => {
  const response = { status: 204, ok: true };
  await expect(readResponse(response, 1000)).resolves.toEqual({ response, retryAfter: null });
});

test("returns retry delay from the rate limit header", async () => {
  const response = { status: 429, headers: { get: () => "2" } };
  await expect(readResponse(response, 5000)).resolves.toEqual({ response, retryAfter: 2000 });
});

test("uses the complete retry delay when it exceeds the request timeout", async () => {
  const response = { status: 429, headers: { get: () => "8" } };
  await expect(readResponse(response, 3000)).resolves.toEqual({ response, retryAfter: 8000 });
});

test("uses retry_after from the rate limit response body when the header is missing", async () => {
  const response = {
    status: 429,
    headers: { get: () => null },
    text: async () => JSON.stringify({ retry_after: 2.5 }),
  };
  await expect(readResponse(response, 1000)).resolves.toEqual({ response, retryAfter: 2500 });
});

test("propagates cancellation while reading a rate limit response", async () => {
  const controller = new AbortController();
  const response = {
    status: 429,
    headers: { get: () => null },
    text: () => new Promise(() => {}),
  };
  const pending = readResponse(response, 1000, controller.signal);
  const assertion = expect(pending).rejects.toThrow("Request aborted.");
  controller.abort();
  await assertion;
});

test("uses the header when both retry delay values are available", async () => {
  const response = {
    status: 429,
    headers: { get: () => "2" },
    text: async () => JSON.stringify({ retry_after: 5 }),
  };
  await expect(readResponse(response, 1000)).resolves.toEqual({ response, retryAfter: 2000 });
});

test("uses the default retry delay for an invalid header", async () => {
  const response = { status: 429, headers: { get: () => "invalid" } };
  await expect(readResponse(response, 3000)).resolves.toEqual({ response, retryAfter: 1000 });
});

test("uses a valid body value when the header is empty", async () => {
  const response = {
    status: 429,
    headers: { get: () => " " },
    text: async () => JSON.stringify({ retry_after: 0.5 }),
  };
  await expect(readResponse(response, 1000)).resolves.toEqual({ response, retryAfter: 500 });
});

test("uses the default retry interval when the value exceeds the timer range", async () => {
  const response = {
    status: 429,
    headers: { get: () => String(Number.MAX_VALUE) },
    text: async () => "{}",
  };
  await expect(readResponse(response, 1000)).resolves.toEqual({ response, retryAfter: 1000 });
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

test("propagates an already aborted signal while reading an HTTP error", async () => {
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

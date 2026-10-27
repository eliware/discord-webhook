import { expect, test } from "@jest/globals";
import { throwHttpError } from "../../src/webhook/http-error.mjs";

test("includes the response body in an HTTP error", async () => {
  const response = { status: 400, text: async () => "bad payload" };
  await expect(throwHttpError(response)).rejects.toThrow(
    "Discord webhook request failed (400): bad payload",
  );
});

test("reports an HTTP error without a response body", async () => {
  const response = { status: 500, text: async () => "" };
  await expect(throwHttpError(response)).rejects.toThrow("Discord webhook request failed (500)");
});

test("reports an HTTP error when response body reading fails", async () => {
  const response = {
    status: 400,
    text: async () => {
      throw new Error("body read failed");
    },
  };
  await expect(throwHttpError(response)).rejects.toThrow("Discord webhook request failed (400)");
});

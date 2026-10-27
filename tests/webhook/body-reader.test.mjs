import { expect, test } from "@jest/globals";
import { readBody } from "../../src/webhook/body-reader.mjs";

test("reads a response body without a signal", async () => {
  const response = { text: async () => "response body" };
  await expect(readBody(response)).resolves.toBe("response body");
});

test("preserves response body read errors", async () => {
  const response = {
    text: async () => {
      throw new Error("body read failed");
    },
  };
  await expect(readBody(response)).rejects.toThrow("body read failed");
});

import { expect, test } from "@jest/globals";
import { validateWebhookBody } from "../src/validate-webhook-body.mjs";

test("accepts valid webhook payloads", () => {
  expect(
    validateWebhookBody({
      content: "hello",
      embeds: [{ title: "title", fields: [{ name: "name", value: "value" }] }],
    }),
  ).toBe(true);
});

test("rejects payloads that exceed Discord limits", () => {
  expect(() => validateWebhookBody({ content: "x".repeat(2001) })).toThrow(/content exceeds 2000/);
  expect(() => validateWebhookBody({ embeds: [{ description: "x".repeat(4097) }] })).toThrow(
    /description exceeds 4096/,
  );
});

test("rejects too many embeds, fields, and total embed text", () => {
  expect(() => validateWebhookBody({ embeds: Array.from({ length: 11 }, () => ({})) })).toThrow(
    /at most 10 embeds/,
  );
  expect(() =>
    validateWebhookBody({
      embeds: [{ fields: Array.from({ length: 26 }, () => ({ name: "n", value: "v" })) }],
    }),
  ).toThrow(/at most 25 fields/);
  expect(() =>
    validateWebhookBody({
      embeds: [
        {
          title: "x".repeat(256),
          description: "x".repeat(4096),
          footer: { text: "x".repeat(2048) },
        },
      ],
    }),
  ).toThrow(/text exceeds 6000/);
});

test("rejects malformed embeds and field values", () => {
  expect(() => validateWebhookBody({ embeds: [[]] })).toThrow(/embed 1 must be an object/);
  expect(() => validateWebhookBody({ embeds: [{ title: 42 }] })).toThrow(/title must be a string/);
  expect(() => validateWebhookBody({ embeds: [{ fields: [null] }] })).toThrow(
    /field 1 must be an object/,
  );
  expect(() =>
    validateWebhookBody({ embeds: [{ fields: [{ name: "x".repeat(257), value: "ok" }] }] }),
  ).toThrow(/field 1 name exceeds 256/);
  expect(() =>
    validateWebhookBody({ embeds: [{ fields: [{ name: "ok", value: "x".repeat(1025) }] }] }),
  ).toThrow(/field 1 value exceeds 1024/);
});

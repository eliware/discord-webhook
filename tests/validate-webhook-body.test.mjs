import { expect, test } from "@jest/globals";
import { validateWebhookBody } from "../src/validate-webhook-body.mjs";

test("accepts valid webhook payloads", () => {
  expect(
    validateWebhookBody({
      content: "hello",
      embeds: [
        {
          title: "title",
          author: { name: "author" },
          footer: { text: "footer" },
          fields: [{ name: "name", value: "value" }],
        },
      ],
    }),
  ).toBe(true);
});

test("rejects payloads that exceed Discord limits", () => {
  expect(() => validateWebhookBody({ content: "x".repeat(2001) })).toThrow(/content exceeds 2000/);
  expect(() => validateWebhookBody({ embeds: [{ description: "x".repeat(4097) }] })).toThrow(
    /description exceeds 4096/,
  );
});

test("rejects content that is not a string", () => {
  for (const content of [42, null, {}]) {
    expect(() => validateWebhookBody({ content })).toThrow(
      "Discord webhook content must be a string.",
    );
  }
});

test("rejects embeds and fields that are not arrays", () => {
  for (const embeds of [{}, "invalid", null]) {
    expect(() => validateWebhookBody({ embeds })).toThrow(
      "Discord webhook embeds must be an array.",
    );
  }
  for (const fields of [{}, "invalid", null]) {
    expect(() => validateWebhookBody({ embeds: [{ fields }] })).toThrow(
      "Discord embed 1 fields must be an array.",
    );
  }
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
  ).toThrow(/embed text exceeds 6000/);
});

test("enforces the total embed text limit across all embeds", () => {
  expect(() =>
    validateWebhookBody({
      embeds: [{ description: "x".repeat(4000) }, { description: "y".repeat(2001) }],
    }),
  ).toThrow(/embed text exceeds 6000/);
});

test("rejects malformed embeds and field values", () => {
  expect(() => validateWebhookBody({ embeds: [[]] })).toThrow(/embed 1 must be an object/);
  expect(() => validateWebhookBody({ embeds: [{ title: 42 }] })).toThrow(/title must be a string/);
  expect(() => validateWebhookBody({ embeds: [{ fields: [null] }] })).toThrow(
    /field 1 must be an object/,
  );
  const fieldArray = [];
  Object.defineProperty(fieldArray, "name", {
    get() {
      throw new Error("field getter must not run");
    },
  });
  expect(() => validateWebhookBody({ embeds: [{ fields: [fieldArray] }] })).toThrow(
    /field 1 must be an object/,
  );
  expect(() =>
    validateWebhookBody({ embeds: [{ fields: [{ name: "x".repeat(257), value: "ok" }] }] }),
  ).toThrow(/field 1 name exceeds 256/);
  expect(() =>
    validateWebhookBody({ embeds: [{ fields: [{ name: "ok", value: "x".repeat(1025) }] }] }),
  ).toThrow(/field 1 value exceeds 1024/);
});

test("rejects malformed embed footer and author objects", () => {
  for (const property of ["footer", "author"]) {
    for (const value of ["invalid", [], null]) {
      expect(() => validateWebhookBody({ embeds: [{ [property]: value }] })).toThrow(
        `Discord embed 1 ${property} must be an object.`,
      );
    }
  }
});

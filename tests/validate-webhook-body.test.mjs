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

test("requires a supported message field", () => {
  for (const body of [{}, { content: "" }, { embeds: [] }, { unknown: "value" }]) {
    expect(() => validateWebhookBody(body)).toThrow(
      "Discord webhook body must include content, embeds, components, or poll.",
    );
  }
  for (const body of [
    { content: "message" },
    { embeds: [{}] },
    { components: [{}] },
    { poll: {} },
  ]) {
    expect(validateWebhookBody(body)).toBe(true);
  }
});

test("rejects content that exceeds Discord limits", () => {
  expect(() => validateWebhookBody({ content: "x".repeat(2001) })).toThrow(/content exceeds 2000/);
});

test("rejects content that is not a string", () => {
  for (const content of [42, null, {}]) {
    expect(() => validateWebhookBody({ content })).toThrow(
      "Discord webhook content must be a string.",
    );
  }
});

test("rejects embeds that are not arrays", () => {
  for (const embeds of [{}, "invalid", null]) {
    expect(() => validateWebhookBody({ embeds })).toThrow(
      "Discord webhook embeds must be an array.",
    );
  }
});

test("rejects too many embeds, fields, and total embed text", () => {
  expect(() => validateWebhookBody({ embeds: Array.from({ length: 11 }, () => ({})) })).toThrow(
    /at most 10 embeds/,
  );
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

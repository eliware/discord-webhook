import { expect, test } from "@jest/globals";
import { getEmbedTextLength } from "../../../src/payload/embed/text.mjs";

test("counts text in embed properties and fields", () => {
  expect(
    getEmbedTextLength({
      title: "title",
      description: "description",
      author: { name: "author" },
      footer: { text: "footer" },
      fields: [{ name: "name", value: "value" }],
    }),
  ).toBe(37);
});

test("ignores non-string optional text", () => {
  expect(getEmbedTextLength({ title: 42, fields: [{ name: null, value: false }] })).toBe(0);
});

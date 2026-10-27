import { expect, test } from "@jest/globals";
import { validateEmbed } from "../../../src/payload/embed/validation.mjs";

test("accepts a valid embed", () => {
  expect(
    validateEmbed(
      {
        title: "title",
        description: "description",
        author: { name: "author" },
        footer: { text: "footer" },
        fields: [{ name: "name", value: "value" }],
      },
      0,
    ),
  ).toBeUndefined();
});

test("rejects invalid embed text types and lengths", () => {
  expect(() => validateEmbed({ title: 42 }, 0)).toThrow(/title must be a string/);
  expect(() => validateEmbed({ description: "x".repeat(4097) }, 0)).toThrow(
    /description exceeds 4096/,
  );
  expect(() => validateEmbed({ fields: [{ name: "x".repeat(257), value: "ok" }] }, 0)).toThrow(
    /field 1 name exceeds 256/,
  );
  expect(() => validateEmbed({ fields: [{ name: "ok", value: "x".repeat(1025) }] }, 0)).toThrow(
    /field 1 value exceeds 1024/,
  );
});

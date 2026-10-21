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

test("rejects malformed embeds and field values", () => {
  expect(() => validateEmbed([], 0)).toThrow(/embed 1 must be an object/);
  expect(() => validateEmbed({ title: 42 }, 0)).toThrow(/title must be a string/);
  expect(() => validateEmbed({ description: "x".repeat(4097) }, 0)).toThrow(
    /description exceeds 4096/,
  );
  expect(() => validateEmbed({ fields: [null] }, 0)).toThrow(/field 1 must be an object/);
  const fieldArray = [];
  Object.defineProperty(fieldArray, "name", {
    get() {
      throw new Error("field getter must not run");
    },
  });
  expect(() => validateEmbed({ fields: [fieldArray] }, 0)).toThrow(/field 1 must be an object/);
  expect(() => validateEmbed({ fields: [{ name: "x".repeat(257), value: "ok" }] }, 0)).toThrow(
    /field 1 name exceeds 256/,
  );
  expect(() => validateEmbed({ fields: [{ name: "ok", value: "x".repeat(1025) }] }, 0)).toThrow(
    /field 1 value exceeds 1024/,
  );
});

test("rejects invalid fields and too many fields", () => {
  for (const fields of [{}, "invalid", null]) {
    expect(() => validateEmbed({ fields }, 0)).toThrow("Discord embed 1 fields must be an array.");
  }
  expect(() =>
    validateEmbed({ fields: Array.from({ length: 26 }, () => ({ name: "n", value: "v" })) }, 0),
  ).toThrow(/at most 25 fields/);
});

test("rejects malformed embed footer and author objects", () => {
  for (const property of ["footer", "author"]) {
    for (const value of ["invalid", [], null]) {
      expect(() => validateEmbed({ [property]: value }, 0)).toThrow(
        `Discord embed 1 ${property} must be an object.`,
      );
    }
  }
});

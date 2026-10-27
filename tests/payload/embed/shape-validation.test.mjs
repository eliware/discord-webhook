import { expect, test } from "@jest/globals";
import { validateEmbedShape } from "../../../src/payload/embed/shape-validation.mjs";

test("rejects malformed embeds and field objects", () => {
  expect(() => validateEmbedShape([], 0)).toThrow(/embed 1 must be an object/);
  expect(() => validateEmbedShape({ fields: [null] }, 0)).toThrow(/field 1 must be an object/);
  const fieldArray = [];
  Object.defineProperty(fieldArray, "name", {
    get() {
      throw new Error("field getter must not run");
    },
  });
  expect(() => validateEmbedShape({ fields: [fieldArray] }, 0)).toThrow(
    /field 1 must be an object/,
  );
});

test("rejects invalid fields and too many fields", () => {
  for (const fields of [{}, "invalid", null]) {
    expect(() => validateEmbedShape({ fields }, 0)).toThrow(
      "Discord embed 1 fields must be an array.",
    );
  }
  expect(() =>
    validateEmbedShape(
      { fields: Array.from({ length: 26 }, () => ({ name: "n", value: "v" })) },
      0,
    ),
  ).toThrow(/at most 25 fields/);
});

test("rejects malformed embed footer and author objects", () => {
  for (const property of ["footer", "author"]) {
    for (const value of ["invalid", [], null]) {
      expect(() => validateEmbedShape({ [property]: value }, 0)).toThrow(
        `Discord embed 1 ${property} must be an object.`,
      );
    }
  }
});

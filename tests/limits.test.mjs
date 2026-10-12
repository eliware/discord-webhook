import { expect, test } from "@jest/globals";
import { DISCORD_LIMITS } from "../src/limits.mjs";

test("defines Discord webhook limits", () => {
  expect(DISCORD_LIMITS).toEqual(
    expect.objectContaining({ content: 2000, embeds: 10, fields: 25, totalEmbedText: 6000 }),
  );
  expect(Object.isFrozen(DISCORD_LIMITS)).toBe(true);
});

import { expect, test } from "@jest/globals";
import * as api from "../src/index.mjs";

test("exports the public webhook API", () => {
  expect(api.sendMessage).toEqual(expect.any(Function));
  expect(api.validateWebhookBody).toEqual(expect.any(Function));
  expect(api.DISCORD_LIMITS.content).toBe(2000);
});

import { expect, test, jest } from "@jest/globals";
import { writeLog } from "../src/logging.mjs";

test("writes an event and its context to the requested level", () => {
  const logger = { info: jest.fn() };
  const context = { status: 204 };
  writeLog(logger, "info", "webhook.request.succeeded", context);
  expect(logger.info).toHaveBeenCalledWith("webhook.request.succeeded", context);
});

test("does nothing when the logger or level method is unavailable", () => {
  expect(() => writeLog(undefined, "info", "event")).not.toThrow();
  expect(() => writeLog({ info: null }, "info", "event")).not.toThrow();
});

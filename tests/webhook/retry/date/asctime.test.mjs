import { expect, test } from "@jest/globals";
import { parseAsctime } from "../../../../src/webhook/retry/date/asctime.mjs";

test("parses an asctime date with a space-padded day", () => {
  expect(parseAsctime("Wed Oct  7 07:28:00 2015")).toEqual({
    weekday: "Wed",
    day: 7,
    month: "Oct",
    year: 2015,
    time: "07:28:00",
  });
});

test("rejects values outside the asctime format", () => {
  expect(parseAsctime("Wed, 21 Oct 2015 07:28:00 GMT")).toBeNull();
});

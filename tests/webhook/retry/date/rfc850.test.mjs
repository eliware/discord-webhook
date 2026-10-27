import { expect, test } from "@jest/globals";
import { parseRfc850 } from "../../../../src/webhook/retry/date/rfc850.mjs";

test("maps two-digit years to the nearest valid century", () => {
  expect(parseRfc850("Friday, 21-Oct-77 07:28:00 GMT", 2026)).toEqual({
    weekday: "Friday",
    day: 21,
    month: "Oct",
    year: 1977,
    time: "07:28:00",
  });
});

test("rejects values outside the RFC 850 format", () => {
  expect(parseRfc850("Wed Oct 21 07:28:00 2015", 2026)).toBeNull();
});

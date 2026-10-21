import { afterEach, expect, jest, test } from "@jest/globals";
import { parseRetryDate } from "../../../src/webhook/retry/date.mjs";

afterEach(() => jest.restoreAllMocks());

test.each([
  "Wed, 21 Oct 2015 07:28:00 GMT",
  "Wednesday, 21-Oct-15 07:28:00 GMT",
  "Wed Oct 21 07:28:00 2015",
])("parses an HTTP date in the %s format", (value) => {
  jest.spyOn(Date, "now").mockReturnValue(Date.parse("Wed, 21 Oct 2015 07:27:00 GMT"));
  expect(parseRetryDate(value)).toBe(60_000);
});

test("returns zero for a past HTTP date and null for invalid dates", () => {
  jest.spyOn(Date, "now").mockReturnValue(Date.parse("Wed, 21 Oct 2015 07:29:00 GMT"));
  expect(parseRetryDate("Wed, 21 Oct 2015 07:28:00 GMT")).toBe(0);
  expect(parseRetryDate("not a date")).toBeNull();
  expect(parseRetryDate("Wed, 21 Oct 2015 99:28:00 GMT")).toBeNull();
  expect(parseRetryDate("Tue, 21 Oct 2015 07:28:00 GMT")).toBeNull();
});

test("moves obsolete two-digit years more than fifty years ahead into the past", () => {
  jest.spyOn(Date, "now").mockReturnValue(Date.parse("Wed, 21 Oct 2026 07:27:00 GMT"));
  expect(parseRetryDate("Friday, 21-Oct-77 07:28:00 GMT")).toBe(0);
});

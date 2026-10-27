import { expect, test } from "@jest/globals";
import { parseImfFixdate } from "../../../../src/webhook/retry/date/imf-fixdate.mjs";

test("parses IMF-fixdate fields", () => {
  expect(parseImfFixdate("Wed, 21 Oct 2015 07:28:00 GMT")).toEqual({
    weekday: "Wed",
    day: 21,
    month: "Oct",
    year: 2015,
    time: "07:28:00",
  });
});

test("rejects values outside the IMF-fixdate format", () => {
  expect(parseImfFixdate("Wednesday, 21-Oct-15 07:28:00 GMT")).toBeNull();
});

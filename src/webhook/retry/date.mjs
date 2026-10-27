import { parseImfFixdate } from "./date/imf-fixdate.mjs";
import { parseRfc850 } from "./date/rfc850.mjs";
import { parseAsctime } from "./date/asctime.mjs";

const WEEKDAYS = new Map([
  ["Sun", "Sunday"],
  ["Mon", "Monday"],
  ["Tue", "Tuesday"],
  ["Wed", "Wednesday"],
  ["Thu", "Thursday"],
  ["Fri", "Friday"],
  ["Sat", "Saturday"],
]);

export function parseRetryDate(value) {
  if (typeof value !== "string") return null;
  const currentYear = new Date(Date.now()).getUTCFullYear();
  const parts = parseImfFixdate(value) ?? parseRfc850(value, currentYear) ?? parseAsctime(value);
  if (!parts) return null;
  const { weekday, day, month, year, time } = parts;
  const weekdayName = WEEKDAYS.get(weekday.slice(0, 3));
  const date = Date.parse(
    `${weekdayName}, ${String(day).padStart(2, "0")} ${month} ${year} ${time} GMT`,
  );
  if (!Number.isFinite(date)) return null;
  const parsed = new Date(date);
  if (
    parsed.getUTCDate() !== day ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCHours() !== Number(time.slice(0, 2)) ||
    parsed.getUTCMinutes() !== Number(time.slice(3, 5)) ||
    parsed.getUTCSeconds() !== Number(time.slice(6, 8)) ||
    WEEKDAYS.get(parsed.toUTCString().slice(0, 3)) !== weekdayName
  ) {
    return null;
  }
  return Math.max(0, date - Date.now());
}

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
  const parts = getDateParts(value);
  if (!parts) return null;
  const { weekday, day, month, year, time } = parts;
  const date = Date.parse(
    `${weekday}, ${String(day).padStart(2, "0")} ${month} ${year} ${time} GMT`,
  );
  if (!Number.isFinite(date)) return null;
  const parsed = new Date(date);
  if (
    parsed.getUTCDate() !== day ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCHours() !== Number(time.slice(0, 2)) ||
    parsed.getUTCMinutes() !== Number(time.slice(3, 5)) ||
    parsed.getUTCSeconds() !== Number(time.slice(6, 8)) ||
    WEEKDAYS.get(parsed.toUTCString().slice(0, 3)) !== weekday
  ) {
    return null;
  }
  return Math.max(0, date - Date.now());
}

function getDateParts(value) {
  const imf = value.match(
    /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat), (\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d{2}:\d{2}:\d{2}) GMT$/,
  );
  if (imf) {
    return {
      weekday: WEEKDAYS.get(imf[1]),
      day: Number(imf[2]),
      month: imf[3],
      year: Number(imf[4]),
      time: imf[5],
    };
  }

  const rfc850 = value.match(
    /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), (\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2}) (\d{2}:\d{2}:\d{2}) GMT$/,
  );
  if (rfc850) {
    const currentYear = new Date(Date.now()).getUTCFullYear();
    let year = Math.floor(currentYear / 100) * 100 + Number(rfc850[4]);
    if (year > currentYear + 50) year -= 100;
    return {
      weekday: rfc850[1],
      day: Number(rfc850[2]),
      month: rfc850[3],
      year,
      time: rfc850[5],
    };
  }

  const asctime = value.match(
    /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2}| \d) (\d{2}:\d{2}:\d{2}) (\d{4})$/,
  );
  if (asctime) {
    return {
      weekday: WEEKDAYS.get(asctime[1]),
      day: Number(asctime[3].trim()),
      month: asctime[2],
      year: Number(asctime[5]),
      time: asctime[4],
    };
  }
  return null;
}

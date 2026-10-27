export function parseRfc850(value, currentYear) {
  const match = value.match(
    /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), (\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2}) (\d{2}:\d{2}:\d{2}) GMT$/,
  );
  if (!match) return null;
  let year = Math.floor(currentYear / 100) * 100 + Number(match[4]);
  if (year > currentYear + 50) year -= 100;
  return {
    weekday: match[1],
    day: Number(match[2]),
    month: match[3],
    year,
    time: match[5],
  };
}

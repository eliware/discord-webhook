export function parseAsctime(value) {
  const match = value.match(
    /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2}| \d) (\d{2}:\d{2}:\d{2}) (\d{4})$/,
  );
  if (!match) return null;
  return {
    weekday: match[1],
    day: Number(match[3].trim()),
    month: match[2],
    year: Number(match[5]),
    time: match[4],
  };
}

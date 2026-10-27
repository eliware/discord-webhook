export function parseImfFixdate(value) {
  const match = value.match(
    /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat), (\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d{2}:\d{2}:\d{2}) GMT$/,
  );
  if (!match) return null;
  return {
    weekday: match[1],
    day: Number(match[2]),
    month: match[3],
    year: Number(match[4]),
    time: match[5],
  };
}

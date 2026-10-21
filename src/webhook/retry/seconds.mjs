export function parseRetrySeconds(value) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds < 0) return null;
  const delayMs = seconds * 1000;
  return Number.isFinite(delayMs) ? delayMs : null;
}

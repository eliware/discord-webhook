export function writeLog(logger, level, event, context = {}) {
  const method = logger?.[level];
  if (typeof method === "function") method.call(logger, event, context);
}

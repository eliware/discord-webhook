import { readAbortable } from "./body-reader/abortable.mjs";

export function readBody(response, signal) {
  const text = response.text();
  if (!signal) return text;
  return readAbortable(text, signal);
}

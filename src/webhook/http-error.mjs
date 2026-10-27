import { readBody } from "./body-reader.mjs";

export async function throwHttpError(response, signal) {
  let detail = "";
  try {
    detail = await readBody(response, signal);
  } catch (error) {
    if (error?.name === "AbortError") throw error;
  }
  throw new Error(
    `Discord webhook request failed (${response.status})${detail ? `: ${detail}` : ""}`,
  );
}

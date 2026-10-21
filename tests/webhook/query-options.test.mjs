import { expect, test } from "@jest/globals";
import { addQueryOptions } from "../../src/webhook/query-options.mjs";

test("adds wait and thread ID query options", () => {
  const target = new URL("https://test/hook");
  addQueryOptions(target, { wait: true, threadId: 42, threadName: "updates" });
  expect(target.searchParams.get("wait")).toBe("true");
  expect(target.searchParams.get("thread_id")).toBe("42");
  expect(target.searchParams.has("thread_name")).toBe(false);
});

test("keeps the URL when no query options are set", () => {
  const target = new URL("https://test/hook");
  addQueryOptions(target, {});
  expect(target.toString()).toBe("https://test/hook");
});

export function addQueryOptions(target, { wait, threadId }) {
  if (wait !== undefined) target.searchParams.set("wait", String(Boolean(wait)));
  if (threadId !== undefined) target.searchParams.set("thread_id", String(threadId));
}

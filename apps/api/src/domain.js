const MAX_TITLE = 500;

export function validateTitle(raw) {
  if (raw == null || typeof raw !== "string") {
    return { ok: false, error: "Title must be a string" };
  }
  const title = raw.trim();
  if (title.length === 0) {
    return { ok: false, error: "Title is required" };
  }
  if (title.length > MAX_TITLE) {
    return { ok: false, error: `Title must be at most ${MAX_TITLE} characters` };
  }
  return { ok: true, title };
}

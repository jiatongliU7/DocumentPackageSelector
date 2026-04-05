/**
 * fetch + parse JSON with a clear error when the server returns HTML (e.g. 500 page)
 * or the wrong dev server is hit (wrong port).
 */
export async function fetchJson(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<unknown> {
  const res = await fetch(input, init);
  const raw = await res.text();
  const trimmed = raw.trim();
  const looksLikeJson =
    trimmed.startsWith("{") || trimmed.startsWith("[");
  const ct = res.headers.get("content-type") ?? "";

  if (!looksLikeJson) {
    const hint =
      trimmed.startsWith("<") || trimmed.startsWith("Internal")
        ? "Looks like an HTML error page. Use the same port as `next dev` (check the terminal) and avoid running two dev servers."
        : "Response was not JSON.";
    throw new Error(
      `${hint} (${ct || "no content-type"}): ${raw.slice(0, 160)}${raw.length > 160 ? "…" : ""}`,
    );
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON: ${raw.slice(0, 120)}`);
  }

  if (!res.ok) {
    const msg =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

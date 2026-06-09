/**
 * Generic JSON fetcher for SWR. Throws on non-2xx responses so SWR's `error`
 * channel fires instead of swallowing failures into stale-looking data.
 */
export async function jsonFetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error(`Request failed: ${res.status}`);
    (error as Error & { status?: number }).status = res.status;
    throw error;
  }
  return res.json() as Promise<T>;
}

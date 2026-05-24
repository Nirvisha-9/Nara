import { auth } from "@eazo/sdk";

/**
 * Drop-in replacement for `fetch` that automatically injects `x-eazo-session`.
 * Returns parsed JSON directly.
 */
export async function request(
  input: RequestInfo | URL,
  init: RequestInit = {},
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const sessionHeader = await auth.getSessionHeader();

  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
      ...(sessionHeader ? { "x-eazo-session": sessionHeader } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed: ${res.status} ${text}`);
  }

  return res.json();
}

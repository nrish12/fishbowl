const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  Deno.env.get("PUBLIC_SITE_URL") || Deno.env.get("SITE_URL") || "https://clueladder.com",
];

export function getCorsHeaders(
  origin: string | null,
  overrides: Record<string, string> = {},
) {
  const baseOrigin = origin && allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[allowedOrigins.length - 1];

  return {
    "Access-Control-Allow-Origin": baseOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
    "Access-Control-Max-Age": "86400",
    ...overrides,
  };
}

export function withCors(
  origin: string | null,
  init?: ResponseInit,
  overrides?: Record<string, string>,
) {
  const headers = {
    ...(init?.headers || {}),
    ...getCorsHeaders(origin, overrides),
  };

  return {
    ...init,
    headers,
  };
}

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://mystle.app",
  "https://www.mystle.app",
  "https://fishbowl-roan.vercel.app",
  Deno.env.get("PUBLIC_SITE_URL"),
  Deno.env.get("SITE_URL"),
].filter(Boolean) as string[];

export function getCorsHeaders(
  origin: string | null,
  overrides: Record<string, string> = {},
) {
  const isLocalhost = origin && (origin.includes("localhost") || origin.includes("127.0.0.1"));
  const isPreview = origin && (origin.includes("webcontainer") || origin.includes("stackblitz"));
  const isVercel = origin && origin.includes(".vercel.app");
  const isAllowed = origin && allowedOrigins.includes(origin);

  const baseOrigin = (isLocalhost || isPreview || isVercel || isAllowed) && origin
    ? origin
    : "*";

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

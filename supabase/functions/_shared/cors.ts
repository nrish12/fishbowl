const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://clueladder.com",
  "https://www.clueladder.com",
];

export function getCorsHeaders(origin: string | null) {
  const corsHeaders = {
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
    "Access-Control-Max-Age": "86400",
  };

  if (origin && allowedOrigins.includes(origin)) {
    return {
      ...corsHeaders,
      "Access-Control-Allow-Origin": origin,
    };
  }

  return {
    ...corsHeaders,
    "Access-Control-Allow-Origin": allowedOrigins[0],
  };
}

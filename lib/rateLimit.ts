const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 30;

const ipRequests = new Map<string, number[]>();

export function checkRateLimit(request: Request): boolean {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const now = Date.now();
  const timestamps = ipRequests.get(ip) || [];
  const validTimestamps = timestamps.filter((time) => now - time < WINDOW_MS);

  if (validTimestamps.length === 0) {
    ipRequests.delete(ip);
  }

  if (validTimestamps.length >= MAX_REQUESTS) {
    ipRequests.set(ip, validTimestamps);
    return false;
  }

  validTimestamps.push(now);
  ipRequests.set(ip, validTimestamps);
  return true;
}

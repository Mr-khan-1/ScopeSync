export const rateLimitMap = new Map<string, { count: number, timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowData = rateLimitMap.get(ip);
  
  if (!windowData || now - windowData.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  if (windowData.count >= MAX_REQUESTS) {
    return false;
  }
  
  windowData.count++;
  return true;
}

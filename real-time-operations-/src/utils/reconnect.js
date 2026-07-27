const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 16000];
export const MAX_RECONNECT_ATTEMPTS = RETRY_DELAYS_MS.length;
export function getReconnectDelay(attempt) {
  const index = Math.min(attempt, RETRY_DELAYS_MS.length - 1);
  return RETRY_DELAYS_MS[index];
}

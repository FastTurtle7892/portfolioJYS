import { Prisma } from "@prisma/client";

// 무료 티어 Postgres(Neon / Vercel Postgres 등)는 일정 시간 유휴 상태면 컴퓨트가
// 슬립되고, 슬립 이후 첫 요청에서 깨어나는 데 시간이 걸려 순간적으로 연결에
// 실패하는 경우가 있다. "일시적인" 연결/타임아웃 오류로 볼 수 있는 것만 골라
// 짧게 대기 후 한 번 더 시도한다. (스키마 오류, id 없음 등 실제 버그는 그대로 던진다)
const RETRYABLE_ERROR_CODES = new Set([
  "P1001", // Can't reach database server
  "P1002", // Database server timed out
  "P1008", // Operation timed out
  "P1017", // Server has closed the connection
  "P2024", // Timed out fetching a new connection from the pool
]);

function isRetryableError(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return RETRYABLE_ERROR_CODES.has(error.code);
  }
  return false;
}

export async function withDbRetry<T>(fn: () => Promise<T>, retries = 1, delayMs = 400): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return withDbRetry(fn, retries - 1, delayMs);
    }
    throw error;
  }
}

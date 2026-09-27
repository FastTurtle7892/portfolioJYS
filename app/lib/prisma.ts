import { PrismaClient } from "@prisma/client";

// Next.js(특히 개발 모드의 Hot Reload) 및 서버리스 환경에서 요청/모듈 리로드마다
// 새 PrismaClient가 생성되어 DB 커넥션이 낭비/고갈되는 것을 막기 위해
// 전역(globalThis)에 인스턴스를 하나만 유지한다.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

import prisma from "@/lib/prisma";

export async function getSkills(ids: number[]) {
  const response = await prisma.skill.findMany({
    where: { OR: ids.map(id => ({ id })) },
    orderBy: { category: "asc" },
  });
  return response;
}

// 여러 항목의 스킬을 한 번에 조회 (N+1 방지). 결과는 category 순으로 정렬된다.
export async function getSkillsByIds(ids: number[]) {
  if (ids.length === 0) return [];
  return prisma.skill.findMany({
    where: { id: { in: ids } },
    orderBy: { category: "asc" },
  });
}

import prisma from "@/lib/prisma";

// 여러 항목의 스킬을 한 번에 조회 (N+1 방지). 결과는 category 순으로 정렬된다.
// ids가 빈 배열이면 곧바로 빈 배열을 반환한다 (Prisma에 빈 조건을 넘기지 않음).
export async function getSkillsByIds(ids: number[]) {
  if (ids.length === 0) return [];
  return prisma.skill.findMany({
    where: { id: { in: ids } },
    orderBy: { category: "asc" },
  });
}

// getSkills와 getSkillsByIds로 중복 구현되어 있던 것을 getSkillsByIds 하나로 통일.
// 기존 호출부(ProjectModal 등) 호환을 위해 이름만 별도로 export.
export const getSkills = getSkillsByIds;

import { MousePointer } from "react-feather";

import SectionWatcher from "@/_components/SectionWatcher";
import SlideUpInView from "@/_components/SlideUpInView";
import ProjectCards from "@/_components/project/ProjectCards";
import prisma from "@/lib/prisma";
import { getSkillsByIds } from "@/utils/api";

async function getProjects() {
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      title: true,
      sub_title: true,
      skill_ids: true,
      logo_url: true,
      card_description: true,
    },
    orderBy: {
      row_number: "asc",
    },
  });

  const allIds = Array.from(new Set(projects.flatMap(p => p.skill_ids)));
  const allSkills = await getSkillsByIds(allIds);

  return projects.map(({ skill_ids, ...project }) => ({
    ...project,
    skills: allSkills.filter(s => skill_ids.includes(s.id)),
  }));
}

const LAB_PROJECT_COUNT = 3;

export default async function ProjectSection() {
  const projects = await getProjects();
  const labProjects = projects.slice(0, LAB_PROJECT_COUNT);
  const ssafyProjects = projects.slice(LAB_PROJECT_COUNT);

  return (
    <SectionWatcher id="project">
      <SlideUpInView>
        {/* 프로젝트 상세 제목 + 랩 카드 3개 + 구분선은 다른 섹션들과 동일하게
            예전 폭(max-w-screen-lg)으로 제한해 시각적으로 그대로 유지한다. */}
        <div className="w-full max-w-screen-lg mx-auto flex flex-col items-center">
          <h2 className="section-eyebrow mb-3 md:mb-4">프로젝트 상세</h2>
          <p className="inline-flex items-center justify-center gap-2 px-4 py-2 mb-8 md:mb-12 rounded-full bg-primary/10 text-primary text-sm md:text-base font-semibold text-center break-keep">
            <MousePointer className="w-4 h-4 flex-shrink-0" />
            프로젝트 카드를 누르면 구조, 문제 해결 과정, 결과까지 더 자세히 볼 수 있어요.
          </p>

          <div className="flex flex-col gap-6 md:gap-8 items-center w-full">
            <h3 className="section-title mb-0">학부 연구 프로젝트 · UWB 무선 측위</h3>
            <ProjectCards projects={labProjects} />
          </div>

          <hr className="w-full md:max-w-[768px] border-t border-foreground/15 mx-auto mt-12 md:mt-16" />
        </div>

        {/* SSAFY 카드 줄만 이 제한 밖에서, main이 제공하는 넓어진 폭을 그대로 사용한다
            (main 자체의 좌우 padding은 그대로 적용되므로 다른 섹션과 좌우 여백은 동일하다). */}
        <div className="flex flex-col gap-6 md:gap-8 items-center w-full mt-12 md:mt-16">
          <h3 className="section-title mb-0">삼성청년SW·AI아카데미 (SSAFY)</h3>
          <ProjectCards projects={ssafyProjects} />
        </div>
      </SlideUpInView>
    </SectionWatcher>
  );
}

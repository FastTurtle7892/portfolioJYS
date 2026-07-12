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
        <h2 className="section-eyebrow mb-8 md:mb-12">프로젝트 상세</h2>

        <div className="flex flex-col gap-12 md:gap-16 w-full">
          <div className="flex flex-col gap-6 md:gap-8 items-center">
            <h3 className="section-title mb-0">학부연구생 · 국민대학교 무선센싱연구실</h3>
            <ProjectCards projects={labProjects} />
          </div>

          <hr className="w-full md:max-w-[768px] border-t border-foreground/15 mx-auto" />

          <div className="flex flex-col gap-6 md:gap-8 items-center">
            <h3 className="section-title mb-0">삼성청년SW·AI아카데미 (SSAFY)</h3>
            <div className="w-full max-w-[38rem] mx-auto">
              <ProjectCards projects={ssafyProjects} />
            </div>
          </div>
        </div>
      </SlideUpInView>
    </SectionWatcher>
  );
}

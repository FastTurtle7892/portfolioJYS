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

export default async function ProjectSection() {
  const projects = await getProjects();

  return (
    <SectionWatcher id="project">
      <SlideUpInView>
        <h2 className="section-eyebrow">프로젝트 상세</h2>
        <p className="section-title">주요 프로젝트의 세부 사항을 확인해보세요</p>

        <ProjectCards projects={projects} />
      </SlideUpInView>
    </SectionWatcher>
  );
}

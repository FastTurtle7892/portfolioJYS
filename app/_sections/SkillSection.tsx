import SectionWatcher from "@/_components/SectionWatcher";
import SlideUpInView from "@/_components/SlideUpInView";
import SkillItems from "@/_components/skill/SkillItems";
import prisma from "@/lib/prisma";

async function getAllSkills() {
  return await prisma.skill.findMany({ orderBy: { category: "asc" } });
}

export default async function SkillSection() {
  const allSkills = await getAllSkills();

  return (
    <SectionWatcher id="skill">
      <SlideUpInView>
        <h2 className="section-eyebrow mb-8 md:mb-12">기술 스택 및 도구</h2>
        <SkillItems skills={allSkills} />
      </SlideUpInView>
    </SectionWatcher>
  );
}

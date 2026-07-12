import React from "react";

import ExpCard from "@/_components/ExpCard";
import SectionWatcher from "@/_components/SectionWatcher";
import SlideUpInView from "@/_components/SlideUpInView";
import prisma from "@/lib/prisma";
import { getSkillsByIds } from "@/utils/api";
import { parsePrismaJSON } from "@/utils/parsePrisma";

async function getExperience() {
  const experiences = await prisma.experience.findMany({ orderBy: { index: "asc" } });

  const allIds = Array.from(new Set(experiences.flatMap(e => e.skill_ids)));
  const allSkills = await getSkillsByIds(allIds);

  const projectRows = await prisma.project.findMany({ select: { id: true, title: true } });
  const findProjectId = (title: string) =>
    projectRows.find(p => p.title === title || p.title.startsWith(title) || title.startsWith(p.title))?.id;

  return experiences.map(({ skill_ids, links, ...exp }) => ({
    ...exp,
    skills: allSkills.filter(s => skill_ids.includes(s.id)),
    links: links.map(link => parsePrismaJSON<{ href: string; label: string }>(link)),
    projectId: exp.category === "PROJECT" ? findProjectId(exp.title) : undefined,
  }));
}

export default async function ExperienceSection() {
  const data = await getExperience();

  const works = data.filter(({ category }) => category === "WORK");
  const projects = data.filter(({ category }) => category === "PROJECT");

  return (
    <SectionWatcher id="experience">
      <SlideUpInView>
        <h2 className="section-eyebrow">경력 사항</h2>
        <p className="section-title">
          시간 순서대로 이어온 활동과 프로젝트를 통해
          <br />
          경험과 노하우를 쌓고 있습니다.
        </p>

        {[
          { title: "활동", data: works },
          { title: "프로젝트", data: projects },
        ].map(({ title, data }) => (
          <React.Fragment key={`exp-${title}`}>
            <div className="flex gap-4 items-center md:max-w-[768px] mx-auto mt-12 mb-8">
              <div className="w-full h-[1px] bg-gradient-to-l from-foreground/15" />
              <p className="flex-shrink-0 text-xs md:text-sm text-foreground/50">{title}</p>
              <div className="w-full h-[1px] bg-gradient-to-r from-foreground/15" />
            </div>

            <div className="flex flex-col gap-8 md:gap-10">
              {data.map(props => (
                <ExpCard key={`exp-${title}-card-${props.id}`} {...props} />
              ))}
            </div>
          </React.Fragment>
        ))}
      </SlideUpInView>
    </SectionWatcher>
  );
}

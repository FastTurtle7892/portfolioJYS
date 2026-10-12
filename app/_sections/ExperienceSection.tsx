import React from "react";

import ExpCard from "@/_components/ExpCard";
import SectionWatcher from "@/_components/SectionWatcher";
import SlideUpInView from "@/_components/SlideUpInView";
import prisma from "@/lib/prisma";
import { getSkillsByIds } from "@/utils/api";
import { parsePrismaJSON } from "@/utils/parsePrisma";

async function getExperience() {
  const experiences = await prisma.experience.findMany({ orderBy: { index: "asc" } });
  const projectRows = await prisma.project.findMany({ select: { id: true, title: true, skill_ids: true } });

  // 경력사항의 프로젝트 항목은 '프로젝트 상세' 카드와 같은 기술 아이콘을 보여줘야 하므로,
  // 해당 프로젝트를 찾아 그 프로젝트의 skill_ids를 그대로 쓴다 (기술 목록을 한 곳에서만 관리).
  // 제목이 조금 달라도(예: "UWB 거리측정 성능 최적화" ↔ "IEEE 802.15.4z UWB 거리측정 성능 최적화") 매칭되도록 포함 관계로 비교한다.
  const findProject = (title: string) =>
    projectRows.find(p => p.title === title || p.title.includes(title) || title.includes(p.title));

  const resolved = experiences.map(exp => {
    const project = exp.category === "PROJECT" ? findProject(exp.title) : undefined;
    // 활동(WORK) 항목은 기술 아이콘을 보여주지 않는다. 프로젝트 항목만 프로젝트 카드의 기술을 따른다.
    return { exp, project, skillIds: project ? project.skill_ids : [] };
  });

  const allIds = Array.from(new Set(resolved.flatMap(r => r.skillIds)));
  const allSkills = await getSkillsByIds(allIds);

  return resolved.map(({ exp: { skill_ids: _unused, links, ...exp }, project, skillIds }) => ({
    ...exp,
    skills: allSkills.filter(s => skillIds.includes(s.id)),
    links: links.map(link => parsePrismaJSON<{ href: string; label: string }>(link)),
    projectId: project?.id,
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

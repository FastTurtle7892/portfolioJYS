import cn from "classnames";
import parse from "html-react-parser";
import Image from "next/image";
import Link from "next/link";

import prisma from "@/lib/prisma";
import { getSkills } from "@/utils/api";
import { parsePrismaJSON } from "@/utils/parsePrisma";

import ProjectLogo from "./ProjectLogo";
import SkillItem from "../skill/SkillItem";

interface ProjectModalProps {
  id: number;
}

interface ProjectLink {
  href: string;
  label: string;
}

async function getProjectById(id: number) {
  const responseProject = await prisma.project.findUniqueOrThrow({ where: { id } });
  const responseItems = await prisma.projectItem.findMany({ where: { projectId: id }, orderBy: { row_number: "asc" } });

  const { links, skill_ids, ...res } = responseProject;
  const responseSkills = await getSkills(skill_ids);

  return {
    ...res,
    links: links.map(link => parsePrismaJSON<ProjectLink>(link)),
    items: responseItems,
    skills: responseSkills,
  };
}

export default async function ProjectModal({ id }: ProjectModalProps) {
  const { title, sub_title, member, period, skills, links, items } = await getProjectById(id);

  const skillsElement = (
    <ul className="p-0 flex gap-2 list-none flex-wrap">
      {skills.map(({ id, item, blobUrl }) => (
        <li key={`project-info-skill-${id}`} className="indent-0">
          <SkillItem size="xs" label={item} imageUrl={blobUrl} />
        </li>
      ))}
    </ul>
  );

  const linksElement = (
    <div className="flex gap-2 flex-wrap items-center">
      {links.map(({ href, label }) => {
        const isInternal = href.startsWith("/");
        return (
          <Link
            key={`link-${label}`}
            href={href}
            {...(isInternal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      <div id="project-modal-header" className="flex flex-col gap-3 md:gap-6">
        <ProjectLogo id={id} label={title} className="w-12 md:w-14 h-12 md:h-14 text-xl p-1.5" />

        <p className="text-xl md:text-2xl font-semibold leading-normal break-keep mb-4">{parse(title)}</p>

        <div className="flex gap-6 flex-wrap">
          {[
            { title: "프로젝트 설명", content: parse(sub_title), isFull: true },
            { title: "기술 스택", content: skillsElement, isFull: true },
            { title: "참여인원", content: member },
            { title: "기간", content: period },
            ...(links.length ? [{ title: "관련 링크", content: linksElement, isFull: true }] : []),
          ].map(({ title, content, isFull }) => (
            <div key={`project-info-${title}`} className={cn("flex flex-col gap-1", isFull && "w-full")}>
              <p className="text-sm font-medium text-foreground/50">{title}</p>
              <div className="text-sm font-semibold text-foreground/80">{content}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-[1px] min-h-[1px] bg-foreground/10 my-3 md:my-4" />

      <div id="project-modal-content" className="text-sm md:text-base flex flex-col gap-8 md:gap-10">
        {items.map((item, index) => (
          <div key={`project-item-${index}`}>
            <p className="font-semibold text-base md:text-lg mb-2">{item.title}</p>
            {item.blobUrl && (
              <div className="relative w-full aspect-video rounded-md overflow-hidden mb-3 bg-foreground/5">
                <Image src={item.blobUrl} alt={item.title} fill className="object-contain" />
              </div>
            )}
            {item.content.length > 0 && (
              <ul className="text-foreground/80 marker:text-foreground/60 list-disc list-inside -indent-5 pl-5">
                {item.content.map((text, contentIndex) => (
                  <li key={`project-desc-${index}-${contentIndex}`} className="mb-1 last:mb-0">
                    {text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

"use client";

import { skill } from "@prisma/client";
import cn from "classnames";
import parse from "html-react-parser";
import Link from "next/link";

import SkillItem from "../skill/SkillItem";
import ProjectLogo from "./ProjectLogo";

interface ProjectCardProps {
  id: number;
  title: string;
  sub_title: string;
  skills: skill[];
}

const ProjectCard = ({ id, title, sub_title, skills }: ProjectCardProps) => {
  return (
    <Link className="no-underline" href={`/project/${id}`} passHref scroll={false}>
      <div
        id={`project-card-${id}`}
        className={cn(
          "w-full md:w-72 h-fit md:h-72 p-5 md:p-6 bg-background border border-foreground/15 hover:border-foreground/0 rounded-md md:rounded-lg flex flex-col justify-between gap-6 md:gap-0 group",
          id % 3 === 0 && "hover:bg-blue hover:text-white",
          id % 3 === 1 && "hover:bg-green hover:text-white",
          id % 3 === 2 && "hover:bg-lime hover:text-white",
        )}
      >
        <div className="text-lef">
          <ProjectLogo id={id} label={title} className="mb-3 md:mb-4 w-10 h-10 md:w-12 md:h-12 text-lg" />
          <p className=" text-lg md:text-xl font-semibold md:mb-4 no-underline!important">{parse(title)}</p>
          <p className="text-sm font-normal opacity-60 hidden md:inline-block">{parse(sub_title)}</p>
        </div>

        <ul className="p-0 flex gap-2 list-none flex-wrap">
          {skills.map(skill => (
            <li key={`project-${id}-skill-${skill.id}`} className="indent-0">
              <SkillItem label={skill.item} imageUrl={skill.blobUrl} size="xs" />
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
};

export default ProjectCard;

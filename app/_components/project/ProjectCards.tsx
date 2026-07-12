import { project, skill } from "@prisma/client";
import cn from "classnames";

import ProjectCard from "./ProjectCard";

type OmittedProject = Pick<project, "id" | "title" | "sub_title"> & {
  skills: skill[];
};

interface ProjectCardsProps {
  projects: OmittedProject[];
}

// 카드 크기는 ProjectCard 자체(w-72 h-72)에서 고정되므로, 여기서는 줄만 감싸고 가운데 정렬만 담당한다.
// 한 줄에 다 안 들어가면(화면이 좁으면) 자연스럽게 다음 줄로 줄바꿈된다.
const ProjectCards = ({ projects }: ProjectCardsProps) => {
  return (
    <div className={cn("cards flex flex-wrap justify-center gap-6 md:gap-8")}>
      {projects.map(props => (
        <ProjectCard key={`project-card-${props.id}`} {...props} />
      ))}
    </div>
  );
};

export default ProjectCards;

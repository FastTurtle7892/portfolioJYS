import cn from "classnames";

import { getProjectMonogramColor } from "./logos";

interface ProjectLogoProps {
  id: number;
  label: string;
  className?: string;
}

// 별도 로고 이미지가 없는 프로젝트는 제목 첫 글자로 모노그램 배지를 만든다
const ProjectLogo = ({ id, label, className }: ProjectLogoProps) => {
  const initial = label.trim().charAt(0) || "P";

  return (
    <div
      className={cn(
        "rounded-xl bg-white ring-1 ring-foreground/10 shadow-sm overflow-hidden flex items-center justify-center font-bold",
        getProjectMonogramColor(id),
        className,
      )}
    >
      {initial}
    </div>
  );
};

export default ProjectLogo;

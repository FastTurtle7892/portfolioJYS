import cn from "classnames";
import Image from "next/image";

import { getProjectMonogramColor } from "./logos";

interface ProjectLogoProps {
  id: number;
  label: string;
  className?: string;
  logoUrl?: string | null;
}

// logoUrl이 있으면 이미지(예: 소속 기관 로고)를 보여주고, 없는 프로젝트는 제목 첫 글자로 모노그램 배지를 만든다
const ProjectLogo = ({ id, label, className, logoUrl }: ProjectLogoProps) => {
  const initial = label.trim().charAt(0) || "P";

  if (logoUrl) {
    return (
      <div
        className={cn(
          "relative rounded-xl bg-white ring-1 ring-foreground/10 shadow-sm overflow-hidden flex items-center justify-center p-1.5",
          className,
        )}
      >
        <Image src={logoUrl} alt={label} fill unoptimized={logoUrl.endsWith(".webp")} className="object-contain p-1.5" />
      </div>
    );
  }

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

import { Activity, Compass, Radio } from "react-feather";

import cn from "classnames";
import Image from "next/image";

import { getProjectMonogramColor } from "./logos";

interface ProjectLogoProps {
  id: number;
  label: string;
  className?: string;
  logoUrl?: string | null;
}

// logoUrl이 "icon:이름" 형식이면 이미지 대신 해당 아이콘 배지를 보여준다 (학교/기관 로고 없이 프로젝트 성격만 표현할 때 사용).
const ICONS = { compass: Compass, activity: Activity, radio: Radio } as const;
const ICON_PREFIX = "icon:";

// logoUrl이 있으면 이미지(예: 소속 기관 로고)를 보여주고, 없는 프로젝트는 제목 첫 글자로 모노그램 배지를 만든다
const ProjectLogo = ({ id, label, className, logoUrl }: ProjectLogoProps) => {
  const initial = label.trim().charAt(0) || "P";

  if (logoUrl?.startsWith(ICON_PREFIX)) {
    const Icon = ICONS[logoUrl.slice(ICON_PREFIX.length) as keyof typeof ICONS];
    if (Icon) {
      return (
        <div
          className={cn(
            "rounded-xl bg-white ring-1 ring-foreground/10 shadow-sm overflow-hidden flex items-center justify-center",
            getProjectMonogramColor(id),
            className,
          )}
        >
          <Icon className="w-1/2 h-1/2" strokeWidth={2} aria-label={label} />
        </div>
      );
    }
  }

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

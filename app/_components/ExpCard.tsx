"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "react-feather";

import { experience, skill } from "@prisma/client";
import cn from "classnames";
import parse from "html-react-parser";
import Image from "next/image";

import SkillItem from "./skill/SkillItem";

interface ExpCardProps extends Omit<experience, "skill_ids"> {
  skills: skill[];
  projectId?: number;
}

// 원본의 shape-sparkle.svg 대신 인라인 SVG로 동일한 역할(진행 상태 마커)을 표현
const SparkleMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={cn("w-4 h-4 flex-shrink-0", className)}>
    <path d="M12 2L14.2 9.2L21 12L14.2 14.8L12 22L9.8 14.8L3 12L9.8 9.2L12 2Z" fill="currentColor" />
  </svg>
);

const ExpCard = ({ id, period, is_active, title, sub_title, skills, items, logo_url, projectId }: ExpCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDetail = () => {
    setIsExpanded(!isExpanded);
  };

  // 프로젝트명 클릭 시 아래 '프로젝트 상세'의 해당 카드로 스크롤만 한다 (모달은 열지 않음)
  const scrollToProject = () => {
    const target = document.getElementById(`project-card-${projectId}`) ?? document.getElementById("project");
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="grid sm:grid-cols-3 sm:gap-x-10 sm:items-start">
      <div className="flex gap-2.5 sm:justify-end items-center mb-3">
        <SparkleMark className={cn(is_active ? "text-primary" : "text-foreground/30")} />
        <p className="text-sm md:text-base font-normal text-foreground/60">{period}</p>
      </div>

      <div className="pl-6 sm:pl-0 sm:col-span-2 flex flex-col gap-3">
        <div className="flex gap-3 items-start">
          {logo_url && (
            <div className="relative flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden bg-white shadow-sm border border-foreground/10">
              <Image src={logo_url} alt={title} fill={true} className="object-contain p-1" />
            </div>
          )}
          <div className="flex flex-col gap-1">
            {projectId ? (
              <button
                type="button"
                onClick={scrollToProject}
                className="group inline-flex items-center gap-1 w-fit text-left"
              >
                <span className="text-base md:text-lg font-semibold group-hover:text-primary transition-colors">
                  {title}
                </span>
                <ChevronDown className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors" />
              </button>
            ) : (
              <p className="text-base md:text-lg font-semibold ">{title}</p>
            )}
            {sub_title && (
              <p className="text-xs md:text-sm font-normal text-foreground/60 whitespace-pre-wrap">
                {parse(sub_title)}
              </p>
            )}
          </div>
        </div>

        <ul className="p-0 flex gap-2 list-none flex-wrap max-w-80 md:max-w-none">
          {skills.map(skill => (
            <li key={`experience-${id}-skill-${skill.id}`} className="indent-0">
              <SkillItem size="xs" label={skill.item} imageUrl={skill.blobUrl} />
            </li>
          ))}
        </ul>

        <button className="text-primary/75 flex items-center gap-1 mt-2" onClick={toggleDetail}>
          <ChevronRight className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-90")} />
          <p className="text-left text-xs md:text-sm">주요 내용 {isExpanded ? "가리기" : "보기"}</p>
        </button>
        {isExpanded && (
          <ul className="list-disc list-inside bg-foreground/5 rounded-lg p-4 -indent-5 pl-10">
            {items.map((data, index) => (
              <li
                key={`exp-${id}-detail-${index}`}
                className="text-sm md:text-base font-normal mb-1 last:mb-0 text-foreground/80"
              >
                {parse(data)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExpCard;

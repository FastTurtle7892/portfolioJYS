"use client";
import { useState } from "react";

import { Category, skill } from "@prisma/client";
import cn from "classnames";
import { motion, useMotionValue } from "framer-motion";

import SkillItem from "./SkillItem";

// 지원 직무(디지털트윈 플랫폼 개발) 핵심에 맞춰 자신 있는 순으로 차등 노출한다.
// 주력(크게) → 보조(중간) → 그 외(작게)
const PRIMARY_SKILLS = ["C (Embedded)", "C++", "Python", "Java"];
const SECONDARY_SKILLS = ["Spring Boot", "FastAPI", "Docker", "PostgreSQL"];

const skillTier = (item: string) => (PRIMARY_SKILLS.includes(item) ? 0 : SECONDARY_SKILLS.includes(item) ? 1 : 2);
const tierToSize = ["lg", "md", "sm"] as const;

interface SkillItemsProps {
  skills: skill[];
}
const SkillItems = ({ skills }: SkillItemsProps) => {
  const sortedSkills = [...skills].sort((a, b) => skillTier(a.item) - skillTier(b.item));
  const [activeCategory, setActiveCategory] = useState<string>();

  const activeCategoryX = useMotionValue(0);
  const activeCategoryWidth = useMotionValue(0);

  const handleCategoryClick = (e: React.MouseEvent, category: Category) => {
    if (activeCategory === category) {
      setActiveCategory(undefined);
      activeCategoryX.set(0);
      activeCategoryWidth.set(0);
    } else {
      setActiveCategory(category);
      if (e.currentTarget.parentElement) {
        const targetRect = (e.currentTarget as Element).getBoundingClientRect();
        const containerRect = e.currentTarget.parentElement.getBoundingClientRect();

        const x = targetRect.x - containerRect.x;
        const width = targetRect.width;
        activeCategoryX.set(x);
        activeCategoryWidth.set(width);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 items-center">
      <nav className="bg-foreground/[0.07] backdrop-blur-lg p-1.5 rounded-full flex items-center relative">
        {[
          { name: "언어", icon: "💻", value: Category.LANGUAGE },
          { name: "프레임워크", icon: "🧩", value: Category.FRAMEWORK },
          { name: "환경 및 도구", icon: "🛠️", value: Category.ENV_TOOL },
          { name: "데이터/AI", icon: "🤖", value: Category.DATA_AI },
        ].map(({ name, icon, value }) => (
          <button
            key={`nav-item-${value}`}
            className={cn(
              "text-sm sm:text-base font-semibold px-2 sm:px-3 py-1 rounded-full transition-colors",
              activeCategory === value ? "text-foreground" : "text-foreground/60",
            )}
            onClickCapture={e => handleCategoryClick(e, value)}
          >
            <p className="relative z-10">
              {icon} {name}
            </p>
          </button>
        ))}
        <motion.div
          className="absolute bg-background z-0 rounded-full top-1.5 bottom-1.5 left-0 transition-all"
          animate={{ opacity: activeCategory ? 1 : 0 }}
          style={{ x: activeCategoryX, width: activeCategoryWidth }}
          transition={{ duration: 0.5, type: "spring", stiffness: 700, damping: 30 }}
        />
      </nav>
      <div className="flex flex-wrap gap-4 max-w-[28rem] justify-center items-center">
        {sortedSkills.map(skill => (
          <SkillItem
            key={`skill-item-${skill.id}`}
            label={skill.item}
            imageUrl={skill.blobUrl}
            size={tierToSize[skillTier(skill.item)]}
            isActive={!activeCategory || activeCategory === skill.category}
          />
        ))}
      </div>
    </div>
  );
};

export default SkillItems;

"use client";

import { useState } from "react";
import cn from "classnames";
import { ChevronDown } from "react-feather";

interface CollapsibleProps extends React.PropsWithChildren {
  label: string;
  defaultOpen?: boolean;
}

// 기본은 접힌 상태. 클릭하면 펼쳐지는 아코디언 (DS-TWR/AoA 원리처럼 "궁금하면 펼쳐보는" 부가 설명용)
const Collapsible = ({ label, defaultOpen = false, children }: CollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-md border border-foreground/10 bg-foreground/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-sm md:text-base font-semibold text-foreground/80"
        aria-expanded={isOpen}
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 md:w-5 md:h-5 shrink-0 text-foreground/50 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          strokeWidth={2}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-sm md:text-base text-foreground/80 flex flex-col gap-3 border-t border-foreground/10 pt-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default Collapsible;

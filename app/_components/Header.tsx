"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "react-feather";

import cn from "classnames";
import { useAnimate, stagger } from "framer-motion";
import Link from "next/link";

import useOnClickOutside from "@/utils/useOnClickOutside";

import Logo from "./Logo";
import { useSectionWatch } from "./SectionWatcher";

interface HeaderProps extends React.HTMLAttributes<HTMLHeadElement> {}

const navItems = [
  { label: "기술", id: "skill" },
  { label: "경력", id: "experience" },
  { label: "프로젝트", id: "project" },
  { label: "교육", id: "education" },
];

const staggerMenuItems = stagger(0.1, { startDelay: 0.15 });

const Header = ({ className, ...props }: HeaderProps) => {
  const { activeId } = useSectionWatch();

  const [isExpanded, setIsExpanded] = useState(false);
  const [scope, animate] = useAnimate();

  const toggleMobileMenu = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    animate([
      [
        ".mobile-menu",
        { clipPath: isExpanded ? "inset(0% 0% 0% 0% round 16px)" : "inset(0% 10% 100% 90% round 16px)" },
        { type: "spring", bounce: 0, duration: 0.5 },
      ],
      [
        ".mobile-menu-item",
        { opacity: isExpanded ? 1 : 0 },
        { duration: 0.2, delay: isExpanded ? staggerMenuItems : 0, at: "-0.2" },
      ],
    ]);
  }, [isExpanded]);

  useOnClickOutside(scope, () => setIsExpanded(false));

  return (
    <header
      className={cn(
        className,
        "fixed top-0 inset-x-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur-lg",
      )}
      {...props}
      ref={scope}
    >
      <div className="relative w-full max-w-screen-lg mx-auto px-5 md:px-8 h-14 flex justify-between items-center">
        <Link className="no-underline" href="#top">
          <Logo />
        </Link>

        <ul className="hidden sm:flex gap-1 md:gap-1.5 items-center list-none p-0 indent-0 m-0">
          {navItems.map(({ label, id }) => (
            <Link key={`header-item-${id}`} href={`#${id}`} className="no-underline">
              <li
                className={cn(
                  "px-3 md:px-4 py-1.5 rounded-full flex gap-0.5 items-center transition-colors",
                  activeId === id && "bg-foreground/[0.07]",
                )}
              >
                <span
                  className={cn(
                    "text-xs md:text-sm font-semibold whitespace-nowrap",
                    activeId === id ? "text-primary" : "text-foreground/60",
                  )}
                >
                  {label}
                </span>
              </li>
            </Link>
          ))}
        </ul>

        <button className="block sm:hidden" onClick={toggleMobileMenu}>
          {isExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <ul
          className={cn(
            "mobile-menu",
            "absolute top-full right-3 left-3 mt-2",
            "h-fit px-5 py-4 flex flex-col sm:hidden indent-0 rounded-2xl",
            "bg-background/95 backdrop-blur-lg list-none shadow-lg ring-1 ring-foreground/10",
            isExpanded ? "pointer-events-auto" : "pointer-events-none",
          )}
          style={{ clipPath: "inset(0% 50% 100% 50% round 10px)" }}
        >
          {navItems.map(({ label, id }) => (
            <Link key={`header-item-m-${id}`} href={`#${id}`} className={cn("mobile-menu-item", "no-underline")}>
              <li className="py-2.5 text-base font-semibold whitespace-nowrap text-foreground/80">{label}</li>
            </Link>
          ))}
        </ul>
      </div>
    </header>
  );
};

export default Header;

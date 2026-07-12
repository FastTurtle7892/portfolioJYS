import cn from "classnames";
import Image from "next/image";

type Size = "xs" | "sm" | "md" | "lg";
type Breakpoint = "xs" | "sm" | "md";
interface SkillItemProps {
  size?: Size;
  label: string;
  imageUrl: string;
  isActive?: boolean;
}

const mediaQueries: Record<Breakpoint, { min: number; max: number }> = {
  xs: { min: 375, max: 640 },
  sm: { min: 640, max: 768 },
  md: { min: 768, max: 9999 },
};

const itemWidths: Record<Size, number> = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
};

const generateSizeSet = (size: Size) => {
  const viewWidths = Object.entries(mediaQueries).map<[Breakpoint, number]>(([key, { min }]) => [
    key as Breakpoint,
    Math.ceil((itemWidths[size] / min) * 100),
  ]);

  return viewWidths
    .map(([key, value], index) => {
      if (index === viewWidths.length - 1) {
        return `${value}vw`;
      }
      const max = mediaQueries[key].max;
      return `(max-width: ${max}px) ${value}vw`;
    })
    .join(", ");
};

const sizeClasses: Record<Size, string> = {
  xs: "w-6 h-6 text-[8px]",
  sm: "w-8 h-8 text-[9px]",
  md: "w-12 h-12 text-[10px]",
  lg: "w-16 h-16 text-[11px]",
};

const SkillItem = ({ size = "md", label, imageUrl, isActive = true }: SkillItemProps) => {
  return (
    <div
      className={cn(
        "relative group/skill transition-all",
        size === "lg" && "w-16 h-16",
        size === "md" && "w-12 h-12",
        size === "sm" && "w-8 h-8",
        size === "xs" && "w-6 h-6",
        !isActive && "opacity-15 blur-md",
      )}
    >
      {imageUrl ? (
        <div
          className={cn(
            "w-full h-full bg-white flex items-center justify-center p-1 overflow-hidden",
            size === "xs" ? "rounded-xl shadow" : "rounded-2xl shadow-md",
          )}
        >
          <Image className="object-contain p-1" fill={true} src={imageUrl} alt={label} sizes={generateSizeSet(size)} />
        </div>
      ) : (
        <div
          className={cn(
            "w-full h-full flex items-center justify-center rounded-md shadow-md bg-foreground/10 font-semibold text-foreground/70 text-center leading-tight px-0.5",
            sizeClasses[size],
          )}
        >
          {label.slice(0, 3)}
        </div>
      )}
      <p
        className={cn(
          "absolute -bottom-1 translate-y-full left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-foreground/75 text-background rounded text-xs md:text-sm text-center whitespace-nowrap font-normal invisible z-10",
          isActive && "group-hover/skill:visible",
        )}
      >
        {label}
      </p>
    </div>
  );
};

export default SkillItem;

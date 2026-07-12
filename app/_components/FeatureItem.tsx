import { intro } from "@prisma/client";
import { motion, MotionProps } from "framer-motion";
import parse from "html-react-parser";

interface FeatureItemProps extends intro, MotionProps {
  index?: number;
}

// 핵심 역량 3가지를 시각적으로 구분 — 아이콘 + 브랜드 컬러 배지
const ACCENTS = [
  { icon: "📡", badge: "bg-primary/10 text-primary", bar: "bg-primary" },
  { icon: "🛠️", badge: "bg-secondary/15 text-secondary", bar: "bg-secondary" },
  { icon: "🤖", badge: "bg-point/15 text-point", bar: "bg-point" },
];

const FeatureItem = ({ id, title, detail, index = 0, ...props }: FeatureItemProps) => {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <motion.li
      key={`intro-card-${id}`}
      className="group relative flex flex-col gap-4 flex-1 indent-0 w-full max-w-80 bg-white rounded-2xl p-6 md:p-7 shadow-md ring-1 ring-foreground/10 overflow-hidden"
      {...props}
    >
      <span className={`absolute left-0 top-0 h-full w-1 ${accent.bar}`} />
      <div
        className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-2xl md:text-3xl ${accent.badge}`}
      >
        {accent.icon}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-lg md:text-xl font-semibold">{title}</p>
        <p className="text-sm font-normal leading-relaxed text-foreground/60 break-keep">{parse(detail)}</p>
      </div>
    </motion.li>
  );
};

export default FeatureItem;

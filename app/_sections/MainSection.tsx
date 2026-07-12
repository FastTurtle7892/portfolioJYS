"use client";

import { motion } from "framer-motion";

const shapes = [
  { className: "bg-primary", size: "w-16 md:w-20 h-16 md:h-20", delay: 0 },
  { className: "bg-secondary", size: "w-12 md:w-16 h-12 md:h-16", delay: 0.15 },
  { className: "bg-point", size: "w-9 md:w-12 h-9 md:h-12", delay: 0.3 },
];

const MainSection = () => {
  return (
    <div id="main" className="w-full pb-16 pt-10 flex flex-col items-center">
      <div className="w-full flex justify-center items-end gap-4 md:gap-6 mb-8 md:mb-10 h-24 md:h-28">
        {shapes.map(({ className, size, delay }, index) => (
          <motion.div
            key={`hero-shape-${index}`}
            className={`rounded-full ${className} ${size}`}
            initial={{ opacity: 0, y: 40, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay, type: "spring", bounce: 0.4 }}
            whileHover={{ y: -12 }}
          />
        ))}
      </div>

      <p className="text-sm md:text-base font-semibold text-primary tracking-wide mb-3">
        Embedded Systems · Indoor Positioning · Signal Processing
      </p>

      <h1 className="w-full p-6 md:p-8 bg-sand z-40 rounded-2xl">
        안녕하세요,
        <br />
        cm급 정밀도로 세상을 측위하는
        <br />
        임베디드 엔지니어 <em>장윤석</em>입니다.
      </h1>

      <p className="text-center text-base md:text-lg font-normal text-gray-400 break-keep mt-6 mb-6 md:mb-8">
        UWB 신호에서 위상을 복원해 거리 오차를 1cm 이하로 줄이고,
        <br />
        STM32·Jetson Orin 위에서 실시간으로 동작하는 시스템을 만듭니다.
      </p>
    </div>
  );
};

export default MainSection;

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
        Real-time Positioning · Data Pipeline · Digital Twin
      </p>

      <h1 className="w-full p-6 md:p-8 bg-sand z-40 rounded-2xl break-keep">
        안녕하세요,
        <br />
        현실과 가상을 데이터로 잇는
        <br />
        엔지니어 <em>장윤석</em>입니다.
      </h1>

      <p className="text-center text-base md:text-lg font-normal text-gray-400 break-keep mt-6 mb-6 md:mb-8">
        UWB 실시간 위치 인식 시스템에서 패킷 교환 횟수(11회→3회)와 거리측정 오차범위(10cm→1cm)를 개선하고,
        <br />
        Socket·WebSocket·MQTT·ROS2 등 다양한 통신으로 임베디드 장비와 서버 간 데이터를 안정적으로 주고받는 시스템을 만듭니다.
      </p>
    </div>
  );
};

export default MainSection;

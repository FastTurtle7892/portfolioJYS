"use client";

import { useEffect } from "react";

import { intro } from "@prisma/client";
import { stagger, useAnimate, useInView } from "framer-motion";

import FeatureItem from "./FeatureItem";

interface FeatureItemsProps {
  features: intro[];
}

const staggerMenuItems = stagger(0.2, { startDelay: 0.1 });

const FeatureItems = ({ features }: FeatureItemsProps) => {
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope, { margin: "-180px" });

  useEffect(() => {
    if (isInView) {
      animate("li", { opacity: 1, y: 0 }, { duration: 0.6, delay: staggerMenuItems, ease: "easeOut" });
    }
  }, [isInView]);

  return (
    <ul className="flex flex-col md:flex-row gap-5 md:gap-6 p-0 items-stretch justify-center" ref={scope}>
      {features.map((feature, index) => (
        <FeatureItem key={`feature-item-${feature.id}`} {...feature} index={index} style={{ opacity: 0, y: 100 }} />
      ))}
    </ul>
  );
};

export default FeatureItems;

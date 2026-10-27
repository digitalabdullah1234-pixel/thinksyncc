"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "wouter";
import { PAGE_DURATION, EASE } from "@/lib/motion";

const VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const TRANSITION = { duration: PAGE_DURATION, ease: EASE };

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={VARIANTS}
        transition={TRANSITION}
        style={{ position: "relative", width: "100%" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

/**
 * `reducedMotion="user"` makes every motion component on the site skip
 * transform animations for anyone who asked for reduced motion, while still
 * letting opacity settle — so nothing is ever stranded mid-slide.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

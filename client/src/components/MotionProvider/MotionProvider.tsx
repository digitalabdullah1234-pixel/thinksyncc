"use client";

import { MotionConfig } from "framer-motion";
import { type ReactNode } from "react";

interface MotionProviderProps {
  children: ReactNode;
}

/**
 * Wrapper that provides consistent motion configuration across the app.
 * Reduces bundle size by avoiding duplicate MotionConfig instances.
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <MotionConfig
      transition={{
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </MotionConfig>
  );
}
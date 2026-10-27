"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Code2, PhoneCall, ShieldCheck, Waypoints } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { EASE, nudge } from "@/lib/motion";
import { Reveal } from "./Reveal";

const ICONS = [Code2, Waypoints, ShieldCheck, PhoneCall];

export function Services() {
  const { t, dir } = useLanguage();
  const { services } = t;
  const [active, setActive] = useState(0);
  const ActiveIcon = ICONS[active];
  const activeItem = services.items[active];

  return (
    <section id="services" className="border-t border-hairline py-section">
      <div className="shell">
        <div className="max-w-2xl">
          <Reveal>
            <span className="text-fluid-xs uppercase tracking-[0.18em] text-mint">
              {services.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display-cut mt-4 font-display text-fluid-h2 text-ink">
              {services.title}
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-5 text-fluid-lg text-muted">
              {services.intro}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.18}>
          <div className="mt-16 grid grid-cols-1 gap-x-14 gap-y-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col divide-y divide-hairline border-y border-hairline">
              {services.items.map((item, index) => {
                const isActive = index === active;
                return (
                  <motion.button
                    key={item.title}
                    onClick={() => setActive(index)}
                    className={`group flex items-start gap-5 py-6 text-start transition-colors duration-200 ${
                      isActive ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                    {...nudge(dir, 6)}
                  >
                    <span
                      className={`mt-1 font-display text-fluid-sm tabular-nums ${
                        isActive ? "text-mint" : "text-muted"
                      }`}
                    >
                      0{index + 1}
                    </span>
                    <span className="flex-1">
                      <span className="block font-display text-fluid-xl">
                        {item.title}
                      </span>
                      <span className="mt-2 hidden text-fluid-sm text-muted lg:block">
                        {item.summary}
                      </span>
                    </span>
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald transition-opacity duration-200 ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </motion.button>
                );
              })}
            </div>

            <div className="relative mt-2 lg:mt-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeItem.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="rounded-2xl border border-hairline bg-surface p-8 lg:p-10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald/10 text-mint">
                    <ActiveIcon size={22} strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-6 font-display text-fluid-h3 text-ink">
                    {activeItem.title}
                  </h3>
                  <p className="mt-3 text-fluid-sm text-muted">
                    {activeItem.summary}
                  </p>
                  <ul className="mt-7 flex flex-col gap-3.5 border-t border-hairline pt-7">
                    {activeItem.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-fluid-sm text-ink">
                        <Check
                          size={16}
                          strokeWidth={2}
                          className="mt-0.5 shrink-0 text-mint"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

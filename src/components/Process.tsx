"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Reveal, RevealGroup, RevealItem } from "./Reveal";

export function Process() {
  const { t } = useLanguage();
  const { process } = t;

  return (
    <section id="process" className="border-t border-hairline py-section">
      <div className="shell">
        <div className="max-w-2xl">
          <Reveal>
            <span className="text-fluid-xs uppercase tracking-[0.18em] text-mint">
              {process.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display-cut mt-4 font-display text-fluid-h2 text-ink">
              {process.title}
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-5 text-fluid-lg text-muted">
              {process.intro}
            </p>
          </Reveal>
        </div>

        <RevealGroup
          stagger={0.1}
          className="relative mt-20 grid grid-cols-1 gap-y-12 lg:grid-cols-5 lg:gap-x-6 lg:gap-y-0"
        >
          <div
            aria-hidden
            className="absolute start-0 top-6 hidden h-px w-full bg-linear-to-r from-emerald via-emerald/45 to-hairline lg:block rtl:bg-linear-to-l"
          />
          <div
            aria-hidden
            className="absolute top-6 bottom-0 start-6 block w-px bg-hairline lg:hidden"
          />

          {process.steps.map((step, index) => (
            <RevealItem key={step.title} className="relative ps-16 lg:px-2 lg:ps-0">
              {/* Not `relative`: on small screens the number is absolutely placed into
                  the RevealItem's start gutter, and a positioned wrapper here would
                  anchor it inside the padding, straight on top of the title. */}
              <div className="flex items-center justify-start lg:justify-center">
                <span className="absolute start-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border border-emerald/30 bg-surface font-display text-fluid-base text-mint lg:static">
                  0{index + 1}
                </span>
              </div>
              <div className="mt-0 lg:mt-8 lg:text-center">
                <h3 className="font-display text-fluid-lg text-ink">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-fluid-sm text-muted">
                  {step.description}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

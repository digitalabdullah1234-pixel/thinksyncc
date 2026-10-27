"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { liftCard } from "@/lib/motion";
import { Reveal, RevealGroup, RevealItem } from "../Reveal/Reveal";

const PATTERNS = [
  "radial-gradient(circle at 20% 20%, rgba(16,152,90,0.22), transparent 55%), radial-gradient(circle at 80% 80%, rgba(16,152,90,0.13), transparent 55%)",
  "linear-gradient(135deg, rgba(16,152,90,0.20), transparent 62%)",
  "radial-gradient(circle at 75% 25%, rgba(16,152,90,0.22), transparent 52%)",
  "linear-gradient(160deg, rgba(16,152,90,0.20), rgba(16,152,90,0.04) 72%)",
];

export function Projects() {
  const { t } = useLanguage();
  const { projects } = t;

  return (
    <section id="projects" className="border-t border-hairline py-section">
      <div className="shell">
        <div className="max-w-2xl">
          <Reveal>
            <span className="text-fluid-xs uppercase tracking-[0.18em] text-mint">
              {projects.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display-cut mt-4 font-display text-fluid-h2 text-ink">
              {projects.title}
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-5 text-fluid-lg text-muted">
              {projects.intro}
            </p>
          </Reveal>
        </div>

        <RevealGroup
          stagger={0.1}
          className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {projects.items.map((project, index) => (
            <RevealItem key={project.name}>
              <motion.article
                className="group h-full overflow-hidden rounded-2xl border border-hairline bg-surface transition-colors duration-300 hover:border-emerald/40"
                {...liftCard}
              >
                <div
                  className="flex h-44 items-end p-6"
                  style={{ background: PATTERNS[index % PATTERNS.length], backgroundColor: "#eef5f0" }}
                >
                  <span className="text-fluid-xs font-medium uppercase tracking-wider text-mint">
                    {project.category}
                  </span>
                </div>
                <div className="border-t border-hairline p-7">
                  <h3 className="font-display text-fluid-xl text-ink">
                    {project.name}
                  </h3>
                  <p className="mt-3 text-fluid-sm text-muted">
                    {project.description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-emerald/25 bg-emerald/8 px-3 py-1 text-fluid-xs font-medium text-mint"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
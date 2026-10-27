"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { lift } from "@/lib/motion";
import { Aurora } from "../Aurora/Aurora";
import { Reveal } from "../Reveal/Reveal";
import { HeroVideo } from "../HeroVideo/HeroVideo";
import { Laptop } from "../Laptop/Laptop";
import styles from "./Hero.module.css";

/**
 * The hero: a full-viewport dark panel with a drifting aurora behind centred
 * white copy.
 *
 * This is the only dark section on the site. Everything below it stays on the
 * light paper-and-green theme, and the hard cut between the two at the hero's
 * bottom edge is the point — the header's own transparent-to-solid flip is
 * driven off this section's visibility.
 */
export function Hero() {
  const { t } = useLanguage();
  const { hero } = t;

  return (
    <section id="top" className={styles.hero}>
      <HeroVideo />
      <Aurora />

      <div className={`shell ${styles.inner}`}>
        <Reveal delay={0.05}>
          <p className={styles.eyebrow}>{hero.eyebrow}</p>
        </Reveal>

        <Reveal delay={0.12}>
          <h1 className={styles.headline}>
            {hero.headlinePrefix}
            <span className={styles.accent}>{hero.headlineAccent}</span>
            {hero.headlineSuffix}
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className={styles.sub}>{hero.subheading}</p>
        </Reveal>

        <Reveal delay={0.28}>
          <div className={styles.actions}>
            <motion.a
              href="#contact"
              className={`${styles.btn} ${styles.btnPrimary}`}
              {...lift}
            >
              {hero.ctaPrimary}
              <ArrowUpRight size={16} strokeWidth={2} className={styles.arrow} />
            </motion.a>
            <motion.a
              href="#services"
              className={`${styles.btn} ${styles.btnGhost}`}
              {...lift}
            >
              {hero.ctaSecondary}
            </motion.a>
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <Laptop />
        </Reveal>
      </div>
    </section>
  );
}
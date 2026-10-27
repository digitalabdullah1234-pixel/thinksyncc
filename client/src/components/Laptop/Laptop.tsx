"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { EASE } from "@/lib/motion";
import { usePageVisible, useInView } from "@/lib/visibility";
import { useIntroDone } from "@/lib/intro";
import { Logo } from "../Logo/Logo";
import styles from "./Laptop.module.css";

/* ----------------------------------------------------------------- laptop */

/** Local to the rig, which is itself tilted -12deg: +22 here puts the screen
    about 10deg off vertical, the angle someone actually types at. */
const LID_OPEN = 22;
const LID_SHUT = -90;

/* ---------------------------------------------------------------- arrival */

/*
 * The machine flies in once, after the intro hands over, and then opens.
 *
 * The flight is applied to a wrapper OUTSIDE the 3D scene, on purpose. That
 * wrapper has no `preserve-3d`, so the whole model is rasterised flat into it
 * and the browser then moves one texture around — instead of re-sorting and
 * re-rasterising a two-hundred-element 3D scene on every frame of the
 * animation. It looks the same and costs a fraction as much.
 */
const FLIGHT_HIDDEN = {
  transformPerspective: 1400,
  scale: 0.42,
  rotateX: 16,
  rotateY: -26,
  y: 56,
} as const;

const FLIGHT_SHOWN = {
  transformPerspective: 1400,
  scale: 1,
  rotateX: 0,
  rotateY: 0,
  y: 0,
} as const;

/** Long and eased-out: it covers most of the distance early and spends the
    rest of the time arriving, which is what reads as weight. */
const FLIGHT_TRANSITION = { duration: 1.05, ease: EASE } as const;

/** The lid starts lifting just before the flight fully settles, so the two
    read as one continuous move rather than a landing and then a pause. */
const LID_DELAY_MS = 900;

const STILL = { duration: 0 } as const;

/** Pre-formatted code snippets for display — no runtime regex highlighter needed. */
const SNIPPETS = [
  {
    file: "deploy.ts",
    lines: [
      "// provision edge capacity across the Kingdom",
      'import { cluster } from "@thinksync/core";',
      "",
      "export async function deploy(site: Site) {",
      "  const nodes = await cluster.provision({",
      '    region: "me-central-1",',
      "    replicas: 12,",
      "    uptime: 99.99,",
      "  });",
      "",
      "  for (const node of nodes) {",
      "    node.link(site.backbone, { redundancy: 2 });",
      "  }",
      "",
      "  return nodes.map((n) => n.id);",
      "}",
    ],
  },
  {
    file: "harden.ts",
    lines: [
      "// harden every edge node before it ships",
      "export function harden(node: EdgeNode) {",
      "  const policy = definePolicy({",
      "    mtls: true,",
      '    rotateKeys: "24h",',
      '    egress: "deny-by-default",',
      "  });",
      "",
      "  return node.apply(policy);",
      "}",
    ],
  },
  {
    file: "audit.py",
    lines: [
      "# fleet health across every site we run",
      "from thinksync import fleet",
      "",
      "def audit(region: str) -> Report:",
      "    nodes = fleet.scan(region)",
      "    down = [n for n in nodes if not n.alive]",
      "    return Report(",
      "        total=len(nodes),",
      "        healthy=len(nodes) - len(down),",
      "    )",
    ],
  },
  {
    file: "Uptime.tsx",
    lines: [
      "export function Uptime({ sites }: Props) {",
      "  const live = sites.filter((s) => s.up);",
      "",
      "  return (",
      '    <Panel title="Network">',
      "      <Stat value={live.length} label=\"online\" />",
      '      <Chart data={live} accent="#0b7c43" />',
      "    </Panel>",
      "  );",
      "}",
    ],
  },
];

/** How long each file stays on screen. */
const APP_MS = 8000;

/* --------------------------------------------------------------- keyboard */

/** [label, flex weight, small legend]. Every row sums to 15, so the columns
    line up down the deck the way a real keyboard does. */
type KeyDef = [string, number, boolean?];

const wide = (label: string, grow: number): KeyDef => [label, grow, true];
const unit = (label: string): KeyDef => [label, 1];

const KEY_ROWS: KeyDef[][] = [
  [
    wide("esc", 2),
    ...["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"].map(
      (label): KeyDef => [label, 1, true],
    ),
    wide("⏻", 1),
  ],
  [
    ...["~", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "−", "+"].map(unit),
    wide("⌫", 2),
  ],
  [
    wide("⇥", 1.5),
    ...["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]"].map(unit),
    wide("\\", 1.5),
  ],
  [
    wide("⇪", 1.8),
    ...["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"].map(unit),
    wide("⏎", 2.2),
  ],
  [
    wide("⇧", 2.3),
    ...["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"].map(unit),
    wide("⇧", 2.7),
  ],
  [
    wide("ctrl", 1.3),
    wide("fn", 1.1),
    wide("⌥", 1.1),
    wide("⌘", 1.4),
    ["", 5.6],
    wide("⌘", 1.4),
    wide("⌥", 1.1),
    wide("◀", 0.67),
    wide("▲", 0.66),
    wide("▶", 0.67),
  ],
];

/** The deck's 77 keys, resolved once at module scope. */
const KEYS = (() => {
  let index = 0;
  return KEY_ROWS.map((row, r) =>
    row.map(([label, grow, small], k) => ({
      id: `${r}-${k}`,
      label,
      className: `${styles.key} ${small ? styles.small : ""}`,
      style: { flexGrow: grow, "--i": index++ } as React.CSSProperties,
    })),
  );
})();

/** Keyboard component — memoized because it never changes. */
const Keyboard = React.memo(function Keyboard({ open }: { open: boolean }) {
  const [hit, setHit] = useState<string | null>(null);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const strike = (id: string) => {
    setHit(id);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setHit(null), 220);
  };

  return (
    <div className={styles.keyboard} data-lid={open ? "open" : "closed"} aria-hidden>
      {KEYS.map((row, r) => (
        <div key={r} className={styles.krow}>
          {row.map((key) => (
            <span
              key={key.id}
              className={key.className}
              style={key.style}
              data-hit={hit === key.id ? "1" : undefined}
              onPointerDown={() => strike(key.id)}
            >
              <span className={styles.cap}>{key.label}</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
});

/** Simple code display component — no regex highlighter, just pre-formatted lines. */
function CodeDisplay({ lines, active = true }: { lines: string[]; active?: boolean }) {
  const [cursorLine, setCursorLine] = useState(0);
  const [cursorChar, setCursorChar] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!active) return;
    setCursorLine(0);
    setCursorChar(0);
    setDone(false);

    const charDelay = 12;
    const lineDelay = 80;

    const type = () => {
      if (cursorLine >= lines.length) {
        setDone(true);
        return;
      }

      const currentLine = lines[cursorLine];
      if (cursorChar < currentLine.length) {
        setCursorChar((c) => c + 1);
        timerRef.current = window.setTimeout(type, charDelay);
      } else {
        setCursorLine((l) => l + 1);
        setCursorChar(0);
        timerRef.current = window.setTimeout(type, lineDelay);
      }
    };

    timerRef.current = window.setTimeout(type, 100);
    return () => window.clearTimeout(timerRef.current);
  }, [active, lines]);

  const visibleLines = 14;
  const start = Math.max(0, cursorLine - visibleLines + 1);
  const displayLines = lines.slice(start, start + visibleLines);

  return (
    <div className={styles.code}>
      <div className={styles.gutter}>
        {displayLines.map((_, i) => (
          <div key={i}>{start + i + 1 <= cursorLine ? start + i + 1 : "\u200B"}</div>
        ))}
        {displayLines.length < visibleLines &&
          Array.from({ length: visibleLines - displayLines.length }).map((_, i) => (
            <div key={`empty-${i}`}>\u200B</div>
          ))}
      </div>
      <div className={styles.lines}>
        {displayLines.map((line, i) => {
          const absoluteIndex = start + i;
          const isCurrent = absoluteIndex === cursorLine && !done;
          return (
            <div key={i}>
              {absoluteIndex < cursorLine || (isCurrent && cursorChar === line.length) ? (
                <span>{line}</span>
              ) : isCurrent ? (
                <>
                  <span>{line.slice(0, cursorChar)}</span>
                  {!done && <i className={styles.caret} />}
                </>
              ) : (
                "\u200B"
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Laptop() {
  const { t, dir } = useLanguage();
  const reduced = useReducedMotion() ?? false;
  const introDone = useIntroDone();

  const [open, setOpen] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [appIndex, setAppIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || !introDone) return;
    const id = window.setTimeout(() => setOpen(true), LID_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [introDone, reduced]);

  const pageVisible = usePageVisible();
  const onScreen = useInView(wrapRef);
  const awake = pageVisible && onScreen;
  const live = awake && open;

  useEffect(() => {
    if (!live || reduced) return;
    const id = window.setInterval(
      () => setAppIndex((i) => (i + 1) % SNIPPETS.length),
      APP_MS,
    );
    return () => window.clearInterval(id);
  }, [live, reduced]);

  const snippet = SNIPPETS[appIndex];
  const label = open ? t.hero.laptopCloseLabel : t.hero.laptopOpenLabel;
  const toggle = () => setOpen((prev) => !prev);

  return (
    <div ref={wrapRef} className={styles.wrap} data-live={awake ? "1" : "0"}>
      <motion.div
        className={styles.flight}
        initial={FLIGHT_HIDDEN}
        animate={introDone || reduced ? FLIGHT_SHOWN : undefined}
        transition={reduced ? STILL : FLIGHT_TRANSITION}
      >
        <div
          className={styles.scene}
          style={{
            "--ry": dir === "rtl" ? "16deg" : "-16deg",
          } as React.CSSProperties}
        >
          <motion.span
            className={styles.shadow}
            aria-hidden
            animate={{ scaleX: open ? 1 : 0.9, opacity: open ? 1 : 0.8 }}
            transition={{ duration: 0.9, ease: EASE }}
          />
          <motion.span
            className={styles.contact}
            aria-hidden
            animate={{ opacity: open ? 1 : 0.85 }}
            transition={{ duration: 0.9, ease: EASE }}
          />

          {!open && (
            <button
              type="button"
              className={styles.reopen}
              onClick={toggle}
              aria-label={label}
            />
          )}

          <div className={styles.float}>
            <div className={styles.rig}>
              {/* --- lid slab -------------------------------------------- */}
              <motion.div
                className={styles.hinge}
                initial={false}
                animate={{ rotateX: open ? LID_OPEN : LID_SHUT }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 78, damping: 19, mass: 1.5 }
                }
              >
                <div className={styles.lid}>
                  <button
                    type="button"
                    className={`${styles.fFront} ${styles.face}`}
                    onClick={toggle}
                    aria-label={label}
                    aria-pressed={!open}
                  >
                    <span className={styles.cam} aria-hidden />
                    <span className={styles.display} dir="ltr">
                      <span className={styles.app}>
                        <span className={styles.topbar}>
                          <span className={styles.dots} aria-hidden>
                            <span className={`${styles.dot} ${styles.dotR}`} />
                            <span className={`${styles.dot} ${styles.dotY}`} />
                            <span className={`${styles.dot} ${styles.dotG}`} />
                          </span>
                          <span className={styles.fileTab}>{snippet.file}</span>
                        </span>

                        <span className={styles.stageWrap}>
                          <AnimatePresence initial={false} mode="wait">
                            <motion.div
                              key={appIndex}
                              style={{ position: "absolute", inset: 0 }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={reduced ? STILL : { duration: 0.45, ease: EASE }}
                            >
                              <CodeDisplay lines={snippet.lines} active={live && !reduced} />
                            </motion.div>
                          </AnimatePresence>
                        </span>
                      </span>
                      <span className={styles.glare} aria-hidden />
                      <span className={styles.hit} aria-hidden />
                    </span>
                    <span className={styles.chin} aria-hidden>
                      <Logo variant="white" className={styles.chinLogo} />
                    </span>
                  </button>

                  <div className={`${styles.fBack} ${styles.back}`} aria-hidden>
                    <span className={styles.badgeGlow} />
                    <Logo variant="white" className={styles.badge} />
                  </div>

                  <span className={`${styles.eTop} ${styles.metal}`} aria-hidden />
                  <span className={`${styles.eBottom} ${styles.metal}`} aria-hidden />
                  <span className={`${styles.eLeft} ${styles.metalSide}`} aria-hidden />
                  <span className={`${styles.eRight} ${styles.metalSide}`} aria-hidden />
                </div>
              </motion.div>

              {/* --- body slab ------------------------------------------- */}
              <div className={styles.base}>
                <div className={`${styles.fFront} ${styles.deckFace}`}>
                  <span className={styles.barrel} aria-hidden />
                  <Keyboard open={open} />
                  <span className={styles.trackpad} aria-hidden />
                </div>
                <span className={`${styles.fBack} ${styles.underside}`} aria-hidden />
                <span className={`${styles.eTop} ${styles.metal}`} aria-hidden />
                <span className={`${styles.eBottom} ${styles.metal}`} aria-hidden />
                <span className={`${styles.eLeft} ${styles.metalSide}`} aria-hidden />
                <span className={`${styles.eRight} ${styles.metalSide}`} aria-hidden />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
"use client";

import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { EASE } from "@/lib/motion";
import { usePageVisible, useInView } from "@/lib/visibility";
import { useIntroDone } from "@/lib/intro";
import { Logo } from "./Logo";
import styles from "./Laptop.module.css";

/* ------------------------------------------------------- syntax highlight */

/** Token classes, mapped 1:1 onto the colour rules in the stylesheet. */
type Cls = "c" | "s" | "g" | "k" | "t" | "f" | "n" | "v" | "p";
type Token = [Cls, string];
type Lang = "ts" | "jsx" | "py";

const KEYWORDS: Record<Lang, string> = {
  ts: "import|from|export|default|async|await|function|const|let|return|for|of|in|new|class|if|else|interface|type|true|false|null",
  jsx: "import|from|export|default|function|const|let|return|if|else|true|false|null",
  py: "import|from|def|return|if|elif|else|for|in|not|and|or|None|True|False|class|with|as",
};

/**
 * One pass, one regex, alternatives in priority order: comments and strings
 * win over everything, then JSX tags, keywords, types, call sites, numbers,
 * and finally bare identifiers. Everything it doesn't claim stays plain.
 *
 * It only has to be right about these four snippets, not about the language.
 */
function buildPattern(lang: Lang): RegExp {
  const comment = lang === "py" ? String.raw`#[^\n]*` : String.raw`\/\/[^\n]*`;
  const parts = [
    String.raw`(?<c>${comment})`,
    String.raw`(?<s>"[^"]*"|'[^']*')`,
    ...(lang === "jsx" ? [String.raw`(?<g><\/?[A-Za-z][\w.]*|\/>)`] : []),
    String.raw`(?<k>\b(?:${KEYWORDS[lang]})\b)`,
    String.raw`(?<t>\b[A-Z][A-Za-z0-9_]*\b)`,
    String.raw`(?<f>\b[A-Za-z_$][\w$]*(?=\())`,
    String.raw`(?<n>\b\d[\d._]*\b)`,
    String.raw`(?<v>\b[A-Za-z_$][\w$]*\b)`,
  ];
  return new RegExp(parts.join("|"), "g");
}

const PATTERNS: Record<Lang, RegExp> = {
  ts: buildPattern("ts"),
  jsx: buildPattern("jsx"),
  py: buildPattern("py"),
};

function highlight(line: string, lang: Lang): Token[] {
  const re = PATTERNS[lang];
  re.lastIndex = 0;
  const out: Token[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(line)) !== null) {
    if (match.index > last) out.push(["p", line.slice(last, match.index)]);
    const groups = match.groups ?? {};
    const cls = (Object.keys(groups) as Cls[]).find(
      (key) => groups[key] !== undefined,
    );
    out.push([cls ?? "p", match[0]]);
    last = match.index + match[0].length;
  }
  if (last < line.length) out.push(["p", line.slice(last)]);
  return out;
}

/* --------------------------------------------------------------- snippets */

const VSCODE_CODE = `// provision edge capacity across the Kingdom
import { cluster } from "@thinksync/core";

export async function deploy(site: Site) {
  const nodes = await cluster.provision({
    region: "me-central-1",
    replicas: 12,
    uptime: 99.99,
  });

  for (const node of nodes) {
    node.link(site.backbone, { redundancy: 2 });
  }

  return nodes.map((n) => n.id);
}`;

const CURSOR_CODE = `// harden every edge node before it ships
export function harden(node: EdgeNode) {
  const policy = definePolicy({
    mtls: true,
    rotateKeys: "24h",
    egress: "deny-by-default",
  });

  return node.apply(policy);
}`;

const PYTHON_CODE = `# fleet health across every site we run
from thinksync import fleet

def audit(region: str) -> Report:
    nodes = fleet.scan(region)
    down = [n for n in nodes if not n.alive]
    return Report(
        total=len(nodes),
        healthy=len(nodes) - len(down),
    )`;

const REACT_CODE = `export function Uptime({ sites }: Props) {
  const live = sites.filter((s) => s.up);

  return (
    <Panel title="Network">
      <Stat value={live.length} label="online" />
      <Chart data={live} accent="#0b7c43" />
    </Panel>
  );
}`;

/* ----------------------------------------------------------------- typing */

/* Tuned so a snippet finishes just inside its 8s slot on screen. */
const CHAR_MS = 13;
const LINE_PAUSE_MS = 90;

/** A frame that ran long types a burst rather than falling behind — but only
    up to this much, so a GC pause can't dump half a snippet at once. */
const MAX_CATCH_UP_MS = 120;

/**
 * Types a snippet out one character at a time and reports how far it has got.
 *
 * The clock only runs while `active` — a shut lid, a backgrounded tab or a
 * hero that has been scrolled past stops it where it stands rather than
 * resetting it, and each app remounts on its turn so it always starts from a
 * blank editor.
 */
function useTyper(lengths: number[], active: boolean) {
  const [pos, setPos] = useState({ line: 0, ch: 0 });
  /* The loop's own copy, so the effect below depends on `active` alone. The
     old version listed `pos` as a dependency, which tore down and rebuilt a
     setTimeout — and re-ran the whole effect — on every single character. */
  const posRef = useRef(pos);

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    let last = performance.now();
    /** Elapsed time banked but not yet spent on a character. */
    let owed = 0;

    /*
     * One requestAnimationFrame loop instead of a 13ms setTimeout chain.
     *
     * At CHAR_MS = 13 the old version asked React to render about 77 times a
     * second — faster than the display can show, so a fraction of those
     * commits were work nobody ever saw, and each one landed inside the 3D
     * scene. Driving it from rAF caps the work at one commit per frame and
     * keeps the overall pace identical, because characters are spent against
     * real elapsed time rather than counted one per timer.
     */
    const step = (now: number) => {
      owed += Math.min(now - last, MAX_CATCH_UP_MS);
      last = now;

      let { line, ch } = posRef.current;
      let moved = false;

      while (line < lengths.length) {
        const atLineEnd = ch >= lengths[line];
        if (atLineEnd && line === lengths.length - 1) break;
        const cost = atLineEnd ? LINE_PAUSE_MS : CHAR_MS;
        if (owed < cost) break;
        owed -= cost;
        if (atLineEnd) {
          line += 1;
          ch = 0;
        } else {
          ch += 1;
        }
        moved = true;
      }

      if (moved) {
        posRef.current = { line, ch };
        setPos(posRef.current);
      }

      // Finished snippets stop the loop dead rather than idling in it.
      const done = line >= lengths.length - 1 && ch >= lengths[lengths.length - 1];
      if (!done) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [lengths, active]);

  return pos;
}

/** The first `count` characters of a line, still split into its tokens. */
function sliceTokens(tokens: Token[], count: number): Token[] {
  const out: Token[] = [];
  let left = count;
  for (const [cls, text] of tokens) {
    if (left <= 0) break;
    out.push([cls, text.slice(0, left)]);
    left -= text.length;
  }
  return out;
}

function renderTokens(tokens: Token[]) {
  return tokens.map(([cls, text], i) => (
    <span key={i} className={styles[cls]}>
      {text}
    </span>
  ));
}

/**
 * A row that is already fully typed.
 *
 * `tokens` comes straight out of the memoised `lines` array, so its identity
 * never changes — which lets React skip these subtrees entirely. Only the row
 * the caret is on is reconciled per frame, instead of all thirteen and their
 * couple of hundred token spans.
 */
const DoneLine = memo(function DoneLine({ tokens }: { tokens: Token[] }) {
  return <>{renderTokens(tokens)}</>;
});

/** Zero-width space: gives an otherwise empty row its line-height back. */
const ZWSP = "​";

interface CodeProps {
  source: string;
  lang: Lang;
  /** Rows on screen at once — the window the code scrolls through. */
  visible: number;
  active: boolean;
  /** Reduced motion: one finished screenful, no caret, no timers, ever. */
  settled?: boolean;
  gutter?: boolean;
  /** Greyed-out completion parked after the caret, for the Cursor screen. */
  ghost?: string;
}

function Code({
  source,
  lang,
  visible,
  active,
  settled = false,
  gutter = true,
  ghost,
}: CodeProps) {
  const lines = useMemo(
    () => source.split("\n").map((line) => highlight(line, lang)),
    [source, lang],
  );
  const lengths = useMemo(
    () => source.split("\n").map((line) => line.length),
    [source],
  );

  const typed = useTyper(lengths, active);
  // Reduced motion gets the finished snippet rather than an empty editor.
  const line = settled ? lengths.length - 1 : typed.line;
  const ch = settled ? lengths[line] : typed.ch;
  // Once the caret passes the last row on screen the window follows it down.
  const start = Math.max(0, line - visible + 1);
  const rows = Array.from({ length: visible }, (_, i) => start + i);
  const done = line === lengths.length - 1 && ch >= lengths[line];

  return (
    <div className={styles.code}>
      {gutter && (
        <div className={styles.gutter}>
          {rows.map((n) => (
            <div key={n}>{n <= line ? n + 1 : ZWSP}</div>
          ))}
        </div>
      )}
      <div className={styles.lines}>
        {rows.map((n) => (
          <div key={n}>
            {n < line && lines[n] ? <DoneLine tokens={lines[n]} /> : null}
            {n === line && lines[n]
              ? renderTokens(sliceTokens(lines[n], ch))
              : null}
            {n === line && ghost && done ? (
              <span className={styles.ghost}>{ghost}</span>
            ) : null}
            {n === line && !settled ? <i className={styles.caret} /> : null}
            {ZWSP}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- the editor */

/**
 * One editor, four files.
 *
 * This used to be four separate fake applications — VS Code, Cursor, a Python
 * window and a browser preview — each with its own chrome, sidebar, chat panel
 * or terminal, swapped wholesale every eight seconds. That is a lot of DOM
 * inside a 3D scene for something rendered a couple of hundred pixels wide,
 * and it read as four different machines rather than one.
 *
 * Now it is a single editor that cycles its open file. The chrome holds still,
 * so the only thing that ever changes on screen is the code — which is the
 * part anyone actually looks at.
 */
interface Snippet {
  file: string;
  lang: Lang;
  code: string;
}

const SNIPPETS: Snippet[] = [
  { file: "deploy.ts", lang: "ts", code: VSCODE_CODE },
  { file: "harden.ts", lang: "ts", code: CURSOR_CODE },
  { file: "audit.py", lang: "py", code: PYTHON_CODE },
  { file: "Uptime.tsx", lang: "jsx", code: REACT_CODE },
];

/** How long each file stays on screen. Tuned so the typing finishes just
    inside its slot and the finished snippet holds for a beat. */
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
    ...[
      "F1",
      "F2",
      "F3",
      "F4",
      "F5",
      "F6",
      "F7",
      "F8",
      "F9",
      "F10",
      "F11",
      "F12",
    ].map((label): KeyDef => [label, 1, true]),
    wide("⏻", 1),
  ],
  [
    ...["~", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "−", "+"].map(
      unit,
    ),
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

/**
 * The deck.
 *
 * The keys are spans rather than buttons on purpose: they are an easter egg on
 * a decorative graphic, and 77 extra tab stops in front of the hero copy would
 * cost far more than they give. The lid is the one real control here.
 *
 * A key press cannot reach the lid toggle even in principle: the keys sit on
 * the base, which is a sibling of the lid rather than an ancestor of it.
 */
/**
 * The deck's 77 keys, resolved once at module scope.
 *
 * Class name, flex weight and the `--i` hue offset are all constant, so
 * building them — and the style object each key needs — on every render was
 * 77 fresh objects for a graphic that never changes shape.
 */
const KEYS = (() => {
  let index = 0;
  return KEY_ROWS.map((row, r) =>
    row.map(([label, grow, small], k) => ({
      id: `${r}-${k}`,
      label,
      className: `${styles.key} ${small ? styles.small : ""}`,
      style: { flexGrow: grow, "--i": index++ } as CSSProperties,
    })),
  );
})();

/**
 * `memo` because the deck is the single largest piece of DOM in the model and
 * nothing about it depends on the screen. Without it every app swap — and,
 * before the typer was rewritten, every typed character — reconciled all 77
 * keys and their caps for nothing.
 */
const Keyboard = memo(function Keyboard({ open }: { open: boolean }) {
  const [hit, setHit] = useState<string | null>(null);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const strike = (id: string) => {
    setHit(id);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setHit(null), 220);
  };

  return (
    <div
      className={styles.keyboard}
      data-lid={open ? "open" : "closed"}
      aria-hidden
    >
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
  /* Perspective travels with the transform rather than sitting on the parent,
     so it can never leak into the model's own 3D projection. */
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

export function Laptop() {
  const { t, dir } = useLanguage();
  const reduced = useReducedMotion() ?? false;
  const introDone = useIntroDone();
  /*
   * Shut to begin with: the arrival is a closed machine flying in and then
   * opening.
   *
   * Reduced motion never sees the shut state at all — the initialiser reads
   * the preference directly so the very first render already has the lid up,
   * rather than opening it from an effect a tick later and flashing a closed
   * laptop on the way. (This component is `ssr: false`, so there is no server
   * render for that read to disagree with.)
   */
  const [open, setOpen] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [appIndex, setAppIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Opens once, a beat after the flight lands. `introDone` latches, so this
  // can never replay; reduced motion is already open and skips it entirely.
  useEffect(() => {
    if (reduced || !introDone) return;
    const id = window.setTimeout(() => setOpen(true), LID_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [introDone, reduced]);

  /*
   * Two independent questions, and conflating them was costing a great deal.
   *
   *   awake — can anyone see the model at all? Drives `data-live`, which the
   *           stylesheet turns into `animation-play-state: paused` for every
   *           looping animation in here. The float, the keyboard's hue roll,
   *           the caret, the chat shimmer and the React atom all used to run
   *           forever, including while the hero was four sections up the page.
   *           The hue roll in particular animates an inherited custom property
   *           through 154 elements, so every one of those frames was a style
   *           recalculation and a repaint of 77 glowing keycaps for nobody.
   *
   *   live  — is there a screen to type into? Adds the lid being open.
   */
  const pageVisible = usePageVisible();
  const onScreen = useInView(wrapRef);
  const awake = pageVisible && onScreen;
  const live = awake && open;

  // Content that swaps itself every 8s is exactly what reduced motion asks us
  // not to do, so that preference parks the screen on one app.
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
        style={
          // Three-quarter view, face turned in toward the copy — which mirrors
          // on its own in Arabic.
          { "--ry": dir === "rtl" ? "16deg" : "-16deg" } as CSSProperties
        }
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

        {/* Only while the lid is down — see `.reopen` in the stylesheet. */}
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
                  : // Heavy, damped, and just shy of overshooting — a lid on a
                    // stiff hinge rather than a flap.
                    { type: "spring", stiffness: 78, damping: 19, mass: 1.5 }
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
                  {/* Source code reads left-to-right in every locale, so the
                      screen keeps its own direction while the page mirrors. */}
                  <span className={styles.display} dir="ltr">
                    <span className={styles.app}>
                      {/* Chrome holds still; only the code below it changes. */}
                      <span className={styles.topbar}>
                        <span className={styles.dots} aria-hidden>
                          <span className={`${styles.dot} ${styles.dotR}`} />
                          <span className={`${styles.dot} ${styles.dotY}`} />
                          <span className={`${styles.dot} ${styles.dotG}`} />
                        </span>
                        <span className={styles.fileTab}>{snippet.file}</span>
                      </span>

                      <span className={styles.stageWrap}>
                        <AnimatePresence initial={false}>
                          <motion.span
                            key={appIndex}
                            style={{ position: "absolute", inset: 0 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={
                              reduced ? STILL : { duration: 0.45, ease: EASE }
                            }
                          >
                            <Code
                              source={snippet.code}
                              lang={snippet.lang}
                              visible={14}
                              active={live && !reduced}
                              settled={reduced}
                            />
                          </motion.span>
                        </AnimatePresence>
                      </span>
                    </span>
                    <span className={styles.glare} aria-hidden />
                    {/* The sheet that actually takes the toggle click. */}
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
                <span
                  className={`${styles.eBottom} ${styles.metal}`}
                  aria-hidden
                />
                <span
                  className={`${styles.eLeft} ${styles.metalSide}`}
                  aria-hidden
                />
                <span
                  className={`${styles.eRight} ${styles.metalSide}`}
                  aria-hidden
                />
              </div>
            </motion.div>

            {/* --- body slab ------------------------------------------- */}
            <div className={styles.base}>
              <div className={`${styles.fFront} ${styles.deckFace}`}>
                <span className={styles.barrel} aria-hidden />
                <Keyboard open={open} />
                <span className={styles.trackpad} aria-hidden />
              </div>
              <span
                className={`${styles.fBack} ${styles.underside}`}
                aria-hidden
              />
              <span className={`${styles.eTop} ${styles.metal}`} aria-hidden />
              <span
                className={`${styles.eBottom} ${styles.metal}`}
                aria-hidden
              />
              <span
                className={`${styles.eLeft} ${styles.metalSide}`}
                aria-hidden
              />
              <span
                className={`${styles.eRight} ${styles.metalSide}`}
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
      </motion.div>
    </div>
  );
}

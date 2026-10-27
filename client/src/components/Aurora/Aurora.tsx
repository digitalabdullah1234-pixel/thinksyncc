"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useInView, usePageVisible } from "@/lib/visibility";
import styles from "./Aurora.module.css";

/** The ground the whole hero sits on. Everything below is added light. */
const BASE = "#06120D";

interface Blob {
  color: [number, number, number];
  /** Peak alpha at the core, before `lighter` accumulates overlaps. */
  alpha: number;
  /** Radius as a fraction of the canvas diagonal. */
  radius: number;
  /** Home position, in 0..1 of the canvas. */
  x: number;
  y: number;
  /** Drift amplitude, in fractions of the canvas. */
  ax: number;
  ay: number;
  /** Seconds per drift cycle on each axis. Deliberately mismatched, so the
      pair never settles into an obvious loop. */
  px: number;
  py: number;
  /** Phase offset, so they do not all set off from the same corner. */
  phx: number;
  phy: number;
  /** Seconds per breath. The radius swells and settles on this cycle, which is
      what stops the field reading as a static image being slid around. */
  breath: number;
  /** How much of the radius the breath moves, as a fraction. */
  swell: number;
}

/**
 * The palette, in three depth bands: emerald core, bright mid, cool edges.
 *
 * Green holds the two largest radii and the highest alpha, so it dominates by
 * area rather than by shouting. The depth comes from stacking bands that are
 * NOT the same brightness — a flat field is what you get when every blob is
 * equally bright, which is what the first pass did.
 */
const BLOBS: Blob[] = [
  // --- the emerald core -------------------------------------------------
  // Two large brand greens carry the field. They are the darkest and widest,
  // so they read as depth rather than as light sources.
  { color: [14, 122, 74], alpha: 0.62, radius: 0.72, x: 0.34, y: 0.66, ax: 0.10, ay: 0.07, px: 23, py: 31, phx: 0, phy: 1.1, breath: 19, swell: 0.14 },
  { color: [16, 152, 90], alpha: 0.5, radius: 0.56, x: 0.68, y: 0.34, ax: 0.09, ay: 0.08, px: 29, py: 19, phx: 2.2, phy: 0.4, breath: 26, swell: 0.16 },

  // --- the bright mid ---------------------------------------------------
  // Teal and a small, hotter mint sit on top of the greens. The mint is
  // deliberately tiny and low-alpha: it is a highlight, not a fifth blob, and
  // it is what makes the middle of the field look lit from inside.
  { color: [20, 200, 166], alpha: 0.33, radius: 0.46, x: 0.62, y: 0.78, ax: 0.11, ay: 0.07, px: 17, py: 27, phx: 3.4, phy: 2.0, breath: 15, swell: 0.2 },
  // Kept low and off to one side. Sitting it dead centre put the brightest
  // pixel in the whole field directly behind the headline and dropped white
  // text to 4.35:1 — under the AA floor. It glows below the copy instead.
  { color: [47, 208, 138], alpha: 0.17, radius: 0.24, x: 0.44, y: 0.74, ax: 0.13, ay: 0.1, px: 21, py: 35, phx: 4.6, phy: 3.3, breath: 12, swell: 0.26 },

  // --- the cool edges ---------------------------------------------------
  // Blue and violet stay out at the corners and stay dim. Their whole job is
  // to keep the greens from going flat by giving them something cool to fall
  // off into.
  { color: [47, 111, 237], alpha: 0.3, radius: 0.46, x: 0.16, y: 0.22, ax: 0.1, ay: 0.09, px: 37, py: 21, phx: 1.3, phy: 4.1, breath: 23, swell: 0.18 },
  { color: [122, 90, 240], alpha: 0.28, radius: 0.42, x: 0.88, y: 0.62, ax: 0.08, ay: 0.1, px: 25, py: 33, phx: 5.0, phy: 2.7, breath: 29, swell: 0.15 },
  { color: [90, 78, 200], alpha: 0.2, radius: 0.34, x: 0.78, y: 0.9, ax: 0.09, ay: 0.07, px: 31, py: 24, phx: 0.7, phy: 5.4, breath: 17, swell: 0.22 },
];

/** Each blob is drawn once into a sprite this wide, then stamped every frame. */
const SPRITE = 256;

/**
 * Hard ceiling on the backing store's long edge.
 *
 * Nothing in this image has an edge in it — it is seven enormous, very soft
 * radial falloffs. Rendering it at display resolution would burn fill rate on
 * detail that cannot exist, so it is drawn small and the browser's bilinear
 * upscale does the rest, which for a pure gradient is indistinguishable from
 * the real thing. On a 1080p screen this is the cap that binds and the canvas
 * ends up around 560x315 rather than 1920x1080 — about a twentieth of the
 * pixels per frame.
 */
const MAX_EDGE = 560;

/** Requested cap for high-density screens. On all but the smallest phones the
    absolute cap above is stricter and wins. */
const DPR_CAP = 1.5;

function makeSprite(blob: Blob): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = SPRITE;
  c.height = SPRITE;
  const ctx = c.getContext("2d");
  if (!ctx) return c;

  const half = SPRITE / 2;
  const [r, g, b] = blob.color;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  // A long, soft tail. The mid stops keep the core from reading as a hard disc
  // once `lighter` starts stacking them on top of one another.
  grad.addColorStop(0, `rgba(${r},${g},${b},${blob.alpha})`);
  grad.addColorStop(0.35, `rgba(${r},${g},${b},${blob.alpha * 0.45})`);
  grad.addColorStop(0.7, `rgba(${r},${g},${b},${blob.alpha * 0.11})`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SPRITE, SPRITE);
  return c;
}

/**
 * The hero's aurora.
 *
 * One canvas, one requestAnimationFrame loop, seven pre-rendered sprites
 * stamped with `lighter` compositing over a near-black ground. Pre-rendering
 * is what makes the count affordable: building seven radial gradients per
 * frame is real work, while stamping seven ready-made bitmaps is close to
 * free, so the palette can have depth without the loop getting heavier.
 *
 * The loop stops dead whenever the hero is scrolled away or the tab is in the
 * background, and never starts at all under reduced motion — that gets a
 * single static frame instead.
 */
export function Aurora() {
  const reduced = useReducedMotion() ?? false;
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onScreen = useInView(hostRef);
  const pageVisible = usePageVisible();
  const running = onScreen && pageVisible && !reduced;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const sprites = BLOBS.map(makeSprite);
    let w = 0;
    let h = 0;
    let diag = 0;
    let frame = 0;
    let resizeFrame = 0;
    let seconds = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const cssW = Math.max(1, rect.width);
      const cssH = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const ratio = Math.min(dpr, MAX_EDGE / Math.max(cssW, cssH));
      w = Math.max(1, Math.round(cssW * ratio));
      h = Math.max(1, Math.round(cssH * ratio));
      diag = Math.hypot(w, h);
      canvas.width = w;
      canvas.height = h;
    };

    const draw = (t: number) => {
      // Opaque ground: the context is created with `alpha: false`, so there is
      // no transparent backdrop to composite and every frame starts from a
      // known colour.
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = BASE;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < BLOBS.length; i++) {
        const blob = BLOBS[i];
        const cx = (blob.x + Math.sin(t / blob.px + blob.phx) * blob.ax) * w;
        const cy = (blob.y + Math.cos(t / blob.py + blob.phy) * blob.ay) * h;
        // The breath. Scaling a pre-rendered sprite costs nothing extra, so
        // the field can swell and settle for free.
        const r =
          blob.radius * diag * (1 + Math.sin(t / blob.breath + blob.phx) * blob.swell);
        ctx.drawImage(sprites[i], cx - r, cy - r, r * 2, r * 2);
      }
    };

    resize();
    // One frame immediately, so the hero is never a flat black rectangle for
    // the beat before the observer reports or the loop spins up.
    draw(0);

    const onResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        resize();
        draw(seconds);
      });
    };
    window.addEventListener("resize", onResize, { passive: true });

    if (running) {
      const start = performance.now();
      const tick = (now: number) => {
        seconds = (now - start) / 1000;
        draw(seconds);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", onResize);
    };
  }, [running]);

  return (
    <div ref={hostRef} className={styles.layer} aria-hidden>
      <canvas ref={canvasRef} className={styles.canvas} />
      {/* All three static, all three free after the first paint: a flat floor
          that guarantees the contrast ratio wherever the aurora happens to be
          brightest, an edge vignette that holds the eye on the centred copy,
          and a fine grain that breaks up the gradient. */}
      <div className={styles.scrim} />
      <div className={styles.focus} />
      <div className={styles.vignette} />
      <div className={styles.grain} />
    </div>
  );
}
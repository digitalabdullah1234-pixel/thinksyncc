"use client";

import { useEffect, useRef, useState } from "react";
import { INTRO_HARD_TIMEOUT_MS, markIntroDone } from "@/lib/intro";
import { LOGO_WHITE } from "@/components/Logo/Logo";
import styles from "./Preloader.module.css";

const GRAY = [0x4d, 0x55, 0x51] as const;

const FORM_MS = 1150;
const FORM_STAGGER_MS = 350;
const SHINE_MS = 800;
const HOLD_MS = 400;
const FLY_MS = 900;
const HANDOFF_MS = 240;
const FORM_END = FORM_MS + FORM_STAGGER_MS;
const SHINE_END = FORM_END + SHINE_MS;
const HOLD_END = SHINE_END + HOLD_MS;
const FLY_END = HOLD_END + FLY_MS;

const LOGO_WIDTH_RATIO = 0.55;
const SAMPLE_STEP = 4;
const MAX_DOTS = 6000;
const IMAGE_WAIT_MS = 1200;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
const easeInOutCubic = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

interface Dot {
  sx: number; sy: number; tx: number; ty: number;
  diag: number; delay: number; r: number;
  cr: number; cg: number; cb: number; key: number;
}

function sampleLogo(img: HTMLImageElement, w: number, h: number, vw: number, vh: number) {
  const off = document.createElement("canvas");
  off.width = Math.round(w); off.height = Math.round(h);
  const octx = off.getContext("2d", { willReadFrequently: true });
  if (!octx) return [];

  octx.drawImage(img, 0, 0, off.width, off.height);
  const { data } = octx.getImageData(0, 0, off.width, off.height);

  const raw: Array<[number, number, number, number, number]> = [];
  for (let y = 0; y < off.height; y += SAMPLE_STEP) {
    for (let x = 0; x < off.width; x += SAMPLE_STEP) {
      const i = (y * off.width + x) * 4;
      if (data[i + 3] > 128) raw.push([x, y, data[i], data[i + 1], data[i + 2]]);
    }
  }
  if (!raw.length) return [];

  const stride = Math.ceil(raw.length / MAX_DOTS);
  const points = stride > 1 ? raw.filter((_, i) => i % stride === 0) : raw;

  return points.map(([tx, ty, cr, cg, cb]): Dot => {
    let sx: number; let sy: number;
    if (Math.random() < 0.65) {
      sx = Math.random() * vw; sy = -30 - Math.random() * vh * 0.9;
    } else {
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.55 + Math.random() * 0.75;
      sx = vw / 2 + Math.cos(angle) * vw * dist;
      sy = vh / 2 + Math.sin(angle) * vh * dist;
    }

    const qr = Math.round(cr / 12) * 12;
    const qg = Math.round(cg / 12) * 12;
    const qb = Math.round(cb / 12) * 12;

    return {
      sx, sy, tx, ty,
      diag: tx + (h - ty) * 0.45,
      delay: (tx / w) * FORM_STAGGER_MS * 0.55 + Math.random() * FORM_STAGGER_MS * 0.45,
      r: 1.4 + Math.random() * 0.7,
      cr: qr, cg: qg, cb: qb,
      key: (qr << 16) | (qg << 8) | qb,
    };
  });
}

export function Preloader() {
  const [active, setActive] = useState(true);
  const bgRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log("[Preloader] Effect mounted");
    let finished = false;
    let raf = 0;
    const timers: number[] = [];
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;

    const finish = () => {
      console.log("[Preloader] finish() called");
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      for (const id of timers) clearTimeout(id);
      root.style.overflow = prevOverflow;
      markIntroDone();
      setActive(false);
    };

    timers.push(window.setTimeout(finish, INTRO_HARD_TIMEOUT_MS));

    const reduced = false;
    if (reduced) { console.log("[Preloader] Reduced motion detected, skipping"); finish(); return; }
    console.log("[Preloader] Starting animation, reduced=false");

    const canvas = canvasRef.current;
    const bg = bgRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !bg || !ctx) { console.error("[Preloader] Canvas/context not available", { canvas: !!canvas, bg: !!bg, ctx: !!ctx }); finish(); return; }

    root.style.overflow = "hidden";

    const vw = window.innerWidth; const vh = window.innerHeight;
    const small = Math.min(vw, vh) < 700;
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    canvas.style.width = vw + "px"; canvas.style.height = vh + "px";
    ctx.scale(dpr, dpr);

    // VISIBLE TEST: Draw a small red square at top-left to verify canvas renders
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 50, 50);
    console.log("[Preloader] Canvas test draw: red square at (0,0)");

    let started = false;
    const start = (img: HTMLImageElement) => {
      if (finished || started) return;
      started = true;

      console.log("[Preloader] Image loaded, starting animation", { width: img.naturalWidth, height: img.naturalHeight });

      const aspect = img.naturalWidth / img.naturalHeight || 279 / 97;
      const logoW = Math.min(vw * LOGO_WIDTH_RATIO, vw - 64);
      const logoH = logoW / aspect;

      const dots = sampleLogo(img, logoW, logoH, vw, vh);
      if (!dots.length) { console.error("[Preloader] No dots generated"); finish(); return; }
      console.log("[Preloader] Dots generated:", dots.length);

      const buckets = new Map<number, Dot[]>();
      for (const d of dots) {
        const list = buckets.get(d.key);
        if (list) list.push(d); else buckets.set(d.key, [d]);
      }

      let minDiag = Infinity; let maxDiag = -Infinity;
      for (const d of dots) {
        if (d.diag < minDiag) minDiag = d.diag;
        if (d.diag > maxDiag) maxDiag = d.diag;
      }
      const band = logoW * 0.16;

      const homeX = (vw - logoW) / 2; const homeY = (vh - logoH) / 2;

      const DIAG_BUCKETS = 128; const diagSpan = maxDiag - minDiag || 1;

      interface ShineGroup { path: Path2D; diag: number; cr: number; cg: number; cb: number; }

      const shine: ShineGroup[] = [];
      { const byBucket = new Map<number, Map<number, ShineGroup>>();
        for (const d of dots) {
          const slot = Math.min(DIAG_BUCKETS - 1, Math.floor(((d.diag - minDiag) / diagSpan) * DIAG_BUCKETS));
          let byColor = byBucket.get(slot);
          if (!byColor) { byColor = new Map(); byBucket.set(slot, byColor); }
          let group = byColor.get(d.key);
          if (!group) {
            group = { path: new Path2D(), diag: minDiag + ((slot + 0.5) / DIAG_BUCKETS) * diagSpan, cr: d.cr, cg: d.cg, cb: d.cb };
            byColor.set(d.key, group); shine.push(group);
          }
          const x = homeX + d.tx; const y = homeY + d.ty;
          group.path.moveTo(x + d.r, y); group.path.arc(x, y, d.r, 0, Math.PI * 2);
        }
      }

      let flyFrom = { x: homeX, y: homeY, s: 1 };
      let flyTo: { x: number; y: number; s: number } | null = null;
      const t0 = performance.now();

      const draw = (now: number) => {
        const t = now - t0; ctx.clearRect(0, 0, vw, vh);
        let originX = homeX; let originY = homeY; let scale = 1; let flying = false;
        if (t >= HOLD_END && flyTo) {
          flying = true;
          const p = easeInOutCubic(clamp01((t - HOLD_END) / FLY_MS));
          originX = flyFrom.x + (flyTo.x - flyFrom.x) * p;
          originY = flyFrom.y + (flyTo.y - flyFrom.y) * p;
          scale = flyFrom.s + (flyTo.s - flyFrom.s) * p;
        }

        if (t < FORM_END) {
          if (t === 0 || t < 16) console.log("[Preloader] Phase: FORM (gather)");
          ctx.fillStyle = "rgb(" + GRAY[0] + "," + GRAY[1] + "," + GRAY[2] + ")";
          ctx.beginPath();
          for (const d of dots) {
            const p = easeOutCubic(clamp01((t - d.delay) / FORM_MS));
            if (p <= 0) continue;
            const x = d.sx + (homeX + d.tx - d.sx) * p;
            const y = d.sy + (homeY + d.ty - d.sy) * p;
            ctx.moveTo(x + d.r, y); ctx.arc(x, y, d.r, 0, Math.PI * 2);
          }
          ctx.fill();
        } else if (t < SHINE_END) {
          if (t === FORM_END || t < FORM_END + 16) console.log("[Preloader] Phase: SHINE (color sweep)");
          const p = clamp01((t - FORM_END) / SHINE_MS);
          const sweep = minDiag - band + p * (maxDiag - minDiag + band * 2);
          for (const group of shine) {
            const c = clamp01((sweep - group.diag) / (band * 0.9) + 0.5);
            const offset = (group.diag - sweep) / (band * 0.55);
            const hl = Math.exp(-(offset * offset));
            const mix = (g: number, tc: number) => { const v = g + (tc - g) * c; return Math.round(v + (255 - v) * hl * 0.7); };
            ctx.fillStyle = "rgb(" + mix(GRAY[0], group.cr) + "," + mix(GRAY[1], group.cg) + "," + mix(GRAY[2], group.cb) + ")";
            ctx.fill(group.path);
          }
        } else {
          if (t === SHINE_END || t < SHINE_END + 16) console.log("[Preloader] Phase: HOLD + FLY");
          const rScale = Math.max(scale, 0.28);
          for (const [key, list] of buckets) {
            ctx.fillStyle = "rgb(" + ((key >> 16) & 255) + "," + ((key >> 8) & 255) + "," + (key & 255) + ")";
            ctx.beginPath();
            for (const d of list) {
              const x = originX + d.tx * scale; const y = originY + d.ty * scale; const r = d.r * rScale;
              ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2);
            }
            ctx.fill();
          }
        }
        if (flying && t >= FLY_END + 200) { finish(); return; }
        if (!finished) raf = requestAnimationFrame(draw);
      };

      raf = requestAnimationFrame(draw);
      console.log("[Preloader] Animation loop started");

      timers.push(window.setTimeout(() => {
        if (finished) return;
        console.log("[Preloader] Phase 5: FLY to header logo");
        const slot = document.querySelector("[data-header-logo]");
        const mark = slot?.querySelector("img") ?? slot;
        const rect = mark?.getBoundingClientRect();

        bg.style.transition = "opacity " + FLY_MS + "ms ease-in-out"; bg.style.opacity = "0";

        if (rect && rect.width > 0) {
          flyFrom = { x: homeX, y: homeY, s: 1 };
          flyTo = { x: rect.left, y: rect.top, s: rect.width / logoW };
          console.log("[Preloader] Fly target:", rect);
        } else {
          console.warn("[Preloader] No header logo found, fading in place");
          canvas.style.transition = "opacity " + FLY_MS + "ms ease-in-out"; canvas.style.opacity = "0";
        }
        timers.push(window.setTimeout(() => {
          console.log("[Preloader] HANDOFF: marking intro done, fading canvas");
          markIntroDone(); canvas.style.transition = "opacity " + HANDOFF_MS + "ms ease-out"; canvas.style.opacity = "0";
        }, Math.max(0, FLY_MS - HANDOFF_MS)));

        timers.push(window.setTimeout(finish, FLY_MS + 80));
      }, HOLD_END));
    };

    const img = new Image(); img.decoding = "async";
    img.onload = () => {
      console.log("[Preloader] Image onload fired", { complete: img.complete, naturalWidth: img.naturalWidth });
      try { start(img); } catch (e) { console.error("[Preloader] Error in start:", e); finish(); }
    };
    img.onerror = (e) => { console.error("[Preloader] Image load error:", e); finish(); };
    img.src = LOGO_WHITE;
    console.log("[Preloader] Image src set:", LOGO_WHITE);
    if (img.complete && img.naturalWidth > 0) {
      console.log("[Preloader] Image already cached, starting immediately");
      try { start(img); } catch (e) { console.error("[Preloader] Error in cached start:", e); finish(); }
    }
    timers.push(window.setTimeout(() => {
      console.log("[Preloader] Image wait timeout");
      if (!img.complete || img.naturalWidth === 0) finish();
    }, IMAGE_WAIT_MS));

    return () => { console.log("[Preloader] Cleanup"); finished = true; cancelAnimationFrame(raf); for (const id of timers) clearTimeout(id); root.style.overflow = prevOverflow; };
  }, []);

  if (!active) return null;

  return (
    <div data-preloader="" aria-hidden="true" className={styles.hero}>
      <div ref={bgRef} className={styles.bg} />
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}

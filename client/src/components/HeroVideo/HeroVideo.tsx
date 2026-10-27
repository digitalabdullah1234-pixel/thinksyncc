"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { usePageVisible, useInView } from "@/lib/visibility";
import styles from "./HeroVideo.module.css";

const SRC = "/hero-bg.mp4";

/**
 * The hero's background film.
 *
 * The file is ~9MB, so nothing about it is allowed onto the critical path:
 *
 *   - the `<video>` mounts with no `src` at all, so the browser cannot begin
 *     fetching during the initial render;
 *   - the source is attached on an idle callback after paint, so the hero's
 *     text and the laptop are interactive first;
 *   - `preload="none"` keeps even that attachment from pulling data until
 *     playback is asked for.
 *
 * The solid ground colour lives on the section itself, underneath. If the file
 * is missing, decodes badly, or never gets an idle moment, the hero is a solid
 * dark panel and every other part of it is unaffected.
 *
 * Playback is also suspended whenever nobody can see it — scrolled past, or a
 * backgrounded tab — because decoding video off-screen is pure battery cost.
 */
export function HeroVideo() {
  const reduced = useReducedMotion() ?? false;
  const videoRef = useRef<HTMLVideoElement>(null);
  /* The ground layer is always present; the <video> is not, so this is what
     gets watched. */
  const layerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  /* Flipped once the source is attached, so the play/pause effect below re-runs
     and takes charge of a video that only just acquired one. */
  const [ready, setReady] = useState(false);

  // Both come from one page-wide listener and one page-wide observer, shared
  // with the laptop and every scroll reveal, rather than a second pair here.
  const pageVisible = usePageVisible();
  const onScreen = useInView(layerRef);

  useEffect(() => {
    // Reduced motion never gets a moving background; the solid panel is the
    // whole treatment, so there is nothing to download either.
    if (reduced) return;
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    let idle = 0;

    const attach = () => {
      if (cancelled || video.src) return;
      video.src = SRC;
      video.load();
      // Playback itself is left to the effect below, which knows whether the
      // hero is actually on screen — a page scrolled past the hero during the
      // idle wait must not start decoding just because the timer fired.
      setReady(true);
    };

    // Attach after paint, and never before the browser is idle. Safari only
    // shipped requestIdleCallback recently, so a timeout stands in for it.
    const canIdle = typeof window.requestIdleCallback === "function";
    idle = canIdle
      ? window.requestIdleCallback(attach, { timeout: 2500 })
      : window.setTimeout(attach, 900);

    return () => {
      cancelled = true;
      if (canIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [reduced]);

  // Suspend decoding whenever the hero is off-screen or the tab is hidden.
  useEffect(() => {
    if (reduced) return;
    const video = videoRef.current;
    if (!video || !ready) return;

    // Autoplay can still be refused (data saver, power saving); that is a
    // fallback to the solid panel, not an error worth surfacing.
    if (pageVisible && onScreen) void video.play().catch(() => {});
    else video.pause();
  }, [reduced, ready, pageVisible, onScreen]);

  return (
    <div ref={layerRef} className={styles.layer} aria-hidden>
      {reduced || failed ? null : (
        <video
          ref={videoRef}
          className={styles.video}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          onError={() => setFailed(true)}
        />
      )}
      {/* Two passes: a flat wash that guarantees a contrast floor wherever the
          footage is bright, and a bottom gradient that anchors the copy. */}
      <div className={styles.scrim} />
      <div className={styles.fade} />
    </div>
  );
}
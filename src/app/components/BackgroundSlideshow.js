"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { cldUrl } from "@/lib/cloudinary";

const DURATION = 5000; // visible time per slide
const FADE = 2500; // crossfade duration
const RESIZE_DEBOUNCE = 150; // resize debounce
const FAILSAFE_TIMEOUT = 10000; // first paint fallback

export default function BackgroundSlideshow({
  desktopSlides = [],
  mobileSlides = [],
}) {
  const [isMobile, setIsMobile] = useState(false); // decided on client
  const [reducedMotion, setReducedMotion] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [firstImageLoaded, setFirstImageLoaded] = useState(false);
  const [currentImageError, setCurrentImageError] = useState(false);

  const firstRevealDoneRef = useRef(false); // <-- avoid re-running first-paint on wrap
  const randomIndexAppliedRef = useRef(false); // Track if we've applied random index
  const advanceTimeoutRef = useRef(null);
  const resizeTimerRef = useRef(null);
  const failsafeTimerRef = useRef(null);

  const slides = useMemo(
    () => (isMobile ? mobileSlides : desktopSlides),
    [isMobile, mobileSlides, desktopSlides]
  );

  // Randomize initial index on client-side mount
  useEffect(() => {
    if (!randomIndexAppliedRef.current && slides && slides.length > 0) {
      const randomIdx = Math.floor(Math.random() * slides.length);
      setCurrentIndex(randomIdx);
      randomIndexAppliedRef.current = true;
    }
  }, [slides]);

  // ---------- helpers ----------
  const clearAdvanceTimer = () => {
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  };

  const scheduleNextAdvance = useCallback(() => {
    clearAdvanceTimer();
    if (reducedMotion || !slides || slides.length <= 1) return;
    advanceTimeoutRef.current = setTimeout(() => {
      advanceSlide();
    }, DURATION);
  }, [slides, reducedMotion]);

  const preloadIndex = useCallback(
    (idx) => {
      if (!slides || slides.length === 0) return;
      const bounded = ((idx % slides.length) + slides.length) % slides.length;
      const publicId = slides[bounded]?.public_id;
      if (!publicId) return;
      const img = new window.Image();
      img.src = cldUrl({ publicId, isMobile }); // warm cache; no render
    },
    [slides, isMobile]
  );

  const advanceSlide = useCallback(() => {
    if (!slides || slides.length <= 1) return;

    setCurrentIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % slides.length;

      // pair fade: prev → out, current → in
      setPrevIndex(prevIndex);
      setIsTransitioning(true);

      setTimeout(
        () => {
          setPrevIndex(null);
          setIsTransitioning(false);
          scheduleNextAdvance();
          if (!reducedMotion) preloadIndex(nextIndex + 1);
        },
        reducedMotion ? 0 : FADE
      );

      return nextIndex;
    });
  }, [slides, scheduleNextAdvance, preloadIndex, reducedMotion]);

  // ---------- effects ----------
  // Decide mobile/desktop on mount + debounced resize
  useEffect(() => {
    const updateIsMobile = () => {
      const m = window.innerWidth < 640;
      setIsMobile((prev) => {
        if (prev !== m) {
          const newSlides = m ? mobileSlides : desktopSlides;
          const len = newSlides?.length || 0;
          if (len > 0) {
            const normalizedIndex = currentIndex % len;
            setCurrentIndex(normalizedIndex);
            setPrevIndex(null);
            setIsTransitioning(false);
            // Reschedule after breakpoint switch
            if (firstRevealDoneRef.current) {
              scheduleNextAdvance();
              if (!reducedMotion) preloadIndex(normalizedIndex + 1);
            }
          }
        }
        return m;
      });
    };
    updateIsMobile();
    const onResize = () => {
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(updateIsMobile, RESIZE_DEBOUNCE);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    };
  }, [desktopSlides, mobileSlides]);

  // Prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(!!mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Pause/resume when tab hidden/visible
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        clearAdvanceTimer();
      } else {
        if (firstRevealDoneRef.current) scheduleNextAdvance();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [scheduleNextAdvance]);

  // First paint: run exactly once
  useEffect(() => {
    if (!slides || slides.length === 0) return;
    if (firstRevealDoneRef.current) return; // already did the reveal

    setFirstImageLoaded(false);
    setCurrentImageError(false);

    // failsafe so we never stay black forever
    if (failsafeTimerRef.current) clearTimeout(failsafeTimerRef.current);
    failsafeTimerRef.current = setTimeout(() => {
      setFirstImageLoaded(true);
      firstRevealDoneRef.current = true;
      scheduleNextAdvance();
      if (!reducedMotion) preloadIndex(currentIndex + 1);
    }, FAILSAFE_TIMEOUT);

    return () => {
      if (failsafeTimerRef.current) {
        clearTimeout(failsafeTimerRef.current);
        failsafeTimerRef.current = null;
      }
    };
    // intentionally no deps on index — first paint only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides?.length, reducedMotion, scheduleNextAdvance, preloadIndex]);

  // After we’re past first reveal, keep scheduling & preloading
  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    if (!firstRevealDoneRef.current) return;
    clearAdvanceTimer();
    scheduleNextAdvance();
    if (!reducedMotion) preloadIndex(currentIndex + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, slides?.length, reducedMotion]);

  // ---------- handlers ----------
  const onFirstHeroLoad = useCallback(() => {
    setFirstImageLoaded(true);
    if (failsafeTimerRef.current) {
      clearTimeout(failsafeTimerRef.current);
      failsafeTimerRef.current = null;
    }
    if (!firstRevealDoneRef.current) {
      firstRevealDoneRef.current = true;
      scheduleNextAdvance();
      if (!reducedMotion) preloadIndex(currentIndex + 1);
    }
  }, [scheduleNextAdvance, preloadIndex, reducedMotion, currentIndex]);

  const onCurrentError = useCallback(() => {
    const id = slides?.[currentIndex]?.public_id;
    console.error("Image load error:", id);
    setCurrentImageError(true);

    if (!firstRevealDoneRef.current) {
      // first hero failed under the mask → try next
      if (slides.length > 1) {
        setCurrentIndex(1);
      } else {
        // nothing to show: lift mask to avoid permanent black
        setFirstImageLoaded(true);
        firstRevealDoneRef.current = true;
      }
    } else {
      // later error: skip gracefully
      if (slides.length > 1) advanceSlide();
    }
  }, [slides, currentIndex, advanceSlide]);

  // ---------- render ----------
  if (!slides || slides.length === 0) {
    return (
      <div
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, zIndex: 0, background: "#000" }}
      />
    );
  }

  const current = slides[currentIndex];
  const prev = prevIndex != null ? slides[prevIndex] : null;

  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0 }}>
      {/* Black overlay — lifts only once on first hero load or failsafe */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#000",
          transition: firstImageLoaded ? "opacity 300ms ease" : "none",
          opacity: firstImageLoaded ? 0 : 1,
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* Previous layer (only during crossfade) */}
      {prev && (
        <Layer
          publicId={prev.public_id}
          alt={prev.alt || ""}
          isMobile={isMobile}
          fadeOutMs={isTransitioning && !reducedMotion ? FADE : 0}
          zIndex={1}
        />
      )}

      {/* Current layer (always rendered) */}
      {current && !currentImageError && (
        <Layer
          key={currentIndex} // Key to force remount on index change
          publicId={current.public_id}
          alt={current.alt || ""}
          isMobile={isMobile}
          fadeInMs={isTransitioning && !reducedMotion ? FADE : 0}
          zIndex={2}
          priority={!firstRevealDoneRef.current} // priority only at very first render
          onLoad={!firstRevealDoneRef.current ? onFirstHeroLoad : undefined}
          onError={onCurrentError}
        />
      )}
    </div>
  );
}

function Layer({
  publicId,
  alt,
  isMobile,
  fadeInMs = 0,
  fadeOutMs = 0,
  zIndex = 1,
  priority = false,
  onLoad,
  onError,
}) {
  const [opacity, setOpacity] = useState(() => (fadeInMs > 0 ? 0 : 1));

  useEffect(() => {
    // Reset and animate based on fade props
    if (fadeInMs > 0) {
      setOpacity(0);
      const timer = setTimeout(() => setOpacity(1), 10);
      return () => clearTimeout(timer);
    }
    if (fadeOutMs > 0) {
      setOpacity(0);
    }
    // When there's no fade, set to 1 immediately
    if (fadeInMs === 0 && fadeOutMs === 0) {
      setOpacity(1);
    }
  }, [fadeInMs, fadeOutMs]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex,
        opacity,
        willChange: fadeInMs || fadeOutMs ? "opacity" : "auto",
        transition:
          fadeInMs || fadeOutMs
            ? `opacity ${Math.max(
                fadeInMs,
                fadeOutMs
              )}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
            : undefined,
      }}
    >
      <Image
        src={cldUrl({ publicId, isMobile })}
        alt={alt}
        fill
        sizes="100vw"
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        style={{ objectFit: "cover", objectPosition: "50% 50%" }}
        onLoad={onLoad}
        onError={onError}
      />
    </div>
  );
}

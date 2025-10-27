# Homepage Slideshow Performance Optimization

## Philosophy: Black-Until-Ready

This slideshow uses a "black-until-ready" approach:

- **Never show low-quality images** (no LQIP/blur placeholders)
- Black overlay covers viewport until first hero `onLoad` fires (or 8s failsafe)
- Users always see sharp, fully-loaded images
- Premium perceived performance over quantity

## Cloudinary Transform

### URL Format

```
c_fill,g_center,ar_X:Y,f_auto,q_auto:good,dpr_auto,w_{W},h_{H}
```

### Size Presets

- **Desktop (16:9)**: 1920×1080
- **Mobile (4:5)**: 640×800

### Target Bytes

- Desktop: ≤ 350 KB
- Mobile: ≤ 200 KB

Verify in Network tab. If exceeded, slightly reduce w×h before relaxing quality.

## Aspect Ratio Locking

Explicit AR prevents perceptual zoom between slides:

- `ar_16:9` for desktop
- `ar_4:5` for mobile

## Crossfade Timing

- Duration: 900ms cubic-bezier ease
- **Never starts until next image is fully loaded**
- Uses `will-change: opacity` for smooth transitions

## Error Handling

1. **First hero error**: Immediately try next slide under mask, unveil only after it loads
2. **Later slide error**: Skip gracefully, keep previous image visible
3. **Never show black between slides**

## Visibility Pause

Slideshow pauses when tab is hidden (`document.hidden`), resumes on visible without jump cuts.

## Debounced Resize

- Resize debounced to 150ms
- Re-modulo index when switching desktop↔mobile sets
- Timer clears and restarts on breakpoint change

## Reduced Motion

- No crossfades (instant swaps only)
- No aggressive preloading beyond current hero
- Respects `prefers-reduced-motion: reduce`

## Web Vitals Targets

- LCP: < 2.5s
- CLS: ≈ 0.00
- INP: < 200ms
- FID: < 100ms
- TTFB: < 800ms

Logs are console-colored with budget warnings.

## Preloading Strategy

- Preload **exactly one** next slide with the exact transformed URL
- Track `nextImageLoaded` state per slide
- Start fade only after image `onLoad` fires
- **Never preload both mobile + desktop**—only active breakpoint

## Testing Checklist

1. ✅ Black overlay lifts only after hero `onLoad` (or 8s fallback)
2. ✅ Network shows AVIF/WebP via `f_auto` at expected w×h
3. ✅ Bytes: Desktop ≤ 350 KB, Mobile ≤ 200 KB
4. ✅ No hydration warnings; console clean
5. ✅ Lighthouse CLS ≈ 0.00
6. ✅ Crossfade starts only when next image is fully sharp
7. ✅ Tab switching pauses/resumes without jump cuts
8. ✅ Broken `public_id` skips gracefully (no black flash)
9. ✅ Reduced-motion = instant swaps, minimal preloads
10. ✅ Resize/breakpoint swap = correct set, no errors, no black frames

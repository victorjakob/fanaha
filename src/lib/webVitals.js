"use client";

import { onLCP, onCLS, onINP, onTTFB } from "web-vitals";

function logMetric() {
  // Web vitals are reported; no console output in production.
}

export function trackWebVitals() {
  onLCP(logMetric);
  onCLS(logMetric);
  onINP(logMetric);
  onTTFB(logMetric);
}

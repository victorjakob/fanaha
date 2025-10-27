"use client";

import { onLCP, onCLS, onINP, onTTFB } from "web-vitals";

const thresholds = {
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  TTFB: { good: 800, poor: 1800 },
};

function logMetric(metric) {
  const { name, value, rating } = metric;
  const threshold = thresholds[name] || { good: 0, poor: 0 };

  let emoji = "✅";
  let color = "#10b981"; // green

  if (rating === "poor") {
    emoji = "🔴";
    color = "#ef4444"; // red
  } else if (rating === "needs-improvement" || value > threshold.good) {
    emoji = "🟡";
    color = "#f59e0b"; // yellow
  }

  const message = `${emoji} ${name}: ${Math.round(value)}${
    name === "CLS" ? "" : "ms"
  }`;

  console.log(
    `%c${message} (${rating})`,
    `color: ${color}; font-weight: bold;`
  );

  // Warn if near poor threshold
  if (rating === "needs-improvement" || value > threshold.good) {
    console.warn(
      `⚠️  ${name} exceeds budget (${
        value > threshold.good ? "poor" : "needs-improvement"
      })`
    );
  }
}

export function trackWebVitals() {
  onLCP(logMetric);
  onCLS(logMetric);
  onINP(logMetric);
  onTTFB(logMetric);
}

"use client";

import { useEffect, useRef, useState } from "react";

export default function InstagramEmbed({ url }) {
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return;

    // Load Instagram embed script
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = () => {
      // Process embeds after script loads
      if (window.instgrm) {
        window.instgrm.Embeds.process();
        setIsLoaded(true);
      }
    };
    script.onerror = () => {
      setError(true);
    };

    document.body.appendChild(script);

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [url]);

  // Re-process when URL changes
  useEffect(() => {
    if (isLoaded && window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }, [url, isLoaded]);

  if (!url) return null;

  // Extract Instagram post/reel URL and create embed URL
  const getEmbedUrl = (url) => {
    // Handle various Instagram URL formats
    const match = url.match(/instagram\.com\/(p|reel)\/([^/?]+)/);
    if (match) {
      const [, type, id] = match;
      return `https://www.instagram.com/${type}/${id}/embed`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(url);

  if (error || !embedUrl) {
    return (
      <div className="w-full max-w-xl mx-auto p-6 bg-zinc-50 rounded-lg border border-zinc-200 text-center">
        <p className="text-sm text-zinc-600 mb-2">
          Unable to load Instagram content
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          View on Instagram
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto flex justify-center my-8">
      <div
        ref={containerRef}
        className="instagram-embed-container w-full"
        style={{ maxWidth: "400px", minHeight: "500px" }}
      >
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{
            background: "#FFF",
            border: "0",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            margin: "0 auto",
            maxWidth: "400px",
            minWidth: "280px",
            padding: "0",
            width: "calc(100% - 2px)",
          }}
        >
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#FFFFFF",
              lineHeight: "0",
              padding: "40px 0",
              textAlign: "center",
              textDecoration: "none",
              width: "100%",
              display: "block",
            }}
          >
            <p
              style={{
                margin: "8px 0 0 0",
                padding: "0 4px",
                color: "#3897f0",
              }}
            >
              View on Instagram
            </p>
          </a>
        </blockquote>
      </div>
    </div>
  );
}

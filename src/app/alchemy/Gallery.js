"use client";
import React from "react";
import { useEffect, useState } from "react";
import AlchemyArtPiece from "./ArtPiece";

export default function AlchemyGallery({ artPieces }) {
  // Arrow delay state - must be before early return
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowArrow(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!artPieces) return <div className="text-zinc-400">Loading...</div>;

  const available = artPieces.filter((a) => a.status === "available");
  const commission = artPieces.filter((a) => a.status === "commission");
  const sold = artPieces.filter((a) => a.status === "sold");

  return (
    <section className="w-full flex flex-col items-center">
      <div className="w-full flex flex-col items-center gap-8 sm:gap-16 py-4 sm:py-8 px-2 sm:px-4 pb-32">
        {available.length > 0 && (
          <>
            <div className="flex flex-col items-center">
              <h2 className="text-xl sm:text-2xl font-light text-center tracking-tight font-serif text-black drop-shadow-md">
                Available
              </h2>
              <div className="flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={`w-6 h-6 sm:w-7 sm:h-7 text-black animate-bounce-slow transition-opacity duration-700 ${
                    showArrow ? "opacity-70" : "opacity-0"
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25L12 15.75 4.5 8.25"
                  />
                </svg>
              </div>
            </div>
            {available.map((piece, idx) => (
              <div key={piece.slug || piece.id}>
                <AlchemyArtPiece
                  slug={piece.slug || piece.id}
                  title={piece.name}
                  mainImage={piece.images?.[0] || "/alchemy/placeholder.png"}
                  status={piece.status || "available"}
                  dimensions={piece.dimensions}
                  palette={piece.palette}
                  price={piece.price}
                />
              </div>
            ))}
          </>
        )}
        {commission.length > 0 && (
          <>
            <div className="w-full flex justify-center mt-12 sm:mt-20 mb-6 sm:mb-8">
              <div className="flex flex-col items-center">
                <h2 className="text-xl sm:text-2xl font-light text-center tracking-tight font-serif text-black drop-shadow-md">
                  Commission
                </h2>
                <div className="flex justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`w-6 h-6 sm:w-7 sm:h-7 text-black animate-bounce-slow transition-opacity duration-700 ${
                      showArrow ? "opacity-70" : "opacity-0"
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25L12 15.75 4.5 8.25"
                    />
                  </svg>
                </div>
              </div>
            </div>
            {commission.map((piece, idx) => (
              <div key={piece.slug || piece.id}>
                <AlchemyArtPiece
                  slug={piece.slug || piece.id}
                  title={piece.name}
                  mainImage={piece.images?.[0] || "/alchemy/placeholder.png"}
                  status={piece.status || "available"}
                  dimensions={piece.dimensions}
                  palette={piece.palette}
                  price={piece.price}
                />
              </div>
            ))}
          </>
        )}
        {sold.length > 0 && (
          <>
            <div className="w-full flex justify-center mt-12 sm:mt-20 mb-6 sm:mb-8">
              <div className="flex flex-col items-center">
                <h2 className="text-xl sm:text-2xl font-light text-center tracking-tight font-serif text-black drop-shadow-md">
                  Sold
                </h2>
                <div className="flex justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`w-6 h-6 sm:w-7 sm:h-7 text-black animate-bounce-slow transition-opacity duration-700 ${
                      showArrow ? "opacity-70" : "opacity-0"
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25L12 15.75 4.5 8.25"
                    />
                  </svg>
                </div>
              </div>
            </div>
            {sold.map((piece, idx) => (
              <div key={piece.slug || piece.id}>
                <AlchemyArtPiece
                  slug={piece.slug || piece.id}
                  title={piece.name}
                  mainImage={piece.images?.[0] || "/alchemy/placeholder.png"}
                  status={piece.status || "available"}
                  dimensions={piece.dimensions}
                  palette={piece.palette}
                  price={piece.price}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}

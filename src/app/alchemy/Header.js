"use client";

export default function AlchemyHeader({ title, description }) {
  return (
    <section className="w-full max-w-3xl text-center relative px-4 sm:px-0">
      <h1 className="text-3xl sm:text-4xl md:text-7xl mb-6 sm:mb-8 tracking-wider">
        {title}
      </h1>
      {description && (
        <p className="text-base sm:text-lg text-zinc-700 max-w-2xl mx-auto px-4 sm:px-8 leading-loose tracking-wide whitespace-pre-line">
          {description}
        </p>
      )}
    </section>
  );
}

import { cookies, headers } from "next/headers";

export const dynamic = "force-dynamic";

function detectLocale() {
  const cookieLocale = cookies().get("NEXT_LOCALE")?.value;
  if (cookieLocale === "fr" || cookieLocale === "en") return cookieLocale;

  const accept = headers().get("accept-language") || "";
  if (/^fr\b/i.test(accept)) return "fr";
  return "en";
}

export default function ComingSoonUnprefixedPage() {
  const locale = detectLocale();
  const isFr = locale === "fr";

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-20 bg-black text-white">
      <div className="w-full max-w-xl text-center">
        <p
          className="text-xs tracking-[0.35em] text-white/70 mb-6"
          style={{ fontFamily: "var(--font-house-minimalist), sans-serif" }}
        >
          FANAHA
        </p>

        <h1
          className="text-4xl sm:text-5xl tracking-wide"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {isFr ? "Bientôt disponible" : "Coming soon"}
        </h1>

        <p
          className="mt-5 text-white/75 text-base sm:text-lg leading-relaxed"
          style={{ fontFamily: "var(--font-nunito), sans-serif" }}
        >
          {isFr
            ? "Nous apportons les dernières touches. Le site sera lancé très bientôt."
            : "We’re finalizing the last touches. The site will launch very soon."}
        </p>
      </div>
    </main>
  );
}

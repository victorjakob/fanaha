import { createServerSupabase } from "@/util/supabase/server";
import { DEFAULT_DESCRIPTION, getSiteUrl } from "@/lib/seo";

// Refresh at most once an hour, so edits in /manage show up here automatically.
export const revalidate = 3600;

const STATUS = { available: "available", commission: "commissioned piece", sold: "sold" };
const oneLine = (s, max = 240) => {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
};

/**
 * /llms.txt — a plain-text summary of who Fanaha is and what she offers, for AI assistants
 * (ChatGPT, Claude, Perplexity…). Format: https://llmstxt.org
 */
export async function GET() {
  const site = getSiteUrl();
  let offerings = [];
  let pieces = [];
  let about = null;
  try {
    const db = createServerSupabase();
    const [o, p, a] = await Promise.all([
      db.from("fanaha_offerings").select("title,description").eq("is_active", true).order("display_order", { ascending: true }),
      db.from("fanaha_alchemy_pieces").select("name,slug,year,dimensions,status").order("display_order", { ascending: true }),
      db.from("fanaha_about_content").select("subtitle,bio_paragraphs").limit(1).maybeSingle(),
    ]);
    offerings = o.data ?? [];
    pieces = p.data ?? [];
    about = a.data ?? null;
  } catch {
    // Still serve the static part if the database is unreachable.
  }

  const bio = Array.isArray(about?.bio_paragraphs) ? about.bio_paragraphs.map((x) => (typeof x === "string" ? x : x?.text)).filter(Boolean)[0] : null;

  const lines = [
    "# Fanaha",
    "",
    `> ${DEFAULT_DESCRIPTION}`,
    "",
    ...(about?.subtitle ? [oneLine(about.subtitle, 400), ""] : []),
    ...(bio ? [oneLine(bio, 600), ""] : []),
    "Fanaha creates alchemical art pieces (round, symbolic artworks), altar artworks, murals and oracle decks. Most work is commissioned: each piece is made for a specific person, family or space. The website is in English and French.",
    "",
    "## Main pages",
    `- [Home](${site}/en): introduction to Fanaha's work`,
    `- [About](${site}/en/about): who Fanaha is and her path as an artist`,
    `- [Alchemical art pieces](${site}/en/alchemy): the full collection, with available, commissioned and sold pieces`,
    `- [What I offer](${site}/en/what-i-offer): commissions and services`,
    `- [Order / commission](${site}/en/order): request a custom art piece`,
    `- [Murals](${site}/en/murals): large-scale works for public and private spaces`,
    `- [Altar artwork](${site}/en/altar): small circular altar pieces`,
    `- [Oracles & projects](${site}/en/oracles-projects): oracle decks and creative collaborations`,
    `- [Exhibitions](${site}/en/exhibitions): past exhibitions`,
    `- [Testimonials](${site}/en/reviews): words from people who own her work`,
    `- [Contact](${site}/en/contact): get in touch`,
    `- French version: ${site}/fr`,
    "",
  ];

  if (offerings.length) {
    lines.push("## What Fanaha offers", "");
    for (const o of offerings) lines.push(`- **${oneLine(o.title, 120)}**: ${oneLine(o.description)}`);
    lines.push("");
  }

  if (pieces.length) {
    lines.push("## Alchemical art pieces", "");
    for (const p of pieces) {
      const details = [p.year, p.dimensions, STATUS[p.status] ?? p.status].filter(Boolean).join(", ");
      lines.push(`- [${oneLine(p.name, 120)}](${site}/en/alchemy/${p.slug})${details ? ` (${oneLine(details, 120)})` : ""}`);
    }
    lines.push("");
  }

  lines.push(
    "## Contact",
    "",
    `- Commissions and enquiries: ${site}/en/order or ${site}/en/contact`,
    "- Instagram: https://www.instagram.com/fanaha",
    "- Facebook: https://www.facebook.com/fanahacrea",
    ""
  );

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

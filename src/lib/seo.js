const SITE_NAME = "Fanaha";
const DEFAULT_DESCRIPTION =
  "Fanaha is a visual artist and ritual storyteller—braiding sound, movement, image, and story into nature-rooted ceremonies. Alchemy pieces, murals, exhibitions. Commissions available.";
const DEFAULT_OG_IMAGE =
  process.env.NEXT_PUBLIC_IMAGE || "/logo/logo-space.png";
const LOCALES = ["en", "fr"];

function normalizeSiteUrl(url) {
  if (!url) return url;
  // Prevent `https://example.com//en` style URLs when env ends with `/`.
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getSiteUrl() {
  return normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  );
}

export function getMetadataBase() {
  return new URL(getSiteUrl());
}

export function getDefaultOgImageUrl() {
  return DEFAULT_OG_IMAGE;
}

export function getOpenGraphImages() {
  const url = getDefaultOgImageUrl();

  // If you provide a full OG image URL via env, don’t assume fixed dimensions.
  if (
    typeof url === "string" &&
    (url.startsWith("http://") || url.startsWith("https://"))
  ) {
    return [{ url, alt: `${SITE_NAME} cover` }];
  }

  return [
    {
      url,
      width: 1200,
      height: 630,
      alt: `${SITE_NAME} cover`,
    },
  ];
}

export function getTwitterImages() {
  return [getDefaultOgImageUrl()];
}

const PAGE_SEO = {
  home: {
    en: {
      description: DEFAULT_DESCRIPTION,
    },
    fr: {
      description:
        "Fanaha est une artiste visuelle. Elle crée des pièces d’alchimie, des fresques et des expositions—un art ancré dans la nature, le rituel et la mémoire. Commandes et collaborations.",
    },
  },
  about: {
    en: {
      title: "About Fanaha",
      description:
        "Fanaha is a conduit for subtle realms—braiding sound, movement, image, and story into ritual. Rooted in nature and guided by the feminine.",
    },
    fr: {
      title: "À propos",
      description:
        "Fanaha est un canal vers les royaumes subtils—tissant le son, le mouvement, l’image et le récit en rituel. Ancrée dans la nature et guidée par le féminin.",
    },
  },
  alchemy: {
    en: {
      title: "Alchemy",
      description:
        "Explore alchemy art pieces by Fanaha—original artworks, details, and available pieces.",
    },
    fr: {
      title: "Alchimie",
      description:
        "Explorez les pièces d’alchimie de Fanaha—œuvres originales, détails et pièces disponibles.",
    },
  },
  altar: {
    en: {
      title: "Altar",
      description: "Discover altar artworks and ritual pieces by Fanaha.",
    },
    fr: {
      title: "Autel",
      description:
        "Découvrez les œuvres d’autel et pièces rituelles de Fanaha.",
    },
  },
  murals: {
    en: {
      title: "Murals",
      description:
        "View murals and large-scale works by Fanaha. Available for mural commissions and collaborations.",
    },
    fr: {
      title: "Fresques",
      description:
        "Voir les fresques et œuvres grand format de Fanaha. Disponible pour des commandes et collaborations.",
    },
  },
  exhibitions: {
    en: {
      title: "Exhibitions",
      description: "See exhibitions featuring Fanaha's work.",
    },
    fr: {
      title: "Expositions",
      description: "Voir les expositions de Fanaha.",
    },
  },
  oraclesProjects: {
    en: {
      title: "Oracles & Projects",
      description: "Explore oracles and special projects by Fanaha.",
    },
    fr: {
      title: "Oracles et projets",
      description: "Explorer les oracles et projets spéciaux de Fanaha.",
    },
  },
  whatIOffer: {
    en: {
      title: "What I Offer",
      description:
        "Services and offerings from Fanaha—murals, commissions, collaborations, and creative projects.",
    },
    fr: {
      title: "Ce que je propose",
      description:
        "Services et offres de Fanaha—fresques, commandes, collaborations et projets créatifs.",
    },
  },
  reviews: {
    en: {
      title: "Testimonials",
      description: "Read testimonials about Fanaha's artwork.",
    },
    fr: {
      title: "Temoignages",
      description: "Lire les témoignages sur les œuvres de Fanaha.",
    },
  },
  contact: {
    en: {
      title: "Contact",
      description:
        "Contact Fanaha for collaborations, commissions, or inquiries.",
    },
    fr: {
      title: "Contact",
      description:
        "Contacter Fanaha pour des collaborations, commandes ou questions.",
    },
  },
  order: {
    en: {
      title: "Order",
      description: "Request a commission or order from Fanaha.",
    },
    fr: {
      title: "Commande",
      description: "Demander une commande ou une création sur mesure.",
    },
  },
};

export function getPageSeo(key, locale) {
  const lang = LOCALES.includes(locale) ? locale : "en";
  return PAGE_SEO[key]?.[lang] || PAGE_SEO[key]?.en || {};
}

function normalizePath(path = "") {
  if (!path || path === "/") {
    return "";
  }
  return path.startsWith("/") ? path : `/${path}`;
}

export function buildPageMetadata({ locale, title, description, path }) {
  const base = getMetadataBase();
  const normalizedPath = normalizePath(path);
  const canonical = `/${locale}${normalizedPath}`;
  const url = new URL(canonical, base).toString();
  const ogLocale = locale === "fr" ? "fr_FR" : "en_US";

  return {
    metadataBase: base,
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: {
      canonical,
      languages: {
        en: `/en${normalizedPath}`,
        fr: `/fr${normalizedPath}`,
      },
    },
    openGraph: {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      url,
      siteName: SITE_NAME,
      locale: ogLocale,
      type: "website",
      images: getOpenGraphImages(),
    },
    twitter: {
      card: "summary_large_image",
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: getTwitterImages(),
    },
  };
}

export { SITE_NAME, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE };

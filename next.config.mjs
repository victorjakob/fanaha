import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [25, 50, 75, 85, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xsylgitzcqbmjbrmpcsy.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },
};

export default withNextIntl(nextConfig);

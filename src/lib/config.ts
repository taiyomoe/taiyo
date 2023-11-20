import type { Metadata } from "next";

type SiteConfig = Record<string, unknown> & {
  twitter: Metadata["twitter"];
  openGraph: Metadata["openGraph"];
};

export const siteConfig = {
  name: "Taiyō",
  description:
    "Leia mangás online e gratuitamente na Taiyō, sem anúncios, com alta qualidade de imagens e suporte aos leitores.",
  twitter: {
    card: "summary_large_image",
    title: "Taiyō",
    description:
      "Leia mangás online e gratuitamente na Taiyō, sem anúncios, com alta qualidade de imagens e suporte aos leitores.",
    images: {
      url: "https://cdn.rdx.dev/taiyo/banner-red.png",
      width: 600,
      height: 315,
      alt: "Taiyō banner",
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://taiyo.moe",
    siteName: "Taiyō",
    description:
      "Leia mangás online e gratuitamente na Taiyō, sem anúncios, com alta qualidade de imagens e suporte aos leitores",
    images: {
      url: "https://cdn.rdx.dev/taiyo/banner-red.png",
      width: 600,
      height: 315,
      alt: "Taiyō banner",
    },
  },
} satisfies SiteConfig;

import type { HomeLayout } from "@taiyomoe/db"
import type { Metadata } from "next"

export type SiteConfig = Record<string, unknown> & {
  twitter: Metadata["twitter"]
  openGraph: Metadata["openGraph"]
  home: {
    releasesLayoutContainerId: string
    releasesLayout: HomeLayout
    displayFollowingReleases: boolean
  }
}

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
      url: "https://cdn.taiyo.moe/assets/banner-red.png",
      width: 600,
      height: 315,
      alt: "Taiyō banner",
    },
  },
  discord: {
    url: "https://discord.gg/RYbnyeWcM2",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://taiyo.moe",
    siteName: "Taiyō",
    description:
      "Leia mangás online e gratuitamente na Taiyō, sem anúncios, com alta qualidade de imagens e suporte aos leitores",
    images: {
      url: "https://cdn.taiyo.moe/assets/banner-red.png",
      width: 600,
      height: 315,
      alt: "Taiyō banner",
    },
  },
  home: {
    releasesLayoutContainerId: "releases-layout-container",
    releasesLayout: "ROWS",
    displayFollowingReleases: false,
  },
} satisfies SiteConfig

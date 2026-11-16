import * as stylex from "@stylexjs/stylex"
import { Globe } from "@taiyomoe/ui/components/icons"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { LanguageFlag } from "@/components/flags/flags"

const SITE_LOGOS: Partial<Record<string, string>> = {
  // Keyed like `MEDIA_LINK_KEYS`.
  mangaDex: "/sites/mangadex.png",
  anilist: "/sites/anilist.png",
  myAnimeList: "/sites/myanimelist.png",
  animePlanet: "/sites/animeplanet.png",
  bookWalker: "/sites/bookwalker.png",
  mangaUpdates: "/sites/mangaupdates.png",
  novelUpdates: "/sites/novelupdates.png",
  kitsu: "/sites/kitsu.png",
  amazon: "/sites/amazon.png",
  eBookJapan: "/sites/ebookjapan.png",
  cdJapan: "/sites/cdjapan.png",
}
const OFFICIAL_LANGUAGES = {
  officialENTranslation: "en",
  officialFRTranslation: "fr",
  officialPTBRTranslation: "pt_br",
} as const
const styles = stylex.create({
  logo: {
    borderRadius: "0.25rem",
    display: "block",
    flexShrink: 0,
    objectFit: "contain",
    height: "1rem",
    width: "1rem",
  },
  generic: {
    color: colors.mutedForeground,
    flexShrink: 0,
    height: "1rem",
    width: "1rem",
  },
  name: {
    gap: "0.5rem",
    alignItems: "center",
    display: "inline-flex",
    minWidth: 0,
  },
})
const isOfficial = (site: string): site is keyof typeof OFFICIAL_LANGUAGES =>
  site in OFFICIAL_LANGUAGES

/** The logo of an external site; official translations show their language's flag. */
export function SiteLogo({ site }: { site: string }) {
  const logo = SITE_LOGOS[site]

  if (logo !== undefined) {
    return (
      <img
        alt=""
        decoding="async"
        height={16}
        loading="lazy"
        src={logo}
        sx={styles.logo}
        width={16}
      />
    )
  }

  if (isOfficial(site)) {
    return <LanguageFlag language={OFFICIAL_LANGUAGES[site]} />
  }

  return <Globe aria-hidden {...stylex.props(styles.generic)} />
}

/** An external site named with its logo on the left. */
export function SiteName({ site, label }: { site: string; label: string }) {
  return (
    <span sx={styles.name}>
      <SiteLogo site={site} />
      {label}
    </span>
  )
}

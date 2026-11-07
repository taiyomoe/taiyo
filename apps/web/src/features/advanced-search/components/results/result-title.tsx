import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { colors, font, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { SearchHit } from "@/features/advanced-search/hooks/use-search-results"
import { CountryFlag } from "@/components/flags/flags"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  heading: {
    margin: 0,
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    fontFamily: font.heading,
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
    minWidth: 0,
  },
  flag: {
    display: "inline-flex",
    flexShrink: 0,
  },
  link: {
    borderRadius: radius.sm,
    overflow: "hidden",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    textDecorationLine: "none",
    textOverflow: "ellipsis",
    transitionDuration: "200ms",
    transitionProperty: "color",
    transitionTimingFunction: motion.easeOut,
    whiteSpace: "nowrap",
    minWidth: 0,
  },
})

export function ResultTitle({ hit, sx }: { hit: SearchHit; sx?: Sx }) {
  const title = hit.mainTitle?.title ?? m.media_untitled()

  return (
    <h2 sx={[styles.heading, sx]}>
      <span sx={styles.flag}>
        <CountryFlag country={hit.countryOfOrigin} />
      </span>
      <Link
        params={{ mediaId: hit.id }}
        title={title}
        to="/media/$mediaId"
        {...stylex.props(styles.link)}
      >
        {title}
      </Link>
    </h2>
  )
}

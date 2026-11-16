import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { FlagComponent } from "country-flag-icons/react/3x2"
import * as stylex from "@stylexjs/stylex"
import { Globe } from "@taiyomoe/ui/components/icons"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useEffect, useState } from "react"
import type { LatestChapter, LatestMediaUpdate } from "@/features/chapters/api/chapters"
import { COUNTRY_FLAGS, getLanguageCode, LANGUAGE_FLAGS } from "@/components/flags/language-flags"
const styles = stylex.create({
  flag: {
    borderRadius: "0.1875rem",
    overflow: "hidden",
    boxShadow: `0 0 0 1px ${colors.border}`,
    display: "inline-flex",
    flexShrink: 0,
    height: "0.75rem",
    width: "1.125rem",
  },
  neutral: {
    alignItems: "center",
    backgroundColor: colors.well,
    color: colors.mutedForeground,
    justifyContent: "center",
  },
  neutralIcon: {
    height: "0.625rem",
    width: "0.625rem",
  },
  svg: {
    display: "block",
    height: "100%",
    width: "100%",
  },
  chip: {
    borderRadius: radius.sm,
    gap: "0.375rem",
    paddingBlock: "0.25rem",
    paddingInline: "0.5rem",
    alignItems: "center",
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 6%, transparent)`,
    color: colors.mutedForeground,
    display: "inline-flex",
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    lineHeight: "1rem",
    whiteSpace: "nowrap",
  },
})
const USER_COUNTRY_FLAGS = import.meta.glob<string>("/node_modules/country-flag-icons/3x2/*.svg", {
  query: "?url",
  import: "default",
})

export function Flag({ flag: Icon, sx }: { flag: FlagComponent | string | null; sx?: Sx }) {
  if (Icon === null) {
    return <span aria-hidden sx={[styles.flag, sx]} />
  }

  return (
    <span aria-hidden sx={[styles.flag, sx]}>
      {typeof Icon === "string" ? (
        <img alt="" decoding="async" src={Icon} sx={styles.svg} />
      ) : (
        <Icon {...stylex.props(styles.svg)} />
      )}
    </span>
  )
}

export function LanguageFlag({ language, sx }: { language: LatestChapter["language"]; sx?: Sx }) {
  const flag = LANGUAGE_FLAGS[language]

  return flag === null ? (
    <span aria-hidden sx={[styles.flag, styles.neutral, sx]}>
      <Globe {...stylex.props(styles.neutralIcon)} />
    </span>
  ) : (
    <Flag flag={flag} sx={sx} />
  )
}

export function LanguageChip({ language }: { language: LatestChapter["language"] }) {
  return (
    <span sx={styles.chip}>
      <LanguageFlag language={language} />
      {getLanguageCode(language)}
    </span>
  )
}

export function CountryFlag({ country }: { country: LatestMediaUpdate["countryOfOrigin"] }) {
  return <Flag flag={COUNTRY_FLAGS[country]} />
}

export function UserCountryFlag({ country }: { country: string }) {
  const [loaded, setLoaded] = useState<{ country: string; src: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    const load =
      USER_COUNTRY_FLAGS[`/node_modules/country-flag-icons/3x2/${country.toUpperCase()}.svg`]

    void load?.().then((src) => {
      if (!cancelled) {
        setLoaded({ country, src })
      }
    })

    return () => {
      cancelled = true
    }
  }, [country])

  return <Flag flag={loaded?.country === country ? loaded.src : null} />
}

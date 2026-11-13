import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { FlagComponent } from "country-flag-icons/react/3x2"
import * as stylex from "@stylexjs/stylex"
import { Globe } from "@taiyomoe/ui/components/icons"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
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
    paddingBlock: "0.1875rem",
    paddingInline: "0.4375rem",
    alignItems: "center",
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 6%, transparent)`,
    color: colors.mutedForeground,
    display: "inline-flex",
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    lineHeight: "1rem",
    whiteSpace: "nowrap",
  },
})

function FlagIcon({ flag: Icon, sx }: { flag: FlagComponent | undefined; sx?: Sx }) {
  return Icon === undefined ? null : (
    <span aria-hidden sx={[styles.flag, sx]}>
      <Icon {...stylex.props(styles.svg)} />
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
    <FlagIcon flag={flag} sx={sx} />
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
  return <FlagIcon flag={COUNTRY_FLAGS[country]} />
}

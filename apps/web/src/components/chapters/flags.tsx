import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { FlagComponent } from "country-flag-icons/react/3x2"
import * as stylex from "@stylexjs/stylex"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import BR from "country-flag-icons/react/3x2/BR"
import CN from "country-flag-icons/react/3x2/CN"
import CZ from "country-flag-icons/react/3x2/CZ"
import DE from "country-flag-icons/react/3x2/DE"
import ES from "country-flag-icons/react/3x2/ES"
import FR from "country-flag-icons/react/3x2/FR"
import GB from "country-flag-icons/react/3x2/GB"
import GR from "country-flag-icons/react/3x2/GR"
import HK from "country-flag-icons/react/3x2/HK"
import HU from "country-flag-icons/react/3x2/HU"
import ID from "country-flag-icons/react/3x2/ID"
import IL from "country-flag-icons/react/3x2/IL"
import IN from "country-flag-icons/react/3x2/IN"
import IR from "country-flag-icons/react/3x2/IR"
import IT from "country-flag-icons/react/3x2/IT"
import JP from "country-flag-icons/react/3x2/JP"
import KR from "country-flag-icons/react/3x2/KR"
import MX from "country-flag-icons/react/3x2/MX"
import MY from "country-flag-icons/react/3x2/MY"
import NL from "country-flag-icons/react/3x2/NL"
import PH from "country-flag-icons/react/3x2/PH"
import PL from "country-flag-icons/react/3x2/PL"
import PT from "country-flag-icons/react/3x2/PT"
import RO from "country-flag-icons/react/3x2/RO"
import RU from "country-flag-icons/react/3x2/RU"
import SA from "country-flag-icons/react/3x2/SA"
import SE from "country-flag-icons/react/3x2/SE"
import TH from "country-flag-icons/react/3x2/TH"
import TR from "country-flag-icons/react/3x2/TR"
import UA from "country-flag-icons/react/3x2/UA"
import US from "country-flag-icons/react/3x2/US"
import VN from "country-flag-icons/react/3x2/VN"
import type { LatestChapter, LatestMediaUpdate } from "@/lib/queries/chapters"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

type Flag = FlagComponent

const LANGUAGE_FLAGS: Partial<Record<LatestChapter["language"], Flag>> = {
  ar: SA,
  cs: CZ,
  de: DE,
  el: GR,
  en: GB,
  es: ES,
  es_la: MX,
  fa: IR,
  fr: FR,
  he: IL,
  hi: IN,
  hu: HU,
  id: ID,
  it: IT,
  ja: JP,
  ja_ro: JP,
  ko: KR,
  ko_ro: KR,
  ms: MY,
  nl: NL,
  pl: PL,
  pt_br: BR,
  pt_pt: PT,
  ro: RO,
  ru: RU,
  sv: SE,
  th: TH,
  tl: PH,
  tr: TR,
  uk: UA,
  vi: VN,
  zh: CN,
  zh_hk: HK,
  zh_ro: CN,
}
const COUNTRY_FLAGS: Record<LatestMediaUpdate["countryOfOrigin"], Flag> = {
  BRAZIL: BR,
  CHINA: CN,
  FRANCE: FR,
  JAPAN: JP,
  KOREA: KR,
  USA: US,
}
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

export const getLanguageCode = (language: LatestChapter["language"]) =>
  language.replace("_", "-").toUpperCase()

const DISPLAY_CODES: Partial<Record<LatestChapter["language"], string>> = { es_la: "es-419" }
const ROMANIZED_SUFFIX = "_ro"
const getDisplayName = (code: string) => {
  try {
    return new Intl.DisplayNames([getLocale()], { type: "language" }).of(code)
  } catch {
    return undefined
  }
}

export const getLanguageName = (language: LatestChapter["language"]) => {
  const romanized = language.endsWith(ROMANIZED_SUFFIX)
  const code = romanized
    ? language.slice(0, -ROMANIZED_SUFFIX.length)
    : (DISPLAY_CODES[language] ?? language.replace("_", "-"))
  const name = getDisplayName(code) ?? getLanguageCode(language)

  return romanized ? m.language_romanized({ name }) : name
}

function FlagIcon({ flag: Icon, sx }: { flag: Flag | undefined; sx?: Sx }) {
  return Icon === undefined ? null : (
    <span aria-hidden sx={[styles.flag, sx]}>
      <Icon {...stylex.props(styles.svg)} />
    </span>
  )
}

export function LanguageFlag({ language, sx }: { language: LatestChapter["language"]; sx?: Sx }) {
  return <FlagIcon flag={LANGUAGE_FLAGS[language]} sx={sx} />
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

import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { FlagComponent } from "country-flag-icons/react/3x2"
import * as stylex from "@stylexjs/stylex"
import { Globe } from "@taiyomoe/ui/components/icons"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import AF from "country-flag-icons/react/3x2/AF"
import AL from "country-flag-icons/react/3x2/AL"
import AM from "country-flag-icons/react/3x2/AM"
import AZ from "country-flag-icons/react/3x2/AZ"
import BA from "country-flag-icons/react/3x2/BA"
import BD from "country-flag-icons/react/3x2/BD"
import BE from "country-flag-icons/react/3x2/BE"
import BG from "country-flag-icons/react/3x2/BG"
import BI from "country-flag-icons/react/3x2/BI"
import BO from "country-flag-icons/react/3x2/BO"
import BR from "country-flag-icons/react/3x2/BR"
import BT from "country-flag-icons/react/3x2/BT"
import BW from "country-flag-icons/react/3x2/BW"
import BY from "country-flag-icons/react/3x2/BY"
import CA from "country-flag-icons/react/3x2/CA"
import CD from "country-flag-icons/react/3x2/CD"
import CF from "country-flag-icons/react/3x2/CF"
import CH from "country-flag-icons/react/3x2/CH"
import CN from "country-flag-icons/react/3x2/CN"
import CZ from "country-flag-icons/react/3x2/CZ"
import DE from "country-flag-icons/react/3x2/DE"
import DK from "country-flag-icons/react/3x2/DK"
import EE from "country-flag-icons/react/3x2/EE"
import ER from "country-flag-icons/react/3x2/ER"
import ES from "country-flag-icons/react/3x2/ES"
import ET from "country-flag-icons/react/3x2/ET"
import FI from "country-flag-icons/react/3x2/FI"
import FJ from "country-flag-icons/react/3x2/FJ"
import FO from "country-flag-icons/react/3x2/FO"
import FR from "country-flag-icons/react/3x2/FR"
import GB from "country-flag-icons/react/3x2/GB"
import GE from "country-flag-icons/react/3x2/GE"
import GH from "country-flag-icons/react/3x2/GH"
import GL from "country-flag-icons/react/3x2/GL"
import GR from "country-flag-icons/react/3x2/GR"
import GU from "country-flag-icons/react/3x2/GU"
import HK from "country-flag-icons/react/3x2/HK"
import HR from "country-flag-icons/react/3x2/HR"
import HT from "country-flag-icons/react/3x2/HT"
import HU from "country-flag-icons/react/3x2/HU"
import ID from "country-flag-icons/react/3x2/ID"
import IE from "country-flag-icons/react/3x2/IE"
import IL from "country-flag-icons/react/3x2/IL"
import IM from "country-flag-icons/react/3x2/IM"
import IN from "country-flag-icons/react/3x2/IN"
import IQ from "country-flag-icons/react/3x2/IQ"
import IR from "country-flag-icons/react/3x2/IR"
import IS from "country-flag-icons/react/3x2/IS"
import IT from "country-flag-icons/react/3x2/IT"
import JP from "country-flag-icons/react/3x2/JP"
import KE from "country-flag-icons/react/3x2/KE"
import KG from "country-flag-icons/react/3x2/KG"
import KH from "country-flag-icons/react/3x2/KH"
import KR from "country-flag-icons/react/3x2/KR"
import KZ from "country-flag-icons/react/3x2/KZ"
import LA from "country-flag-icons/react/3x2/LA"
import LK from "country-flag-icons/react/3x2/LK"
import LS from "country-flag-icons/react/3x2/LS"
import LT from "country-flag-icons/react/3x2/LT"
import LU from "country-flag-icons/react/3x2/LU"
import LV from "country-flag-icons/react/3x2/LV"
import MG from "country-flag-icons/react/3x2/MG"
import MH from "country-flag-icons/react/3x2/MH"
import MK from "country-flag-icons/react/3x2/MK"
import ML from "country-flag-icons/react/3x2/ML"
import MM from "country-flag-icons/react/3x2/MM"
import MN from "country-flag-icons/react/3x2/MN"
import MT from "country-flag-icons/react/3x2/MT"
import MV from "country-flag-icons/react/3x2/MV"
import MW from "country-flag-icons/react/3x2/MW"
import MX from "country-flag-icons/react/3x2/MX"
import MY from "country-flag-icons/react/3x2/MY"
import NA from "country-flag-icons/react/3x2/NA"
import NG from "country-flag-icons/react/3x2/NG"
import NL from "country-flag-icons/react/3x2/NL"
import NO from "country-flag-icons/react/3x2/NO"
import NP from "country-flag-icons/react/3x2/NP"
import NR from "country-flag-icons/react/3x2/NR"
import NZ from "country-flag-icons/react/3x2/NZ"
import PE from "country-flag-icons/react/3x2/PE"
import PF from "country-flag-icons/react/3x2/PF"
import PG from "country-flag-icons/react/3x2/PG"
import PH from "country-flag-icons/react/3x2/PH"
import PK from "country-flag-icons/react/3x2/PK"
import PL from "country-flag-icons/react/3x2/PL"
import PT from "country-flag-icons/react/3x2/PT"
import PY from "country-flag-icons/react/3x2/PY"
import RO from "country-flag-icons/react/3x2/RO"
import RS from "country-flag-icons/react/3x2/RS"
import RU from "country-flag-icons/react/3x2/RU"
import RW from "country-flag-icons/react/3x2/RW"
import SA from "country-flag-icons/react/3x2/SA"
import SE from "country-flag-icons/react/3x2/SE"
import SI from "country-flag-icons/react/3x2/SI"
import SK from "country-flag-icons/react/3x2/SK"
import SN from "country-flag-icons/react/3x2/SN"
import SO from "country-flag-icons/react/3x2/SO"
import SZ from "country-flag-icons/react/3x2/SZ"
import TH from "country-flag-icons/react/3x2/TH"
import TJ from "country-flag-icons/react/3x2/TJ"
import TM from "country-flag-icons/react/3x2/TM"
import TO from "country-flag-icons/react/3x2/TO"
import TR from "country-flag-icons/react/3x2/TR"
import TZ from "country-flag-icons/react/3x2/TZ"
import UA from "country-flag-icons/react/3x2/UA"
import UG from "country-flag-icons/react/3x2/UG"
import US from "country-flag-icons/react/3x2/US"
import UZ from "country-flag-icons/react/3x2/UZ"
import VN from "country-flag-icons/react/3x2/VN"
import VU from "country-flag-icons/react/3x2/VU"
import WS from "country-flag-icons/react/3x2/WS"
import ZA from "country-flag-icons/react/3x2/ZA"
import ZW from "country-flag-icons/react/3x2/ZW"
import type { LatestChapter, LatestMediaUpdate } from "@/features/chapters/api/chapters"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

type Flag = FlagComponent

const LANGUAGE_FLAGS: Record<LatestChapter["language"], Flag | null> = {
  aa: ET,
  ab: GE,
  ae: null,
  af: ZA,
  ak: GH,
  am: ET,
  an: ES,
  ar: SA,
  as: IN,
  av: RU,
  ay: BO,
  az: AZ,
  ba: RU,
  be: BY,
  bg: BG,
  bi: VU,
  bm: ML,
  bn: BD,
  bo: null,
  br: FR,
  bs: BA,
  ca: ES,
  ce: RU,
  ch: GU,
  co: FR,
  cr: CA,
  cs: CZ,
  cu: null,
  cv: RU,
  cy: GB,
  da: DK,
  de: DE,
  dv: MV,
  dz: BT,
  ee: GH,
  el: GR,
  en: GB,
  eo: null,
  es: ES,
  es_la: MX,
  et: EE,
  eu: ES,
  fa: IR,
  ff: SN,
  fi: FI,
  fj: FJ,
  fo: FO,
  fr: FR,
  fy: NL,
  ga: IE,
  gd: GB,
  gl: ES,
  gn: PY,
  gu: IN,
  gv: IM,
  ha: NG,
  he: IL,
  hi: IN,
  ho: PG,
  hr: HR,
  ht: HT,
  hu: HU,
  hy: AM,
  hz: NA,
  ia: null,
  id: ID,
  ie: null,
  ig: NG,
  ii: CN,
  ik: US,
  io: null,
  is: IS,
  it: IT,
  iu: CA,
  ja: JP,
  ja_ro: JP,
  jv: ID,
  ka: GE,
  kg: CD,
  ki: KE,
  kj: NA,
  kk: KZ,
  kl: GL,
  km: KH,
  kn: IN,
  ko: KR,
  ko_ro: KR,
  kr: NG,
  ks: IN,
  ku: IQ,
  kv: RU,
  kw: GB,
  ky: KG,
  la: null,
  lb: LU,
  lg: UG,
  li: NL,
  ln: CD,
  lo: LA,
  lt: LT,
  lu: CD,
  lv: LV,
  mg: MG,
  mh: MH,
  mi: NZ,
  mk: MK,
  ml: IN,
  mn: MN,
  mr: IN,
  ms: MY,
  mt: MT,
  my: MM,
  na: NR,
  nb: NO,
  nd: ZW,
  ne: NP,
  ng: NA,
  nl: NL,
  nn: NO,
  no: NO,
  nr: ZA,
  nv: US,
  ny: MW,
  oc: FR,
  oj: CA,
  om: ET,
  or: IN,
  os: RU,
  pa: IN,
  pi: null,
  pl: PL,
  ps: AF,
  pt_br: BR,
  pt_pt: PT,
  qu: PE,
  rm: CH,
  rn: BI,
  ro: RO,
  ru: RU,
  rw: RW,
  sa: IN,
  sc: IT,
  sd: PK,
  se: NO,
  sg: CF,
  si: LK,
  sk: SK,
  sl: SI,
  sm: WS,
  sn: ZW,
  so: SO,
  sq: AL,
  sr: RS,
  ss: SZ,
  st: LS,
  su: ID,
  sv: SE,
  sw: TZ,
  ta: IN,
  te: IN,
  tg: TJ,
  th: TH,
  ti: ER,
  tk: TM,
  tl: PH,
  tn: BW,
  to: TO,
  tr: TR,
  ts: ZA,
  tt: RU,
  tw: GH,
  ty: PF,
  ug: null,
  uk: UA,
  ur: PK,
  uz: UZ,
  ve: ZA,
  vi: VN,
  vo: null,
  wa: BE,
  wo: SN,
  xh: ZA,
  yi: null,
  yo: NG,
  za: CN,
  zh: CN,
  zh_hk: HK,
  zh_ro: CN,
  zu: ZA,
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

export const getLanguageCode = (language: LatestChapter["language"]) =>
  language.replace("_", "-").toUpperCase()

const DISPLAY_CODES: Partial<Record<LatestChapter["language"], string>> = { es_la: "es-419" }
const ROMANIZED_SUFFIX = "_ro"
const getDisplayName = (code: string) => {
  try {
    return new Intl.DisplayNames([getLocale()], { type: "language", style: "short" }).of(code)
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

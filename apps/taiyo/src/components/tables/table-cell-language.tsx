import type { Languages } from "@taiyomoe/db"
import { LANGUAGES_PT } from "@taiyomoe/utils/i18n"
import { CountryFlag } from "~/components/ui/CountryFlag"

type Props = {
  language: Languages
}

export const TableCellLanguage = ({ language }: Props) => (
  <div className="flex items-center gap-2">
    <CountryFlag language={language} size={24} />
    <p>{LANGUAGES_PT[language]}</p>
  </div>
)

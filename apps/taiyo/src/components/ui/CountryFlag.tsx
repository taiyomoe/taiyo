import type { Languages } from "@prisma/client"
import Image from "next/image"

import { LanguageUtils } from "~/lib/utils/language.utils"

type Props = {
  language: Languages
}

export const CountryFlag = ({ language }: Props) => {
  const countryCode = LanguageUtils.languageCodeToCountryCode(language)
  const countryFlagUrl = countryCode
    ? `https://flagcdn.com/${countryCode}.svg`
    : "https://upload.wikimedia.org/wikipedia/commons/5/50/Flag_with_question_mark.svg"

  return (
    <Image
      src={countryFlagUrl}
      className="max-h-6 select-none object-contain"
      width={24}
      height={24}
      alt={language}
    />
  )
}

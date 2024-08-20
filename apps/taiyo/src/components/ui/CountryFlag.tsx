import type { Countries, Languages } from "@prisma/client"
import { LanguageUtils } from "@taiyomoe/utils"
import Image from "next/image"
import { useMemo } from "react"

type Props = {
  language?: Languages
  country?: Countries
  size: number
}

export const CountryFlag = ({ language, country, size }: Props) => {
  const countryCode = useMemo(
    () =>
      language ? LanguageUtils.languageCodeToCountryCode(language) : country,
    [language, country],
  )
  const countryFlagUrl = useMemo(() => {
    if (countryCode) {
      return `https://flagcdn.com/${countryCode}.svg`
    }

    return "https://upload.wikimedia.org/wikipedia/commons/5/50/Flag_with_question_mark.svg"
  }, [countryCode])

  return (
    <Image
      src={countryFlagUrl}
      className="select-none object-contain"
      width={size}
      height={size}
      alt={countryCode ?? "Country flag"}
    />
  )
}

import Image from "next/image";
import type { Languages } from "@prisma/client";

import { LanguageUtils } from "~/lib/utils/language.utils";

type Props = {
  language: Languages;
};

export const CountryFlag = ({ language }: Props) => {
  const countryCode = LanguageUtils.languageCodeToCountryCode(language);
  const countryFlagUrl = `https://flagcdn.com/${countryCode}.svg`;

  return (
    <Image
      src={countryFlagUrl}
      className="select-none object-contain"
      width={24}
      height={24}
      alt="Brasil"
    />
  );
};

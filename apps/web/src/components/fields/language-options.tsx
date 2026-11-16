import { MEDIA_LANGUAGES, SUPPORTED_LANGUAGES } from "@taiyomoe/db/constants"
import { Languages } from "@taiyomoe/ui/components/icons"
import type { OptionIcon, OptionSet } from "@/components/fields/option-select"
import type { LatestChapter } from "@/features/chapters/api/chapters"
import { LanguageFlag } from "@/components/flags/flags"
import { getLanguageName } from "@/components/flags/language-flags"

type Language = LatestChapter["language"]

const icons = new Map<Language, OptionIcon>()
const flagIcon = (language: Language) => {
  const known = icons.get(language)

  if (known !== undefined) {
    return known
  }

  function Flag() {
    return <LanguageFlag language={language} />
  }

  icons.set(language, Flag)

  return Flag
}
/** Languages read with their flag, like every language field shows them. */
const languageOptions = <T extends Language>(values: readonly T[]): OptionSet<T> => ({
  values,
  label: getLanguageName,
  icon: flagIcon,
  fieldIcon: Languages,
})

export const SUPPORTED_LANGUAGE_OPTIONS = languageOptions(SUPPORTED_LANGUAGES)

export const MEDIA_LANGUAGE_OPTIONS = languageOptions(MEDIA_LANGUAGES)

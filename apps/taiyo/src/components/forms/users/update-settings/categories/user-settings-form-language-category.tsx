import { Languages } from "@taiyomoe/db"
import { LANGUAGES_PT } from "@taiyomoe/utils/i18n"
import { SelectField } from "~/components/generics/form/select-field"
import { CountryFlag } from "~/components/ui/CountryFlag"
import { UserSettingsFormFieldBuilder } from "./user-settings-form-field-builder"

export const UserSettingsFormLanguageCategory = () => (
  <div className="space-y-8">
    <UserSettingsFormFieldBuilder
      title="Títulos"
      description={
        <>
          Idioma dos títulos usados através do site.
          <br />
          Se uma obra não tiver um título no idioma selecionado, o título padrão
          será usado.
        </>
      }
    >
      <SelectField
        name="preferredTitles"
        className="w-full md:w-1/3"
        items={Languages}
        aria-label="Language"
        renderOption={(item) => (
          <div className="flex items-center gap-2">
            <CountryFlag language={item as Languages} size={24} />
            <p>{LANGUAGES_PT[item as Languages]}</p>
          </div>
        )}
        allowEmpty
      />
    </UserSettingsFormFieldBuilder>
  </div>
)

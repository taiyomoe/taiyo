import { ContentRating } from "@taiyomoe/db"
import { CONTENT_RATING_PT } from "@taiyomoe/utils/i18n"
import { SelectField } from "~/components/generics/form/select-field"
import { UserSettingsFormFieldBuilder } from "./user-settings-form-field-builder"

export const UserSettingsFormBlocksCategory = () => (
  <div className="space-y-8">
    <UserSettingsFormFieldBuilder
      title="Filtro de conteúdo"
      description={
        <>
          Escolha quais tipos de conteúdo você quer ver no site.
          <br />
          NSFW representa conteúdo que contém atos sexuais explícitos e NSFL
          conteúdo com violência (gore) ou abuso sexual.
          <br />
          <span className="text-warning-400">
            Se escolher NSFL, então você verá todos os tipos de conteúdo
            (incluindo NSFW). Se escolher NSFW, então verá apenas conteúdo NSFW,
            sugestivo e normal e assim por diante.
          </span>
        </>
      }
      warning="Não efetivo"
    >
      <SelectField
        name="contentRating"
        className="w-full md:w-1/3"
        items={ContentRating}
        renderOption={(item) => CONTENT_RATING_PT[item as ContentRating]}
        aria-label="Content rating"
      />
    </UserSettingsFormFieldBuilder>
  </div>
)

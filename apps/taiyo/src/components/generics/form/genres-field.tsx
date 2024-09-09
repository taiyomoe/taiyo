import type { MediaGenres } from "@taiyomoe/db"
import { GENRES_PT } from "@taiyomoe/utils/i18n"
import { Controller } from "react-hook-form"
import { Label } from "~/components/generics/label"
import { MultiSelect } from "~/components/generics/multi-select"
import { SelectUtils } from "~/lib/utils/select.utils"

export const GenresField = () => {
  return (
    <Label label="Gêneros">
      <Controller
        name={"genres"}
        render={({ field, formState: { defaultValues } }) => (
          <MultiSelect
            onChange={(values) => {
              field.onChange(values.map((v) => v.value))
            }}
            defaultValue={defaultValues?.genres?.map((v: MediaGenres) => ({
              label: GENRES_PT[v],
              value: v,
            }))}
            options={SelectUtils.enumToItems(GENRES_PT)}
          />
        )}
      />
    </Label>
  )
}

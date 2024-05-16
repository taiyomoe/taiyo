import { TAGS_PT } from "@taiyomoe/utils/i18n"
import { Controller } from "react-hook-form"
import { Label } from "~/components/generics/label"
import { MultiSelect } from "~/components/generics/multi-select"
import type { SelectItem } from "~/lib/types"

export const TagsField = () => {
  return (
    <Label label="Tags">
      <Controller
        name={"tags"}
        render={({ field, formState: { defaultValues } }) => (
          <MultiSelect<SelectItem & { isSpoiler: boolean }>
            onChange={(values) => {
              field.onChange(
                values.map((v) => ({ key: v.value, isSpoiler: v.isSpoiler })),
              )
            }}
            defaultValue={defaultValues?.tags?.map(
              (v: PrismaJson.MediaTag) => ({
                label: TAGS_PT[v.key].name,
                value: v.key,
                isSpoiler: false,
              }),
            )}
            options={Object.entries(TAGS_PT).map(([value, tag]) => ({
              label: tag.name,
              value,
              isSpoiler: false,
            }))}
          />
        )}
      />
    </Label>
  )
}

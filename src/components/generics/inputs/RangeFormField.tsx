import { Input } from "@nextui-org/input"
import { MediaChapter } from "@prisma/client"
import { useField } from "formik"
import {
  ChangeEventHandler,
  FocusEventHandler,
  useCallback,
  useMemo,
  useState,
} from "react"
import { RangeValues } from "~/components/ui/RangeValues"
import { BulkUpdateMediaChapterVolumesSchema } from "~/lib/schemas"
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils"
import { NumberUtils } from "~/lib/utils/number.utils"

type Props = {
  name: string
  chapters: MediaChapter[]
}

export const RangeFormField = ({ name, chapters }: Props) => {
  // biome-ignore lint/correctness/noEmptyPattern: we need to destructure the array
  const [field, {}, { setValue: setFieldValue }] = useField<
    BulkUpdateMediaChapterVolumesSchema[number]["ids"]
  >({ name })
  const initialValue = useMemo(
    () =>
      NumberUtils.compressRange(
        chapters.filter((c) => field.value.includes(c.id)).map((c) => c.number),
      ),
    [chapters, field.value],
  )
  const [value, setValue] = useState(initialValue)

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setValue(e.target.value)
    },
    [],
  )

  const handleBlur: FocusEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const range = NumberUtils.parseRange(e.target.value)
      const chapterIds = MediaChapterUtils.getFromRange(chapters, range)

      setFieldValue(chapterIds)
    },
    [chapters, setFieldValue],
  )

  return (
    <Input
      {...field}
      classNames={{
        mainWrapper: "w-auto",
      }}
      label="Range"
      labelPlacement="outside"
      placeholder="Ex: 1-5, 7, 9-10"
      value={value}
      description={
        <RangeValues
          range={NumberUtils.parseRange(value)}
          availableNumbers={chapters.map((c) => c.number)}
        />
      }
      onChange={handleChange}
      // @ts-expect-error this is valid
      onBlur={handleBlur}
    />
  )
}

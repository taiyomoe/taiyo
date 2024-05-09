import { TriangleAlertIcon } from "lucide-react"
import { mapValues, objectify } from "radash"
import { type ReactNode, useEffect, useMemo, useRef } from "react"
import { useFormContext } from "react-hook-form"
import { DisplayTextList } from "~/components/utils/display-text-list"
import type { RangeItem } from "~/lib/types"
import { FormUtils } from "~/lib/utils/form.utils"

type Props = {
  name: string
  items: RangeItem[]
  renderMessage?: (items: RangeItem[]) => ReactNode
}

export const RangeOverlappingHelper = ({
  name,
  items,
  renderMessage,
}: Props) => {
  const { watch, clearErrors, setError } = useFormContext()
  const fieldsValues = watch()
  const { overlappingFields, overlappingKeys, overlappingItems } =
    useMemo(() => {
      const fields = FormUtils.getOverlappingValues(fieldsValues, name)
      const uniqueValues = [...new Set(Object.values(fields).flat())]
      const findItems = (arr: unknown[]) =>
        arr.map((v) => items.find((i) => i.value === v)).filter(Boolean)

      return {
        overlappingFields: mapValues(fields, findItems),
        overlappingKeys: Object.keys(fields),
        overlappingItems: findItems(uniqueValues),
      }
    }, [fieldsValues, name, items])
  const prevOverlappingKeys = useRef<string[]>([])

  /**
   * Sets errors on the overlapping fields.
   *
   * This will also clear those errors when the users fixes the overlapping values.
   */
  useEffect(() => {
    const keys = prevOverlappingKeys.current

    if (overlappingKeys.length === keys.length) {
      return
    }

    prevOverlappingKeys.current = overlappingKeys

    if (overlappingKeys.length === 0) {
      clearErrors("root")
    }

    /**
     * Weird hack to get the errors dynamically in the RangeField component.
     *
     * Somehow settings the errors individually doesn't work.
     * I noticed that the button color of the currently opened RangeField wasn't changing when the error was set.
     */
    setError("root", {
      types: objectify(
        overlappingKeys,
        (k) => k,
        () => true,
      ),
      message: "Overlapping items",
    })
  }, [clearErrors, setError, overlappingKeys])

  if (!overlappingItems.length || !overlappingKeys.includes(name)) return null

  return (
    <div className="rounded-r-small border-warning-400 border-l-4 bg-warning-50 p-4">
      <div className="flex">
        <TriangleAlertIcon className="text-warning-400" />
        <div className="ml-3">
          {!!renderMessage && renderMessage(overlappingFields[name]!)}
          {!renderMessage && (
            <DisplayTextList
              prefix="Os números seguintes foram selecionados mais de uma vez: "
              items={overlappingFields[name]!}
              className="font-semibold text-warning-400"
            />
          )}
        </div>
      </div>
    </div>
  )
}

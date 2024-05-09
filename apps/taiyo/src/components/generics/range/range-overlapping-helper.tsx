import { TriangleAlertIcon } from "lucide-react"
import { objectify } from "radash"
import { useEffect, useMemo, useRef } from "react"
import { useFormContext } from "react-hook-form"
import type { RangeItem } from "~/lib/types"
import { FormUtils } from "~/lib/utils/form.utils"

type Props = {
  name: string
  items: RangeItem[]
  renderMessage?: (items: RangeItem[]) => string
}

export const RangeOverlappingHelper = ({
  name,
  items,
  renderMessage,
}: Props) => {
  const { watch, clearErrors, setError } = useFormContext()
  const fieldsValues = watch()
  const { overlappingKeys, overlappingItems } = useMemo(() => {
    const fields = FormUtils.getOverlappingValues(fieldsValues, name)
    const uniqueValues = [...new Set(Object.values(fields).flat())]

    return {
      overlappingKeys: Object.keys(fields),
      overlappingItems: uniqueValues
        .map((v) => items.find((i) => i.value === v))
        .filter(Boolean),
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

    // console.log("Setting errors", overlappingKeys)

    setError("root", {
      types: objectify(
        overlappingKeys,
        (k) => k,
        () => true,
      ),
      message: "Overlapping items",
    })

    // for (const key of overlappingKeys) {
    //   console.log("Setting error", key)

    //   setError(key, { message: "Overlapping items" })
    // }
    // setError("volumes.0.ids", { message: "Overlapping items" })
    // setError("volumes.1.ids", { message: "Overlapping items" })
  }, [clearErrors, setError, overlappingKeys])

  if (!overlappingItems.length) return null

  return (
    <div className="rounded-r-small border-warning-400 border-l-4 bg-warning-50 p-4">
      <div className="flex">
        <TriangleAlertIcon className="text-warning-400" />
        <div className="ml-3">
          {!!renderMessage && renderMessage(overlappingItems)}
          {!renderMessage && (
            <p>
              Os números seguintes foram selecionados mais de uma vez:{" "}
              {overlappingItems.map((v) => v.label).join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

import { Button } from "@nextui-org/react"
import { useFormikContext } from "formik"
import { PlusIcon } from "lucide-react"
import { useCallback } from "react"
import { BulkUpdateMediaChapterVolumesSchema } from "~/lib/schemas"

export const BulkUpdateChapterVolumesAddVolumeButton = () => {
  const { values, setValues } =
    useFormikContext<BulkUpdateMediaChapterVolumesSchema>()

  const handlePress = useCallback(() => {
    const highestVolume = values.reduce(
      (acc, curr) => Math.max(acc, curr.volume),
      0,
    )

    setValues((prev) => [...prev, { volume: highestVolume + 1, ids: [] }])
  }, [values, setValues])

  return (
    <Button
      startContent={<PlusIcon className="h-6 w-6" />}
      onPress={handlePress}
      color="primary"
      variant="light"
      size="sm"
      isIconOnly
    />
  )
}

import { Button } from "@nextui-org/react"
import { useFormikContext } from "formik"
import { PlusIcon } from "lucide-react"
import { useCallback } from "react"
import { BulkUpdateMediaChapterScansSchema } from "~/lib/schemas"

export const BulkUpdateChapterScansAddButton = () => {
  const { setValues } = useFormikContext<BulkUpdateMediaChapterScansSchema>()

  const handlePress = useCallback(() => {
    setValues((prev) => [...prev, { scanIds: [], ids: [] }])
  }, [setValues])

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

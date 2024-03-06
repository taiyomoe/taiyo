import type { ButtonProps } from "@nextui-org/button"
import { Button } from "@nextui-org/button"
import { useFormikContext } from "formik"
import { useImageStore } from "~/stores"

export const SubmitButton = ({ isDisabled, children }: ButtonProps) => {
  const { isCompressing } = useImageStore()
  const { isSubmitting, isValid, dirty } = useFormikContext()

  const shouldDisableButton =
    isSubmitting || !(isValid && dirty) || isCompressing || isDisabled

  if (isCompressing) {
    return (
      <Button className="w-fit font-medium" isLoading color="primary">
        Comprimindo
      </Button>
    )
  }

  return (
    <Button
      className="w-fit font-medium"
      isDisabled={shouldDisableButton}
      isLoading={isSubmitting}
      color="primary"
      type="submit"
    >
      {children}
    </Button>
  )
}

import type { ButtonProps } from "@nextui-org/button";
import { Button } from "@nextui-org/button";
import { useFormikContext } from "formik";

export const SubmitButton = ({ isDisabled, children }: ButtonProps) => {
  const { isSubmitting, isValid, dirty } = useFormikContext();
  const shouldDisableButton = isSubmitting || !(isValid && dirty) || isDisabled;

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
  );
};

import type { ButtonProps } from "@nextui-org/button";
import { Button } from "@nextui-org/button";
import { useFormikContext } from "formik";
import { useAtomValue } from "jotai";

import { needsCompressionAtom } from "~/atoms/imageCompression.atoms";

export const SubmitButton = ({ isDisabled, children }: ButtonProps) => {
  const needsCompression = useAtomValue(needsCompressionAtom);
  const { isSubmitting, isValid, dirty } = useFormikContext();

  const shouldDisableButton =
    isSubmitting || !(isValid && dirty) || needsCompression || isDisabled;

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

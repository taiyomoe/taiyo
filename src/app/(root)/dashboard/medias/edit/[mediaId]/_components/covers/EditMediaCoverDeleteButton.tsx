import { Button } from "@nextui-org/react";
import { useFormikContext } from "formik";
import { useSetAtom } from "jotai";
import { toast } from "sonner";

import { mediaCoversEditAtom } from "~/atoms/mediaEdit.atoms";
import type { UpdateMediaCoverSchema } from "~/lib/schemas";
import { api } from "~/lib/trpc/client";

type Props = {
  toggleModal: () => void;
};

export const EditMediaCoverDeleteButton = ({ toggleModal }: Props) => {
  const { initialValues, values } = useFormikContext<UpdateMediaCoverSchema>();
  const setMediaCoversEdit = useSetAtom(mediaCoversEditAtom);
  const { mutateAsync } = api.mediaCovers.delete.useMutation();

  const handlePress = () => {
    toast.promise(mutateAsync({ id: values.id }), {
      loading: "Apagando a cover...",
      success: () => {
        setMediaCoversEdit((prev) =>
          prev.map((v) => ({
            ...v,
            covers: v.covers.filter((c) => c.id !== values.id),
          })),
        );
        toggleModal();

        return "Cover apagada com sucesso!";
      },
      error: (err) => {
        console.log(err);

        return "Erro ao apagar a cover.";
      },
    });
  };

  return (
    <Button
      onPress={handlePress}
      isDisabled={initialValues.isMainCover}
      variant="light"
      color="danger"
    >
      Apagar
    </Button>
  );
};

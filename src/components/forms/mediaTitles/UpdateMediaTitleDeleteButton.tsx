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

export const UpdateMediaTitleDeleteButton = ({ toggleModal }: Props) => {
  const { initialValues, values } = useFormikContext<UpdateMediaCoverSchema>();
  const setMediaCoversEdit = useSetAtom(mediaCoversEditAtom);
  const { mutateAsync } = api.mediaTitles.delete.useMutation();

  const handlePress = () => {
    toast.promise(mutateAsync({ id: values.id }), {
      loading: "Apagando o título...",
      success: () => {
        setMediaCoversEdit((prev) =>
          prev.map((v) => ({
            ...v,
            covers: v.covers.filter((c) => c.id !== values.id),
          })),
        );
        toggleModal();

        return "Título apagado com sucesso!";
      },
      error: "Erro ao apagar o título.",
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

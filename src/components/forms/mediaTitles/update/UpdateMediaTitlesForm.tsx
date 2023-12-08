import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import type { MediaTitle } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";
import { pick } from "lodash-es";
import { FileEditIcon } from "lucide-react";
import { toast } from "sonner";
import { toFormikValidationSchema } from "zod-formik-adapter";

import { UpdateMediaTitleDeleteButton } from "~/components/forms/mediaTitles/update/UpdateMediaTitleDeleteButton";
import { UpdateMediaTitlesFormFields } from "~/components/forms/mediaTitles/update/UpdateMediaTitlesFormFields";
import { SubmitButton } from "~/components/generics/buttons/SubmitButton";
import { Form } from "~/components/generics/form/Form";
import type { UpdateMediaTitleSchema } from "~/lib/schemas";
import { updateMediaTitleSchema } from "~/lib/schemas";
import { api } from "~/lib/trpc/client";
import type { FormSubmit, MediaWithRelations } from "~/lib/types";
import { ObjectUtils } from "~/lib/utils/object.utils";

type Props = {
  media: MediaWithRelations;
  title: MediaTitle;
};

export const UpdateMediaTitlesForm = ({ title }: Props) => {
  const { mutateAsync } = api.mediaTitles.update.useMutation();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const initalValues: UpdateMediaTitleSchema = pick(
    title,
    "id",
    "title",
    "language",
    "priority",
    "isMainTitle",
    "isAcronym",
  );

  const handleSubmit: FormSubmit<UpdateMediaTitleSchema> = (
    values,
    { setSubmitting },
  ) => {
    const delta = ObjectUtils.deepDifference(values, initalValues);
    const payload = {
      id: values.id,
      ...delta,
    };

    toast.promise(mutateAsync(payload), {
      loading: "Salvando alterações...",
      success: () => {
        onOpen();

        return "Alterações salvas com sucesso!";
      },
      error: (err) => {
        if (err instanceof TRPCClientError) {
          return err.message;
        }

        return "Ocorreu um erro inesperado ao salvar as alterações.";
      },
      finally: () => setSubmitting(false),
    });
  };

  return (
    <>
      <Button
        startContent={<FileEditIcon className="h-6 w-6" />}
        onPress={onOpen}
        color="warning"
        variant="light"
        size="sm"
        isIconOnly
      />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Form.Component
          initialValues={initalValues}
          validationSchema={toFormikValidationSchema(updateMediaTitleSchema)}
          onSubmit={handleSubmit}
        >
          <ModalContent>
            <ModalHeader>Modificar título</ModalHeader>
            <ModalBody>
              <UpdateMediaTitlesFormFields />
            </ModalBody>
            <ModalFooter>
              <UpdateMediaTitleDeleteButton toggleModal={onOpen} />
              <Button onClick={onOpenChange}>Fechar</Button>
              <SubmitButton>Salvar</SubmitButton>
            </ModalFooter>
          </ModalContent>
        </Form.Component>
      </Modal>
    </>
  );
};

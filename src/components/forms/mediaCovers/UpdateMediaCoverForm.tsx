import NextImage from "next/image";
import { Button } from "@nextui-org/button";
import { Image } from "@nextui-org/image";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { Tooltip } from "@nextui-org/tooltip";
import { ContentRating, Languages } from "@prisma/client";
import type { MediaCover } from "@prisma/client";
import type { FormikConfig } from "formik";
import { toast } from "sonner";
import { toFormikValidationSchema } from "zod-formik-adapter";

import { SubmitButton } from "~/components/generics/buttons/SubmitButton";
import { Form } from "~/components/generics/form/Form";
import { InputFormField } from "~/components/generics/form/InputFormField";
import { SelectFormField } from "~/components/generics/form/SelectFormField";
import { SwitchFormField } from "~/components/generics/form/SwitchFormField";
import type { UpdateMediaCoverSchema } from "~/lib/schemas";
import { updateMediaCoverSchema } from "~/lib/schemas";
import { api } from "~/lib/trpc/client";
import type { MediaWithRelations } from "~/lib/types";
import { MediaCoverUtils } from "~/lib/utils/mediaCover.utils";
import { ObjectUtils } from "~/lib/utils/object.utils";
import { useMediaUpdateStore } from "~/stores";

import { UpdateMediaCoverDeleteButton } from "./UpdateMediaCoverDeleteButton";

type Props = {
  media: MediaWithRelations;
  cover: MediaCover;
};

export const UpdateMediaCoverForm = ({ media, cover }: Props) => {
  const { updateCover } = useMediaUpdateStore();
  const { mutateAsync } = api.mediaCovers.update.useMutation();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const initialValues: UpdateMediaCoverSchema = {
    id: cover.id,
    volume: cover.volume,
    contentRating: cover.contentRating,
    isMainCover: cover.isMainCover,
    language: cover.language,
  };

  const handleSubmit: FormikConfig<UpdateMediaCoverSchema>["onSubmit"] = (
    values,
    helpers,
  ) => {
    const delta = ObjectUtils.deepDifference(values, initialValues);
    const payload = {
      id: values.id,
      ...delta,
    };

    toast.promise(mutateAsync(payload), {
      loading: "Salvando alterações...",
      success: () => {
        updateCover(payload);
        onOpenChange();
        helpers.resetForm({ values });

        return "Alterações salvas com sucesso!";
      },
      error: "Não foi possível salvar as alterações.",
      finally: () => {
        helpers.setSubmitting(false);
      },
    });
  };

  return (
    <>
      <Image
        as={NextImage}
        className="h-[300px] min-w-[210px] rounded-small object-cover transition-all hover:cursor-pointer hover:opacity-80"
        src={MediaCoverUtils.getUrl({ id: media.id, coverId: cover.id })}
        onClick={onOpen}
        height={300}
        width={210}
        alt="cover"
      />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Form.Component
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={toFormikValidationSchema(updateMediaCoverSchema)}
        >
          <ModalContent>
            <ModalHeader>Modificar cover</ModalHeader>
            <ModalBody className="flex-row">
              <Image
                as={NextImage}
                src={MediaCoverUtils.getUrl({
                  id: media.id,
                  coverId: cover.id,
                })}
                className="h-[160px] min-w-[110px] rounded-small object-cover"
                height={160}
                width={110}
                alt="cover"
              />
              <Form.Col>
                <Form.Row>
                  <SelectFormField
                    name="contentRating"
                    label="Classificação"
                    labelPlacement="outside"
                    variant="faded"
                    items={ContentRating}
                  />
                  <Tooltip
                    content="Para trocar de cover principal, em vez de desativar a opção nesta cover, ative-a na nova cover."
                    isDisabled={initialValues.isMainCover === false}
                    color="warning"
                  >
                    <div className="min-w-fit">
                      <SwitchFormField
                        name="isMainCover"
                        label="Cover principal"
                        labelPlacement="outside"
                        isDisabled={initialValues.isMainCover}
                      />
                    </div>
                  </Tooltip>
                </Form.Row>
                <Form.Row>
                  <InputFormField
                    name="volume"
                    label="Volume"
                    type="number"
                    labelPlacement="outside"
                    variant="faded"
                    fullWidth
                  />
                  <SelectFormField
                    name="language"
                    label="Idioma"
                    labelPlacement="outside"
                    variant="faded"
                    items={Languages}
                  />
                </Form.Row>
              </Form.Col>
            </ModalBody>
            <ModalFooter>
              <UpdateMediaCoverDeleteButton toggleModal={onOpen} />
              <Button onClick={onOpenChange}>Fechar</Button>
              <SubmitButton>Salvar</SubmitButton>
            </ModalFooter>
          </ModalContent>
        </Form.Component>
      </Modal>
    </>
  );
};

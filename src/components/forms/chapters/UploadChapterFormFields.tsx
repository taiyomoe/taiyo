import { Badge } from "@nextui-org/badge";
import { Button } from "@nextui-org/button";
import { Tooltip } from "@nextui-org/tooltip";
import { ContentRating, Flag, MediaChapterLanguages } from "@prisma/client";
import { useFormikContext } from "formik";
import { AlertCircleIcon } from "lucide-react";

import { Form } from "~/components/generics/form/Form";
import { InputFormField } from "~/components/generics/form/InputFormField";
import { SelectFormField } from "~/components/generics/form/SelectFormField";
import { ImageDropzone } from "~/components/ui/images/ImageDropzone";
import { useChapterImageCompression } from "~/hooks/useChapterImageCompression";

export const UploadChapterFormFields = () => {
  const { isSubmitting, isValid, dirty } = useFormikContext();
  const { needsCompression, handleCompressImages } =
    useChapterImageCompression();

  const shouldDisableButton =
    needsCompression || isSubmitting || !(isValid && dirty);

  return (
    <Form.Layout>
      <Form.Category>
        <InputFormField name="id" label="ID do capítulo" isDisabled />
        <Tooltip content="Temporário">
          <Badge
            isOneChar
            content={<AlertCircleIcon />}
            color="warning"
            size="lg"
            placement="top-right"
            className="right-1"
          >
            <InputFormField name="mediaId" label="ID da obra" />
          </Badge>
        </Tooltip>
        <InputFormField name="title" label="Título" />
        <Tooltip content="Temporário">
          <Badge
            isOneChar
            content={<AlertCircleIcon />}
            color="warning"
            size="lg"
            placement="top-right"
            className="right-1 top-7"
          >
            <InputFormField
              name="scansIds"
              label="IDs das scans"
              labelPlacement="outside"
              placeholder="Separe os IDs por uma vírgula"
            />
          </Badge>
        </Tooltip>
      </Form.Category>
      <Form.Category title="Detalhes">
        <Form.Row>
          <InputFormField
            name="number"
            label="Número"
            labelPlacement="outside"
            placeholder="Ex: 1"
          />
          <InputFormField
            name="volume"
            label="Volume"
            labelPlacement="outside"
            placeholder="Ex: 1"
          />
        </Form.Row>
        <Form.Row>
          <SelectFormField
            name="contentRating"
            label="Classificação do conteúdo"
            labelPlacement="outside"
            items={ContentRating}
            isDisabled
          />
          <SelectFormField
            name="flag"
            label="Flag"
            labelPlacement="outside"
            items={Flag}
            isDisabled
          />
          <SelectFormField
            name="language"
            label="Idioma"
            labelPlacement="outside"
            items={MediaChapterLanguages}
            isDisabled
          />
        </Form.Row>
      </Form.Category>
      <Form.Category title="Imagens">
        <ImageDropzone />
      </Form.Category>
      <Form.Actions>
        <Button
          className="w-fit font-medium"
          variant="flat"
          onClick={handleCompressImages}
          isDisabled={!needsCompression}
        >
          Comprimir
        </Button>
        <Button
          color="primary"
          type="submit"
          className="w-fit font-medium"
          isDisabled={shouldDisableButton}
          isLoading={isSubmitting}
        >
          Adicionar
        </Button>
      </Form.Actions>
    </Form.Layout>
  );
};

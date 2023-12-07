import { Badge } from "@nextui-org/badge";
import { Tooltip } from "@nextui-org/tooltip";
import { ContentRating, Flag, Languages } from "@prisma/client";
import { AlertCircleIcon } from "lucide-react";

import { SubmitButton } from "~/components/generics/buttons/SubmitButton";
import { Form } from "~/components/generics/form/Form";
import { InputFormField } from "~/components/generics/form/InputFormField";
import { SelectFormField } from "~/components/generics/form/SelectFormField";
import { ImageDropzone } from "~/components/ui/images/ImageDropzone";

export const UploadChapterFormFields = () => {
  const handleDrop = (filesLength: number) => {
    console.log("Dropped files", filesLength);
  };

  return (
    <Form.Layout>
      <Form.Category>
        <InputFormField name="id" label="ID do capítulo" isDisabled />
        <Tooltip content="Temporário">
          <Badge
            className="right-1"
            placement="top-right"
            content={<AlertCircleIcon />}
            color="warning"
            size="lg"
            isOneChar
          >
            <InputFormField name="mediaId" label="ID da obra" />
          </Badge>
        </Tooltip>
        <InputFormField name="title" label="Título" />
        <Tooltip content="Temporário">
          <Badge
            className="right-1 top-7"
            placement="top-right"
            content={<AlertCircleIcon />}
            color="warning"
            size="lg"
            isOneChar
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
            items={ContentRating}
            isDisabled
          />
          <SelectFormField name="flag" label="Flag" items={Flag} isDisabled />
          <SelectFormField
            name="language"
            label="Idioma"
            items={Languages}
            isDisabled
          />
        </Form.Row>
      </Form.Category>
      <Form.Category title="Imagens">
        <ImageDropzone title="Páginas" type="CHAPTER" onDrop={handleDrop}>
          {({}) => <p>azert</p>}
        </ImageDropzone>
      </Form.Category>
      <Form.Actions>
        <SubmitButton>Adicionar</SubmitButton>
      </Form.Actions>
    </Form.Layout>
  );
};

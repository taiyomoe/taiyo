import { ContentRating, Flag, Languages } from "@prisma/client";

import { Form } from "~/components/generics/form/Form";
import { InputFormField } from "~/components/generics/form/InputFormField";
import { SelectFormField } from "~/components/generics/form/SelectFormField";
import { MediasSearchAutocomplete } from "~/components/medias/MediasSearchAutocomplete";
import { ScansSearchAutocomplete } from "~/components/scans/ScansSearchAutocomplete";
import { ImageCard } from "~/components/ui/images/ImageCard";
import { ImageDropzone } from "~/components/ui/images/ImageDropzone";

export const UploadChapterFormFields = () => {
  return (
    <Form.Layout>
      <Form.Category>
        <MediasSearchAutocomplete />
        <InputFormField name="title" label="Título" />
        <ScansSearchAutocomplete />
      </Form.Category>
      <Form.Category title="Detalhes">
        <Form.Row>
          <InputFormField
            name="number"
            label="Número"
            labelPlacement="outside"
            placeholder="Ex: 1"
            type="number"
          />
          <InputFormField
            name="volume"
            label="Volume"
            labelPlacement="outside"
            placeholder="Ex: 1"
            type="number"
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
      <ImageDropzone title="Páginas" type="CHAPTER" isCompact>
        {({ selectedImages }) => (
          <div className="flex flex-col gap-3">
            {selectedImages.map((f, i) => (
              <ImageCard
                key={i}
                file={f}
                position={`${i + 1}/${selectedImages.length}`}
              />
            ))}
          </div>
        )}
      </ImageDropzone>
    </Form.Layout>
  );
};

import { ContentRating } from "@prisma/client";

import { Form } from "~/components/generics/form/Form";
import { InputFormField } from "~/components/generics/form/InputFormField";
import { SelectFormField } from "~/components/generics/form/SelectFormField";
import { ImageDropzone } from "~/components/ui/images/ImageDropzone";

export const MediaCoversFormCategory = () => {
  return (
    <Form.Category title="Covers">
      <Form.Row>
        <ImageDropzone compact />
        <div className="md:w-1/3">
          <Form.Col>
            <InputFormField
              name="volume"
              label="Volume"
              labelPlacement="outside"
              placeholder="Ex: 69"
            />
            <SelectFormField
              name="contentRating"
              label="Classificação"
              labelPlacement="outside"
              items={ContentRating}
            />
          </Form.Col>
        </div>
      </Form.Row>
    </Form.Category>
  );
};

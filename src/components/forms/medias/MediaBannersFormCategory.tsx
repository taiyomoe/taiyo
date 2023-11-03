import { ContentRating } from "@prisma/client";

import { Form } from "~/components/generics/form/Form";
import { SelectFormField } from "~/components/generics/form/SelectFormField";
import { ImageDropzone } from "~/components/ui/images/ImageDropzone";

export const MediaBannersFormCategory = () => {
  return (
    <Form.Category title="Banners">
      <Form.Row>
        <ImageDropzone compact />
        <SelectFormField
          name="contentRating"
          label="Classificação"
          labelPlacement="outside"
          items={ContentRating}
          className="md:w-1/3"
        />
      </Form.Row>
    </Form.Category>
  );
};

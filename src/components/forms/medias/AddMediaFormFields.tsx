import { Button } from "@nextui-org/button";
import {
  ContentRating,
  Flag,
  MediaCountryOfOrigin,
  MediaDemography,
  MediaSource,
  MediaStatus,
  MediaType,
} from "@prisma/client";
import { useFormikContext } from "formik";

import { Form } from "~/components/generics/form/Form";
import { InputFormField } from "~/components/generics/form/InputFormField";
import { SelectFormField } from "~/components/generics/form/SelectFormField";
import { SwitchFormField } from "~/components/generics/form/SwitchFormField";
import { TextAreaFormField } from "~/components/generics/form/TextAreaFormField";
import { useImageCompression } from "~/hooks/useImageCompression";

import { MediaBannersFormCategory } from "./MediaBannersFormCategory";
import { MediaCoversFormCategory } from "./MediaCoversFormCategory";
import { MediaTagsFormCategory } from "./MediaTagsFormCategory";
import { MediaTitlesFormCategory } from "./MediaTitlesFormCategory";
import { MediaTrackersFormCategory } from "./MediaTrackersFormFields";

export const AddMediaFormFields = () => {
  const { values, errors, isSubmitting, isValid, dirty } = useFormikContext();
  const { needsCompression, handleCompressImages } = useImageCompression();

  const shouldDisableButton =
    needsCompression || isSubmitting || !(isValid && dirty);

  console.log("values", values);
  console.log("errors", errors);

  return (
    <Form.Layout>
      <Form.Category>
        <InputFormField name="id" label="ID da obra" isDisabled />
        <TextAreaFormField
          name="synopsis"
          label="Sinopse"
          placeholder={
            'Gol D. Roger, a man referred to as the "Pirate King," is set to be executed by the World Government. But just before his...'
          }
        />
      </Form.Category>
      <MediaTrackersFormCategory />
      <Form.Category title="Detalhes">
        <Form.Row>
          <InputFormField
            name="startDate"
            label="Data de início"
            labelPlacement="outside"
            placeholder="Ex: 2021-01-01"
          />
          <InputFormField
            name="endDate"
            label="Data de término"
            labelPlacement="outside"
            placeholder="Ex: 2021-01-01"
          />
        </Form.Row>
        <Form.Row>
          <SelectFormField name="type" label="Tipo" items={MediaType} />
          <SelectFormField
            name="demography"
            label="Demografia"
            items={MediaDemography}
          />
          <SelectFormField name="source" label="Source" items={MediaSource} />
          <SelectFormField name="status" label="Status" items={MediaStatus} />
        </Form.Row>
        <Form.Row>
          <SelectFormField
            name="countryOfOrigin"
            label="Origem"
            items={MediaCountryOfOrigin}
          />
          <SelectFormField
            name="contentRating"
            label="Classificação"
            items={ContentRating}
          />
          <SelectFormField name="flag" label="Flag" items={Flag} />
          <SwitchFormField name="oneShot" label="One Shot" size="lg" />
        </Form.Row>
      </Form.Category>
      <MediaTitlesFormCategory />
      <MediaTagsFormCategory />
      <MediaCoversFormCategory />
      <MediaBannersFormCategory />
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

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
import { MediaTitlesFormCategory } from "./MediaTitlesFormCategory";

export const AddMediaFormFields = () => {
  const { isSubmitting, isValid, dirty } = useFormikContext();

  const shouldDisableButton = isSubmitting || !(isValid && dirty);

  return (
    <Form.Layout>
      <Form.Category>
        <TextAreaFormField
          name="synopsis"
          label="Sinopse"
          placeholder="Sinopse da obra"
        />
      </Form.Category>
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
      <Form.Category title="Tags">a</Form.Category>
      <Form.Category title="Trackers">a</Form.Category>
      <Form.Category title="Covers">a</Form.Category>
      <Form.Category title="Banners">a</Form.Category>
      <Form.Category title="Títulos">a</Form.Category>
      <Form.Actions>
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

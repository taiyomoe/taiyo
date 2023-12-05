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

import { MediaTagsFormCategory } from "./MediaTagsFormCategory";
import { MediaTitlesFormCategory } from "./MediaTitlesFormCategory";
import { MediaTrackersFormCategory } from "./MediaTrackersFormFields";

type Props = {
  action: "create" | "update";
};

export const MediaFormFields = ({ action }: Props) => {
  const { isSubmitting, isValid, dirty } = useFormikContext();
  const shouldDisableButton = isSubmitting || !(isValid && dirty);
  const buttonText = action === "create" ? "Adicionar" : "Salvar";

  return (
    <Form.Layout>
      <Form.Category>
        <InputFormField name="id" label="ID da obra" isDisabled />
        <TextAreaFormField
          name="synopsis"
          label="Sinopse"
          placeholder='Gol D. Roger, a man referred to as the "Pirate King," is set to be executed by the World Government. But just before his...'
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
            type="date"
          />
          <InputFormField
            name="endDate"
            label="Data de término"
            labelPlacement="outside"
            placeholder="Ex: 2021-01-01"
            type="date"
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
        <InputFormField
          name="genres"
          label="Gêneros — WIP"
          labelPlacement="outside"
          placeholder="ACTION, COMEDY, THRILLER"
          isDisabled
        />
      </Form.Category>
      <MediaTitlesFormCategory />
      <MediaTagsFormCategory />
      <Form.Actions>
        <Button
          color="primary"
          type="submit"
          className="w-fit font-medium"
          isDisabled={shouldDisableButton}
          isLoading={isSubmitting}
        >
          {buttonText}
        </Button>
      </Form.Actions>
    </Form.Layout>
  );
};

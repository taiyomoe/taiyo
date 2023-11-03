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
import { HardDriveDownloadIcon } from "lucide-react";

import { Form } from "~/components/generics/form/Form";
import { InputFormField } from "~/components/generics/form/InputFormField";
import { SelectFormField } from "~/components/generics/form/SelectFormField";
import { SwitchFormField } from "~/components/generics/form/SwitchFormField";
import { TextAreaFormField } from "~/components/generics/form/TextAreaFormField";
import { MediaBannersFormCategory } from "./MediaBannersFormCategory";
import { MediaCoversFormCategory } from "./MediaCoversFormCategory";
import { MediaTagsFormCategory } from "./MediaTagsFormCategory";
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
      <Form.Category title="Trackers">
        <Form.Row>
          <InputFormField
            name="trackers[0].trackerMediaId"
            label="ID na MangaDex"
            labelPlacement="outside"
            placeholder="a1c7c817-4e59-43b7-9365-09675a149a6f"
            className="md:w-2/3"
            classNames={{ inputWrapper: "pr-0" }}
            endContent={
              <Button
                className="rounded-l-none"
                color="primary"
                startContent={<HardDriveDownloadIcon size={20} />}
                isIconOnly
                isDisabled
              />
            }
          />
          <InputFormField
            name="trackers[1].trackerMediaId"
            label="ID na AniList"
            labelPlacement="outside"
            placeholder="30013"
            className="md:w-fit"
          />
          <InputFormField
            name="trackers[3].trackerMediaId"
            label="ID no MyAnimeList"
            labelPlacement="outside"
            placeholder="13"
            className="md:w-fit"
          />
        </Form.Row>
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
      <MediaTagsFormCategory />
      <MediaCoversFormCategory />
      <MediaBannersFormCategory />
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

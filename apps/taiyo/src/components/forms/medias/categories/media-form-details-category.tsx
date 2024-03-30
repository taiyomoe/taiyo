import {
  ContentRating,
  Flag,
  MediaCountryOfOrigin,
  MediaDemography,
  MediaSource,
  MediaStatus,
  MediaType,
} from "@taiyomoe/db"
import { GenresField } from "~/components/generics/newForm/genres-field"
import { InputField } from "~/components/generics/newForm/input-field"
import { Form } from "~/components/generics/newForm/new-form"
import { SelectField } from "~/components/generics/newForm/select-field"
import { SwitchField } from "~/components/generics/newForm/switch-field"
import { TagsField } from "~/components/generics/newForm/tags-field"

export const MediaFormDetailsCategory = () => (
  <Form.Category title="Detalhes">
    <Form.Row>
      <InputField
        name="startDate"
        label="Data de início"
        labelPlacement="outside"
        placeholder="Ex: 2021-01-01"
        type="date"
      />
      <InputField
        name="endDate"
        label="Data de término"
        labelPlacement="outside"
        placeholder="Ex: 2021-01-01"
        type="date"
      />
    </Form.Row>
    <Form.Row>
      <SelectField name="type" label="Tipo" items={MediaType} />
      <SelectField
        name="demography"
        label="Demografia"
        items={MediaDemography}
      />
      <SelectField name="source" label="Fonte" items={MediaSource} />
      <SelectField name="status" label="Status" items={MediaStatus} />
    </Form.Row>
    <Form.Row>
      <SelectField
        name="countryOfOrigin"
        label="Origem"
        items={MediaCountryOfOrigin}
      />
      <SelectField
        name="contentRating"
        label="Classificação"
        items={ContentRating}
      />
      <SelectField name="flag" label="Flag" items={Flag} />
      <SwitchField name="oneShot" label="One Shot" size="lg" />
    </Form.Row>
    <GenresField />
    <TagsField />
  </Form.Category>
)

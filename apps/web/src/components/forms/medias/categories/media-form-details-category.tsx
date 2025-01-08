import { now } from "@internationalized/date"
import {
  ContentRating,
  Flag,
  MediaCountryOfOrigin,
  MediaDemography,
  MediaSource,
  MediaStatus,
  MediaType,
} from "@taiyomoe/db"
import { DateField } from "~/components/generics/form/date-field"
import { Form } from "~/components/generics/form/form"
import { GenresField } from "~/components/generics/form/genres-field"
import { SelectField } from "~/components/generics/form/select-field"
import { SwitchField } from "~/components/generics/form/switch-field"
import { TagsField } from "~/components/generics/form/tags-field"
import { TextAreaField } from "~/components/generics/form/textarea-field"

export const MediaFormDetailsCategory = () => (
  <Form.Category title="Detalhes">
    <TextAreaField
      name="synopsis"
      label="Sinopse"
      placeholder='Gol D. Roger, a man referred to as the "Pirate King," is set to be executed by the World Government. But just before his...'
      isRequired
    />
    <Form.Row>
      <DateField
        name="startDate"
        label="Data de início"
        labelPlacement="outside"
        maxValue={now("America/Sao_Paulo")}
        aria-label="Start date"
        showMonthAndYearPickers
      />
      <DateField
        name="endDate"
        label="Data de término"
        labelPlacement="outside"
        maxValue={now("America/Sao_Paulo")}
        aria-label="End date"
        showMonthAndYearPickers
      />
    </Form.Row>
    <Form.Row>
      <SelectField name="type" label="Tipo" items={MediaType} isRequired />
      <SelectField
        name="demography"
        label="Demografia"
        items={MediaDemography}
        isRequired
      />
      <SelectField name="source" label="Fonte" items={MediaSource} isRequired />
      <SelectField
        name="status"
        label="Status"
        items={MediaStatus}
        isRequired
      />
    </Form.Row>
    <Form.Row>
      <SelectField
        name="countryOfOrigin"
        label="Origem"
        items={MediaCountryOfOrigin}
        isRequired
      />
      <SelectField
        name="contentRating"
        label="Classificação"
        items={ContentRating}
        isRequired
      />
      <SelectField name="flag" label="Flag" items={Flag} isRequired />
      <SwitchField name="oneShot" label="One Shot" size="lg" isRequired />
    </Form.Row>
    <GenresField />
    <TagsField />
  </Form.Category>
)

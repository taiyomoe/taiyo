import { InputField } from "~/components/generics/newForm/input-field"
import { Form } from "~/components/generics/newForm/new-form"

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
      <p>Filler</p>
      {/* <SelectFormField name="type" label="Tipo" items={MediaType} />
      <SelectFormField
        name="demography"
        label="Demografia"
        items={MediaDemography}
      />
      <SelectFormField name="source" label="Source" items={MediaSource} />
      <SelectFormField name="status" label="Status" items={MediaStatus} /> */}
    </Form.Row>
    <Form.Row>
      <p>Filler</p>
      {/* <SelectFormField
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
      <SwitchFormField name="oneShot" label="One Shot" size="lg" /> */}
    </Form.Row>
    <InputField
      name="genres"
      label="Gêneros — WIP"
      labelPlacement="outside"
      placeholder="ACTION, COMEDY, THRILLER"
      isDisabled
    />
  </Form.Category>
)

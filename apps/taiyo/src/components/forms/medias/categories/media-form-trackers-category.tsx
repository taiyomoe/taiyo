import { InputField } from "~/components/generics/form/input-field"
import { Form } from "~/components/generics/form/new-form"

export const MediaFormTrackersCategory = () => (
  <Form.Category title="Trackers">
    <Form.Col>
      <InputField
        name="mdId"
        label="ID na MangaDex"
        labelPlacement="outside"
        placeholder="a1c7c817-4e59-43b7-9365-09675a149a6f"
      />
      <Form.Row>
        <InputField
          name="alId"
          label="ID na AniList"
          labelPlacement="outside"
          placeholder="30013"
          type="number"
        />
        <InputField
          name="malId"
          label="ID no MyAnimeList"
          labelPlacement="outside"
          placeholder="13"
          type="number"
        />
      </Form.Row>
    </Form.Col>
  </Form.Category>
)

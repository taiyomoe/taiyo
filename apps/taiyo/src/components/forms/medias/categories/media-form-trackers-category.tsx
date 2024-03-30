import { InputField } from "~/components/generics/newForm/input-field"
import { Form } from "~/components/generics/newForm/new-form"

export const MediaFormTrackersCategory = () => (
  <Form.Category title="Trackers">
    <Form.Col>
      <InputField
        name="mdTracker"
        label="ID na MangaDex"
        labelPlacement="outside"
        placeholder="a1c7c817-4e59-43b7-9365-09675a149a6f"
      />
      <Form.Row>
        <InputField
          name="alTracker"
          label="ID na AniList"
          labelPlacement="outside"
          placeholder="30013"
        />
        <InputField
          name="malTracker"
          label="ID no MyAnimeList"
          labelPlacement="outside"
          placeholder="13"
        />
      </Form.Row>
    </Form.Col>
  </Form.Category>
)

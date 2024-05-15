import { Tooltip } from "@nextui-org/tooltip"
import { ContentRating, Languages } from "@taiyomoe/db"
import { InputField } from "~/components/generics/newForm/input-field"
import { Form } from "~/components/generics/newForm/new-form"
import { SelectField } from "~/components/generics/newForm/select-field"
import { SwitchField } from "~/components/generics/newForm/switch-field"

type Props = {
  isMainCover: boolean
}

export const UpdateCoverFormFields = ({ isMainCover }: Props) => (
  <Form.Col className="justify-center">
    <Form.Row>
      <SelectField
        name="contentRating"
        label="Classificação"
        labelPlacement="outside"
        variant="faded"
        items={ContentRating}
      />
      <Tooltip
        content="Para trocar de cover principal, em vez de desativar a opção nesta cover, ative-a na nova cover."
        isDisabled={isMainCover === false}
        color="warning"
      >
        <div className="min-w-fit">
          <SwitchField
            name="isMainCover"
            label="Cover principal"
            labelPlacement="outside"
            isDisabled={isMainCover}
          />
        </div>
      </Tooltip>
    </Form.Row>
    <Form.Row>
      <InputField
        name="volume"
        label="Volume"
        type="number"
        labelPlacement="outside"
        variant="faded"
        fullWidth
      />
      <SelectField
        name="language"
        label="Idioma"
        labelPlacement="outside"
        variant="faded"
        items={Languages}
      />
    </Form.Row>
  </Form.Col>
)

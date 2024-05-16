import { Button } from "@nextui-org/button"
import { Form } from "~/components/generics/form/form"
import { InputField } from "~/components/generics/form/input-field"
import { TextAreaField } from "~/components/generics/form/textarea-field"

export const CreateScanFormFields = () => {
  return (
    <Form.Layout>
      <Form.Category>
        <InputField name="name" label="Nome" />
        <TextAreaField name="description" label="Description" />
      </Form.Category>
      <Form.Category title="Redes sociais">
        <Form.Row>
          <InputField
            name="website"
            label="Website"
            labelPlacement="outside"
            placeholder="https://animaregia.net/"
          />
          <InputField
            name="discord"
            label="Discord"
            labelPlacement="outside"
            placeholder="https://discord.gg/T7XXzNN"
          />
        </Form.Row>
        <Form.Row>
          <InputField
            name="twitter"
            label="Twitter"
            labelPlacement="outside"
            placeholder="https://twitter.com/onepieceex"
          />
          <InputField
            name="facebook"
            label="Facebook"
            labelPlacement="outside"
            placeholder="https://www.facebook.com/DROPEscanlator"
          />
        </Form.Row>
        <Form.Row>
          <InputField
            name="instagram"
            label="Instagram"
            labelPlacement="outside"
            placeholder="https://www.instagram.com/saikaioficial"
          />
          <InputField
            name="telegram"
            label="Telegram"
            labelPlacement="outside"
            placeholder="https://t.me/gekkouscans"
          />
        </Form.Row>
        <Form.Row>
          <InputField
            name="youtube"
            label="YouTube"
            labelPlacement="outside"
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          />
          <InputField
            name="email"
            label="Email"
            labelPlacement="outside"
            placeholder="animaregia@live.com"
          />
        </Form.Row>
      </Form.Category>
      <Form.Category title="Imagens">
        <InputField
          name="logo"
          label="Logo"
          placeholder="https://i.imgur.com/rSDmlHq.png"
        />
        <InputField
          name="banner"
          label="Banner"
          placeholder="https://i.imgur.com/13N7kAY.jpg"
        />
      </Form.Category>
      <Form.Actions>
        <Button color="primary" type="submit" className="w-fit font-medium">
          Adicionar
        </Button>
      </Form.Actions>
    </Form.Layout>
  )
}

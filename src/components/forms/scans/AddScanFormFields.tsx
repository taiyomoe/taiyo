import { Button } from "@nextui-org/button";
import { useFormikContext } from "formik";

import { Form } from "~/components/generics/form/Form";
import { InputFormField } from "~/components/generics/form/InputFormField";
import { TextAreaFormField } from "~/components/generics/form/TextAreaFormField";

export const AddScanFormFields = () => {
  const { isSubmitting, isValid, dirty } = useFormikContext();

  const shouldDisableButton = isSubmitting || !(isValid && dirty);

  return (
    <Form.Layout>
      <Form.Category>
        <InputFormField name="name" label="Nome" />
        <TextAreaFormField
          name="description"
          label="Descrição"
          labelPlacement="outside"
          placeholder="Detalhes sobre a tag"
        />
      </Form.Category>
      <Form.Category title="Redes sociais">
        <Form.Row>
          <InputFormField
            name="website"
            label="Website"
            labelPlacement="outside"
            placeholder="https://animaregia.net/"
            className="w-full"
          />
          <InputFormField
            name="discord"
            label="Discord"
            labelPlacement="outside"
            placeholder="https://discord.gg/T7XXzNN"
            className="w-full"
          />
        </Form.Row>
        <Form.Row>
          <InputFormField
            name="twitter"
            label="Twitter"
            labelPlacement="outside"
            placeholder="https://twitter.com/onepieceex"
            className="w-full"
          />
          <InputFormField
            name="facebook"
            label="Facebook"
            labelPlacement="outside"
            placeholder="https://www.facebook.com/DROPEscanlator"
            className="w-full"
          />
        </Form.Row>
        <Form.Row>
          <InputFormField
            name="instagram"
            label="Instagram"
            labelPlacement="outside"
            placeholder="https://www.instagram.com/saikaioficial"
            className="w-full"
          />
          <InputFormField
            name="Telegram"
            label="Telegram"
            labelPlacement="outside"
            placeholder="https://t.me/gekkouscans"
            className="w-full"
          />
        </Form.Row>
        <Form.Row>
          <InputFormField
            name="youtube"
            label="YouTube"
            labelPlacement="outside"
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            className="w-full"
          />
          <InputFormField
            name="email"
            label="Email"
            labelPlacement="outside"
            placeholder="animaregia@live.com"
            className="w-full"
          />
        </Form.Row>
      </Form.Category>
      <Form.Category title="Imagens">
        <InputFormField
          name="logo"
          label="Logo"
          placeholder="https://i.imgur.com/rSDmlHq.png"
          className="w-full"
        />
        <InputFormField
          name="banner"
          label="Banner"
          placeholder="https://i.imgur.com/13N7kAY.jpg"
          className="w-full"
        />
      </Form.Category>
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

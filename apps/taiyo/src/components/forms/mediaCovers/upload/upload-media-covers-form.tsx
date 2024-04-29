import { typeboxResolver } from "@hookform/resolvers/typebox"
import {
  type UploadCoversInput,
  uploadCoversSchema,
} from "@taiyomoe/image-orchestrator"
import { type SubmitHandler, useForm } from "react-hook-form"
import { Form } from "~/components/generics/newForm/new-form"
import { UploadMediaCoversFormFields } from "./upload-media-covers-form-fields"

type Props = {
  mediaId: string
}

export const UploadMediaCoversForm = ({ mediaId }: Props) => {
  const methods = useForm<UploadCoversInput>({
    resolver: typeboxResolver(uploadCoversSchema),
    mode: "onTouched",
    defaultValues: { covers: [] },
  })

  const handleSubmit: SubmitHandler<UploadCoversInput> = async (values) => {
    console.log("values", mediaId, values)
  }

  return (
    <Form.Component {...methods} onSubmit={handleSubmit}>
      <UploadMediaCoversFormFields />
    </Form.Component>
  )
}

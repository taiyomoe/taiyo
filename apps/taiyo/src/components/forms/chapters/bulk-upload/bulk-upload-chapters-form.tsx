"use client"

import { typeboxResolver } from "@hookform/resolvers/typebox"
import {
  type UploadChaptersInput,
  uploadChaptersSchema,
} from "@taiyomoe/image-orchestrator"
import { type SubmitHandler, useForm } from "react-hook-form"
import { Form } from "~/components/generics/newForm/new-form"
import { BulkUploadChaptersFormFields } from "./bulk-upload-chapters-form-fields"

export const BulkUploadChaptersForm = () => {
  const methods = useForm<UploadChaptersInput>({
    resolver: typeboxResolver(uploadChaptersSchema),
    mode: "onTouched",
    defaultValues: { chapters: [], concurrent: 10 },
  })

  const handleSubmit: SubmitHandler<UploadChaptersInput> = async (values) => {
    console.log("Submitted", values.mediaId, values.chapters)
  }

  return (
    <Form.Component {...methods} onSubmit={handleSubmit}>
      <BulkUploadChaptersFormFields />
    </Form.Component>
  )
}

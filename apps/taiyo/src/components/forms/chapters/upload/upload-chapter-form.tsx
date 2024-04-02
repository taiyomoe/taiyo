"use client"

import { typeboxResolver } from "@hookform/resolvers/typebox"
import {
  type UploadChapterInput,
  uploadChapterSchema,
} from "@taiyomoe/image-orchestrator"
import { type SubmitHandler, useForm } from "react-hook-form"
import { Form } from "~/components/generics/newForm/new-form"
import { UploadChapterFormFields } from "./upload-chapter-form-fields"

export const UploadChapterForm = () => {
  const methods = useForm<UploadChapterInput>({
    resolver: typeboxResolver(uploadChapterSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      number: 0,
      volume: undefined,
      contentRating: "NORMAL",
      flag: "OK",
    },
  })

  const handleSubmit: SubmitHandler<UploadChapterInput> = async (values) => {
    console.log("values", values)
  }

  return (
    <Form.Component {...methods} onSubmit={handleSubmit}>
      <UploadChapterFormFields />
    </Form.Component>
  )
}

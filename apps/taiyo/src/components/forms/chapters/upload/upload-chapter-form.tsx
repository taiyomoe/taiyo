"use client"

import { typeboxResolver } from "@hookform/resolvers/typebox"
import {
  type UploadChapterInput,
  uploadChapterSchema,
} from "@taiyomoe/image-orchestrator"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Form } from "~/components/generics/form/form"
import { handleErrors, ioApi } from "~/eden/client"
import { UploadChapterFormFields } from "./upload-chapter-form-fields"

export const UploadChapterForm = () => {
  const methods = useForm<UploadChapterInput>({
    resolver: typeboxResolver(uploadChapterSchema),
    mode: "onTouched",
    defaultValues: {
      mediaId: "",
      title: "",
      number: 0,
      volume: undefined,
      contentRating: "NORMAL",
      flag: "OK",
      language: "pt_br",
      files: [],
    },
  })

  const handleSubmit: SubmitHandler<UploadChapterInput> = async (values) =>
    toast.promise(ioApi.chapters.upload(values), {
      loading: "Upando o capítulo...",
      error: handleErrors("Ocorreu um erro inesperado ao upar o capítulo"),
      success: () => {
        const coercedNumber = Number(values.number)
        const newNumber = Number.isInteger(Number(coercedNumber))
          ? coercedNumber + 1
          : coercedNumber + 0.5

        methods.reset({
          ...values,
          number: newNumber,
          files: [],
        })

        return "Capítulo upado!"
      },
    })

  return (
    <Form.Component {...methods} onSubmit={handleSubmit}>
      <UploadChapterFormFields />
    </Form.Component>
  )
}

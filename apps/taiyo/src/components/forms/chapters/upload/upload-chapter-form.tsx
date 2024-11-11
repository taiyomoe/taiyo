"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type UploadChapterInput, uploadChapterSchema } from "@taiyomoe/schemas"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Form } from "~/components/generics/form/form"
import { handleErrors, ioApi } from "~/utils/hono-rpc"
import { UploadChapterFormFields } from "./upload-chapter-form-fields"

export const UploadChapterForm = () => {
  const methods = useForm<UploadChapterInput>({
    resolver: zodResolver(uploadChapterSchema),
    mode: "onTouched",
    defaultValues: {
      title: undefined,
      number: 0,
      volume: undefined,
      contentRating: "NORMAL",
      flag: "OK",
      language: "pt_br",
      scanIds: [],
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

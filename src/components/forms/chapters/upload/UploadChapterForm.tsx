"use client"

import { toFormikValidationSchema } from "zod-formik-adapter"

import { Form } from "~/components/generics/form/Form"
import { useChapterUpload } from "~/hooks/useChapterUpload"
import { insertMediaChapterFormSchema } from "~/lib/schemas/mediaChapter.schemas"
import type { InsertMediaChapterFormSchema } from "~/lib/schemas/mediaChapter.schemas"

import { UploadChapterFormFields } from "./UploadChapterFormFields"

const initialValues: InsertMediaChapterFormSchema = {
  title: null,
  number: 0,
  volume: null,
  language: "pt_br",
  contentRating: "NORMAL",
  flag: "OK",
  mediaId: "",
  scanIds: [],
}

export const UploadChapterForm = () => {
  const { handleSubmit } = useChapterUpload()

  return (
    <Form.Component
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(insertMediaChapterFormSchema)}
      onSubmit={handleSubmit}
    >
      <UploadChapterFormFields />
    </Form.Component>
  )
}

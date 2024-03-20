"use client"

import {
  type BulkUploadMediaChapters,
  bulkUploadMediaChapters,
} from "@taiyomoe/schemas"
import { toFormikValidationSchema } from "zod-formik-adapter"
import { Form } from "~/components/generics/form/Form"
import { useBulkChapterUpload } from "~/hooks/useBulkChapterUpload"
import { BulkUploadChapterFormFields } from "./BulkUploadChapterFormFields"

const initialValues: BulkUploadMediaChapters = {
  mediaId: "",
  concurrent: 5,
}

export const BulkUploadChapterForm = () => {
  const { handleSubmit } = useBulkChapterUpload()

  return (
    <Form.Component
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(bulkUploadMediaChapters)}
      onSubmit={handleSubmit}
    >
      <BulkUploadChapterFormFields />
    </Form.Component>
  )
}

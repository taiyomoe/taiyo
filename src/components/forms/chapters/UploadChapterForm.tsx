"use client";

import { toFormikValidationSchema } from "zod-formik-adapter";

import { Form } from "~/components/generics/form/Form";
import { useChapterUpload } from "~/hooks/useChapterUpload";
import { insertMediaChapterSchema } from "~/lib/schemas/mediaChapter.schemas";
import type { InsertMediaChapterFormSchema } from "~/lib/schemas/mediaChapter.schemas";

import { UploadChapterFormFields } from "./UploadChapterFormFields";

const initialValues: InsertMediaChapterFormSchema = {
  title: "",
  number: 0,
  volume: 0,
  language: "pt_br",
  pages: [],
  contentRating: "NORMAL",
  flag: "OK",
  mediaId: "",
  scanIds: [],
};

export const UploadChapterForm = () => {
  const { handleSubmit } = useChapterUpload();

  return (
    <Form.Component
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(insertMediaChapterSchema)}
      onSubmit={handleSubmit}
    >
      <UploadChapterFormFields />
    </Form.Component>
  );
};

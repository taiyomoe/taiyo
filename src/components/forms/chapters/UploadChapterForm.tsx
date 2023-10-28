"use client";

import { toFormikValidationSchema } from "zod-formik-adapter";

import { Form } from "~/components/generics/form/Form";
import { useChapterUpload } from "~/hooks/useChapterUpload";
import {
  insertMediaChapterSchema,
  type InsertMediaChapterSchema,
} from "~/lib/schemas/mediaChapter.schemas";
import { UploadChapterFormFields } from "./UploadChapterFormFields";

const initialValues: InsertMediaChapterSchema = {
  id: crypto.randomUUID(),
  title: "Teste",
  number: 0,
  volume: 0,
  language: "PORTUGUESE",
  pages: [],
  contentRating: "NORMAL",
  flag: "OK",
  mediaId: "95bf236c-87ca-42d3-b9a0-d17ad7a13b2c",
  // @ts-expect-error — the schema produces an array but we do have to pass a string
  scansIds: "",
};

export const UploadChapterForm = () => {
  const { handleSubmit } = useChapterUpload(initialValues);

  return (
    <Form
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(insertMediaChapterSchema)}
      onSubmit={handleSubmit}
    >
      <UploadChapterFormFields />
    </Form>
  );
};

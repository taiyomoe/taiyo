"use client";

import type { FormikConfig } from "formik";
import { toast } from "sonner";
import { toFormikValidationSchema } from "zod-formik-adapter";

import { Form } from "~/components/generics/form/Form";
import {
  insertMediaChapterSchema,
  type InsertMediaChapterSchema,
} from "~/lib/schemas/mediaChapter.schemas";
import { UploadChapterFormFields } from "./UploadChapterFormFields";

const initialValues: InsertMediaChapterSchema = {
  title: "",
  number: 0,
  volume: 0,
  language: "PORTUGUESE",
  pages: [],
  contentRating: "NORMAL",
  flag: "OK",
  mediaId: "",
  scansIds: [],
};

export const UploadChapterForm = () => {
  const handleSubmit: FormikConfig<InsertMediaChapterSchema>["onSubmit"] =
    () => {
      toast.loading("Uploading...");
    };

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

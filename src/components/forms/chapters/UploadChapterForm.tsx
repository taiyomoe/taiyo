"use client";

import type { FormikConfig } from "formik";
import { toast } from "sonner";
import { toFormikValidationSchema } from "zod-formik-adapter";

import { Form } from "~/components/generics/form/Form";
import {
  insertMediaChapterSchema,
  type InsertMediaChapterSchema,
} from "~/lib/schemas/mediaChapter.schemas";
import { api } from "~/lib/trpc/client";
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
  scansIds: [],
};

export const UploadChapterForm = () => {
  const { mutate } = api.mediaChapters.startUploadSession.useMutation();

  const handleSubmit: FormikConfig<InsertMediaChapterSchema>["onSubmit"] = ({
    mediaId,
  }) => {
    toast.loading("Uploading...");

    mutate(
      { mediaId, mediaChapterId: initialValues.id },
      {
        onSuccess: (res) => {
          console.log("res", res);
        },
      },
    );
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

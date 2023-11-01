"use client";

import type { FormikConfig } from "formik";
import { toast } from "sonner";
import { toFormikValidationSchema } from "zod-formik-adapter";

import { Form } from "~/components/generics/form/Form";
import { insertMediaSchema, type InsertMediaSchema } from "~/lib/schemas";
import { api } from "~/lib/trpc/client";
import { AddMediaFormFields } from "./AddMediaFormFields";

const initialValues: InsertMediaSchema = {
  id: "",
  startDate: null,
  endDate: null,
  synopsis: "",
  contentRating: "NORMAL",
  oneShot: false,
  type: "MANGA",
  status: "RELEASING",
  source: "ORIGINAL",
  demography: "SHOUNEN",
  countryOfOrigin: "JAPAN",
  flag: "OK",
  titles: [{ title: "", isAcronym: false, language: "ENGLISH" }],
  tags: [],
  trackers: [],
};

export const AddMediaForm = () => {
  const { mutate } = api.medias.add.useMutation();

  const handleSubmit: FormikConfig<InsertMediaSchema>["onSubmit"] = (
    values,
    { resetForm },
  ) => {
    mutate(values, {
      onSuccess: () => {
        toast.success("Obra adicionada com sucesso!");
        resetForm();
      },
      onError: (error) => {
        toast.error("Ocorreu um erro inesperado ao adicionar a obra.");
        console.log(error);
      },
    });
  };

  return (
    <Form.Component
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(insertMediaSchema)}
      onSubmit={handleSubmit}
    >
      <AddMediaFormFields />
    </Form.Component>
  );
};

"use client";

import type { FormikConfig } from "formik";
import { toast } from "sonner";
import { toFormikValidationSchema } from "zod-formik-adapter";

import { Form } from "~/components/generics/form/Form";
import { insertTagSchema } from "~/lib/schemas";
import type { InsertTagSchema } from "~/lib/schemas";
import { api } from "~/lib/trpc/client";

import { AddTagFormFields } from "./AddTagFormFields";

const initialValues: InsertTagSchema = {
  name: "",
  description: "",
  category: "",
  contentRating: "NORMAL",
  alId: 0,
};

export const AddTagForm = () => {
  const { mutate } = api.tags.add.useMutation();

  const handleSubmit: FormikConfig<InsertTagSchema>["onSubmit"] = (
    values,
    { resetForm },
  ) => {
    mutate(values, {
      onSuccess: () => {
        toast.success("Tag adicionada com sucesso!");
        resetForm();
      },
      onError: (error) => {
        toast.error("Ocorreu um erro inesperado ao adicionar a tag.");
        console.log(error);
      },
    });
  };

  return (
    <Form.Component
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(insertTagSchema)}
      onSubmit={handleSubmit}
    >
      <AddTagFormFields />
    </Form.Component>
  );
};

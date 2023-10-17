"use client";

import type { FormikConfig } from "formik";
import { toast } from "sonner";
import { toFormikValidationSchema } from "zod-formik-adapter";

import { Form } from "~/components/generics/form/Form";
import { api } from "~/lib/trpc/client";
import { insertTagSchema, type InsertTag } from "~/lib/types";
import { AddTagFormFields } from "./AddTagFormFields";

const initialValues: InsertTag = {
  name: "",
  description: "",
  category: "",
  isAdult: false,
  alId: 0,
};

export const AddTagForm = () => {
  const { mutate } = api.tags.add.useMutation();

  const handleSubmit: FormikConfig<InsertTag>["onSubmit"] = (
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
    <Form
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(insertTagSchema)}
      onSubmit={handleSubmit}
    >
      <AddTagFormFields />
    </Form>
  );
};

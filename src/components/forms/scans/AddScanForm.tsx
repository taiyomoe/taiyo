"use client";

import { toast } from "sonner";
import { toFormikValidationSchema } from "zod-formik-adapter";

import { Form } from "~/components/generics/form/Form";
import { insertScanSchema } from "~/lib/schemas";
import type { InsertScanSchema } from "~/lib/schemas";
import { api } from "~/lib/trpc/client";
import type { FormSubmit } from "~/lib/types";

import { AddScanFormFields } from "./AddScanFormFields";

const initialValues: InsertScanSchema = {
  name: "",
  description: "",
  logo: "",
  banner: "",
  website: "",
  discord: "",
  twitter: "",
  facebook: "",
  instagram: "",
  telegram: "",
  youtube: "",
  email: "",
};

export const AddScanForm = () => {
  const { mutateAsync } = api.scans.add.useMutation();

  const handleSubmit: FormSubmit<InsertScanSchema> = (
    values,
    { resetForm },
  ) => {
    const promsie = () => mutateAsync(values);

    toast.promise(promsie, {
      loading: "Adicionando scan...",
      success: () => {
        resetForm();
        return "Scan adicionada com sucesso!";
      },
      error: (err) => {
        console.log(err);
        return "Ocorreu um erro inesperado ao adicionar a tag.";
      },
    });
  };

  return (
    <Form.Component
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(insertScanSchema)}
      onSubmit={handleSubmit}
    >
      <AddScanFormFields />
    </Form.Component>
  );
};

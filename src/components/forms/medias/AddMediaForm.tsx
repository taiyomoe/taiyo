"use client";

import { toFormikValidationSchema } from "zod-formik-adapter";

import { Form } from "~/components/generics/form/Form";
import { useMediaCreation } from "~/hooks/useMediaCreation";
import { insertMediaSchema, type InsertMediaSchema } from "~/lib/schemas";

import { AddMediaFormFields } from "./AddMediaFormFields";

const initialValues: InsertMediaSchema = {
  id: crypto.randomUUID(),
  synopsis: "Gol D. Roger...",
  contentRating: "NORMAL",
  oneShot: true,
  type: "MANGA",
  status: "RELEASING",
  source: "ORIGINAL",
  demography: "SHOUNEN",
  countryOfOrigin: "JAPAN",
  flag: "OK",
  titles: [{ title: "Teste", isAcronym: false, language: "ENGLISH" }],
  // tags: [],
  cover: {
    id: "",
    volume: null,
    contentRating: "NORMAL",
  },
  banner: {
    id: "",
    contentRating: "NORMAL",
  },
};

export const AddMediaForm = () => {
  const { handleSubmit } = useMediaCreation();

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

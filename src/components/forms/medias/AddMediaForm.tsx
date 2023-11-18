"use client";

import { toFormikValidationSchema } from "zod-formik-adapter";

import { Form } from "~/components/generics/form/Form";
import { useMediaCreation } from "~/hooks/useMediaCreation";
import type { InsertMediaSchema } from "~/lib/schemas";
import { insertMediaSchema } from "~/lib/schemas";

import { AddMediaFormFields } from "./AddMediaFormFields";

const initialValues: InsertMediaSchema = {
  id: crypto.randomUUID(),
  synopsis: "",
  contentRating: "NORMAL",
  oneShot: true,
  type: "MANGA",
  status: "RELEASING",
  source: "ORIGINAL",
  demography: "SHOUNEN",
  countryOfOrigin: "JAPAN",
  flag: "OK",
  genres: [],
  titles: [
    {
      title: "",
      language: "en",
      priority: 1,
      isAcronym: false,
      isMainTitle: true,
    },
  ],
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

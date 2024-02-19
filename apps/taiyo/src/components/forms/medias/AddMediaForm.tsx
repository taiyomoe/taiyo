"use client"

import { toFormikValidationSchema } from "zod-formik-adapter"

import type { InsertMediaSchema } from "@taiyomoe/schemas"
import { insertMediaSchema } from "@taiyomoe/schemas"
import { Form } from "~/components/generics/form/Form"
import { useMediaCreation } from "~/hooks/useMediaCreation"

import { MediaFormFields } from "./MediaFormFields"

const initialValues: InsertMediaSchema = {
  id: crypto.randomUUID(),
  startDate: null,
  endDate: null,
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
  tags: [],
}

export const AddMediaForm = () => {
  const { handleSubmit } = useMediaCreation()

  return (
    <Form.Component
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(insertMediaSchema)}
      onSubmit={handleSubmit}
    >
      <MediaFormFields action="create" />
    </Form.Component>
  )
}

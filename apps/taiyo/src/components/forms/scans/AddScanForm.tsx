"use client"

import { toast } from "sonner"
import { toFormikValidationSchema } from "zod-formik-adapter"

import type { InsertScanSchema } from "@taiyomoe/schemas"
import { insertScanSchema } from "@taiyomoe/schemas"
import { Form } from "~/components/generics/form/Form"
import { api } from "~/lib/trpc/client"
import type { FormSubmit } from "~/lib/types"

import { AddScanFormFields } from "./AddScanFormFields"

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
}

export const AddScanForm = () => {
  const { mutateAsync } = api.scans.create.useMutation()

  const handleSubmit: FormSubmit<InsertScanSchema> = (
    values,
    { resetForm, setSubmitting },
  ) => {
    toast.promise(mutateAsync(values), {
      loading: "Adicionando scan...",
      success: () => {
        resetForm()

        return "Scan adicionada com sucesso!"
      },
      error: (error) => {
        console.error(error)

        return "Ocorreu um erro inesperado ao adicionar a scan."
      },
      finally: () => {
        setSubmitting(false)
      },
    })
  }

  return (
    <Form.Component
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(insertScanSchema)}
      onSubmit={handleSubmit}
    >
      <AddScanFormFields />
    </Form.Component>
  )
}

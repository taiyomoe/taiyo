import type { FormikConfig } from "formik"
import { toast } from "sonner"
import { toFormikValidationSchema } from "zod-formik-adapter"

import { SubmitButton } from "~/components/generics/buttons/SubmitButton"
import { Form } from "~/components/generics/form/Form"
import { InputFormField } from "~/components/generics/form/InputFormField"
import { TextAreaFormField } from "~/components/generics/form/TextAreaFormField"
import type { ImportMediaSchema } from "~/lib/schemas"
import { importMediaSchema } from "~/lib/schemas"
import { api } from "~/lib/trpc/client"

const initialValues: ImportMediaSchema = {
  mdId: "",
  synopsis: "",
}

export const ImportButton = () => {
  const { mutate } = api.md.import.useMutation()

  const handleSubmit: FormikConfig<ImportMediaSchema>["onSubmit"] = (
    values,
    { setSubmitting },
  ) => {
    mutate(values, {
      onSuccess: () => {
        toast.success("Obra importada com sucesso.")
      },
      onError: (err) => {
        toast.error(err.message)
      },
      onSettled: () => {
        setSubmitting(false)
      },
    })
  }

  return (
    <Form.Component
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(importMediaSchema)}
      onSubmit={handleSubmit}
    >
      <div className="flex gap-4">
        <InputFormField
          name="mdId"
          placeholder="93c8f7f8-58cc-40fe-9146-3f68cbfc71af"
        />
        <SubmitButton>Importar</SubmitButton>
      </div>
      <TextAreaFormField name="synopsis" placeholder="Sinopse da obra..." />
    </Form.Component>
  )
}

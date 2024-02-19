"use client"

import type { FormikConfig } from "formik"
import { toast } from "sonner"
import { toFormikValidationSchema } from "zod-formik-adapter"

import type { UpdateMediaSchema } from "@taiyomoe/schemas"
import { updateMediaSchema } from "@taiyomoe/schemas"
import { Form } from "~/components/generics/form/Form"
import { api } from "~/lib/trpc/client"
import { ObjectUtils } from "~/lib/utils/object.utils"

import { MediaFormFields } from "./MediaFormFields"

type Props = {
  initialValues: UpdateMediaSchema
}

export const UpdateMediaForm = ({ initialValues }: Props) => {
  const { mutateAsync } = api.medias.update.useMutation()
  const handleSubmit: FormikConfig<UpdateMediaSchema>["onSubmit"] = (
    values,
    helpers,
  ) => {
    const delta = ObjectUtils.deepDifference(values, initialValues)
    const payload = {
      ...delta,
      id: values.id,
      tags: values.tags,
      genres: values.genres,
    }

    toast.promise(mutateAsync(payload), {
      loading: "Salvando alterações...",
      success: () => {
        helpers.resetForm({ values })

        return "Alterações salvas com sucesso!"
      },
      error: "Não foi possível salvar as alterações.",
      finally: () => {
        helpers.setSubmitting(false)
      },
    })
  }

  return (
    <Form.Component
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(updateMediaSchema)}
      onSubmit={handleSubmit}
    >
      <MediaFormFields action="update" />
    </Form.Component>
  )
}

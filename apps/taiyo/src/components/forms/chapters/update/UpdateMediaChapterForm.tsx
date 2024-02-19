"use client"

import type { UpdateMediaChapterSchema } from "@taiyomoe/schemas"
import { updateMediaChapterSchema } from "@taiyomoe/schemas"
import type { MediaChapterWithRelations } from "@taiyomoe/types"
import type { FormikConfig } from "formik"
import { toast } from "sonner"
import { toFormikValidationSchema } from "zod-formik-adapter"

import { Form } from "~/components/generics/form/Form"
import { api } from "~/lib/trpc/client"
import { ObjectUtils } from "~/lib/utils/object.utils"

import { UpdateMediaChapterFormFields } from "./UpdateMediaChapterFormFields"

type Props = {
  chapter: MediaChapterWithRelations
}

export const UpdateMediaChapterForm = ({ chapter }: Props) => {
  const { mutateAsync } = api.mediaChapters.update.useMutation()
  const initialValues: UpdateMediaChapterSchema = {
    id: chapter.id,
    title: chapter.title,
    number: chapter.number,
    volume: chapter.volume,
    contentRating: chapter.contentRating,
    flag: chapter.flag,
    language: chapter.language,
    scanIds: chapter.scans.map((s) => s.id),
  }

  const handleSubmit: FormikConfig<UpdateMediaChapterSchema>["onSubmit"] = (
    values,
    helpers,
  ) => {
    const delta = ObjectUtils.deepDifference(values, initialValues)
    const payload = {
      id: values.id,
      ...delta,
      scanIds: values.scanIds,
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
      validationSchema={toFormikValidationSchema(updateMediaChapterSchema)}
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      <UpdateMediaChapterFormFields scans={chapter.scans} />
    </Form.Component>
  )
}

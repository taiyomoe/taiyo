"use client"

import { MediaChapter } from "@prisma/client"
import { toast } from "sonner"
import { toFormikValidationSchema } from "zod-formik-adapter"

import { Form } from "~/components/generics/form/Form"
import {
  BulkUpdateMediaChapterScansSchema,
  bulkUpdateMediaChapterScansSchema,
} from "~/lib/schemas"
import { api } from "~/lib/trpc/client"
import { FormSubmit } from "~/lib/types"

import { TRPCClientError } from "@trpc/client"
import { BulkUpdateChapterScansFormFields } from "./BulkUpdateChapterScansFormFields"

type Props = {
  chapters: MediaChapter[]
}

export const BulkUpdateChapterScansForm = ({ chapters }: Props) => {
  const { mutateAsync } = api.mediaChapters.updateScans.useMutation()

  const initialValues: BulkUpdateMediaChapterScansSchema = [
    { scanIds: [], ids: [] },
  ]

  const handleSubmit: FormSubmit<BulkUpdateMediaChapterScansSchema> = async (
    values,
  ) => {
    toast.promise(mutateAsync(values), {
      loading: "Atualizando capítulos...",
      success: "Capítulos atualizados com sucesso.",
      error: (err) => {
        if (err instanceof TRPCClientError) {
          return err.message
        }

        return "Erro ao atualizar capítulos."
      },
    })
  }

  return (
    <Form.Component
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(
        bulkUpdateMediaChapterScansSchema,
      )}
      onSubmit={handleSubmit}
    >
      <BulkUpdateChapterScansFormFields chapters={chapters} />
    </Form.Component>
  )
}

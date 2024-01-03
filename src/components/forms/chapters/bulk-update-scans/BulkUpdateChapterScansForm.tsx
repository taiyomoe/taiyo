"use client"

import { MediaChapter } from "@prisma/client"
import { toast } from "sonner"
import { toFormikValidationSchema } from "zod-formik-adapter"

import { Form } from "~/components/generics/form/Form"
import {
  BulkUpdateMediaChapterScansSchema,
  bulkUpdateMediaChapterScansSchema,
} from "~/lib/schemas"
import { FormSubmit } from "~/lib/types"

import { useRouter } from "next/navigation"
import { api } from "~/lib/trpc/client"
import { BulkUpdateChapterScansFormFields } from "./BulkUpdateChapterScansFormFields"

type Props = {
  chapters: MediaChapter[]
}

export const BulkUpdateChapterScansForm = ({ chapters }: Props) => {
  const { mutateAsync } = api.mediaChapters.updateScans.useMutation()
  const router = useRouter()

  const initialValues: BulkUpdateMediaChapterScansSchema = [
    { scanIds: [], ids: [] },
    { scanIds: [], ids: [] },
  ]

  const handleSubmit: FormSubmit<BulkUpdateMediaChapterScansSchema> = async (
    values,
  ) => {
    console.log(values)

    toast.promise(mutateAsync(values), {
      loading: "Atualizando capítulos...",
      success: "Capítulos atualizados com sucesso.",
      error: "Erro ao atualizar capítulos.",
    })

    router.push("/dashboard/chapters/bulk-edit")
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

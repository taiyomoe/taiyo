"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  type BulkUpdateChaptersScansInput,
  bulkUpdateChaptersScansSchema,
} from "@taiyomoe/schemas"
import type { MediaChapterWithScans } from "@taiyomoe/types"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Form } from "~/components/generics/form/form"
import { useErrorHandler } from "~/hooks/useErrorHandler"
import { api } from "~/trpc/react"
import { BulkUpdateChaptersScansFormFields } from "./bulk-update-chapters-scans-form-fields"

type Props = {
  chapters: MediaChapterWithScans[]
}

export const BulkUpdateChaptersScansForm = (props: Props) => {
  const { chapters: initialChapters } = props
  const [chapters, setChapters] = useState(initialChapters)
  const { mutateAsync } = api.chapters.updateScans.useMutation()
  const { handleError } = useErrorHandler()
  const methods = useForm<BulkUpdateChaptersScansInput>({
    resolver: zodResolver(bulkUpdateChaptersScansSchema),
    mode: "onTouched",
    defaultValues: { scans: [{ scanIds: [], ids: [] }] },
  })

  const handleSubmit: SubmitHandler<BulkUpdateChaptersScansInput> = async (
    values,
  ) => {
    toast.promise(mutateAsync(values), {
      loading: "Atualizando capítulos...",
      success: () => {
        setChapters((prev) =>
          prev.map((c) => {
            const newScans = values.scans.find((v) =>
              v.ids.includes(c.id),
            )?.scanIds

            if (!newScans?.length) {
              return { ...c, scans: [] }
            }

            return { ...c, scanIds: newScans }
          }),
        )
        methods.reset({ scans: [{ scanIds: [], ids: [] }] })

        return "Capítulos atualizados com sucesso."
      },
      error: handleError(
        "Ocorreu um erro inesperado ao atualizar os capítulos.",
      ),
    })
  }

  return (
    <Form.Component onSubmit={handleSubmit} {...methods}>
      <BulkUpdateChaptersScansFormFields chapters={chapters} />
    </Form.Component>
  )
}

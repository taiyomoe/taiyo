"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  type BulkUpdateChaptersScansSchema,
  bulkUpdateChaptersScansSchema,
} from "@taiyomoe/schemas"
import type { MediaChapterWithScans } from "@taiyomoe/types"
import { TRPCClientError } from "@trpc/client"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Form } from "~/components/generics/newForm/new-form"
import { api } from "~/trpc/react"
import { BulkUpdateChaptersScansFormFields } from "./bulk-update-chapters-scans-form-fields"

type Props = {
  chapters: MediaChapterWithScans[]
}

export const BulkUpdateChaptersScansForm = (props: Props) => {
  const { chapters: initialChapters } = props
  const [chapters, setChapters] = useState(initialChapters)
  const { mutateAsync } = api.mediaChapters.updateScans.useMutation()
  const methods = useForm<BulkUpdateChaptersScansSchema>({
    resolver: zodResolver(bulkUpdateChaptersScansSchema),
    mode: "onTouched",
    defaultValues: { scans: [{ scanIds: [], ids: [] }] },
  })

  const handleSubmit: SubmitHandler<BulkUpdateChaptersScansSchema> = async (
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
      error: (error) => {
        if (error instanceof TRPCClientError) {
          return error.message
        }

        return "Erro ao atualizar capítulos."
      },
    })
  }

  return (
    <Form.Component onSubmit={handleSubmit} {...methods}>
      <BulkUpdateChaptersScansFormFields chapters={chapters} />
    </Form.Component>
  )
}

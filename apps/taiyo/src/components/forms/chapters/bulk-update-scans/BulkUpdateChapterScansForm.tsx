"use client"

import { Accordion, AccordionItem } from "@nextui-org/accordion"
import { TRPCClientError } from "@trpc/client"
import { toast } from "sonner"
import { toFormikValidationSchema } from "zod-formik-adapter"

import { MediaChapterWithScans } from "@taiyomoe/types"
import { Form } from "~/components/generics/form/Form"
import {
  BulkUpdateMediaChapterScansSchema,
  bulkUpdateMediaChapterScansSchema,
} from "~/lib/schemas"
import { api } from "~/lib/trpc/client"

import { useParams } from "next/navigation"
import { useState } from "react"
import { BulkUpdateActions } from "~/app/(root)/dashboard/chapters/bulk-edit/_components/BulkUpdateActions"
import { FormSubmit } from "~/lib/types"
import { BulkUpdateChapterScansFormFields } from "./BulkUpdateChapterScansFormFields"

type Props = {
  chapters: MediaChapterWithScans[]
}

export const BulkUpdateChapterScansForm = (props: Props) => {
  const { chapters: initialChapters } = props
  const [chapters, setChapters] = useState(initialChapters)
  const { mediaId } = useParams<{ mediaId: string }>()
  const { mutateAsync } = api.mediaChapters.updateScans.useMutation()
  const initialValues: BulkUpdateMediaChapterScansSchema = [
    { scanIds: [], ids: [] },
  ]

  const handleSubmit: FormSubmit<BulkUpdateMediaChapterScansSchema> = async (
    values,
    helpers,
  ) => {
    toast.promise(mutateAsync(values), {
      loading: "Atualizando capítulos...",
      success: () => {
        setChapters((prev) =>
          prev.map((c) => {
            const newScans = values.find((v) => v.ids.includes(c.id))?.scanIds

            if (!newScans?.length) {
              return { ...c, scans: [] }
            }

            return { ...c, scanIds: newScans }
          }),
        )
        helpers.resetForm()

        return "Capítulos atualizados com sucesso."
      },
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
      <BulkUpdateActions mediaId={mediaId} />
      <Accordion>
        <AccordionItem title="Capítulos">
          {chapters.map((c) => c.number).join(", ")}
        </AccordionItem>
        <AccordionItem title="Capítulos sem scans">
          {chapters
            .filter((c) => c.scanIds.length === 0)
            .map((c) => c.number)
            .join(", ")}
        </AccordionItem>
      </Accordion>
      <BulkUpdateChapterScansFormFields chapters={chapters} />
    </Form.Component>
  )
}

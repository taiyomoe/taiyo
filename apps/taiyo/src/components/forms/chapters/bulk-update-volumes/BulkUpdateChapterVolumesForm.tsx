"use client"

import { Accordion, AccordionItem } from "@nextui-org/accordion"
import type { MediaChapter } from "@prisma/client"
import {
  type BulkUpdateMediaChapterVolumesSchema,
  bulkUpdateMediaChapterVolumesSchema,
} from "@taiyomoe/schemas"
import { MediaChapterUtils } from "@taiyomoe/utils"
import { TRPCClientError } from "@trpc/client"
import { AlertTriangleIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { toFormikValidationSchema } from "zod-formik-adapter"
import { Form } from "~/components/generics/form/Form"
import type { FormSubmit } from "~/lib/types"
import { api } from "~/trpc/react"
import { BulkUpdateChapterVolumesFormFields } from "./BulkUpdateChapterVolumesFormFields"

type Props = {
  chapters: MediaChapter[]
}

export const BulkUpdateChapterVolumesForm = (props: Props) => {
  const { chapters: initialChapters } = props
  const [chapters, setChapters] = useState(initialChapters)
  const { mutateAsync } = api.mediaChapters.updateVolumes.useMutation()
  const initialValues: BulkUpdateMediaChapterVolumesSchema = [
    { volume: 1, ids: [] },
  ]

  const handleSubmit: FormSubmit<BulkUpdateMediaChapterVolumesSchema> = async (
    values,
    helpers,
  ) => {
    const duplicatedChapters = MediaChapterUtils.getDuplicatedChapters(
      values,
      chapters,
    )

    if (duplicatedChapters.length) {
      const errorMessage = `Os capítulos seguintes estão presentes em mais de 1 volume: ${duplicatedChapters.join(
        ", ",
      )}`

      helpers.setErrors([{ ids: errorMessage }])
      toast.error(errorMessage, { duration: 10000 })

      return
    }

    toast.promise(mutateAsync(values), {
      loading: "Atualizando capítulos...",
      success: () => {
        setChapters((prev) =>
          prev.map((c) => {
            const newVolume = Number(
              values.find((v) => v.ids.includes(c.id))?.volume,
            )

            if (Number.isNaN(newVolume)) {
              return c
            }

            return { ...c, volume: newVolume === -1 ? null : newVolume }
          }),
        )
        helpers.resetForm({ values })

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
    <Form.Component
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(
        bulkUpdateMediaChapterVolumesSchema,
      )}
      onSubmit={handleSubmit}
    >
      <Accordion>
        <AccordionItem title="Capítulos">
          {chapters.map((c) => c.number).join(", ")}
        </AccordionItem>
        <AccordionItem title="Capítulos sem volume">
          {chapters
            .filter((c) => c.volume === null)
            .map((c) => c.number)
            .join(", ")}
        </AccordionItem>
      </Accordion>
      <div className="flex items-center gap-2">
        <AlertTriangleIcon className="text-warning" />
        <p>Use -1 para remover o volume de um capítulo.</p>
      </div>
      <BulkUpdateChapterVolumesFormFields chapters={chapters} />
    </Form.Component>
  )
}

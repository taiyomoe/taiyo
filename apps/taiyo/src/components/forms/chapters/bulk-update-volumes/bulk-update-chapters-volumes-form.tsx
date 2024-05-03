"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Accordion, AccordionItem } from "@nextui-org/accordion"
import type { MediaChapter } from "@prisma/client"
import {
  type BulkUpdateChaptersVolumesSchema,
  bulkUpdateChaptersVolumesSchema,
} from "@taiyomoe/schemas"
import { MediaChapterUtils } from "@taiyomoe/utils"
import { TRPCClientError } from "@trpc/client"
import { AlertTriangleIcon } from "lucide-react"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Form } from "~/components/generics/newForm/new-form"
import { api } from "~/trpc/react"
import { BulkUpdateChaptersVolumesFormFields } from "./bulk-update-chapters-volumes-form-fields"

type Props = {
  chapters: MediaChapter[]
}

export const BulkUpdateChaptersVolumesForm = (props: Props) => {
  const { chapters: initialChapters } = props
  const [chapters, setChapters] = useState(initialChapters)
  const { mutateAsync } = api.mediaChapters.updateVolumes.useMutation()
  const methods = useForm<BulkUpdateChaptersVolumesSchema>({
    resolver: zodResolver(bulkUpdateChaptersVolumesSchema),
    mode: "onTouched",
    defaultValues: { volumes: [{ number: 1, ids: [] }] },
  })

  const handleSubmit: SubmitHandler<BulkUpdateChaptersVolumesSchema> = async (
    values,
  ) => {
    const duplicatedChapters = MediaChapterUtils.getDuplicatedChapters(
      values,
      chapters,
    )

    if (duplicatedChapters.length) {
      const errorMessage = `Os capítulos seguintes estão presentes em mais de 1 volume: ${duplicatedChapters.join(
        ", ",
      )}`

      methods.setError("volumes", { message: errorMessage })
      toast.error(errorMessage, { duration: 10000 })

      return
    }

    toast.promise(mutateAsync(values), {
      loading: "Atualizando capítulos...",
      success: () => {
        setChapters((prev) =>
          prev.map((c) => {
            const newVolume = Number(
              values.volumes.find((v) => v.ids.includes(c.id))?.number,
            )

            if (Number.isNaN(newVolume)) {
              return c
            }

            return { ...c, volume: newVolume === -1 ? null : newVolume }
          }),
        )
        methods.reset({ volumes: [{ number: 1, ids: [] }] })

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
      <BulkUpdateChaptersVolumesFormFields chapters={chapters} />
    </Form.Component>
  )
}

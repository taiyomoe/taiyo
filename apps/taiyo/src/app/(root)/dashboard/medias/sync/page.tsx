"use client"

import { useCallback, useMemo } from "react"
import { EventSteppedDescription } from "~/components/events/event-stepped-description"
import { SyncMediaForm } from "~/components/forms/medias/sync/sync-media-form"
import VerticalSteps from "~/components/ui/vertical-steps"
import { useSyncMediaStore } from "~/stores/syncMedia.store"
import { EventUtils } from "~/utils/event.utils"

export default function Page() {
  const { currentStep, downloadCovers, downloadChapters, messages } =
    useSyncMediaStore()

  const generateStep = useCallback(EventUtils.generateStep(messages), [])
  const coverSteps = useMemo(() => {
    if (!downloadCovers) return []

    return [
      generateStep(3, "Recuperar as covers"),
      generateStep(4, "Upar as covers (se houver)"),
    ]
  }, [generateStep, downloadCovers])
  const chapterSteps = useMemo(() => {
    if (!downloadChapters) return []

    const totalSteps = downloadCovers ? 5 : 3

    return [
      generateStep(totalSteps + 1, "Recuperar os capítulos"),
      generateStep(totalSteps + 2, "Recuperar as scans"),
      generateStep(
        totalSteps + 3,
        "Criar as scans (se necessário)",
        <EventSteppedDescription
          messages={messages}
          currentStep={currentStep}
          stepIndex={totalSteps + 3}
        />,
      ),
      generateStep(
        totalSteps + 4,
        "Reindexar a busca das scans (se necessário)",
      ),
      generateStep(
        totalSteps + 5,
        "Upar os capítulos (se houver)",
        <EventSteppedDescription
          messages={messages}
          currentStep={currentStep}
          stepIndex={totalSteps + 5}
        />,
      ),
      generateStep(
        totalSteps + 6,
        "Reindexar a busca dos capítulos (se necessário)",
      ),
    ]
  }, [generateStep, downloadCovers, downloadChapters, messages, currentStep])

  return (
    <VerticalSteps
      currentStep={currentStep}
      steps={[
        {
          title: "Configurações",
          description: <SyncMediaForm />,
          shouldLoad: false,
        },
        generateStep(1, "Recuperar as informações da obra"),
        generateStep(2, "Atualizar a obra"),
      ]
        .concat(coverSteps)
        .concat([
          generateStep(coverSteps.length ? 5 : 3, "Reindexar a busca da obra"),
        ])
        .concat(chapterSteps)}
    />
  )
}

"use client"

import { useCallback } from "react"
import { EventSteppedDescription } from "~/components/events/event-stepped-description"
import { ImportMediaForm } from "~/components/forms/medias/import/import-media-form"
import VerticalSteps from "~/components/ui/vertical-steps"
import { useImportMediaStore } from "~/stores/importMedia.store"
import { EventUtils } from "~/utils/event.utils"

export default function Page() {
  const { currentStep, downloadChapters, messages } = useImportMediaStore()

  const generateStep = useCallback(EventUtils.generateStep(messages), [])

  return (
    <VerticalSteps
      currentStep={currentStep}
      steps={[
        {
          title: "ID na MangaDex",
          description: <ImportMediaForm />,
          shouldLoad: false,
        },
        generateStep(1, "Recuperar as informações da obra"),
        generateStep(2, "Criar a página da obra"),
        generateStep(
          3,
          "Upar as covers",
          <EventSteppedDescription
            messages={messages}
            currentStep={currentStep}
            stepIndex={3}
          />,
        ),
        generateStep(4, "Reindexar a busca da obra"),
      ].concat(
        downloadChapters
          ? [
              generateStep(5, "Recuperar os capítulos"),
              generateStep(6, "Recuperar as scans"),
              generateStep(
                7,
                "Criar as scans (se necessário)",
                <EventSteppedDescription
                  messages={messages}
                  currentStep={currentStep}
                  stepIndex={7}
                />,
              ),
              generateStep(8, "Reindexar a busca das scans (se necessário)"),
              generateStep(
                9,
                "Upar os capítulos (se houver)",
                <EventSteppedDescription
                  messages={messages}
                  currentStep={currentStep}
                  stepIndex={9}
                />,
              ),
              generateStep(
                10,
                "Reindexar a busca dos capítulos (se necessário)",
              ),
            ]
          : [],
      )}
    />
  )
}

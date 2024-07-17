"use client"

import { ImportMediaForm } from "~/components/forms/medias/import/import-media-form"
import VerticalSteps from "~/components/ui/vertical-steps"
import { useImportMediaStore } from "~/stores/importMedia.store"
import { ImportMediaCoversStepDescription } from "./_components/import-media-covers-step-description"

export default function Page() {
  const { currentStep, downloadChapters, messages } = useImportMediaStore()

  const generateStep = (
    stepIndex: number,
    defaultMessage: string,
    description?: React.ReactNode,
  ) => {
    const message = messages
      .filter((m) => m.step === stepIndex)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .pop()

    if (!message || message.type === "error")
      return {
        title: defaultMessage,
        hasError: message?.type === "error",
        description,
      }

    return { title: message.content, hasError: false, description }
  }

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
          <ImportMediaCoversStepDescription stepIndex={3} />,
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
                <ImportMediaCoversStepDescription stepIndex={7} />,
              ),
              generateStep(8, "Reindexar a busca das scans (se necessário)"),
              generateStep(
                9,
                "Upar os capítulos (se houver)",
                <ImportMediaCoversStepDescription stepIndex={9} />,
              ),
            ]
          : [],
      )}
    />
  )
}

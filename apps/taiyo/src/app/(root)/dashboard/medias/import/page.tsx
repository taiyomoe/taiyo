"use client"

import { useAtomValue } from "jotai"
import {
  importMediaCurrentStepAtom,
  importMediaMessagesAtom,
} from "~/atoms/importMedia.atoms"
import { ImportMediaForm } from "~/components/forms/medias/import/import-media-form"
import VerticalSteps from "~/components/ui/vertical-steps"
import { ImportMediaCoversStepDescription } from "./_components/import-media-covers-step-description"

export default function Page() {
  const currentStep = useAtomValue(importMediaCurrentStepAtom)
  const messages = useAtomValue(importMediaMessagesAtom)

  const getLatestMessage = (stepIndex: number) => {
    return messages[stepIndex]?.at(-1)?.content
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
        { title: getLatestMessage(1) ?? "Recuperar as informações da obra" },
        { title: getLatestMessage(2) ?? "Criar a página da obra" },
        {
          title: getLatestMessage(3) ?? "Upar as covers",
          description: <ImportMediaCoversStepDescription stepIndex={3} />,
        },
        { title: getLatestMessage(4) ?? "Reindexar a obra" },
      ]}
    />
  )
}

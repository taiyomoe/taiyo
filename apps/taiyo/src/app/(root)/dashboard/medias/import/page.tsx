"use client"

import { useState } from "react"
import { ImportMediaForm } from "~/components/forms/medias/import/import-media-form"
import VerticalSteps from "~/components/ui/vertical-steps"
import { RenderImportMediaEventMessage } from "./_components/RenderImportEventMessage"

export default function Page() {
  const [currentStep, setCurrentStep] = useState(0)

  const handleSubmit = () => {
    setCurrentStep(1)
  }

  return (
    <VerticalSteps
      currentStep={currentStep}
      steps={[
        {
          title: "ID na MangaDex",
          description: <ImportMediaForm onSubmit={handleSubmit} />,
        },
        { title: "Processo", description: <RenderImportMediaEventMessage /> },
      ]}
    />
  )
}

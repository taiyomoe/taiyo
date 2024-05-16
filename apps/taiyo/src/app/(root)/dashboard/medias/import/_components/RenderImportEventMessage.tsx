"use client"

import { Spinner } from "@nextui-org/spinner"
import { useAtomValue } from "jotai"
import { CheckIcon } from "lucide-react"
import { importMediaEventMessagesAtom } from "~/atoms/wsEvents.atoms"

export const RenderImportMediaEventMessage = () => {
  const messages = useAtomValue(importMediaEventMessagesAtom)
  const highestStep = Math.max(...messages.map((message) => message.step))
  const messagesWithLatestSteps = Array.from(
    { length: highestStep },
    (_, i) => messages.filter((message) => message.step === i + 1).pop()!,
  )

  console.log("messages", messages)

  return (
    <div className="flex flex-col gap-4">
      {messagesWithLatestSteps.map((message) => (
        <div key={message.content} className="flex gap-2">
          {message.type === "ongoing" && (
            <Spinner size="sm" className="min-w-[24px]" />
          )}
          {message.type === "success" && <CheckIcon className="text-success" />}
          {message.type === "error" && <Spinner />}
          <p className="text-base">{message.content}</p>
        </div>
      ))}
    </div>
  )
}

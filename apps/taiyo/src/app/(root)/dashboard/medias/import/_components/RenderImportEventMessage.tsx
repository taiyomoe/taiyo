import { Spinner } from "@nextui-org/react"
import { useAtomValue } from "jotai"
import { CheckIcon } from "lucide-react"
import { importEventMessages } from "~/atoms/wsEvents.atoms"

export const RenderImportEventMessage = () => {
  const messages = useAtomValue(importEventMessages)
  const highestStep = Math.max(...messages.map((message) => message.step))
  const messagesWithLatestSteps = Array.from(
    { length: highestStep },
    (_, i) => messages.filter((message) => message.step === i + 1).pop()!,
  )

  return (
    <div className="flex flex-col gap-4">
      {messagesWithLatestSteps.map((message) => (
        <div key={message.content} className="flex gap-2">
          {message.type === "ongoing" && (
            <Spinner size="sm" className="min-w-[24px]" />
          )}
          {message.type === "success" && <CheckIcon className="text-success" />}
          {message.type === "error" && <Spinner />}
          <p>{message.content}</p>
        </div>
      ))}
    </div>
  )
}

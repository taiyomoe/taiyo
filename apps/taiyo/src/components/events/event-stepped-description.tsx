import { Spinner } from "@nextui-org/spinner"
import type { GenericMessage } from "@taiyomoe/types"
import { CheckIcon } from "lucide-react"
import { group, mapValues } from "radash"
import { useMemo } from "react"

type Props = {
  messages: GenericMessage[]
  currentStep: number
  stepIndex: number
}

export const EventSteppedDescription = ({
  messages,
  currentStep,
  stepIndex,
}: Props) => {
  const latestUpdates = useMemo(() => {
    const filtered = messages.filter((m) => m.step === stepIndex)
    const grouped = group(filtered, (m) => m.itemIndex)
    const mapped = mapValues(
      grouped,
      (m) =>
        m!.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).pop()!,
    )
    const updates = Object.values(mapped)

    if (currentStep > stepIndex + 1) {
      updates.splice(updates.length - 1, 1)
    }

    return updates
  }, [currentStep, stepIndex, messages])

  if (!messages.length) return null

  return (
    <>
      {latestUpdates.map((msg) => (
        <div key={msg.itemIndex} className="flex gap-2">
          {msg.type === "ongoing" && (
            <Spinner size="sm" className="min-w-[24px]" />
          )}
          {msg.type === "success" && <CheckIcon className="text-success" />}
          <p>{msg.content}</p>
        </div>
      ))}
    </>
  )
}

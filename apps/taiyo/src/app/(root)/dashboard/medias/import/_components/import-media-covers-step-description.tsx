import { Spinner } from "@nextui-org/spinner"
import { CheckIcon } from "lucide-react"
import { group, mapValues } from "radash"
import { useMemo } from "react"
import { useImportMediaStore } from "~/stores/importMedia.store"

type Props = {
  stepIndex: number
}

export const ImportMediaCoversStepDescription = ({ stepIndex }: Props) => {
  const { messages } = useImportMediaStore()
  const latestUpdates = useMemo(() => {
    const filtered = messages.filter((m) => m.step === stepIndex)
    const grouped = group(filtered, (m) => m.itemIndex)
    const mapped = mapValues(
      grouped,
      (m) =>
        m!.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).pop()!,
    )

    return Object.values(mapped)
  }, [stepIndex, messages])

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

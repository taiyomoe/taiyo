import { Spinner } from "@nextui-org/spinner"
import { useAtomValue } from "jotai"
import { CheckIcon } from "lucide-react"
import { useMemo } from "react"
import { importMediaMessagesAtom } from "~/atoms/importMedia.atoms"

type Props = {
  stepIndex: number
}

export const ImportMediaCoversStepDescription = ({ stepIndex }: Props) => {
  const messages = useAtomValue(importMediaMessagesAtom)[stepIndex] ?? []
  const latestUpdates = useMemo(() => {
    const hashMap = new Map<
      string,
      (typeof messages)[number] & { index: number }
    >()

    for (const [i, msg] of messages.entries()) {
      const match = msg.content.match(/cover (\d+)\/\d+/i)

      if (match) {
        const coverNumber = match[1]!

        hashMap.set(coverNumber, { ...msg, index: i })
      }
    }

    return Array.from(hashMap.values()).sort((a, b) => a.index - b.index)
  }, [messages])

  if (!messages.length) return null

  return (
    <>
      {latestUpdates.map((msg) => (
        <div key={msg.index} className="flex gap-2">
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

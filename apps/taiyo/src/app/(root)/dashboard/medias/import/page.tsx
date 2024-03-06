"use client"

import { pusherClient } from "@taiyomoe/soketi/client"
import type { ImportEventMessage } from "@taiyomoe/types"
import { useSetAtom } from "jotai"
import { useEffect } from "react"
import { importEventMessages } from "~/atoms/wsEvents.atoms"
import { Stepper } from "~/components/generics/stepper/Stepper"
import { StepperItem } from "~/components/generics/stepper/StepperItem"
import { ImportButton } from "./_components/ImportButton"
import { RenderImportEventMessage } from "./_components/RenderImportEventMessage"

export default function Page() {
  const setMessages = useSetAtom(importEventMessages)

  useEffect(() => {
    setMessages([])

    pusherClient.subscribe("importChannel")
    pusherClient.bind("importEvent", (message: ImportEventMessage) => {
      setMessages((prev) => {
        // Prevent duplicate messages (React Strict Mode duplicates them)
        if (prev.find(({ content }) => content === message.content)) {
          return prev
        }

        return [...prev, message]
      })
    })

    return () => {
      pusherClient.unsubscribe("importChannel")
    }
  })

  return (
    <Stepper>
      <StepperItem
        number={1}
        title="ID na MangaDex"
        content={<ImportButton />}
      />
      <StepperItem
        number={2}
        title="Processo"
        content={<RenderImportEventMessage />}
      />
    </Stepper>
  )
}

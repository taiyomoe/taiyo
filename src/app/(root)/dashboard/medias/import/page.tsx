"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";

import { importEventMessages } from "~/atoms/wsEvents.atoms";
import { Stepper } from "~/components/generics/stepper/Stepper";
import { StepperItem } from "~/components/generics/stepper/StepperItem";
import { pusherClient } from "~/lib/soketi/client";
import type { ImportEventMessage } from "~/lib/types";

import { ImportButton } from "./_components/ImportButton";
import { RenderImportEventMessage } from "./_components/RenderImportEventMessage";

export default function Page() {
  const setMessages = useSetAtom(importEventMessages);

  useEffect(() => {
    setMessages([]);

    pusherClient.subscribe("importChannel");
    pusherClient.bind("importEvent", (message: ImportEventMessage) => {
      setMessages((prev) => {
        // Prevent duplicate messages (React Strict Mode duplicates them)
        if (prev.find(({ content }) => content === message.content)) {
          return prev;
        }

        return [...prev, message];
      });
    });

    return () => {
      pusherClient.unsubscribe("importChannel");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  );
}

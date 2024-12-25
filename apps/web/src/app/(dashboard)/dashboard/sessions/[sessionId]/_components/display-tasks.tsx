"use client"

import type { Task } from "@taiyomoe/db"
import { useParams } from "next/navigation"
import { api } from "~/trpc/react"
import { DisplayChapterTasks } from "./display-chapter-tasks"
import { DisplayCoverTasks } from "./display-cover-tasks"

type Props = {
  initialData: Task[]
}

export const DisplayTasks = ({ initialData }: Props) => {
  const { sessionId } = useParams()
  const { data } = api.tasks.getBySessionId.useQuery(sessionId as string, {
    initialData,
    refetchInterval: 5000,
  })

  if (!data) return null

  return (
    <>
      <DisplayCoverTasks rawTasks={data} />
      <DisplayChapterTasks rawTasks={data} />
    </>
  )
}

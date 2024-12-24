import { db } from "@taiyomoe/db"
import { MediaUtils } from "@taiyomoe/utils"
import { ExternalLinkIcon } from "lucide-react"
import Link from "next/link"
import { DisplayTasks } from "./_components/display-tasks"

type Props = {
  params: Promise<{ sessionId: string }>
}

export default async function Page({ params }: Props) {
  const { sessionId } = await params
  const result = await db.task.findMany({ where: { sessionId } })
  const mediaId = (result.at(0)?.payload as Record<string, string> | undefined)
    ?.mediaId

  return (
    <div className="flex flex-col gap-12">
      <p className="font-semibold text-4xl">Sessão de upload</p>
      <div className="space-y-8">
        {mediaId && (
          <Link
            href={MediaUtils.getUrl({ id: mediaId })}
            className="flex items-center gap-2 transition-colors hover:text-default-600"
          >
            Página da obra <ExternalLinkIcon />
          </Link>
        )}
        {result.length > 0 && <DisplayTasks initialData={result} />}
        {result.length === 0 && (
          <p>
            Nenhuma tarefa encontrada. Isto significa que não há nenhuma cover
            ou capítulo para importar.
          </p>
        )}
      </div>
    </div>
  )
}

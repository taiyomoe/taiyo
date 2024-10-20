import type {
  ImportChapterMessageInput,
  ImportCoverMessageInput,
  ImportMediaInitialMessageInput,
  ImportMediaInitialMessageOutput,
} from "@taiyomoe/types"
import { Connection } from "rabbitmq-client"
import SuperJSON from "superjson"
import { RABBIT_DEFAULT_OPTIONS } from "./constants"
import { env } from "./env"

export const rawRabbitClient = new Connection(env.RABBITMQ_URL)

const rawRabbitPublisher = rawRabbitClient.createPublisher(
  RABBIT_DEFAULT_OPTIONS,
)

const rawRabbitRpcClient = rawRabbitClient.createRPCClient({ confirm: true })

export const rabbitPublisher = {
  medias: {
    import: (input: ImportMediaInitialMessageInput) =>
      rpcHandler<ImportMediaInitialMessageOutput>(
        "medias-initial-import",
        input,
      ),
    importCover: (input: ImportCoverMessageInput) =>
      messageHandler("import-cover", input),
    importChapter: (input: ImportChapterMessageInput) =>
      messageHandler("import-chapter", input),
  },
}

const rpcHandler = async <TOutput>(routingKey: string, content: unknown) => {
  const { body } = await rawRabbitRpcClient.send(
    routingKey,
    SuperJSON.stringify(content),
  )

  return SuperJSON.parse<TOutput>(body)
}

const messageHandler = async (routingKey: string, content: unknown) =>
  rawRabbitPublisher.send(
    { exchange: "medias", routingKey },
    SuperJSON.stringify(content),
  )

process.on("SIGINT", async () => {
  await rawRabbitPublisher.close()
  await rawRabbitRpcClient.close()
})

export * from "./constants"

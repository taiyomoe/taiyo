import type {
  CreateMediaMessageInput,
  CreateMediaMessageOutput,
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
    create: (input: CreateMediaMessageInput) =>
      rpcHandler<CreateMediaMessageOutput>("medias-create", input, false),
    import: (input: ImportMediaInitialMessageInput) =>
      rpcHandler<ImportMediaInitialMessageOutput>(
        "medias-initial-import",
        input,
        true,
      ),
    importCover: (input: ImportCoverMessageInput) =>
      messageHandler("import-cover", input),
    importChapter: (input: ImportChapterMessageInput) =>
      messageHandler("import-chapter", input),
  },
}

/**
 * We should only stringify the input if doesn't contain a file.
 * In that case, we should avoir using dates.
 */
const rpcHandler = async <TOutput>(
  routingKey: string,
  input: Record<string, unknown>,
  stringify: boolean,
) => {
  const { body } = await rawRabbitRpcClient.send(
    routingKey,
    stringify ? SuperJSON.stringify(input) : input,
  )

  return SuperJSON.parse<TOutput>(body)
}

const messageHandler = async (routingKey: string, input: unknown) =>
  rawRabbitPublisher.send(
    { exchange: "medias", routingKey },
    SuperJSON.stringify(input),
  )

process.on("SIGINT", async () => {
  await rawRabbitPublisher.close()
  await rawRabbitRpcClient.close()
})

export * from "./constants"

import type {
  CreateMediaMessageInput,
  UploadChapterMessageInput,
} from "@taiyomoe/types"
import { Queue, QueueEvents } from "bullmq"
import { QUEUE_OPTIONS, UPLOADS_QUEUE } from "./constants"

const uploadsQueue = new Queue(UPLOADS_QUEUE, QUEUE_OPTIONS)
const uploadsQueueEvents = new QueueEvents(UPLOADS_QUEUE, QUEUE_OPTIONS)
// const importsQueue = new Queue(IMPORTS_QUEUE, {
//   connection: { url: env.DRAGONFLY_URL },
// })

export const messagingClient = {
  queues: {
    uploads: uploadsQueueEvents,
  },

  medias: {
    create: (input: CreateMediaMessageInput) =>
      uploadsQueue.add("medias-create", input),
  },
  chapters: {
    upload: (input: UploadChapterMessageInput) =>
      uploadsQueue.add("chapters-upload", input),
  },
}

export * from "./constants"

// export const rawRabbitClient = new Connection(env.RABBITMQ_URL)

// const rawRabbitPublisher = rawRabbitClient.createPublisher(
//   RABBIT_DEFAULT_OPTIONS,
// )

// const rawRabbitRpcClient = rawRabbitClient.createRPCClient({ confirm: true })

// export const messagingClient = {
//   medias: {
//     create: (input: CreateMediaMessageInput) =>
//       rpcHandler<CreateMediaMessageOutput>("medias-create", input, false),
//     import: (input: ImportMediaInitialMessageInput) =>
//       rpcHandler<ImportMediaInitialMessageOutput>(
//         "medias-initial-import",
//         input,
//         true,
//       ),
//     importCover: (input: ImportCoverMessageInput) =>
//       messageHandler("import-cover", input),
//     importChapter: (input: ImportChapterMessageInput) =>
//       messageHandler("import-chapter", input),
//   },
// }

// /**
//  * We should only stringify the input if doesn't contain a file.
//  * In that case, we should avoir using dates.
//  */
// const rpcHandler = async <TOutput>(
//   routingKey: string,
//   input: Record<string, unknown>,
//   stringify: boolean,
// ) => {
//   const { body } = await rawRabbitRpcClient.send(
//     routingKey,
//     stringify ? SuperJSON.stringify(input) : input,
//   )

//   return SuperJSON.parse<TOutput>(body)
// }

// const messageHandler = async (routingKey: string, input: unknown) =>
//   rawRabbitPublisher.send(
//     { exchange: "medias", routingKey },
//     SuperJSON.stringify(input),
//   )

// process.on("SIGINT", async () => {
//   await rawRabbitPublisher.close()
//   await rawRabbitRpcClient.close()
// })

// export * from "./constants"

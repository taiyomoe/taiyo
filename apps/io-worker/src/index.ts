import { RABBIT_DEFAULT_EXCHANGES, rawRabbitClient } from "@taiyomoe/rabbit"
import SuperJSON from "superjson"
import { importChapterHandler } from "~/handlers/import-chapter.handler"
import { importCoverHandler } from "~/handlers/import-cover.handler"
import { mediasInitialImportHandler } from "~/handlers/medias-initial-import.handler"
import { logger } from "~/logger"

console.log("image-orchestrator worker up and running!")

const rabbitConsumer = rawRabbitClient.createConsumer(
  {
    qos: { prefetchCount: 2 },
    queueOptions: { durable: true },
    exchanges: RABBIT_DEFAULT_EXCHANGES,
    queueBindings: [{ exchange: "medias", routingKey: "*" }],
  },
  async ({ routingKey, body }) => {
    logger.debug(`Received RabbitMQ message (${routingKey})`)

    switch (routingKey) {
      case "import-cover":
        return importCoverHandler(SuperJSON.parse(body))
      case "import-chapter":
        return importChapterHandler(SuperJSON.parse(body))
      default:
        logger.error("Received unknown RabbitMQ routing key", routingKey)
    }
  },
)

const rpcRabbitConsumer = rawRabbitClient.createConsumer(
  { queue: "medias-initial-import" },
  ({ body }, reply) => {
    logger.debug("Received RabbitMQ RPC message (medias-initial-import)")
    return mediasInitialImportHandler(SuperJSON.parse(body), reply)
  },
)

rabbitConsumer.on("error", (err) => {
  logger.error("An error occured while handling a RabbitMQ message", err)
})

rpcRabbitConsumer.on("error", (err) => {
  logger.error("An error occured while handling a RabbitMQ RPC message", err)
})

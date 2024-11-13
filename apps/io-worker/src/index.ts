import { RABBIT_DEFAULT_EXCHANGES, rawRabbitClient } from "@taiyomoe/rabbit"
import SuperJSON from "superjson"
import { createMediaHandler } from "~/handlers/create-media.handler"
import { importChapterHandler } from "~/handlers/import-chapter.handler"
import { importCoverHandler } from "~/handlers/import-cover.handler"
import { mediasInitialImportHandler } from "~/handlers/medias-initial-import.handler"
import { handleErrors } from "~/utils/handle-errors"
import { logger } from "~/utils/logger"

console.log("image-orchestrator worker up and running!")

const rabbitConsumer = rawRabbitClient.createConsumer(
  {
    requeue: false,
    qos: { prefetchCount: 2 },
    queueOptions: { durable: true },
    exchanges: RABBIT_DEFAULT_EXCHANGES,
    queueBindings: [{ exchange: "medias", routingKey: "*" }],
  },
  async ({ routingKey, body }) => {
    logger.debug(`Received RabbitMQ message (${routingKey})`)

    switch (routingKey) {
      case "import-cover":
        return handleErrors(importCoverHandler)(SuperJSON.parse(body))
      case "import-chapter":
        return handleErrors(importChapterHandler)(SuperJSON.parse(body))
      default:
        logger.error("Received unknown RabbitMQ routing key", routingKey)
    }
  },
)

const mediasInitialImportConsumer = rawRabbitClient.createConsumer(
  { queue: "medias-initial-import", requeue: false },
  ({ body }, reply) => {
    logger.debug("Received RabbitMQ RPC message (medias-initial-import)")
    return handleErrors(mediasInitialImportHandler)(
      SuperJSON.parse(body),
      reply,
    )
  },
)

const mediasCreateConsumer = rawRabbitClient.createConsumer(
  { queue: "medias-create", requeue: false },
  ({ body }, reply) => {
    logger.debug("Received RabbitMQ RPC message (medias-create)")
    return handleErrors(createMediaHandler)(body, reply)
  },
)

rabbitConsumer.on("error", (err) => {
  logger.error("An error occured while handling a RabbitMQ message", err)
})

mediasInitialImportConsumer.on("error", (err) => {
  logger.error(
    "An error occured while handling a RabbitMQ RPC message (medias-initial-import)",
    err,
  )
})

mediasCreateConsumer.on("error", (err) => {
  logger.error(
    "An error occured while handling a RabbitMQ RPC message (medias-create)",
    err,
  )
})

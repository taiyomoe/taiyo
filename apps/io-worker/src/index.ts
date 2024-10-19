import { RABBIT_DEFAULT_EXCHANGES, rawRabbitClient } from "@taiyomoe/rabbit"
import SuperJSON from "superjson"
import { mediasInitialImportHandler } from "~/handlers/medias-initial-import.handler"
import { logger } from "~/logger"

console.log("image-orchestrator worker up and running!")

const rabbitConsumer = rawRabbitClient.createConsumer(
  {
    qos: { prefetchCount: 5 },
    queueOptions: { durable: true },
    exchanges: RABBIT_DEFAULT_EXCHANGES,
    queueBindings: [{ exchange: "medias", routingKey: "*" }],
  },
  async (msg) => {
    console.log("received message (user-events)")
    console.clear()
    console.log("msg", msg)

    // The message is automatically acknowledged (BasicAck) when this function ends.
    // If this function throws an error, then msg is rejected (BasicNack) and
    // possibly requeued or sent to a dead-letter exchange. You can also return a
    // status code from this callback to control the ack/nack behavior
    // per-message.
  },
)

// const rpcRabbitConsumer = rawRabbitClient.createConsumer(
//   { queue: "rpc-queue" },
//   ({ routingKey, body }, reply) => {
//     switch (routingKey) {
//       case "medias-initial-import":
//         logger.debug("Received Rabbit RPC message (medias-initial-import)")
//         return mediasInitialImportHandler(body, reply)
//       default:
//         logger.error("Received unknown Rabbit RPC message", routingKey)
//     }
//   },
// )

const rpcRabbitConsumer = rawRabbitClient.createConsumer(
  { queue: "medias-initial-import" },
  ({ body }, reply) => {
    logger.debug("Received Rabbit RPC message (medias-initial-import)")
    return mediasInitialImportHandler(SuperJSON.parse(body), reply)
  },
)

rabbitConsumer.on("error", (err) => {
  logger.error("An error occured while handling a RabbitMQ message", err)
})

rpcRabbitConsumer.on("error", (err) => {
  logger.error("An error occured while handling a RabbitMQ RPC message", err)
})

import Connection from "rabbitmq-client"
import { env } from "./env"

const rawRabbitClient = new Connection(env.RABBITMQ_URL)

export const rabbitPublisher = rawRabbitClient.createPublisher({
  confirm: true,
  maxAttempts: 3,
  exchanges: [{ exchange: "chapters", type: "topic" }],
})

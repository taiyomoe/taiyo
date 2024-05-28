import DF from "ioredis"
import { env } from "../env"

export const dragonflyClient = new DF({ port: env.DRAGONFLY_PORT })

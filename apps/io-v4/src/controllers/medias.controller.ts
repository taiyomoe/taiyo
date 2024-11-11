import { Hono } from "hono"
import { createMediaHandler } from "~/handlers/create-media.handler"

export const mediasController = new Hono().route("/", createMediaHandler)

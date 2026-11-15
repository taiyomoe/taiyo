import type { PushMessage, PushSender } from "@taiyomoe/queue"

type SentPush = { endpoint: string; message: PushMessage }

const sentPushes = new WeakMap<PushSender, SentPush[]>()
const statuses = new WeakMap<PushSender, Map<string, number>>()

export const createMemoryPushSender = () => {
  const sent: SentPush[] = []
  const status = new Map<string, number>()
  const sender: PushSender = ({ endpoint }, message) => {
    sent.push({ endpoint, message })

    return Promise.resolve(status.get(endpoint) ?? 201)
  }

  sentPushes.set(sender, sent)
  statuses.set(sender, status)

  return sender
}

export const getSentPushes = (sender: PushSender | null) =>
  sender === null ? [] : (sentPushes.get(sender) ?? [])

export const answerPushWith = (sender: PushSender | null, endpoint: string, code: number) => {
  if (sender !== null) {
    statuses.get(sender)?.set(endpoint, code)
  }
}

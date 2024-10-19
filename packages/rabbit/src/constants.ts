export const RABBIT_DEFAULT_EXCHANGES = [{ exchange: "medias", type: "topic" }]

export const RABBIT_DEFAULT_OPTIONS = {
  confirm: true,
  maxAttempts: 3,
  exchanges: RABBIT_DEFAULT_EXCHANGES,
}

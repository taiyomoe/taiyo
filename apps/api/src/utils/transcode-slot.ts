// sharp work runs on libvips threads shared by the whole api: a few concurrent transcodes leave
// room for every other request.
const MAX_CONCURRENT_TRANSCODES = 2
let running = 0
const waiting: Array<() => void> = []

export const withTranscodeSlot = async <T>(task: () => Promise<T>) => {
  if (running >= MAX_CONCURRENT_TRANSCODES) {
    await new Promise<void>((resolve) => {
      waiting.push(resolve)
    })
  }

  running += 1

  try {
    return await task()
  } finally {
    running -= 1
    waiting.shift()?.()
  }
}

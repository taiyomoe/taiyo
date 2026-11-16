import { LOCKDOWN_IMPACT, LOCKDOWN_TAPES } from "@/features/media/lib/lockdown-timeline"

const soundUrl = (name: string) => `/sounds/lockdown/${name}.mp3`
// The metal hit starts 20ms into its recording.
const SLAM_ONSET = 0.02
const IDLE_SUSPEND = 6000

export type LockdownSounds = {
  tapes: AudioBuffer[]
  slam: AudioBuffer
}

const decode = async (context: BaseAudioContext, name: string) => {
  const response = await fetch(soundUrl(name))

  return context.decodeAudioData(await response.arrayBuffer())
}

export const loadLockdownSounds = async (
  context: BaseAudioContext = new OfflineAudioContext(1, 1, 48_000),
) => {
  const [slam, ...tapes] = await Promise.all([
    decode(context, "slam"),
    ...LOCKDOWN_TAPES.map((tape) => decode(context, tape.sound)),
  ])

  return { tapes, slam } satisfies LockdownSounds
}

/**
 * Plays a strip of tape being pulled and pressed down for every strip, then
 * the metal placard slamming onto them. `start` is the context time the
 * animation starts at, and works on a live or an offline context.
 */
const scheduleLockdownSounds = (
  context: BaseAudioContext,
  sounds: LockdownSounds,
  start: number,
) => {
  const play = (buffer: AudioBuffer, at: number) => {
    const source = context.createBufferSource()

    source.buffer = buffer
    source.connect(context.destination)
    source.start(Math.max(at, context.currentTime))
  }

  for (const [index, tape] of LOCKDOWN_TAPES.entries()) {
    const buffer = sounds.tapes[index]

    if (buffer !== undefined) {
      play(buffer, start + tape.delay / 1000)
    }
  }

  play(sounds.slam, start + LOCKDOWN_IMPACT / 1000 - SLAM_ONSET)
}
// Safari only starts an audio context from inside a user gesture, and the page
// mounts well after the click that led to it. So the click itself wakes a
// shared context, which goes back to sleep when nothing plays on it.
let shared: AudioContext | null = null
let idle: ReturnType<typeof setTimeout> | undefined
const wake = () => {
  if (typeof window.AudioContext === "undefined") {
    return
  }

  shared ??= new window.AudioContext()

  if (shared.state === "suspended") {
    void shared.resume()
  }

  clearTimeout(idle)
  idle = setTimeout(() => {
    void shared?.suspend()
  }, IDLE_SUSPEND)
}

if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", wake, { capture: true, passive: true })
  window.addEventListener("keydown", wake, { capture: true, passive: true })
}

export const playLockdownSounds = (sounds: LockdownSounds) => {
  if (shared?.state !== "running") {
    return
  }

  clearTimeout(idle)
  idle = setTimeout(() => {
    void shared?.suspend()
  }, IDLE_SUSPEND + LOCKDOWN_IMPACT)
  scheduleLockdownSounds(shared, sounds, shared.currentTime + 0.02)
}

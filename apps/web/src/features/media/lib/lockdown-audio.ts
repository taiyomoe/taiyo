import {
  LOCKDOWN_IMPACT,
  LOCKDOWN_PLACARD,
  LOCKDOWN_TAPES,
} from "@/features/media/lib/lockdown-timeline"

const seeded = (seed: number) => {
  let state = seed

  return () => {
    state = (state + 0x6d2b79f5) | 0

    let value = Math.imul(state ^ (state >>> 15), 1 | state)

    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value)

    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}

/**
 * Schedules the sounds of the lockdown on any audio context, live or offline:
 * a peel of adhesive tape for every strip, then the placard whooshing down and
 * slamming onto the tape. `start` is the context time the animation starts at.
 */
export const scheduleLockdownSounds = (context: BaseAudioContext, start: number) => {
  const random = seeded(3507)
  const rate = context.sampleRate
  const master = context.createGain()
  const compressor = context.createDynamicsCompressor()
  const room = context.createConvolver()
  const roomLevel = context.createGain()

  master.gain.value = 0.8
  compressor.threshold.value = -14
  compressor.ratio.value = 4
  master.connect(compressor)
  compressor.connect(context.destination)

  const impulse = context.createBuffer(2, Math.round(rate * 1.4), rate)

  for (let channel = 0; channel < 2; channel += 1) {
    const data = impulse.getChannelData(channel)

    for (let index = 0; index < data.length; index += 1) {
      data[index] = (random() * 2 - 1) * (1 - index / data.length) ** 3.5
    }
  }

  room.buffer = impulse
  roomLevel.gain.value = 0.2
  room.connect(roomLevel)
  roomLevel.connect(master)

  const buffer = (seconds: number, sample: (time: number) => number) => {
    const result = context.createBuffer(1, Math.ceil(seconds * rate), rate)
    const data = result.getChannelData(0)

    for (let index = 0; index < data.length; index += 1) {
      data[index] = sample(index / rate)
    }

    return result
  }
  const play = (
    source: AudioBuffer,
    at: number,
    chain: Array<BiquadFilterNode | GainNode>,
    wet: boolean,
  ) => {
    const node = context.createBufferSource()
    let tail: AudioNode = node

    node.buffer = source

    for (const link of chain) {
      tail.connect(link)
      tail = link
    }

    tail.connect(master)

    if (wet) {
      tail.connect(room)
    }

    node.start(at)
  }
  const filter = (type: BiquadFilterType, frequency: number, q = 0.7) => {
    const node = context.createBiquadFilter()

    node.type = type
    node.frequency.value = frequency
    node.Q.value = q

    return node
  }
  const level = (value: number) => {
    const node = context.createGain()

    node.gain.value = value

    return node
  }
  // Adhesive peeling off a roll: sparse crackles that get denser as the pull
  // speeds up, over a bed of hiss, then the slap of the strip landing flat.
  const peel = (at: number, duration: number) => {
    let crackle = 0
    const source = buffer(duration + 0.06, (time) => {
      const progress = Math.min(time / duration, 1)
      const density = 900 + 1700 * Math.sin(Math.PI * progress * 0.8)

      if (random() < density / rate) {
        crackle = (0.35 + random() * 0.65) * (random() < 0.5 ? -1 : 1)
      }

      crackle *= 0.84

      const attack = Math.min(time / 0.012, 1)
      const release = time <= duration ? 1 : Math.max(0, 1 - (time - duration) / 0.05)

      return (crackle + (random() * 2 - 1) * 0.22) * attack * release * (0.7 + 0.3 * progress)
    })
    const sweep = filter("bandpass", 2400, 0.8)

    sweep.frequency.setValueAtTime(2600, at)
    sweep.frequency.exponentialRampToValueAtTime(1300, at + duration)
    play(source, at, [sweep, level(0.9)], false)
    play(source, at, [filter("lowpass", 520), level(0.5)], false)

    const slap = buffer(0.12, (time) => (random() * 2 - 1) * Math.exp(-time / 0.016))

    play(slap, at + duration, [filter("lowpass", 1500), level(0.75)], true)
  }
  const whoosh = (at: number, duration: number) => {
    const source = buffer(duration, (time) => {
      const progress = time / duration

      return (random() * 2 - 1) * progress ** 2 * (progress > 0.94 ? (1 - progress) / 0.06 : 1)
    })
    const sweep = filter("bandpass", 300, 1.1)

    sweep.frequency.setValueAtTime(260, at)
    sweep.frequency.exponentialRampToValueAtTime(1500, at + duration)
    play(source, at, [sweep, level(0.55)], true)
  }
  // A heavy metal sign hitting the tape: a low body thump, the crack of the
  // impact and the plate rattling for a moment after.
  const slam = (at: number) => {
    const body = context.createOscillator()
    const bodyLevel = context.createGain()

    body.type = "sine"
    body.frequency.setValueAtTime(118, at)
    body.frequency.exponentialRampToValueAtTime(34, at + 0.42)
    bodyLevel.gain.setValueAtTime(0.0001, at)
    bodyLevel.gain.exponentialRampToValueAtTime(1, at + 0.006)
    bodyLevel.gain.exponentialRampToValueAtTime(0.0001, at + 0.65)
    body.connect(bodyLevel)
    bodyLevel.connect(master)
    bodyLevel.connect(room)
    body.start(at)
    body.stop(at + 0.7)

    const crack = buffer(0.2, (time) => (random() * 2 - 1) * Math.exp(-time / 0.028))

    play(crack, at, [filter("lowpass", 1100), level(0.95)], true)
    play(crack, at, [filter("highpass", 3200), level(0.18)], true)

    for (const [index, frequency] of [287, 433, 661, 1019].entries()) {
      const partial = context.createOscillator()
      const partialLevel = context.createGain()
      const peak = 0.07 / (index + 1)

      partial.type = "triangle"
      partial.frequency.setValueAtTime(frequency, at)
      partial.frequency.linearRampToValueAtTime(frequency * 0.985, at + 0.5)
      partialLevel.gain.setValueAtTime(0.0001, at)
      partialLevel.gain.exponentialRampToValueAtTime(peak, at + 0.004)
      partialLevel.gain.exponentialRampToValueAtTime(0.0001, at + 0.55 - index * 0.08)
      partial.connect(partialLevel)
      partialLevel.connect(master)
      partialLevel.connect(room)
      partial.start(at)
      partial.stop(at + 0.6)
    }
  }

  for (const tape of LOCKDOWN_TAPES) {
    peel(start + tape.delay / 1000, tape.duration / 1000)
  }

  const impact = start + LOCKDOWN_IMPACT / 1000
  const fall = impact - (start + LOCKDOWN_PLACARD.delay / 1000)

  whoosh(impact - fall, fall)
  slam(impact)

  return impact + 1.4
}

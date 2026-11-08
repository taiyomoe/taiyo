import type { CosmeticRarity } from "@taiyomoe/db/cosmetics"

const REVEAL_NOTES: Record<CosmeticRarity, number[]> = {
  common: [523.25, 659.25],
  rare: [523.25, 659.25, 783.99],
  epic: [440, 554.37, 659.25, 880],
  legendary: [392, 493.88, 587.33, 783.99, 987.77, 1174.66],
}
const BURST_WEIGHT: Record<CosmeticRarity, number> = {
  common: 0.5,
  rare: 0.7,
  epic: 0.85,
  legendary: 1,
}

export type ChestAudio = ReturnType<typeof createChestAudio>

export const createChestAudio = () => {
  const AudioContextClass = typeof window === "undefined" ? undefined : window.AudioContext

  if (AudioContextClass === undefined) {
    return null
  }

  const context = new AudioContextClass()
  const master = context.createGain()
  const echo = context.createDelay(1)
  const echoFeedback = context.createGain()
  const echoFilter = context.createBiquadFilter()

  master.gain.value = 0.55
  echo.delayTime.value = 0.19
  echoFeedback.gain.value = 0.32
  echoFilter.type = "lowpass"
  echoFilter.frequency.value = 3200
  echo.connect(echoFilter)
  echoFilter.connect(echoFeedback)
  echoFeedback.connect(echo)
  echoFilter.connect(master)
  master.connect(context.destination)

  const noise = (() => {
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
    const data = buffer.getChannelData(0)

    for (let index = 0; index < data.length; index += 1) {
      data[index] = Math.random() * 2 - 1
    }

    return buffer
  })()
  const envelope = (gain: GainNode, at: number, peak: number, attack: number, release: number) => {
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(peak, at + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + attack + release)
  }
  const tone = ({
    frequency,
    at,
    duration,
    peak,
    type = "sine",
    glideTo,
    wet = false,
  }: {
    frequency: number
    at: number
    duration: number
    peak: number
    type?: OscillatorType
    glideTo?: number
    wet?: boolean
  }) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, at)

    if (glideTo !== undefined) {
      oscillator.frequency.exponentialRampToValueAtTime(glideTo, at + duration)
    }

    envelope(gain, at, peak, Math.min(0.02, duration / 4), duration)
    oscillator.connect(gain)
    gain.connect(master)

    if (wet) {
      gain.connect(echo)
    }

    oscillator.start(at)
    oscillator.stop(at + duration + 0.05)
  }
  const hiss = ({
    at,
    duration,
    peak,
    type,
    from,
    to,
    q = 1,
  }: {
    at: number
    duration: number
    peak: number
    type: BiquadFilterType
    from: number
    to: number
    q?: number
  }) => {
    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()

    source.buffer = noise
    filter.type = type
    filter.Q.value = q
    filter.frequency.setValueAtTime(from, at)
    filter.frequency.exponentialRampToValueAtTime(to, at + duration)
    envelope(gain, at, peak, Math.min(0.03, duration / 3), duration)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    source.start(at, Math.random())
    source.stop(at + duration + 0.05)
  }
  let riser: { oscillator: OscillatorNode; gain: GainNode } | null = null
  const stopRiser = () => {
    if (riser === null) {
      return
    }

    const now = context.currentTime

    riser.gain.gain.cancelScheduledValues(now)
    riser.gain.gain.setTargetAtTime(0.0001, now, 0.03)
    riser.oscillator.stop(now + 0.2)
    riser = null
  }

  return {
    resume: () => context.resume(),
    rattle: (intensity: number) => {
      const now = context.currentTime
      const level = 0.12 + intensity * 0.3

      hiss({
        at: now,
        duration: 0.07,
        peak: level,
        type: "bandpass",
        from: 1400 + intensity * 900,
        to: 900,
        q: 3,
      })
      tone({
        frequency: 140 + intensity * 60,
        glideTo: 70,
        at: now,
        duration: 0.09,
        peak: level * 0.9,
      })
      hiss({
        at: now + 0.035,
        duration: 0.05,
        peak: level * 0.6,
        type: "highpass",
        from: 4200,
        to: 2600,
      })
    },
    charge: (seconds: number) => {
      stopRiser()

      const now = context.currentTime
      const oscillator = context.createOscillator()
      const filter = context.createBiquadFilter()
      const gain = context.createGain()

      oscillator.type = "sawtooth"
      oscillator.frequency.setValueAtTime(90, now)
      oscillator.frequency.exponentialRampToValueAtTime(420, now + seconds)
      filter.type = "lowpass"
      filter.frequency.setValueAtTime(300, now)
      filter.frequency.exponentialRampToValueAtTime(2400, now + seconds)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.08, now + seconds)
      oscillator.connect(filter)
      filter.connect(gain)
      gain.connect(master)
      oscillator.start(now)
      riser = { oscillator, gain }
    },
    burst: (rarity: CosmeticRarity) => {
      stopRiser()

      const now = context.currentTime
      const weight = BURST_WEIGHT[rarity]

      tone({ frequency: 120, glideTo: 32, at: now, duration: 0.7, peak: 0.7 * weight })
      hiss({ at: now, duration: 0.9, peak: 0.45 * weight, type: "lowpass", from: 7000, to: 300 })
      hiss({
        at: now,
        duration: 1.4 * weight,
        peak: 0.18 * weight,
        type: "highpass",
        from: 6000,
        to: 3000,
      })
      tone({
        frequency: 1800,
        glideTo: 2600,
        at: now + 0.02,
        duration: 0.35,
        peak: 0.05,
        type: "triangle",
        wet: true,
      })
    },
    reveal: (rarity: CosmeticRarity) => {
      const now = context.currentTime
      const notes = REVEAL_NOTES[rarity]
      const step = rarity === "legendary" ? 0.085 : 0.11

      for (const [index, frequency] of notes.entries()) {
        tone({
          frequency,
          at: now + index * step,
          duration: 0.9,
          peak: 0.16,
          type: "triangle",
          wet: true,
        })
        tone({
          frequency: frequency * 2,
          at: now + index * step,
          duration: 0.5,
          peak: 0.04,
          wet: true,
        })
      }

      if (rarity === "epic" || rarity === "legendary") {
        const root = notes[0] ?? 440
        const at = now + notes.length * step

        for (const ratio of [1, 1.25, 1.5]) {
          tone({ frequency: root * ratio, at, duration: 2.2, peak: 0.06, type: "sine", wet: true })
        }
      }

      if (rarity === "legendary") {
        for (let index = 0; index < 10; index += 1) {
          tone({
            frequency: 2000 + Math.random() * 2200,
            at: now + 0.5 + index * 0.09 + Math.random() * 0.05,
            duration: 0.25,
            peak: 0.035,
            wet: true,
          })
        }
      }
    },
    coin: () => {
      const now = context.currentTime

      tone({ frequency: 987.77, at: now, duration: 0.12, peak: 0.14, type: "square" })
      tone({
        frequency: 1318.51,
        at: now + 0.08,
        duration: 0.4,
        peak: 0.12,
        type: "square",
        wet: true,
      })
    },
    fail: () => {
      stopRiser()
      tone({
        frequency: 220,
        glideTo: 110,
        at: context.currentTime,
        duration: 0.4,
        peak: 0.12,
        type: "triangle",
      })
    },
    stop: stopRiser,
    close: () => {
      stopRiser()
      void context.close()
    },
  }
}

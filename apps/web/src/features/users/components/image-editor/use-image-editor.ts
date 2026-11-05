import { useSyncExternalStore } from "react"
import { isShallowEqual } from "remeda"
import {
  type CropTransform,
  type Point,
  type Size,
  clamp,
  clampPan,
  clampTransform,
  getFrameSize,
  getImageCrop,
  getMinScale,
  MAX_ZOOM,
  rotatePoint,
  zoomAround,
} from "@/features/users/components/image-editor/crop-math"

/**
 * The editable state. Rotation is split in whole quarter turns (unbounded, so
 * rotating keeps animating forward) and the straighten angle (−45°..45°).
 */
type Model = {
  panX: number
  panY: number
  scale: number
  quarterTurns: number
  straighten: number
  flipX: boolean
  flipY: boolean
}

/**
 * What is on screen, which differs from the model during animations and
 * rubber-banding. Flips are numbers so they can be interpolated, and the
 * mirror is a screen-space flip around the frame centre used to animate the
 * flip buttons.
 */
type Visual = {
  panX: number
  panY: number
  scale: number
  rotation: number
  flipX: number
  flipY: number
  mirrorX: number
  mirrorY: number
}

export type EditorState = {
  ready: boolean
  zoom: number
  straighten: number
  quarterTurns: number
  flipX: boolean
  flipY: boolean
  dragging: boolean
  showGrid: boolean
  pristine: boolean
  frameWidth: number
  frameHeight: number
}

const ANIMATION_MS = 260
const RUBBER_LIMIT = 90
const ZOOM_STEP = 1.25

export const STRAIGHTEN_LIMIT = 45

const rotationOf = (model: Model) => model.quarterTurns * 90 + model.straighten
const toTransform = (model: Model) =>
  ({
    panX: model.panX,
    panY: model.panY,
    scale: model.scale,
    rotation: rotationOf(model),
    flipX: model.flipX,
    flipY: model.flipY,
  }) satisfies CropTransform
const toVisual = (model: Model, offset: Point = { x: 0, y: 0 }) =>
  ({
    panX: model.panX + offset.x,
    panY: model.panY + offset.y,
    scale: model.scale,
    rotation: rotationOf(model),
    flipX: model.flipX ? -1 : 1,
    flipY: model.flipY ? -1 : 1,
    mirrorX: 1,
    mirrorY: 1,
  }) satisfies Visual
const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress
const lerpVisual = (from: Visual, to: Visual, progress: number) =>
  ({
    panX: lerp(from.panX, to.panX, progress),
    panY: lerp(from.panY, to.panY, progress),
    scale: lerp(from.scale, to.scale, progress),
    rotation: lerp(from.rotation, to.rotation, progress),
    flipX: lerp(from.flipX, to.flipX, progress),
    flipY: lerp(from.flipY, to.flipY, progress),
    mirrorX: lerp(from.mirrorX, to.mirrorX, progress),
    mirrorY: lerp(from.mirrorY, to.mirrorY, progress),
  }) satisfies Visual
const easeOut = (progress: number) => 1 - (1 - progress) ** 3
/** Resistance past the edge: tracks the finger at first, then levels off. */
const rubber = (distance: number) =>
  Math.sign(distance) * RUBBER_LIMIT * (1 - 1 / ((Math.abs(distance) * 0.55) / RUBBER_LIMIT + 1))
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
const getFrameMargin = (viewport: Size) => (viewport.width < 480 ? 16 : 28)
/**
 * The CSS matrix that draws an element of `element` size (the image at
 * `base` px per image px) at `visual`, centred on `centre`, with every length
 * multiplied by `factor` (1 on the stage, smaller in the previews):
 * T(centre) · factor · Mirror · T(pan) · R(θ) · Flip · scale/base · T(−element/2).
 */
const toMatrix = (visual: Visual, element: Size, base: number, centre: Point, factor: number) => {
  const radians = (visual.rotation * Math.PI) / 180
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const scaleX = (visual.flipX * visual.scale) / base
  const scaleY = (visual.flipY * visual.scale) / base
  const a = factor * visual.mirrorX * cos * scaleX
  const b = factor * visual.mirrorY * sin * scaleX
  const c = -factor * visual.mirrorX * sin * scaleY
  const d = factor * visual.mirrorY * cos * scaleY
  const e =
    centre.x + factor * visual.mirrorX * visual.panX - (a * element.width + c * element.height) / 2
  const f =
    centre.y + factor * visual.mirrorY * visual.panY - (b * element.width + d * element.height) / 2

  return `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`
}

/**
 * Owns the editor's geometry outside React: gestures mutate it, it writes the
 * transform straight to the DOM once per animation frame, and it publishes a
 * small snapshot (at most once per frame) for the controls to render.
 */
export function createImageEditor({
  aspect,
  lockRotation,
}: {
  aspect: number
  lockRotation: boolean
}) {
  let image: Size | null = null
  let viewport: Size = { width: 0, height: 0 }
  let frame: Size = { width: 0, height: 0 }
  // Image px → element px. The <img> is laid out at the size that covers the
  // frame unrotated, so the browser never rasterises a huge element.
  let base = 1
  let model: Model = {
    panX: 0,
    panY: 0,
    scale: 1,
    quarterTurns: 0,
    straighten: 0,
    flipX: false,
    flipY: false,
  }
  let drag: { raw: Point; moved: boolean } | null = null
  let overscroll: Point = { x: 0, y: 0 }
  let tween: { from: Visual; startedAt: number } | null = null
  let displayed: Visual = toVisual(model)
  let renderRequest = 0
  let notifyRequest = 0
  let showGrid = false
  let imageElement: HTMLImageElement | null = null
  const previews = new Map<HTMLImageElement, Size>()
  const listeners = new Set<() => void>()
  const isReady = () => image !== null && frame.width > 0
  const minScaleAt = (rotation: number) =>
    image === null || frame.width === 0 ? 1 : getMinScale(image, frame, rotation)
  const getFitModel = (quarterTurns = 0) =>
    ({
      panX: 0,
      panY: 0,
      scale: minScaleAt(0),
      quarterTurns,
      straighten: 0,
      flipX: false,
      flipY: false,
    }) satisfies Model
  const clampModel = (next: Model) => {
    if (image === null || frame.width === 0) {
      return next
    }

    const clamped = clampTransform(toTransform(next), image, frame)

    return { ...next, panX: clamped.panX, panY: clamped.panY, scale: clamped.scale }
  }
  const computeState = () => {
    const zoom = Math.round((model.scale / minScaleAt(rotationOf(model))) * 1000) / 1000

    return {
      ready: isReady(),
      zoom,
      straighten: model.straighten,
      quarterTurns: ((model.quarterTurns % 4) + 4) % 4,
      flipX: model.flipX,
      flipY: model.flipY,
      dragging: drag?.moved === true,
      showGrid,
      pristine:
        Math.abs(model.panX) < 0.5 &&
        Math.abs(model.panY) < 0.5 &&
        model.quarterTurns % 4 === 0 &&
        model.straighten === 0 &&
        !model.flipX &&
        !model.flipY &&
        zoom < 1.001,
      frameWidth: frame.width,
      frameHeight: frame.height,
    } satisfies EditorState
  }
  let state: EditorState = computeState()
  const publish = () => {
    notifyRequest = 0

    const next = computeState()

    if (!isShallowEqual(next, state)) {
      state = next

      for (const listener of listeners) {
        listener()
      }
    }
  }
  const notify = () => {
    if (notifyRequest === 0) {
      notifyRequest = requestAnimationFrame(publish)
    }
  }
  const elementSize = () =>
    image === null
      ? { width: 0, height: 0 }
      : { width: image.width * base, height: image.height * base }
  const applyLayout = () => {
    const { width, height } = elementSize()

    for (const element of [imageElement, ...previews.keys()]) {
      if (element !== null) {
        element.style.width = `${width}px`
        element.style.height = `${height}px`
      }
    }
  }
  const write = (visual: Visual) => {
    const element = elementSize()

    if (imageElement !== null) {
      imageElement.style.transform = toMatrix(
        visual,
        element,
        base,
        { x: viewport.width / 2, y: viewport.height / 2 },
        1,
      )
    }

    for (const [preview, size] of previews) {
      preview.style.transform = toMatrix(
        visual,
        element,
        base,
        { x: size.width / 2, y: size.height / 2 },
        size.width / frame.width,
      )
    }
  }
  const render = (now: number) => {
    renderRequest = 0

    if (!isReady()) {
      return
    }

    const target = toVisual(model, { x: rubber(overscroll.x), y: rubber(overscroll.y) })
    let visual = target

    if (tween !== null) {
      const progress = (now - tween.startedAt) / ANIMATION_MS

      if (progress >= 1) {
        tween = null
      } else {
        visual = lerpVisual(tween.from, target, easeOut(Math.max(progress, 0)))
        renderRequest = requestAnimationFrame(render)
      }
    }

    displayed = visual
    write(visual)
  }
  const schedule = () => {
    if (renderRequest === 0) {
      renderRequest = requestAnimationFrame(render)
    }
  }
  const update = (next: Model, { animate = false, from = displayed } = {}) => {
    model = clampModel(next)
    tween = animate && !prefersReducedMotion() ? { from, startedAt: performance.now() } : null
    schedule()
    notify()
  }
  const zoomTo = (scale: number, focal: Point = { x: 0, y: 0 }, animate = false) => {
    const minScale = minScaleAt(rotationOf(model))
    const nextScale = clamp(scale, minScale, minScale * MAX_ZOOM)
    const pan = zoomAround({ x: model.panX, y: model.panY }, model.scale, nextScale, focal)

    update({ ...model, scale: nextScale, panX: pan.x, panY: pan.y }, { animate })

    if (drag !== null) {
      drag.raw = { x: model.panX, y: model.panY }
      overscroll = { x: 0, y: 0 }
    }
  }
  /** Rotates around the frame centre, keeping the same image point centred and the zoom level. */
  const rotateTo = (quarterTurns: number, straighten: number, animate: boolean) => {
    if (lockRotation || image === null) {
      return
    }

    const before = rotationOf(model)
    const after = quarterTurns * 90 + straighten
    const scale = (model.scale / minScaleAt(before)) * minScaleAt(after)
    const pan = rotatePoint({ x: model.panX, y: model.panY }, after - before)
    const ratio = scale / model.scale

    update(
      { ...model, quarterTurns, straighten, scale, panX: pan.x * ratio, panY: pan.y * ratio },
      { animate },
    )
  }

  return {
    /** Starts over with a decoded image of this natural (EXIF-oriented) size. */
    setImage: (size: Size | null) => {
      image = size
      drag = null
      overscroll = { x: 0, y: 0 }
      base = isReady() ? minScaleAt(0) : 1
      model = getFitModel()
      tween = null
      applyLayout()
      schedule()
      notify()
    },
    /** Called on resize: keeps the same crop by scaling everything with the frame. */
    setViewport: (size: Size) => {
      const previous = frame

      viewport = size
      frame = getFrameSize(size, aspect, getFrameMargin(size))

      if (image === null || frame.width === 0) {
        notify()

        return
      }

      base = minScaleAt(0)

      if (previous.width === 0) {
        model = getFitModel()
      } else {
        const ratio = frame.width / previous.width

        model = clampModel({
          ...model,
          panX: model.panX * ratio,
          panY: model.panY * ratio,
          scale: model.scale * ratio,
        })
      }

      tween = null
      applyLayout()
      write(toVisual(model))
      notify()
    },
    attachImage: (element: HTMLImageElement | null) => {
      imageElement = element
      applyLayout()

      if (isReady()) {
        write(displayed)
      }
    },
    registerPreview: (element: HTMLImageElement, size: Size) => {
      previews.set(element, size)
      applyLayout()

      if (isReady()) {
        write(displayed)
      }

      return () => {
        previews.delete(element)
      }
    },
    beginDrag: () => {
      drag = { raw: { x: model.panX, y: model.panY }, moved: false }
      overscroll = { x: 0, y: 0 }
      tween = null
      notify()
    },
    /** Pans by a pointer delta; past the edges the image follows with resistance. */
    dragBy: (dx: number, dy: number) => {
      if (drag === null || image === null) {
        return
      }

      drag.raw = { x: drag.raw.x + dx, y: drag.raw.y + dy }

      if (!drag.moved) {
        // A click or the first half of a double-click is not a drag yet.
        drag.moved = true
        notify()
      }

      const clamped = clampPan(
        drag.raw,
        { scale: model.scale, rotation: rotationOf(model) },
        image,
        frame,
      )

      model = { ...model, panX: clamped.x, panY: clamped.y }
      overscroll = { x: drag.raw.x - clamped.x, y: drag.raw.y - clamped.y }
      tween = null
      schedule()
    },
    endDrag: () => {
      if (drag === null) {
        return
      }

      const springBack = overscroll.x !== 0 || overscroll.y !== 0
      const from = displayed

      drag = null
      overscroll = { x: 0, y: 0 }
      update(model, { animate: springBack, from })
    },
    panBy: (dx: number, dy: number) => {
      update({ ...model, panX: model.panX + dx, panY: model.panY + dy })
    },
    zoomBy: (factor: number, focal?: Point) => {
      zoomTo(model.scale * factor, focal)
    },
    stepZoom: (direction: 1 | -1) => {
      zoomTo(model.scale * ZOOM_STEP ** direction, undefined, true)
    },
    /** Zoom relative to the smallest scale that covers the frame (1 = fit). */
    setZoom: (zoom: number) => {
      zoomTo(zoom * minScaleAt(rotationOf(model)))
    },
    /** Double-click: fit when zoomed in, otherwise 2× around the pointer. */
    toggleFit: (focal: Point) => {
      const minScale = minScaleAt(rotationOf(model))

      zoomTo(model.scale / minScale > 1.01 ? minScale : minScale * 2, focal, true)
    },
    setStraighten: (degrees: number) => {
      rotateTo(
        model.quarterTurns,
        Math.round(clamp(degrees, -STRAIGHTEN_LIMIT, STRAIGHTEN_LIMIT) * 10) / 10,
        false,
      )
    },
    rotate: (direction: 1 | -1) => {
      rotateTo(model.quarterTurns + direction, model.straighten, true)
    },
    /**
     * Mirrors what is on screen around the frame centre. Flipping the image
     * alone would mirror it around its own (rotated) axis and tilt a
     * straightened horizon, so the rotation is negated too.
     */
    flip: (axis: "x" | "y") => {
      const next = {
        ...model,
        quarterTurns: 0 - model.quarterTurns,
        straighten: 0 - model.straighten,
        flipX: axis === "x" ? !model.flipX : model.flipX,
        flipY: axis === "y" ? !model.flipY : model.flipY,
        panX: axis === "x" ? 0 - model.panX : model.panX,
        panY: axis === "y" ? 0 - model.panY : model.panY,
      }

      update(next, {
        animate: true,
        from: {
          ...toVisual(next),
          mirrorX: axis === "x" ? -1 : 1,
          mirrorY: axis === "y" ? -1 : 1,
        },
      })
    },
    reset: () => {
      // The nearest whole turn, so resetting after four rotations does not spin back.
      update(getFitModel(Math.round(model.quarterTurns / 4) * 4), { animate: true })
    },
    toggleGrid: () => {
      showGrid = !showGrid
      notify()
    },
    getCrop: () =>
      image === null || !isReady() ? null : getImageCrop(toTransform(model), image, frame),
    subscribe: (listener: () => void) => {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
    getState: () => state,
    /** Cancels pending frames; safe to call more than once (StrictMode). */
    stop: () => {
      cancelAnimationFrame(renderRequest)
      cancelAnimationFrame(notifyRequest)
      renderRequest = 0
      notifyRequest = 0
      tween = null
    },
  }
}

export type ImageEditor = ReturnType<typeof createImageEditor>

/** Subscribes to one field of the editor snapshot, re-rendering only when it changes. */
export const useEditorValue = <K extends keyof EditorState>(editor: ImageEditor, key: K) =>
  useSyncExternalStore(
    editor.subscribe,
    () => editor.getState()[key],
    () => editor.getState()[key],
  )

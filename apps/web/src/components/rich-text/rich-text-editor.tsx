import type { IconProps } from "@taiyomoe/ui/components/icons"
import * as stylex from "@stylexjs/stylex"
import { Bold, EyeOff, Italic, Link, Strikethrough, Underline } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Kbd, KbdGroup } from "@taiyomoe/ui/components/ui/kbd"
import { FieldPrimitive, mergeProps } from "@taiyomoe/ui/components/ui/textarea"
import { Tooltip, TooltipPopup, TooltipTrigger } from "@taiyomoe/ui/components/ui/tooltip"
import { breakpoints, colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import {
  type ChangeEvent,
  type ClipboardEvent,
  type ComponentProps,
  type DragEvent,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  useRef,
  useState,
} from "react"
import { highlightRichText, type RichTextMark } from "@/components/rich-text/rich-text-highlight"
import { m } from "@/paraglide/messages"

const FORMATS = [
  {
    mark: "bold",
    token: "**",
    shortcut: { key: "b", shift: false },
    icon: Bold,
    label: m.rich_text_bold,
  },
  {
    mark: "italic",
    token: "*",
    shortcut: { key: "i", shift: false },
    icon: Italic,
    label: m.rich_text_italic,
  },
  {
    mark: "underline",
    token: "__",
    shortcut: { key: "u", shift: false },
    icon: Underline,
    label: m.rich_text_underline,
  },
  {
    mark: "strike",
    token: "~~",
    shortcut: { key: "x", shift: true },
    icon: Strikethrough,
    label: m.rich_text_strikethrough,
  },
  { mark: "spoiler", token: "||", shortcut: null, icon: EyeOff, label: m.rich_text_spoiler },
] satisfies Array<{
  mark: RichTextMark
  token: string
  shortcut: { key: string; shift: boolean } | null
  icon: (props: IconProps) => ReactElement
  label: () => string
}>
const URL_ONLY = /^https?:\/\/\S+$/i
const styles = stylex.create({
  frame: {
    borderColor: colors.input,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: colors.muted,
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  frameDisabled: {
    opacity: 0.64,
  },
  toolbar: {
    gap: "0.125rem",
    paddingBlock: "0.375rem",
    paddingInline: "0.5rem",
    display: "flex",
  },
  field: {
    borderColor: { default: colors.input, ":focus-within": colors.ring },
    borderStyle: "solid",
    borderWidth: 1,
    marginInline: "-1px",
    overflow: "hidden",
    backgroundClip: "padding-box",
    backgroundColor: colors.field,
    borderEndEndRadius: radius.xl,
    borderEndStartRadius: radius.xl,
    borderStartEndRadius: radius.lg,
    borderStartStartRadius: radius.lg,
    boxShadow: { default: shadows.chip, ":focus-within": "none" },
    color: colors.foreground,
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    outlineColor: `color-mix(in srgb, ${colors.ring} 24%, transparent)`,
    outlineOffset: 0,
    outlineStyle: { default: "none", ":focus-within": "solid" },
    outlineWidth: 3,
    position: "relative",
    transitionProperty: "box-shadow, border-color",
    marginBottom: "-1px",
    minWidth: 0,
  },
  fieldInvalid: {
    borderColor: {
      default: `color-mix(in srgb, ${colors.destructive} 36%, transparent)`,
      ":focus-within": `color-mix(in srgb, ${colors.destructive} 64%, transparent)`,
    },
    outlineColor: `color-mix(in srgb, ${colors.destructive} 16%, transparent)`,
  },
  surface: {
    margin: 0,
    borderWidth: 0,
    paddingBlock: "0.5rem",
    paddingInline: "0.75rem",
    boxSizing: "border-box",
    fontFamily: "inherit",
    fontFeatureSettings: '"kern" 0, "calt" 0, "liga" 0',
    fontKerning: "none",
    fontSize: { default: "1rem", [breakpoints.sm]: "0.875rem" },
    fontVariantLigatures: "none",
    fontWeight: 400,
    gridColumnEnd: 2,
    gridColumnStart: 1,
    gridRowEnd: 2,
    gridRowStart: 1,
    letterSpacing: "normal",
    lineHeight: 1.6,
    overflowWrap: "break-word",
    tabSize: 4,
    textTransform: "none",
    whiteSpace: "pre-wrap",
    wordBreak: "normal",
    width: "100%",
  },
  mirror: {
    color: colors.foreground,
    pointerEvents: "none",
    userSelect: "none",
  },
  textarea: {
    overflow: "hidden",
    backgroundColor: "transparent",
    caretColor: colors.foreground,
    color: "transparent",
    outlineStyle: "none",
    resize: "none",
    "::placeholder": {
      color: `color-mix(in srgb, ${colors.mutedForeground} 72%, transparent)`,
    },
    "::selection": {
      backgroundColor: `color-mix(in srgb, ${colors.primary} 28%, transparent)`,
      color: "transparent",
    },
  },
  syntax: {
    color: colors.mutedForeground,
  },
  bold: {
    WebkitTextStrokeColor: "currentColor",
    WebkitTextStrokeWidth: "0.04em",
  },
  italic: {
    fontStyle: "italic",
  },
  underline: {
    textDecorationLine: "underline",
  },
  strike: {
    textDecorationLine: "line-through",
  },
  underlineStrike: {
    textDecorationLine: "underline line-through",
  },
  spoiler: {
    borderRadius: "0.25rem",
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 16%, transparent)`,
    boxDecorationBreak: "clone",
  },
  image: {
    borderRadius: "0.25rem",
    backgroundColor: `color-mix(in srgb, ${colors.primary} 14%, transparent)`,
    boxDecorationBreak: "clone",
    color: `color-mix(in srgb, ${colors.primary} 70%, ${colors.foreground})`,
  },
  toolbarEnd: {
    gap: "0.125rem",
    alignItems: "center",
    display: "flex",
    marginInlineStart: "auto",
  },
  frameDragging: {
    borderColor: colors.ring,
  },
})
const replaceRange = (
  textarea: HTMLTextAreaElement,
  from: number,
  to: number,
  insert: string,
  selection: [number, number],
) => {
  textarea.focus()
  textarea.setSelectionRange(from, to)

  // execCommand is the only way to edit a textarea that keeps the native undo history.
  // oxlint-disable-next-line typescript/no-deprecated
  if (!document.execCommand("insertText", false, insert)) {
    textarea.setRangeText(insert, from, to, "end")
    textarea.dispatchEvent(new Event("input", { bubbles: true }))
  }

  textarea.setSelectionRange(...selection)
}

export const insertAtCursor = (
  textarea: HTMLTextAreaElement,
  text: string,
  { block = false }: { block?: boolean } = {},
) => {
  const { selectionStart: start, selectionEnd: end, value } = textarea
  const before = block && start > 0 && value[start - 1] !== "\n" ? "\n" : ""
  const after = block && value[end] !== "\n" ? "\n" : ""
  const insert = `${before}${text}${after}`
  const caret = start + insert.length

  replaceRange(textarea, start, end, insert, [caret, caret])
}

const imageFiles = (list: FileList | null) =>
  Array.from(list ?? []).filter((file) => file.type.startsWith("image/"))

function ShortcutHint({ shortcut, shift }: { shortcut: string; shift: boolean }) {
  const mac = /Mac|iPhone|iPad/.test(navigator.platform)

  return (
    <KbdGroup>
      <Kbd>{mac ? "⌘" : "Ctrl"}</Kbd>
      {shift ? <Kbd>{mac ? "⇧" : "Shift"}</Kbd> : null}
      <Kbd>{shortcut.toUpperCase()}</Kbd>
    </KbdGroup>
  )
}

export function RichTextEditor({
  ref,
  value,
  defaultValue,
  onChange,
  onKeyDown,
  rows = 6,
  images = false,
  toolbarEnd,
  onFiles,
  ...props
}: ComponentProps<"textarea"> & {
  ref?: Ref<HTMLTextAreaElement>
  images?: boolean
  toolbarEnd?: ReactNode
  onFiles?: (files: File[]) => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uncontrolled, setUncontrolled] = useState(
    typeof defaultValue === "string" ? defaultValue : "",
  )
  const text = typeof value === "string" ? value : uncontrolled
  const segments = highlightRichText(text, { images })
  const setRef = (node: HTMLTextAreaElement | null) => {
    textareaRef.current = node

    if (typeof ref === "function") {
      ref(node)
    } else if (ref !== null && ref !== undefined) {
      ref.current = node
    }
  }
  const toggle = (token: string) => {
    const textarea = textareaRef.current

    if (textarea === null || textarea.disabled || textarea.readOnly) {
      return
    }

    const { selectionStart: start, selectionEnd: end, value: current } = textarea
    const size = token.length
    const selected = current.slice(start, end)
    const outside =
      current.slice(start - size, start) === token &&
      current.slice(end, end + size) === token &&
      (size > 1 || (current[start - 2] !== token && current[end + 1] !== token))
    const inside =
      selected.length > size * 2 && selected.startsWith(token) && selected.endsWith(token)

    if (outside) {
      replaceRange(textarea, start - size, end + size, selected, [start - size, end - size])
    } else if (inside) {
      replaceRange(textarea, start, end, selected.slice(size, -size), [start, end - size * 2])
    } else {
      replaceRange(textarea, start, end, `${token}${selected}${token}`, [start + size, end + size])
    }
  }
  const insertLink = () => {
    const textarea = textareaRef.current

    if (textarea === null || textarea.disabled || textarea.readOnly) {
      return
    }

    const { selectionStart: start, selectionEnd: end, value: current } = textarea
    const selected = current.slice(start, end)

    if (URL_ONLY.test(selected)) {
      replaceRange(textarea, start, end, `[](${selected})`, [start + 1, start + 1])
    } else if (selected === "") {
      replaceRange(textarea, start, end, "[](https://)", [start + 1, start + 1])
    } else {
      const urlStart = start + selected.length + 3

      replaceRange(textarea, start, end, `[${selected}](https://)`, [urlStart, urlStart + 8])
    }
  }
  const markStyle = (marks: RichTextMark[]) => {
    const underline = marks.includes("underline") || marks.includes("link")
    const strike = marks.includes("strike")

    return [
      marks.includes("bold") && styles.bold,
      marks.includes("italic") && styles.italic,
      underline && !strike && styles.underline,
      strike && !underline && styles.strike,
      underline && strike && styles.underlineStrike,
      marks.includes("spoiler") && styles.spoiler,
      marks.includes("image") && styles.image,
    ]
  }

  return (
    <div
      onDragLeave={() => {
        setDragging(false)
      }}
      onDragOver={(event: DragEvent<HTMLDivElement>) => {
        if (onFiles !== undefined && event.dataTransfer.types.includes("Files")) {
          event.preventDefault()
          setDragging(true)
        }
      }}
      onDrop={(event: DragEvent<HTMLDivElement>) => {
        setDragging(false)

        const files = imageFiles(event.dataTransfer.files)

        if (onFiles !== undefined && files.length > 0) {
          event.preventDefault()
          onFiles(files)
        }
      }}
      sx={[
        styles.frame,
        props.disabled === true && styles.frameDisabled,
        dragging && styles.frameDragging,
      ]}
    >
      <div aria-label={m.rich_text_toolbar()} role="toolbar" sx={styles.toolbar}>
        {FORMATS.map((format) => (
          <Tooltip key={format.mark}>
            <TooltipTrigger
              delay={300}
              render={
                <Button
                  aria-label={format.label()}
                  disabled={props.disabled}
                  onClick={() => {
                    toggle(format.token)
                  }}
                  onMouseDown={(event) => {
                    event.preventDefault()
                  }}
                  size="icon-sm"
                  variant="ghost"
                />
              }
            >
              <format.icon />
            </TooltipTrigger>
            <TooltipPopup>
              {format.label()}{" "}
              {format.shortcut === null ? null : (
                <ShortcutHint shift={format.shortcut.shift} shortcut={format.shortcut.key} />
              )}
            </TooltipPopup>
          </Tooltip>
        ))}
        <Tooltip>
          <TooltipTrigger
            delay={300}
            render={
              <Button
                aria-label={m.rich_text_link()}
                disabled={props.disabled}
                onClick={insertLink}
                onMouseDown={(event) => {
                  event.preventDefault()
                }}
                size="icon-sm"
                variant="ghost"
              />
            }
          >
            <Link />
          </TooltipTrigger>
          <TooltipPopup>{m.rich_text_link()}</TooltipPopup>
        </Tooltip>
        {toolbarEnd === undefined ? null : <div sx={styles.toolbarEnd}>{toolbarEnd}</div>}
      </div>
      <div
        sx={[
          styles.field,
          props["aria-invalid"] !== undefined &&
            props["aria-invalid"] !== false &&
            styles.fieldInvalid,
        ]}
      >
        <div aria-hidden sx={[styles.surface, styles.mirror]}>
          {segments.map((segment) => (
            <span
              key={segment.start}
              sx={[...markStyle(segment.marks), segment.syntax && styles.syntax]}
            >
              {text.slice(segment.start, segment.end)}
            </span>
          ))}{" "}
        </div>
        <FieldPrimitive.Control
          ref={setRef}
          defaultValue={defaultValue}
          disabled={props.disabled}
          id={props.id}
          name={props.name}
          render={(defaultProps: ComponentProps<"textarea">) => (
            <textarea
              {...mergeProps(defaultProps, props, {
                onChange: (event: ChangeEvent<HTMLTextAreaElement>) => {
                  setUncontrolled(event.target.value)
                  onChange?.(event)
                },
                onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => {
                  onKeyDown?.(event)

                  const format = FORMATS.find(
                    (candidate) =>
                      candidate.shortcut !== null &&
                      (event.metaKey || event.ctrlKey) &&
                      !event.altKey &&
                      event.shiftKey === candidate.shortcut.shift &&
                      event.key.toLowerCase() === candidate.shortcut.key,
                  )

                  if (format !== undefined && !event.defaultPrevented) {
                    event.preventDefault()
                    toggle(format.token)
                  }
                },
                onPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => {
                  const files = imageFiles(event.clipboardData.files)

                  if (onFiles !== undefined && files.length > 0) {
                    event.preventDefault()
                    onFiles(files)

                    return
                  }

                  const textarea = event.currentTarget
                  const pasted = event.clipboardData.getData("text/plain").trim()
                  const { selectionStart: start, selectionEnd: end, value: current } = textarea
                  const selected = current.slice(start, end)

                  if (selected.trim() === "" || selected.includes("\n") || !URL_ONLY.test(pasted)) {
                    return
                  }

                  event.preventDefault()

                  const link = `[${selected}](${pasted})`

                  replaceRange(textarea, start, end, link, [
                    start + link.length,
                    start + link.length,
                  ])
                },
              })}
              {...stylex.props(styles.surface, styles.textarea)}
              data-slot="textarea"
              rows={rows}
              value={value}
            />
          )}
          value={value}
        />
      </div>
    </div>
  )
}

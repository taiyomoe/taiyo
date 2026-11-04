import type { AuditLogField } from "@taiyomoe/audit/query"
import type { ChangeEvent, KeyboardEvent, SyntheticEvent } from "react"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { auditLogSuggestionsQueryOptions } from "@/features/activity-log/api/audit-logs"
import { describeField, describeOperator } from "@/features/activity-log/components/fields"
import { useDebounced } from "@/features/activity-log/hooks/use-debounced"
import {
  getKqlContext,
  getOperatorSuggestions,
  getTermSuggestions,
  getValueSuggestions,
  type KqlSuggestion,
} from "@/features/activity-log/lib/kql-suggestions"
import { m } from "@/paraglide/messages"

export const useKqlInput = ({
  value,
  onChange,
  onSubmit,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const listId = useId()
  const errorId = useId()
  const [cursor, setCursor] = useState(value.length)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const context = useMemo(() => getKqlContext(value, cursor), [value, cursor])
  const remoteField: AuditLogField | null =
    context.kind === "value" && context.field.values === undefined && context.field.suggest === true
      ? context.field
      : null
  const remotePrefix = useDebounced(context.kind === "value" ? context.prefix : "", 150)
  const remote = useQuery({
    ...auditLogSuggestionsQueryOptions(remoteField?.name ?? "", remotePrefix),
    enabled: open && remoteField !== null,
  })
  const suggestions = useMemo(() => {
    switch (context.kind) {
      case "term": {
        return getTermSuggestions(context, describeField) satisfies KqlSuggestion[]
      }

      case "operator": {
        return getOperatorSuggestions(context, describeOperator) satisfies KqlSuggestion[]
      }

      case "value": {
        const values =
          context.field.values?.map((option) => ({ value: option, label: null, image: null })) ??
          (remoteField === null ? [] : (remote.data ?? []))

        return getValueSuggestions(
          context,
          values,
          m.activity_any_value(),
        ) satisfies KqlSuggestion[]
      }

      case "none":

      default: {
        return [] satisfies KqlSuggestion[]
      }
    }
  }, [context, remote.data, remoteField])
  const showSuggestions = open && suggestions.length > 0

  useEffect(() => {
    if (active >= 0) {
      document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" })
    }
  }, [active, listId])

  const apply = (suggestion: KqlSuggestion) => {
    const next = `${value.slice(0, suggestion.start)}${suggestion.insert}${value.slice(suggestion.end)}`
    const position = suggestion.start + suggestion.insert.length

    onChange(next)
    setCursor(position)
    setActive(-1)
    setOpen(true)
    requestAnimationFrame(() => {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(position, position)
    })
  }
  const handleBlur = () => {
    setOpen(false)
    setActive(-1)
  }
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.currentTarget.value.replaceAll("\n", " "))
    setCursor(event.currentTarget.selectionStart)
    setOpen(true)
    setActive(-1)
  }
  const handleFocus = () => {
    setOpen(true)
  }
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const count = suggestions.length

    if (event.key === "ArrowDown" && showSuggestions) {
      event.preventDefault()
      setActive((current) => (current + 1) % count)
    } else if (event.key === "ArrowUp" && showSuggestions) {
      event.preventDefault()
      setActive((current) => (current <= 0 ? count - 1 : current - 1))
    } else if (event.key === "Enter") {
      event.preventDefault()

      const suggestion = suggestions[active]

      if (showSuggestions && suggestion !== undefined) {
        apply(suggestion)
      } else {
        setOpen(false)
        onSubmit(value)
      }
    } else if (event.key === "Tab" && showSuggestions && !event.shiftKey) {
      const suggestion = suggestions[Math.max(active, 0)]

      if (suggestion !== undefined) {
        event.preventDefault()
        apply(suggestion)
      }
    } else if (event.key === "Escape" && showSuggestions) {
      event.preventDefault()
      setOpen(false)
    }
  }
  const handleSelect = (event: SyntheticEvent<HTMLTextAreaElement>) => {
    setCursor(event.currentTarget.selectionStart)
  }

  return {
    textareaRef,
    listId,
    errorId,
    active,
    setActive,
    suggestions,
    showSuggestions,
    apply,
    handleBlur,
    handleChange,
    handleFocus,
    handleKeyDown,
    handleSelect,
  }
}

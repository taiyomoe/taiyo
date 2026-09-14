"use client"

import {
  Alert02Icon,
  AlertCircleIcon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  CornerDownLeftIcon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Loading03Icon,
  MinusSignIcon,
  MoreHorizontalIcon,
  PlusSignIcon,
  Search01Icon,
  SidebarLeft01Icon,
  Tick02Icon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import type * as React from "react"

/**
 * The icon set. Hugeicons is the only icon dependency: components import a
 * semantic name from here rather than reaching for the icon library, so the
 * set can be swapped or a glyph re-mapped in one place.
 *
 * Hugeicons strokes at 1.5 by default (lucide used 2), which is what gives the
 * lighter, more precise line the design language is after.
 */
export type IconProps = Omit<React.ComponentProps<typeof HugeiconsIcon>, "icon">

function icon(glyph: IconSvgElement): (props: IconProps) => React.ReactElement {
  return function Icon(props: IconProps): React.ReactElement {
    return <HugeiconsIcon icon={glyph} {...props} />
  }
}

export const ChevronDown: (props: IconProps) => React.ReactElement = icon(ArrowDown01Icon)

export const ChevronUp: (props: IconProps) => React.ReactElement = icon(ArrowUp01Icon)

export const ChevronLeft: (props: IconProps) => React.ReactElement = icon(ArrowLeft01Icon)

export const ChevronRight: (props: IconProps) => React.ReactElement = icon(ArrowRight01Icon)

/** The up/down pair a select or combobox trigger shows. */
export const ChevronsUpDown: (props: IconProps) => React.ReactElement = icon(UnfoldMoreIcon)

export const Close: (props: IconProps) => React.ReactElement = icon(Cancel01Icon)

export const Search: (props: IconProps) => React.ReactElement = icon(Search01Icon)

export const Plus: (props: IconProps) => React.ReactElement = icon(PlusSignIcon)

export const Minus: (props: IconProps) => React.ReactElement = icon(MinusSignIcon)

export const Ellipsis: (props: IconProps) => React.ReactElement = icon(MoreHorizontalIcon)

export const PanelLeft: (props: IconProps) => React.ReactElement = icon(SidebarLeft01Icon)

export const Check: (props: IconProps) => React.ReactElement = icon(Tick02Icon)

/** The return-key symbol used in keyboard hints. */
export const Enter: (props: IconProps) => React.ReactElement = icon(CornerDownLeftIcon)

export const Spinner: (props: IconProps) => React.ReactElement = icon(Loading03Icon)

export const AlertCircle: (props: IconProps) => React.ReactElement = icon(AlertCircleIcon)

export const AlertTriangle: (props: IconProps) => React.ReactElement = icon(Alert02Icon)

export const CheckCircle: (props: IconProps) => React.ReactElement = icon(CheckmarkCircle02Icon)

export const Info: (props: IconProps) => React.ReactElement = icon(InformationCircleIcon)

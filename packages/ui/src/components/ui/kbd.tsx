import * as stylex from "@stylexjs/stylex"
import * as React from "react"
import type { Sx } from "../../styles/sx"
import { colors, font, radius } from "../../styles/tokens.stylex"
import { cn } from "../../utils/cn"

const KbdSurfaceContext = React.createContext(false)

export function KbdSurface({ children }: { children: React.ReactNode }): React.ReactElement {
  return <KbdSurfaceContext value={true}>{children}</KbdSurfaceContext>
}

const styles = stylex.create({
  surface: {
    borderColor: colors.keycapBorder,
    borderRadius: radius.sm,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.25rem",
    paddingInline: "0.375rem",
    alignItems: "center",
    backgroundColor: colors.keycap,
    color: colors.mutedForeground,
    display: "inline-flex",
    fontFamily: font.sans,
    fontSize: "0.75rem",
    fontWeight: 500,
    justifyContent: "center",
    lineHeight: "1rem",
    pointerEvents: "none",
    userSelect: "none",
    height: "1.375rem",
    minWidth: "1.375rem",
  },
  glyph: {
    backgroundColor: "transparent",
    color: "inherit",
    display: "inline-flex",
    fontFamily: "inherit",
    fontSize: "inherit",
    fontWeight: "inherit",
    lineHeight: "inherit",
  },
})

export type KbdProps = React.ComponentProps<"kbd"> & {
  sx?: Sx
}

export function Kbd({ className, sx, ...props }: KbdProps): React.ReactElement {
  const onSurface = React.useContext(KbdSurfaceContext)
  const styleProps = stylex.props(onSurface ? styles.glyph : styles.surface, sx)

  return (
    <kbd
      className={cn(styleProps.className, className)}
      data-slot="kbd"
      style={styleProps.style}
      {...props}
    />
  )
}

export function KbdGroup({ className, children, sx, ...props }: KbdProps): React.ReactElement {
  const styleProps = stylex.props(styles.surface, sx)

  return (
    <kbd
      className={cn(styleProps.className, className)}
      data-slot="kbd-group"
      style={styleProps.style}
      {...props}
    >
      <KbdSurface>{children}</KbdSurface>
    </kbd>
  )
}

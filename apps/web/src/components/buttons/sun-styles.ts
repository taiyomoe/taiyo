import * as stylex from "@stylexjs/stylex"
import { font, radius, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { scene } from "@/components/scene/scene.stylex"

export const sunStyles = stylex.create({
  base: {
    borderRadius: radius.full,
    borderStyle: "none",
    overflow: "hidden",
    backgroundImage: `linear-gradient(95deg, ${scene.brand} 0%, #ff8a3d 50%, ${scene.gold} 100%)`,
    boxShadow: {
      default: `0 6px 18px color-mix(in srgb, ${scene.brand} 32%, transparent)`,
      ":disabled": `0 6px 18px color-mix(in srgb, ${scene.brand} 32%, transparent)`,
      ":hover": `0 10px 30px color-mix(in srgb, ${scene.brand} 50%, transparent)`,
    },
    color: scene.ink,
    cursor: { default: "pointer", ":disabled": "not-allowed" },
    fontFamily: font.sans,
    fontWeight: 800,
    opacity: { default: 1, ":disabled": 0.7 },
    position: "relative",
    transform: { default: null, ":active": "scale(0.98)" },
    transitionDuration: "200ms",
    transitionProperty: "transform, box-shadow",
    whiteSpace: "nowrap",
  },
  md: {
    paddingInline: "1.5rem",
    fontSize: text.base,
    height: "3.375rem",
  },
  lg: {
    paddingInline: "2.125rem",
    fontSize: text.lg,
    height: "3.625rem",
  },
  block: {
    width: "100%",
  },
})

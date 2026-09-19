import * as stylex from "@stylexjs/stylex"

import { scene } from "@/components/scene/scene.stylex"

export const authFormStyles = stylex.create({
  stack: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
  fields: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
  },
  link: {
    color: scene.goldLight,
    fontWeight: 700,
    textDecorationLine: { default: "none", ":hover": "underline" },
  },
  linkNoWrap: {
    fontSize: "0.875rem",
    whiteSpace: "nowrap",
  },
  footer: {
    color: `color-mix(in srgb, ${scene.paper} 55%, transparent)`,
    fontSize: "0.875rem",
    textAlign: "center",
    marginTop: "1.5rem",
  },
  submit: {
    marginTop: "0.5rem",
  },
  confirmation: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
  },
  confirmationBadge: {
    borderRadius: "9999px",
    alignItems: "center",
    backgroundColor: `color-mix(in srgb, ${scene.gold} 10%, transparent)`,
    color: scene.gold,
    display: "flex",
    justifyContent: "center",
    height: "3rem",
    width: "3rem",
  },
  confirmationIcon: {
    height: "1.5rem",
    width: "1.5rem",
  },
  confirmationText: {
    color: `color-mix(in srgb, ${scene.paper} 60%, transparent)`,
    fontSize: "0.875rem",
  },
  confirmationAction: {
    height: "3rem",
    width: "100%",
  },
  captchaGroup: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
    marginTop: "0.5rem",
  },
})

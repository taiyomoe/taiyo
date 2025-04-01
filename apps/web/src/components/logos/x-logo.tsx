"use client"

import type { SVGProps } from "react"
import { type VariantProps, tv } from "tailwind-variants"

const xLogo = tv({
  base: "[&_path]:transition",
  variants: {
    color: {
      default: "",
      white: "[&_path]:fill-white",
      inverted: "[&_path]:fill-inverted",
    },
    shadow: {
      true: "[filter:drop-shadow(2px_2px_2px_rgba(0,0,0,.4))]",
      false: "",
    },
  },
  defaultVariants: {
    color: "default",
    shadow: true,
  },
})

type Props = SVGProps<SVGSVGElement> & VariantProps<typeof xLogo>

export const XLogo = ({ className, color, ...props }: Props) => (
  <svg
    className={xLogo({ className, color })}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 49.8 45"
    xmlSpace="preserve"
    {...props}
  >
    <title>X logo</title>
    <path
      d="M39.2 0h7.6L30.2 19.1 49.8 45H34.4l-12-15.7L8.6 45H1l17.8-20.4L0 0h15.8l10.9 14.4zm-2.7 40.4h4.2L13.5 4.3H8.9z"
      fill="black"
    />
  </svg>
)

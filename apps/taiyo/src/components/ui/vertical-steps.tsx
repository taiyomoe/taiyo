"use client"

import type { ButtonProps } from "@nextui-org/button"
import { Spinner } from "@nextui-org/spinner"
import { useControlledState } from "@react-stately/utils"
import { LazyMotion, domAnimation, m } from "framer-motion"
import { PlusIcon } from "lucide-react"
import type { ComponentProps } from "react"
import React from "react"
import { cn } from "~/lib/utils/cn"

type StepProps = {
  className?: string
  description?: React.ReactNode
  title?: React.ReactNode
  shouldLoad?: boolean
  hasError?: boolean
}

type Props = React.HTMLAttributes<HTMLButtonElement> & {
  /**
   * An array of steps.
   *
   * @default []
   */
  steps?: StepProps[]
  /**
   * The color of the steps.
   *
   * @default "primary"
   */
  color?: ButtonProps["color"]
  /**
   * The current step index.
   */
  currentStep?: number
  /**
   * The default step index.
   *
   * @default 0
   */
  defaultStep?: number
  /**
   * The custom class for the steps wrapper.
   */
  className?: string
  /**
   * The custom class for the step.
   */
  stepClassName?: string
  /**
   * Callback function when the step index changes.
   */
  onStepChange?: (stepIndex: number) => void
}

function CheckIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <title>Check</title>
      <m.path
        animate={{ pathLength: 1 }}
        d="M5 13l4 4L19 7"
        initial={{ pathLength: 0 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        transition={{
          delay: 0.2,
          type: "tween",
          ease: "easeOut",
          duration: 0.3,
        }}
      />
    </svg>
  )
}

const VerticalSteps = React.forwardRef<HTMLButtonElement, Props>(
  (
    {
      color = "primary",
      steps = [],
      defaultStep = 0,
      onStepChange,
      currentStep: currentStepProp,
      stepClassName,
      className,
      ...props
    },
    ref,
  ) => {
    const [currentStep] = useControlledState(
      currentStepProp,
      defaultStep,
      onStepChange,
    )

    const colors = React.useMemo(() => {
      let userColor: string
      let fgColor: string

      const colorsVars = [
        "[--active-fg-color:var(--step-fg-color)]",
        "[--active-border-color:var(--step-color)]",
        "[--active-color:var(--step-color)]",
        "[--complete-background-color:var(--step-color)]",
        "[--complete-border-color:var(--step-color)]",
        "[--inactive-border-color:hsl(var(--nextui-default-300))]",
        "[--inactive-color:hsl(var(--nextui-default-300))]",
        "[--error-border-color:hsl(var(--nextui-danger))]",
        "[--error-color:hsl(var(--nextui-danger))]",
      ]

      switch (color) {
        case "primary":
          userColor = "[--step-color:hsl(var(--nextui-primary))]"
          fgColor = "[--step-fg-color:hsl(var(--nextui-primary-foreground))]"
          break
        case "secondary":
          userColor = "[--step-color:hsl(var(--nextui-secondary))]"
          fgColor = "[--step-fg-color:hsl(var(--nextui-secondary-foreground))]"
          break
        case "success":
          userColor = "[--step-color:hsl(var(--nextui-success))]"
          fgColor = "[--step-fg-color:hsl(var(--nextui-success-foreground))]"
          break
        case "warning":
          userColor = "[--step-color:hsl(var(--nextui-warning))]"
          fgColor = "[--step-fg-color:hsl(var(--nextui-warning-foreground))]"
          break
        case "danger":
          userColor = "[--step-color:hsl(var(--nextui-error))]"
          fgColor = "[--step-fg-color:hsl(var(--nextui-error-foreground))]"
          break
        case "default":
          userColor = "[--step-color:hsl(var(--nextui-default))]"
          fgColor = "[--step-fg-color:hsl(var(--nextui-default-foreground))]"
          break
        default:
          userColor = "[--step-color:hsl(var(--nextui-primary))]"
          fgColor = "[--step-fg-color:hsl(var(--nextui-primary-foreground))]"
          break
      }

      if (!className?.includes("--step-fg-color")) colorsVars.unshift(fgColor)
      if (!className?.includes("--step-color")) colorsVars.unshift(userColor)
      if (!className?.includes("--inactive-bar-color"))
        colorsVars.push("[--inactive-bar-color:hsl(var(--nextui-default-300))]")

      return colorsVars
    }, [color, className])

    return (
      <nav aria-label="Progress">
        <ol className={cn("flex flex-col gap-y-8", colors, className)}>
          {steps?.map((step, stepIdx) => {
            const shouldLoad = step.shouldLoad ?? true
            const hasError = step.hasError ?? false
            const status = hasError
              ? "error"
              : currentStep === stepIdx && shouldLoad
                ? "active"
                : currentStep < stepIdx
                  ? "inactive"
                  : "complete"

            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: should be fine
              <li key={stepIdx} className="relative">
                <div className="flex w-full max-w-full items-center">
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: should be fine
                    key={stepIdx}
                    ref={ref}
                    aria-current={status === "active" ? "step" : undefined}
                    className={cn(
                      "flex w-full items-start justify-center gap-4 rounded-large",
                      stepClassName,
                    )}
                    {...props}
                  >
                    <div className="flex h-full">
                      <LazyMotion features={domAnimation}>
                        <div className="relative">
                          <m.div
                            animate={status}
                            className={cn(
                              "relative flex h-[34px] w-[34px] items-center justify-center rounded-full border-medium font-semibold text-default-foreground text-large",
                              { "shadow-lg": status === "complete" },
                            )}
                            data-status={status}
                            initial={false}
                            transition={{ duration: 0.25 }}
                            variants={{
                              inactive: {
                                backgroundColor: "transparent",
                                borderColor: "var(--inactive-border-color)",
                                color: "var(--inactive-color)",
                              },
                              active: {
                                backgroundColor: "transparent",
                                borderColor: "var(--active-border-color)",
                                color: "var(--active-color)",
                              },
                              complete: {
                                backgroundColor:
                                  "var(--complete-background-color)",
                                borderColor: "var(--complete-border-color)",
                              },
                              error: {
                                backgroundColor: "transparent",
                                borderColor: "var(--error-border-color)",
                                color: "var(--error-color)",
                              },
                            }}
                          >
                            <div className="flex items-center justify-center">
                              {status === "error" && (
                                <PlusIcon className="h-6 w-6 rotate-45 text-[var(--error-color)]" />
                              )}
                              {status === "active" && (
                                <Spinner size="sm" color="warning" />
                              )}
                              {status === "complete" && (
                                <CheckIcon className="h-6 w-6 text-[var(--active-fg-color)]" />
                              )}
                              {((status === "active" && !shouldLoad) ||
                                status === "inactive") && (
                                <span>{stepIdx + 1}</span>
                              )}
                            </div>
                          </m.div>
                        </div>
                      </LazyMotion>
                      {stepIdx < steps.length - 1 && (
                        <div
                          aria-hidden="true"
                          className={cn(
                            "pointer-events-none absolute top-10 left-3 flex h-[calc(100%-14px)] items-center px-1",
                          )}
                        >
                          <div
                            className={cn(
                              "relative h-full w-0.5 bg-[var(--inactive-bar-color)] transition-colors duration-300",
                              "after:absolute after:block after:h-0 after:w-full after:bg-[var(--active-border-color)] after:transition-[height] after:duration-300 after:content-['']",
                              { "after:h-full": stepIdx < currentStep },
                            )}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex grow flex-col gap-4 text-left">
                      <div
                        className="font-semibold text-2xl text-default-foreground transition-[color] duration-300 data-[status=error]:text-[var(--error-color)] data-[status=inactive]:text-default-500"
                        data-status={status}
                      >
                        {step.title}
                      </div>
                      <div
                        className={cn(
                          "space-y-1 text-default-600 transition-[color] duration-300",
                          { "text-default-500": status === "inactive" },
                        )}
                      >
                        {step.description}
                      </div>
                    </div>
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      </nav>
    )
  },
)

VerticalSteps.displayName = "VerticalSteps"

export default VerticalSteps

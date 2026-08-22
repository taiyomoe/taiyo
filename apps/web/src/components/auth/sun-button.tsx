import { Spinner } from "@taiyomoe/ui/components/ui/spinner"
import { cn } from "@taiyomoe/ui/utils/cn"
import type { ComponentProps } from "react"

type SunButtonProps = ComponentProps<"button"> & {
  loading?: boolean
}

// The signature gradient CTA with an animated sheen. Custom (not a coss Button
// variant) because of the gradient fill + sheen overlay.
export const SunButton = ({
  className,
  children,
  loading = false,
  disabled,
  type = "button",
  ...props
}: SunButtonProps) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={cn(
      "group relative h-13.5 w-full cursor-pointer overflow-hidden rounded-full font-sans text-base font-extrabold text-[#2a1208]",
      "shadow-[0_6px_18px_rgba(242,69,45,0.32)] transition-[transform,box-shadow] duration-200",
      "hover:shadow-[0_10px_30px_rgba(242,69,45,0.5)] active:scale-[0.98]",
      "disabled:cursor-not-allowed disabled:opacity-70 hover:disabled:shadow-[0_6px_18px_rgba(242,69,45,0.32)] active:disabled:scale-100",
      className,
    )}
    style={{ backgroundImage: "linear-gradient(95deg,#F2452D 0%,#FF8A3D 50%,#FFB820 100%)" }}
    {...props}
  >
    <span className={cn("relative z-2 inline-flex items-center gap-2", loading && "opacity-0")}>
      {children}
    </span>
    {loading ? (
      <span className="absolute inset-0 z-2 inline-flex items-center justify-center">
        <Spinner className="text-[#2a1208]" />
      </span>
    ) : null}
    {/* A thin diagonal glint that sweeps fully across, then rests off-screen.
        Anchored at left-0 so the translate (relative to its own width) clears the
        whole button; `backwards` keeps it off-screen before the first sweep. */}
    <span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0 z-1 w-1/3"
      style={{
        background: "linear-gradient(90deg, transparent, rgba(255,249,236,0.55), transparent)",
        animation: "auth-sheen 5s ease-in-out infinite backwards",
      }}
    />
  </button>
)

"use client"

import { useTranslations } from "next-intl"
import { Button, type ButtonProps } from "react-aria-components"
import { GoogleLogo } from "~/components/logos/google-logo"

export const GoogleButton = (props: ButtonProps) => {
  const t = useTranslations("auth")

  return (
    <Button
      className="group flex h-9 w-full items-center justify-center gap-3 rounded bg-white pressed:bg-white/70 px-4 py-2 font-medium pressed:text-black/70 text-black transition hover:bg-white/80 pressed:[&_path]:opacity-70 hover:[&_path]:opacity-80"
      {...props}
    >
      <GoogleLogo className="size-5" />
      {t("google")}
    </Button>
  )
}

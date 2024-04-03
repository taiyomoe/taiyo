"use client"

import { Button } from "@nextui-org/button"
import { signIn } from "next-auth/react"
import { CompanyLogo } from "~/components/ui/CompanyLogo"

export const GoogleButton = () => {
  return (
    <Button
      className="w-full bg-google font-medium text-google-foreground text-medium hover:bg-google/80"
      startContent={<CompanyLogo company="google" height={28} />}
      onClick={() => signIn("google")}
      radius="full"
      isDisabled
    >
      <p className="w-full">Google</p>
    </Button>
  )
}

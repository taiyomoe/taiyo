"use client"

import { authClient } from "@taiyomoe/auth/client"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"

export const SignOutButton = () => {
  const handlePress = async () => {
    await authClient.signOut()
    toast.success("Signed out successfully")
  }

  return (
    <Button className="w-fit" onPress={handlePress}>
      Sign out
    </Button>
  )
}

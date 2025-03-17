"use client"

import { authClient } from "@taiyomoe/auth/client"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { useAuth } from "~/stores/auth.store"

export const SignOutButton = () => {
  const authStore = useAuth()

  const handlePress = async () => {
    await authClient.signOut()
    authStore.signOut()
    toast.success("Signed out successfully")
  }

  return (
    <div>
      <p>This is a client component</p>
      <p className="whitespace-pre-wrap">
        {JSON.stringify(authStore.user, null, 4)}
      </p>
      <Button className="w-fit" onPress={handlePress}>
        Sign out
      </Button>
    </div>
  )
}

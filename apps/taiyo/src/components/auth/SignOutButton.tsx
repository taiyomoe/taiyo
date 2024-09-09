"use client"

import { Button } from "@nextui-org/button"
import { signOut } from "@taiyomoe/auth/client"

export const SignOutButton = () => {
  return (
    <Button
      className="min-w-[220px] font-medium text-medium"
      variant="flat"
      color="danger"
      onClick={() => signOut()}
    >
      <p>Sair</p>
    </Button>
  )
}

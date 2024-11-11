import { Button } from "@nextui-org/button"
import { signOut } from "@taiyomoe/auth"

export const SignOutButton = () => (
  <Button
    className="min-w-[220px] font-medium text-medium"
    variant="flat"
    color="danger"
    onClick={() => signOut()}
  >
    Sair
  </Button>
)

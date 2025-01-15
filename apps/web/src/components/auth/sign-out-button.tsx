import { Button } from "@nextui-org/button"
import { authClient } from "@taiyomoe/auth/client"

export const SignOutButton = () => (
  <Button
    className="min-w-[220px] font-medium text-medium"
    variant="flat"
    color="danger"
    onPress={() => authClient.signOut()}
  >
    Sair
  </Button>
)

import { Button } from "@nextui-org/button"
import { Card, CardBody } from "@nextui-org/card"
import { Input } from "@nextui-org/input"
import { DiscordButton } from "./DiscordButton"
import { GoogleButton } from "./GoogleButton"

export const AuthCard = () => {
  return (
    <Card className="mx-4 w-full max-w-[500px]">
      <CardBody className="w-full gap-8">
        <div className="flex flex-col gap-2">
          <Input placeholder="Email" isDisabled variant="bordered" />
          <Input placeholder="Senha" isDisabled variant="bordered" />
          <Button className="mt-2" isDisabled>
            Logar
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="relative">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-content1-foreground/20" />
            </div>
            <div className="relative flex justify-center text-sm font-medium leading-6">
              <span className="select-none bg-content1 px-6 text-content1-foreground/40">
                Ou continue com
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DiscordButton />
            <GoogleButton />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

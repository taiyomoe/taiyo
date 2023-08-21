import { Input } from "~/components/ui/Input";
import { DiscordLogin } from "./DiscordLogin";

export const AuthCard = () => {
  return (
    <div className="bg-background-accent flex max-w-md flex-col gap-8 rounded-md p-4">
      <div className="flex flex-col gap-2">
        <Input type="text" placeholder="Nome de usuário" disabled />
        <Input type="text" placeholder="Senha" disabled />
      </div>
      <div className="flex flex-col gap-4">
        <div className="relative">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-muted-foreground/20" />
          </div>
          <div className="relative flex justify-center text-sm font-medium leading-6">
            <span className="bg-background-accent select-none px-6 text-muted-foreground/40">
              Ou continue com
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <DiscordLogin />
        </div>
      </div>
    </div>
  );
};

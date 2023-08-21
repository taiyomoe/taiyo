import { Skeleton } from "~/components/ui/Skeleton";
import { DiscordButton } from "./DiscordButton";
import { GoogleButton } from "./GoogleButton";

export const AuthCard = () => {
  return (
    <div className="flex w-5/6 flex-col gap-8 rounded-md bg-card p-4 sm:mx-0 sm:w-1/2">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="relative">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-card-foreground/20" />
          </div>
          <div className="relative flex justify-center text-sm font-medium leading-6">
            <span className="select-none bg-card px-6 text-card-foreground/40">
              Ou continue com
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DiscordButton />
          <GoogleButton disabled />
        </div>
      </div>
    </div>
  );
};

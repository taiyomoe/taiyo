import { Skeleton } from "~/components/ui/Skeleton";
import { DiscordButton } from "./DiscordButton";
import { GoogleButton } from "./GoogleButton";

export const AuthCard = () => {
  return (
    <div className="flex w-full max-w-[500px] flex-col gap-8 rounded-t-lg bg-card p-4 shadow-md sm:mx-0 sm:w-auto sm:min-w-[400px] sm:rounded-b-lg">
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

import { Skeleton } from "@nextui-org/skeleton";

import { DiscordButton } from "./DiscordButton";
import { GoogleButton } from "./GoogleButton";

export const AuthCard = () => {
  return (
    <div className="bg-content1 flex w-full max-w-[500px] flex-col gap-8 rounded-t-lg p-4 shadow-md sm:mx-0 sm:w-auto sm:min-w-[400px] sm:rounded-b-lg">
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
            <div className="border-content1-foreground/20 w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm font-medium leading-6">
            <span className="bg-content1 text-content1-foreground/40 select-none px-6">
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

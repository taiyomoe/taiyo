import Link from "next/link";
import { Button } from "@nextui-org/react";
import { FileEditIcon } from "lucide-react";

import { AddToUserLibraryButton } from "~/components/library/AddToUserLibraryButton";
import { SignedIn } from "~/components/utils/SignedIn";
import type { MediaLimited } from "~/lib/types";

type Props = {
  media: MediaLimited;
};

export const MediaLayoutActions = ({ media }: Props) => {
  return (
    <div className="flex h-28 flex-col justify-end gap-2 py-3 xl:h-36">
      <p className="line-clamp-1 pb-1 text-center text-2xl font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] md:text-left md:text-4xl xl:text-5xl">
        {media.mainTitle}
      </p>
      <div className="flex gap-4">
        <AddToUserLibraryButton media={media} />
        <SignedIn requiredPermissions={["medias:update:any"]}>
          <Button
            as={Link}
            href={`/dashboard/medias/edit/${media.id}`}
            startContent={<FileEditIcon className="h-6 w-6" />}
            color="warning"
            radius="sm"
            isIconOnly
          />
        </SignedIn>
      </div>
    </div>
  );
};

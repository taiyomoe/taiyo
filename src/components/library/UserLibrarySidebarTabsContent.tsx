import { useEffect } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { Image } from "@nextui-org/image";
import { Spinner } from "@nextui-org/react";
import { useSession } from "next-auth/react";

import { UserLibrarySidebarDeleteButton } from "~/components/library/UserLibrarySidebarDeleteButton";
import { UserLibrarySidebarStatusSelect } from "~/components/library/UserLibrarySidebarStatusSelect";
import { api } from "~/lib/trpc/client";
import type { UserLibraryStatus } from "~/lib/types";
import { MediaUtils } from "~/lib/utils/media.utils";
import { useLibraryStore } from "~/stores";

type Props = {
  status: UserLibraryStatus;
};

export const UserLibrarySidebarTabsContent = ({ status }: Props) => {
  const { populate } = useLibraryStore();
  const { data: session } = useSession();
  const { data, isLoading } = api.libary.getLibrary.useQuery(
    {
      status,
      userId: session!.user.id,
    },
    { refetchOnMount: false },
  );

  useEffect(() => {
    if (data) {
      populate(status, data);
    }
  }, [data, populate, status]);

  if (isLoading || !data) {
    return (
      <div className="mt-8 flex w-full justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {data.map((media) => (
        <div key={media.id} className="relative flex h-[80px] gap-2">
          <Image
            as={NextImage}
            src={MediaUtils.getCoverUrl(media)}
            className="object-fit h-full min-w-[60px] rounded-small"
            width={60}
            height={80}
            alt="media's cover"
          />
          <div className="flex grow flex-col justify-between gap-1">
            <Link
              className="line-clamp-1 text-lg font-medium hover:underline"
              href={MediaUtils.getUrl(media)}
            >
              {media.mainTitle}
            </Link>
            <div className="flex justify-between gap-1">
              <UserLibrarySidebarStatusSelect status={status} media={media} />
              <UserLibrarySidebarDeleteButton media={media} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

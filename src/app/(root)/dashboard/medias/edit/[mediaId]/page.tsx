import { notFound } from "next/navigation";

import { db } from "~/lib/server/db";

import { EditMediaTabs } from "./_components/EditMediaTabs";

type Props = {
  params: { mediaId: string };
};

export default async function Page({ params }: Props) {
  const media = await db.media.findFirst({
    include: {
      covers: { where: { deletedAt: null } },
      banners: { where: { deletedAt: null } },
      titles: { where: { deletedAt: null } },
      trackers: { where: { deletedAt: null } },
      creator: true,
    },
    where: { id: params.mediaId, deletedAt: null },
  });

  if (!media) {
    return notFound();
  }

  return <EditMediaTabs media={media} />;
}

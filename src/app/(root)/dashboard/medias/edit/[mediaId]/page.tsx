import { notFound } from "next/navigation";
import { Tab, Tabs } from "@nextui-org/tabs";

import { EditMediaTabs } from "~/app/(root)/dashboard/medias/edit/[mediaId]/_components/EditMediaTabs";
import { db } from "~/lib/server/db";

import { EditMediaInfoTab } from "./_components/tabs/EditMediaInfoTab";
import { EditMediaStatsTab } from "./_components/tabs/EditMediaStatsTab";

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

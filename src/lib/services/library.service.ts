import { db } from "~/lib/server/db";
import type { UserLibraryStatus } from "~/lib/types";
import { LibraryUtils } from "~/lib/utils/library.utils";

const getUserLibrary = async (userId: string | undefined) => {
  if (!userId) return null;

  const userLibrary = await db.userLibrary.findFirst({
    where: {
      userId: userId,
    },
  });

  if (!userLibrary) return null;

  return userLibrary;
};

const getUserLibraryMedia = async (
  userId: string | undefined,
  mediaId: string,
) => {
  const userLibrary = await getUserLibrary(userId);

  if (!userLibrary) return null;

  const statusKeys = LibraryUtils.getStatuses(userLibrary);

  for (const [status, libraryEntries] of Object.entries(statusKeys)) {
    const media = libraryEntries.find((entry) => entry.mediaId === mediaId);
    if (media) return { ...media, status: status as UserLibraryStatus };
  }

  return null;
};

export const LibraryService = {
  getUserLibrary,
  getUserLibraryMedia,
};

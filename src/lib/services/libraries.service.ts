import { db } from "~/lib/server/db";
import type { MediaLibraryStatus } from "~/lib/types";
import { LibraryUtils } from "~/lib/utils/library.utils";

const getUserLibrary = async (userId: string | undefined) => {
  if (!userId) return null;

  const userLibrary = await db.userLibrary.findFirst({
    where: {
      userId: userId,
    },
  });

  if (!userLibrary) {
    throw new Error(`User ${userId} has no library. This should not happen.`);
  }

  return userLibrary;
};

const getMediaStatusFromUserLibrary = async (
  userId: string | undefined,
  mediaId: string,
) => {
  const userLibrary = await getUserLibrary(userId);

  if (!userLibrary) return null;

  const statusKeys = LibraryUtils.getStatuses(userLibrary);

  for (const [status, libraryEntries] of Object.entries(statusKeys)) {
    const media = libraryEntries.find((entry) => entry.mediaId === mediaId);
    if (media) return status as MediaLibraryStatus;
  }

  return null;
};

export const LibrariesService = {
  getUserLibrary,
  getMediaStatusFromUserLibrary,
};

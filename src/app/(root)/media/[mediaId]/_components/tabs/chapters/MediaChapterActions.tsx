import { Button } from "@nextui-org/react";
import { PencilIcon } from "lucide-react";
import { useSession } from "next-auth/react";

import { UpdateMediaChapterDeleteButton } from "~/components/forms/chapters/UpdateMediaChapterDeleteButton";
import type { MediaLimitedChapter } from "~/lib/types";

type Props = {
  chapter: MediaLimitedChapter;
};

export const MediaChapterActions = ({ chapter }: Props) => {
  const { data: session } = useSession();

  if (session?.user?.role.name !== "ADMIN") {
    return;
  }

  return (
    <div className="flex flex-col">
      <Button
        startContent={<PencilIcon size={18} />}
        size="sm"
        variant="light"
        color="warning"
        isIconOnly
      />
      <UpdateMediaChapterDeleteButton chapter={chapter} />
    </div>
  );
};

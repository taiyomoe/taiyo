import { tv } from "@nextui-org/react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { api } from "~/lib/trpc/client";
import type { MediaLimitedChapter } from "~/lib/types";

type Props = {
  chapter: MediaLimitedChapter;
  completed: boolean;
  setCompleted: (completed: boolean) => void;
};

const mediaChapterCardProgressionButton = tv({
  slots: {
    container: "hover:cursor-pointer",
    icon: "h-4 w-fit md:h-5",
  },
  variants: {
    completed: {
      true: {
        icon: "text-default-300",
      },
    },
  },
});

export const MediaChapterCardProgressionButton = (props: Props) => {
  const { chapter, completed, setCompleted } = props;
  const slots = mediaChapterCardProgressionButton({ completed });
  const { mutate } = api.history.updateProgression.useMutation();
  const Icon = completed ? EyeOffIcon : EyeIcon;
  const divTitle = completed ? "Marcar como não lido" : "Marcar como lido";

  const handleClick = () => {
    mutate({
      chapterId: chapter.id,
      completed: !completed,
    });

    setCompleted(!completed);
  };

  return (
    <div className={slots.container()} onClick={handleClick} title={divTitle}>
      <Icon className={slots.icon()} />
    </div>
  );
};

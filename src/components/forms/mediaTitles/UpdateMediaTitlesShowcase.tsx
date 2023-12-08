import { Chip } from "@nextui-org/react";

import { UpdateMediaTitlesForm } from "~/components/forms/mediaTitles/UpdateMediaTitlesForm";
import { Form } from "~/components/generics/form/Form";
import { List } from "~/components/generics/List";
import type { MediaWithRelations } from "~/lib/types";
import { MediaTitleUtils } from "~/lib/utils/mediaTitles.utils";

type Props = {
  media: MediaWithRelations;
};

export const UpdateMediaTitlesShowcase = ({ media }: Props) => {
  const sortedTitles = MediaTitleUtils.sort(media.titles);

  return (
    <Form.Category title="Títulos ativos">
      <List>
        {sortedTitles.map((title) => (
          <div key={title.id} className="flex w-full justify-between">
            <div className="flex items-center gap-4">
              <p>{title.title}</p>
              {title.isMainTitle && (
                <Chip
                  classNames={{ content: "font-medium px-1.5" }}
                  color="primary"
                  size="sm"
                >
                  Principal
                </Chip>
              )}
              {title.isAcronym && (
                <Chip classNames={{ content: "px-1.5" }} size="sm">
                  Acrônimo
                </Chip>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Chip classNames={{ content: "px-1.5" }} size="sm">
                {title.language}
              </Chip>
              <UpdateMediaTitlesForm media={media} title={title} />
            </div>
          </div>
        ))}
      </List>
    </Form.Category>
  );
};

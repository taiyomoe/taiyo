import { Chip } from "@nextui-org/react"
import { useMemo } from "react"

import { UpdateMediaTitleCreateButton } from "~/components/forms/mediaTitles/update/UpdateMediaTitleCreateButton"
import { UpdateMediaTitlesForm } from "~/components/forms/mediaTitles/update/UpdateMediaTitlesForm"
import { List } from "~/components/generics/List"
import { Form } from "~/components/generics/form/Form"
import { MediaTitleUtils } from "~/lib/utils/mediaTitles.utils"
import { useMediaUpdateStore } from "~/stores"

type Props = {
  mediaId: string
}

export const UpdateMediaTitlesShowcase = ({ mediaId }: Props) => {
  const { titles } = useMediaUpdateStore()

  const sortedTitles = useMemo(() => MediaTitleUtils.sort(titles), [titles])

  return (
    <Form.Category
      title="Títulos ativos"
      actions={<UpdateMediaTitleCreateButton mediaId={mediaId} />}
    >
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
              <UpdateMediaTitlesForm title={title} />
            </div>
          </div>
        ))}
      </List>
    </Form.Category>
  )
}

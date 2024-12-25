import { Chip } from "@nextui-org/chip"
import { TitleUtils } from "@taiyomoe/utils"
import { useMemo } from "react"
import { List } from "~/components/generics/List"
import { Form } from "~/components/generics/form/form"
import { useMediaUpdateStore } from "~/stores"
import { CreateMediaTitleForm } from "../create/create-media-title-form"
import { UpdateMediaTitleForm } from "./update-media-title-form"

type Props = {
  mediaId: string
}

export const UpdateMediaTitlesShowcase = ({ mediaId }: Props) => {
  const { titles } = useMediaUpdateStore()

  const sortedTitles = useMemo(() => TitleUtils.sort(titles), [titles])

  return (
    <Form.Category
      title="Títulos ativos"
      actions={<CreateMediaTitleForm mediaId={mediaId} />}
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
              <UpdateMediaTitleForm title={title} />
            </div>
          </div>
        ))}
      </List>
    </Form.Category>
  )
}

import type { MarkdownComponents } from "@tanstack/markdown/react"
import { use } from "react"
import type { CommentImage as CommentImageData } from "@/features/comments/api/comments"
import { Twemoji } from "@/components/emoji/twemoji"
import { RichText } from "@/components/rich-text/rich-text"
import { EMOJI_TAG, IMAGE_TAG, parseCommentText } from "@/components/rich-text/rich-text-document"
import { CommentImage } from "@/features/comments/components/comment-image"
import {
  type CommentImageEditing,
  CommentImagesContext,
} from "@/features/comments/lib/comments-context"

function ImageNode(props: { "data-id"?: string; "data-spoiler"?: string }) {
  const { images, interactive, editing } = use(CommentImagesContext)
  const id = props["data-id"] ?? ""

  return (
    <CommentImage
      editing={editing}
      id={id}
      image={images.get(id) ?? null}
      interactive={interactive}
      spoiler={props["data-spoiler"] === "true"}
    />
  )
}

function EmojiNode(props: { "data-emoji"?: string }) {
  return <Twemoji emoji={props["data-emoji"] ?? ""} />
}

const components = { [IMAGE_TAG]: ImageNode, [EMOJI_TAG]: EmojiNode } satisfies MarkdownComponents

export function CommentContent({
  content,
  images,
  interactive = true,
  collapsible = true,
  editing = null,
}: {
  content: string
  images: readonly CommentImageData[]
  interactive?: boolean
  collapsible?: boolean
  editing?: CommentImageEditing | null
}) {
  return (
    <CommentImagesContext
      value={{
        images: new Map(images.map((image) => [image.id, image])),
        interactive: interactive && editing === null,
        editing,
      }}
    >
      <RichText
        collapsible={collapsible}
        document={parseCommentText(content)}
        extraComponents={components}
        size="sm"
      />
    </CommentImagesContext>
  )
}

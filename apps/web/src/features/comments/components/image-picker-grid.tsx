import * as stylex from "@stylexjs/stylex"
import { Star } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useInfiniteQuery } from "@tanstack/react-query"
import { range, uniqueBy } from "remeda"
import {
  type ImageCollection,
  type LibraryImage,
  myCommentImagesQueryOptions,
  useFavoriteCommentImage,
} from "@/features/comments/api/comment-images"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  scroll: {
    overscrollBehavior: "contain",
    height: "17rem",
    overflowY: "auto",
  },
  grid: {
    gap: "0.375rem",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  },
  cell: {
    borderRadius: radius.md,
    overflow: "hidden",
    aspectRatio: "1",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    position: "relative",
  },
  pick: {
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    cursor: "pointer",
    display: "block",
    outlineColor: colors.ring,
    outlineOffset: -2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    height: "100%",
    width: "100%",
  },
  thumb: {
    display: "block",
    objectFit: "cover",
    transform: { default: "scale(1)", ":hover": "scale(1.04)" },
    transitionDuration: motion.enter,
    transitionProperty: "transform",
    height: "100%",
    width: "100%",
  },
  star: {
    position: "absolute",
    right: "0.25rem",
    top: "0.25rem",
  },
  starOn: {
    color: colors.warning,
  },
  skeleton: {
    borderRadius: radius.md,
    aspectRatio: "1",
  },
  empty: {
    margin: 0,
    paddingBlock: "2.5rem",
    paddingInline: "1rem",
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    lineHeight: 1.5,
    textAlign: "center",
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "0.5rem",
  },
})

export function ImagePickerGrid({
  collection,
  onPick,
}: {
  collection: ImageCollection
  onPick: (image: LibraryImage) => void
}) {
  const query = useInfiniteQuery(myCommentImagesQueryOptions(collection))
  const favorite = useFavoriteCommentImage()
  const images = uniqueBy(query.data?.pages.flatMap((page) => page.data) ?? [], (image) => image.id)

  if (query.isPending) {
    return (
      <div sx={[styles.scroll, styles.grid]}>
        {range(0, 9).map((index) => (
          <Skeleton key={index} sx={styles.skeleton} />
        ))}
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <p sx={styles.empty}>
        {collection === "favorites"
          ? m.comments_picker_favorites_empty()
          : m.comments_picker_uploads_empty()}
      </p>
    )
  }

  return (
    <div sx={styles.scroll}>
      <div sx={styles.grid}>
        {images.map((image) => (
          <div key={image.id} sx={styles.cell}>
            <button
              aria-label={m.comments_picker_insert()}
              onClick={() => {
                onPick(image)
              }}
              sx={styles.pick}
              type="button"
            >
              <img alt="" decoding="async" loading="lazy" src={image.url} sx={styles.thumb} />
            </button>
            <Button
              aria-label={
                image.favorited ? m.comments_image_unfavorite() : m.comments_image_favorite()
              }
              aria-pressed={image.favorited}
              onClick={() => {
                favorite.mutate({ id: image.id, favorited: !image.favorited })
              }}
              size="icon-xs"
              sx={[styles.star, image.favorited && styles.starOn]}
              variant="secondary"
            >
              <Star />
            </Button>
          </div>
        ))}
      </div>
      {query.hasNextPage ? (
        <div sx={styles.footer}>
          <Button
            loading={query.isFetchingNextPage}
            onClick={() => {
              void query.fetchNextPage()
            }}
            size="sm"
            variant="ghost"
          >
            {m.comments_load_more()}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

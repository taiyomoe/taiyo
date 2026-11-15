import { Settings } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Link } from "@tanstack/react-router"

export function ManageImagesLink({
  kind,
  mediaId,
  label,
}: {
  kind: "covers" | "banners"
  mediaId: string
  label: string
}) {
  return (
    <Button
      render={
        <Link
          search={{ mediaId }}
          to={kind === "covers" ? "/dashboard/covers" : "/dashboard/banners"}
        />
      }
      size="sm"
      variant="outline"
    >
      <Settings />
      {label}
    </Button>
  )
}

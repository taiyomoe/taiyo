"use client"

import type { SearchedMedia } from "@taiyomoe/types"
import { useRouter } from "next/navigation"
import { MediaSearchAutocomplete } from "~/components/navbar/search/MediaSearchAutocomplete"

export default function Page() {
  const router = useRouter()

  const handleSelectionChange = (media: SearchedMedia) => {
    router.push(`/dashboard/chapters/bulk-edit/${media.id}`)
  }

  return <MediaSearchAutocomplete onSelectionChange={handleSelectionChange} />
}

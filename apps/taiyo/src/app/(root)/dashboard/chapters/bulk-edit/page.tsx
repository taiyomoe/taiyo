"use client"

import { SearchedMedia } from "@taiyomoe/types"
import { useState } from "react"
import { MediaSearchAutocomplete } from "~/components/navbar/search/MediaSearchAutocomplete"
import { BulkUpdateActions } from "./_components/BulkUpdateActions"

export default function Page() {
  const [media, setMedia] = useState<SearchedMedia | null>(null)

  return (
    <div className="flex flex-col gap-12">
      <p className="text-4xl font-semibold">Modificar capítulos em massa</p>
      <div className="flex flex-col gap-8">
        <MediaSearchAutocomplete
          className="w-full"
          onSelectionChange={setMedia}
        />
        {media && <BulkUpdateActions mediaId={media.id} />}
      </div>
    </div>
  )
}

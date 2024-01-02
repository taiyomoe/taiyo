"use client"

import { Button } from "@nextui-org/react"
import Link from "next/link"
import { useState } from "react"
import { MediaSearchAutocomplete } from "~/components/navbar/search/MediaSearchAutocomplete"
import { SearchedMedia } from "~/lib/types"

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
        {media && (
          <div className="flex gap-4">
            <Button as={Link} href={`bulk-edit/${media.id}/volumes`}>
              Volumes
            </Button>
            <Button as={Link} href={`bulk-edit/${media.id}/scans`}>
              Scans
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { Button } from "@nextui-org/react"
import Link from "next/link"
import { useCallback, useState } from "react"
import { MediaSearchAutocomplete } from "~/components/navbar/search/MediaSearchAutocomplete"
import { SearchedMedia } from "~/lib/types"

export default function Page() {
  const [mediaId, setMediaId] = useState<string | null>(null)

  const handleSelectionChange = useCallback((media: SearchedMedia) => {
    setMediaId(media.id)
  }, [])

  return (
    <div className="flex flex-col gap-12">
      <p className="text-4xl font-semibold">Modificar capítulos em massa</p>
      <div className="flex flex-col gap-8">
        <MediaSearchAutocomplete
          className="w-full"
          onSelectionChange={handleSelectionChange}
        />
        {mediaId && (
          <div className="flex gap-4">
            <Button as={Link} href={`bulk-edit/${mediaId}/volumes`}>
              Volumes
            </Button>
            <Button as={Link} href={`bulk-edit/${mediaId}/scans`}>
              Scans
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

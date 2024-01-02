"use client"

import { MediaSearchAutocomplete } from "~/components/navbar/search/MediaSearchAutocomplete"

export default function Page() {
  return (
    <MediaSearchAutocomplete
      className="w-full"
      href={(mediaId) => `edit/${mediaId}`}
    />
  )
}

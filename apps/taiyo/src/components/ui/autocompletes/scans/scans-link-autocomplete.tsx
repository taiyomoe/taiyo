"use client"

import type { ScansIndexItem } from "@taiyomoe/types"
import { useRouter } from "next/navigation"
import {
  ScansAutocomplete,
  type ScansAutocompleteProps,
} from "./scans-autocomplete"

type Props = { href: string } & ScansAutocompleteProps

export const ScansLinkAutocomplete = ({ href }: Props) => {
  const router = useRouter()

  const handleSelectionChange = (item: ScansIndexItem | null) => {
    if (!item) return

    router.push(href + item.id)
  }

  return <ScansAutocomplete onSelectionChange={handleSelectionChange} />
}

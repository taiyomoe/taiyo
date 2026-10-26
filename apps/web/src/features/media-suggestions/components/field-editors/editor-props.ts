import type { MediaEditDraft } from "@/features/media-suggestions/lib/media-edit-model"

export type EditorProps = { draft: MediaEditDraft; onChange: (draft: MediaEditDraft) => void }

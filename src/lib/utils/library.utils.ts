import type { UserLibrary } from "@prisma/client";

const getStatusKeys = () => [
  "reading",
  "rereading",
  "completed",
  "onHold",
  "dropped",
  "planToRead",
  "delete",
];

const getStatuses = (userLibrary: UserLibrary) => ({
  reading: userLibrary.reading,
  rereading: userLibrary.rereading,
  completed: userLibrary.completed,
  onHold: userLibrary.onHold,
  dropped: userLibrary.dropped,
  planToRead: userLibrary.planToRead,
});

const getStatusLabel = (input: string | null) => {
  switch (input) {
    case "reading":
      return "Lendo";
    case "rereading":
      return "Relendo";
    case "completed":
      return "Completado";
    case "onHold":
      return "Pausado";
    case "dropped":
      return "Dropado";
    case "planToRead":
      return "Planeja ler";
    case "delete":
      return "Remover da biblioteca";
    default:
      return "Adicionar à biblioteca";
  }
};

export const LibraryUtils = {
  getStatusKeys,
  getStatuses,
  getStatusLabel,
};

import { Manga } from "mangadex-full-api"
import { HttpError } from "~/utils/http-error"

const getMedia = async (input: string) => {
  const result = await Manga.get(input).catch(() => null)

  if (!result) {
    throw new HttpError(404, "medias.notFound")
  }

  return result
}

export const MdService = {
  getMedia,
}

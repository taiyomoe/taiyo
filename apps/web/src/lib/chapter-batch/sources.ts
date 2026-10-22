import type { ImageMimeType } from "@taiyomoe/db/constants"
import { unzipSync } from "fflate"

type PageInfo = { key: string; name: string; size: number; type: ImageMimeType }

export type ChapterSource = {
  key: string
  name: string
  path: string
  pages: PageInfo[]
  open: () => Promise<Map<string, Blob>>
}

export type DroppedFile = { path: string; file: File }

export type ReadResult = { chapters: ChapterSource[]; unsupported: string[] }

const EXTENSION_TYPES = new Map<string, ImageMimeType>([
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"],
  ["gif", "image/gif"],
])
const ARCHIVE = /\.(?:zip|cbz)$/i
const IGNORED = /(?:^|\/)(?:__MACOSX|\.[^/]*|thumbs\.db|desktop\.ini)(?:\/|$)/i
const imageType = (name: string) =>
  EXTENSION_TYPES.get(name.slice(name.lastIndexOf(".") + 1).toLowerCase())
const dirname = (path: string) => path.slice(0, Math.max(path.lastIndexOf("/"), 0))
const basename = (path: string) => path.slice(path.lastIndexOf("/") + 1)
const naturally = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
const groupBy = <T>(items: readonly T[], keyOf: (item: T) => string) => {
  const groups = new Map<string, T[]>()

  for (const item of items) {
    const key = keyOf(item)

    groups.set(key, [...(groups.get(key) ?? []), item])
  }

  return [...groups.entries()].sort(([a], [b]) => naturally(a, b))
}
const readEntries = (reader: FileSystemDirectoryReader) =>
  new Promise<FileSystemEntry[]>((resolve, reject) => {
    reader.readEntries(resolve, reject)
  })
const isDirectory = (entry: FileSystemEntry): entry is FileSystemDirectoryEntry => entry.isDirectory
const isFile = (entry: FileSystemEntry): entry is FileSystemFileEntry => entry.isFile
const walk = async (entry: FileSystemEntry, prefix: string): Promise<DroppedFile[]> => {
  const path = prefix === "" ? entry.name : `${prefix}/${entry.name}`

  if (isFile(entry)) {
    return [
      {
        path,
        file: await new Promise<File>((resolve, reject) => {
          entry.file(resolve, reject)
        }),
      },
    ]
  }

  if (!isDirectory(entry)) {
    return []
  }

  const reader = entry.createReader()
  const children: FileSystemEntry[] = []

  for (let batch = await readEntries(reader); batch.length > 0; batch = await readEntries(reader)) {
    children.push(...batch)
  }

  return (await Promise.all(children.map((child) => walk(child, path)))).flat()
}

export const filesFromDrop = async (items: DataTransferItemList) => {
  const entries = [...items].flatMap((item) => {
    const entry = item.webkitGetAsEntry()

    return entry === null ? [] : [entry]
  })

  return (await Promise.all(entries.map((entry) => walk(entry, "")))).flat()
}

export const filesFromInput = (files: FileList | null): DroppedFile[] =>
  [...(files ?? [])].map((file) => ({ path: file.webkitRelativePath || file.name, file }))

export const readChapterSources = async (dropped: DroppedFile[]): Promise<ReadResult> => {
  const visible = dropped.filter(({ path }) => !IGNORED.test(path))
  const archives = visible.filter(({ path }) => ARCHIVE.test(path))
  const images = visible.filter(({ path }) => imageType(path) !== undefined)
  const unsupported = visible
    .filter(({ path }) => !ARCHIVE.test(path) && imageType(path) === undefined)
    .map(({ path }) => basename(path))
  const fromArchives = await Promise.all(
    archives.map(async ({ path, file }) => {
      try {
        const listed: Array<{ name: string; size: number }> = []

        unzipSync(new Uint8Array(await file.arrayBuffer()), {
          filter: (entry) => {
            if (!entry.name.endsWith("/") && !IGNORED.test(entry.name) && imageType(entry.name)) {
              listed.push({ name: entry.name, size: entry.originalSize })
            }

            return false
          },
        })

        const groups = groupBy(listed, (entry) => dirname(entry.name))
        const archiveName = basename(path).replace(ARCHIVE, "")

        return groups.map(([directory, entries]) => {
          const pages = [...entries]
            .sort((a, b) => naturally(a.name, b.name))
            .map((entry) => ({
              key: entry.name,
              name: basename(entry.name),
              size: entry.size,
              type: imageType(entry.name) ?? "image/jpeg",
            }))
          const wanted = new Set(pages.map((page) => page.key))

          return {
            key: `archive:${path}:${directory}:${crypto.randomUUID()}`,
            name: groups.length > 1 && directory !== "" ? basename(directory) : archiveName,
            path: directory === "" ? archiveName : `${archiveName}/${directory}`,
            pages,
            open: async () => {
              const files = unzipSync(new Uint8Array(await file.arrayBuffer()), {
                filter: (entry) => wanted.has(entry.name),
              })

              return new Map(
                pages.flatMap((page) => {
                  const data = files[page.key]

                  return data === undefined
                    ? []
                    : [[page.key, new Blob([data], { type: page.type })]]
                }),
              )
            },
          }
        })
      } catch {
        unsupported.push(basename(path))

        return []
      }
    }),
  )

  return {
    chapters: [
      ...groupBy(images, (image) => dirname(image.path)).map(([directory, files]) => {
        const pages = [...files]
          .sort((a, b) => naturally(a.path, b.path))
          .map(({ path, file }) => ({
            key: path,
            name: basename(path),
            size: file.size,
            type: imageType(path) ?? "image/jpeg",
            file,
          }))

        return {
          key: `folder:${directory}:${crypto.randomUUID()}`,
          name: basename(directory),
          path: directory,
          pages: pages.map(({ file: _file, ...page }) => page),
          open: () => Promise.resolve(new Map(pages.map((page) => [page.key, page.file]))),
        }
      }),
      ...fromArchives.flat(),
    ],
    unsupported,
  }
}

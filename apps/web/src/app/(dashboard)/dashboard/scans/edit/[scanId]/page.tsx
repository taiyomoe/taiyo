import { db } from "@taiyomoe/db"
import { notFound } from "next/navigation"
import { UpdateScanForm } from "~/components/forms/scans/update/update-scan-form"

type Props = {
  params: Promise<{ scanId: string }>
}

export default async function Page({ params }: Props) {
  const { scanId } = await params
  const scan = await db.scan.findFirst({
    omit: {
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      creatorId: true,
      deleterId: true,
    },
    where: { id: scanId, deletedAt: null },
  })

  if (!scan) {
    return notFound()
  }

  return <UpdateScanForm initialValues={scan} />
}

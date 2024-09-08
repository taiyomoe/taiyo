import { Button } from "@nextui-org/button"
import { useDisclosure } from "@nextui-org/modal"
import { AnimatePresence, motion } from "framer-motion"
import { useAtomValue } from "jotai"
import { Trash2Icon } from "lucide-react"
import { useMemo } from "react"
import { scansListSelectedKeysAtom } from "~/atoms/scansList.atoms"
import { useScansList } from "~/hooks/useScansList"
import { ScansTableDeleteModal } from "./scans-table-delete-modal"

export const ScansTableMultipleActionsDeleteButton = () => {
  const selectedKeys = useAtomValue(scansListSelectedKeysAtom)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { items } = useScansList()
  const selectedScans = useMemo(
    () => items.filter((item) => Array.from(selectedKeys).includes(item.id)),
    [selectedKeys, items],
  )

  return (
    <>
      <AnimatePresence initial={false}>
        {Array.from(selectedKeys).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Button color="danger" variant="light" onPress={onOpen} isIconOnly>
              <Trash2Icon />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <ScansTableDeleteModal
        selectedScans={selectedScans}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
    </>
  )
}

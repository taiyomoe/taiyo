import { Spinner } from "@nextui-org/spinner"
import { CheckIcon, HourglassIcon } from "lucide-react"
import { Form } from "~/components/generics/form/Form"

export const BulkUploadChaptersLegendCategory = () => (
  <Form.Category title="Legenda">
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <HourglassIcon className="text-warning" size={20} />
        <p>Aguardando</p>
      </div>

      <div className="flex items-center gap-4">
        <Spinner size="sm" />
        <p>Upload em andamento</p>
      </div>

      <div className="flex items-center gap-4">
        <CheckIcon className="text-success" size={20} />
        <p>Upload efetuado</p>
      </div>
    </div>
  </Form.Category>
)

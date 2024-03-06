import { Spinner } from "@nextui-org/spinner"
import { CheckIcon, HourglassIcon, RefreshCwIcon } from "lucide-react"
import { Form } from "~/components/generics/form/Form"

export const UploadStatusLegend = () => (
  <Form.Category title="Legenda">
    <div className="grid grid-cols-2">
      {/* STEP 1 */}
      <div className="col-span-2 md:col-span-1 flex gap-4 items-center">
        <HourglassIcon className="text-warning" size={20} />
        <p>Aguardando</p>
      </div>
      {/* STEP 3 */}
      <div className="flex gap-4 items-center">
        <Spinner size="sm" />
        <p>Upload em andamento</p>
      </div>
      {/* STEP 2 */}
      <div className="flex gap-4 items-center">
        <RefreshCwIcon
          className="text-blue-400 animate-spin-medium"
          size={20}
        />
        <p>Covertendo e comprimindo imagens</p>
      </div>
      {/* STEP 4 */}
      <div className="flex gap-4 items-center">
        <CheckIcon className="text-success" size={20} />
        <p>Upload efetuado</p>
      </div>
    </div>
  </Form.Category>
)

// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@taiyomoe/ui/components/ui/combobox"
import { useQuery } from "@tanstack/react-query"
import { useDeferredValue, useState } from "react"
import { fieldEditorStyles } from "@/features/media-suggestions/components/field-editors/field-editor-styles"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"
import { m } from "@/paraglide/messages"

type StaffOption = { id: string; name: string }

export function StaffPicker({ onPick }: { onPick: (staff: StaffOption) => void }) {
  const [input, setInput] = useState("")
  const query = useDeferredValue(input.trim())
  const { data, isFetching } = useQuery({
    queryKey: ["staffs", "search", query],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.staffs.$get(
          { query: { search: query, page: "1", perPage: "10" } },
          { init: { signal } },
        ),
      ),
    enabled: query.length > 0,
  })

  return (
    <div sx={fieldEditorStyles.addPicker}>
      <Combobox<StaffOption>
        filter={null}
        inputValue={input}
        isItemEqualToValue={(a, b) => a.id === b.id}
        itemToStringLabel={(item) => item.name}
        items={(data ?? []).map(({ id, name }) => ({ id, name }))}
        onInputValueChange={setInput}
        onValueChange={(next) => {
          if (next !== null) {
            onPick(next)
            setInput("")
          }
        }}
        value={null}
      >
        <ComboboxInput placeholder={m.media_edit_staff_search()} size="sm" />
        <ComboboxPopup>
          <ComboboxList>
            {(item: StaffOption) => (
              <ComboboxItem key={item.id} value={item}>
                {item.name}
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>
            {isFetching ? m.upload_searching() : m.media_edit_staff_none()}
          </ComboboxEmpty>
        </ComboboxPopup>
      </Combobox>
    </div>
  )
}

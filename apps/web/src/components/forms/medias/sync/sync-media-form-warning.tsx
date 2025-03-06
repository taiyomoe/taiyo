import { Alert } from "@heroui/alert"

export const SyncMediaFormWarning = () => (
  <Alert
    className="space-y-2"
    color="warning"
    title={
      <div className="space-y-2">
        <p>
          Sincronizar é uma ação que pode levar algum tempo dependendo da
          quantidade de covers e capítulos disponíveis na MangaDex.
        </p>
        <p>
          Também deve se levar em consideração que a fila de espera pode estar
          cheia, e que leve algum tempo até que as tarefas comecem a ser
          executadas.
        </p>
      </div>
    }
  />
)

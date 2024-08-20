import type { UserLimited } from "@taiyomoe/types"
import { COUNTRIES_PT } from "@taiyomoe/utils/i18n"
import { CountryFlag } from "~/components/ui/CountryFlag"

type Props = {
  user: UserLimited
}

export const UserLayoutInfoTab = ({ user }: Props) => {
  return (
    <div className="flex flex-col gap-8">
      {user.profile.about && (
        <div>
          <p className="font-bold text-foreground-400 text-small uppercase">
            Sobre mim
          </p>
          <p>{user.profile.about}</p>
        </div>
      )}
      {user.profile.birthDate && (
        <div>
          <p className="font-bold text-foreground-400 text-small uppercase">
            Data de nascimento
          </p>
          <p>{user.profile.birthDate.toISOString()}</p>
        </div>
      )}
      {user.profile.city && (
        <div>
          <p className="font-bold text-foreground-400 text-small uppercase">
            Cidade
          </p>
          <p>{user.profile.city}</p>
        </div>
      )}
      {user.profile.country && (
        <div>
          <p className="font-bold text-foreground-400 text-small uppercase">
            País
          </p>
          <div className="flex items-center gap-2">
            <CountryFlag country={user.profile.country} size={24} />
            <p>{COUNTRIES_PT[user.profile.country]}</p>
          </div>
        </div>
      )}
    </div>
  )
}

import type { UserLimited } from "@taiyomoe/types"
import { COUNTRIES_PT } from "@taiyomoe/utils/i18n"
import { DateTime } from "luxon"
import { CountryFlag } from "~/components/ui/CountryFlag"
import { DateUtils } from "~/lib/utils/date.utils"

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
          <p className="break-words">{user.profile.about}</p>
        </div>
      )}
      {user.profile.birthDate && (
        <div>
          <p className="font-bold text-foreground-400 text-small uppercase">
            Data de nascimento
          </p>
          <p>
            {DateTime.fromJSDate(user.profile.birthDate).toFormat("dd/MM/yyyy")}{" "}
            ({DateUtils.getAge(user.profile.birthDate)} anos)
          </p>
        </div>
      )}
      {user.profile.city && (
        <div>
          <p className="font-bold text-foreground-400 text-small uppercase">
            Cidade
          </p>
          <p className="break-words">{user.profile.city}</p>
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

import { now } from "@internationalized/date"
import { Divider } from "@nextui-org/react"
import { Countries, Genders } from "@taiyomoe/db"
import { COUNTRIES_PT } from "@taiyomoe/utils/i18n"
import { UserSettingsFormFieldBuilder } from "~/components/forms/users/update-settings/categories/user-settings-form-field-builder"
import { DateField } from "~/components/generics/form/date-field"
import { InputField } from "~/components/generics/form/input-field"
import { SelectField } from "~/components/generics/form/select-field"
import { TextAreaField } from "~/components/generics/form/textarea-field"
import { CountryFlag } from "~/components/ui/CountryFlag"

export const UserSettingsFormProfileCategory = () => {
  return (
    <div className="space-y-8">
      <UserSettingsFormFieldBuilder
        title="Sobre mim"
        description="Descrição curta (2000 caracteres máximo)"
        orientation="vertical"
      >
        <TextAreaField
          name="profile.about"
          maxLength={2000}
          aria-label="About me"
          fullWidth
        />
      </UserSettingsFormFieldBuilder>
      <Divider />
      <UserSettingsFormFieldBuilder
        title="Data de nascimento"
        description={
          <>
            Porquê entrar a minha verdadeira data de nascimento num site de
            mangás?
            <br />
            Bem, talvez haja algumas surpresas no futuro, quem sabe?
          </>
        }
      >
        <DateField
          name="profile.birthDate"
          className="w-full md:w-1/3"
          maxValue={now("America/Sao_Paulo")}
          aria-label="Birth date"
          showMonthAndYearPickers
        />
      </UserSettingsFormFieldBuilder>
      <Divider />
      <UserSettingsFormFieldBuilder title="Gênero" description="Sei lá">
        <SelectField
          name="profile.gender"
          className="w-full md:w-1/3"
          items={Genders}
          aria-label="Genre"
        />
      </UserSettingsFormFieldBuilder>
      <Divider />
      <UserSettingsFormFieldBuilder title="Cidade" description="Sei lá">
        <InputField
          name="profile.city"
          className="w-full md:w-1/3"
          aria-label="City"
        />
      </UserSettingsFormFieldBuilder>
      <Divider />
      <UserSettingsFormFieldBuilder title="País" description="Sei lá">
        <SelectField
          name="profile.country"
          className="w-full md:w-1/3"
          items={Countries}
          renderValue={(item) => item[0]?.rendered}
          renderOption={(item) => (
            <div className="flex items-center gap-2">
              <CountryFlag country={item as Countries} size={24} />
              <p>{COUNTRIES_PT[item as Countries]}</p>
            </div>
          )}
          aria-label="Country"
        />
      </UserSettingsFormFieldBuilder>
    </div>
  )
}

import { now } from "@internationalized/date"
import { Divider } from "@nextui-org/react"
import { Countries, Genders } from "@taiyomoe/db"
import { COUNTRIES_PT, GENDERS_PT } from "@taiyomoe/utils/i18n"
import { UserSettingsFormFieldBuilder } from "~/components/forms/users/update-settings/categories/user-settings-form-field-builder"
import { DateField } from "~/components/generics/form/date-field"
import { InputField } from "~/components/generics/form/input-field"
import { SelectField } from "~/components/generics/form/select-field"
import { SwitchField } from "~/components/generics/form/switch-field"
import { TextAreaField } from "~/components/generics/form/textarea-field"
import { CountryFlag } from "~/components/ui/CountryFlag"

export const UserSettingsFormProfileCategory = () => (
  <div className="space-y-8">
    <UserSettingsFormFieldBuilder
      title="Sobre mim"
      description="Conte um pouco sobre você. Queremos te conhecer melhor! (2000 caracteres no máximo)"
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
    <UserSettingsFormFieldBuilder
      title="Gênero"
      description="O gênero ajuda a personalizar a sua experiência na plataforma."
    >
      <SelectField
        name="profile.gender"
        className="w-full md:w-1/3"
        items={Genders}
        renderOption={(item) => GENDERS_PT[item as Genders]}
        aria-label="Gender"
      />
    </UserSettingsFormFieldBuilder>
    <Divider />
    <UserSettingsFormFieldBuilder
      title="Cidade"
      description="De onde você vem?"
    >
      <InputField
        name="profile.city"
        className="w-full md:w-1/3"
        aria-label="City"
      />
    </UserSettingsFormFieldBuilder>
    <Divider />
    <UserSettingsFormFieldBuilder
      title="País"
      description={
        <>
          O país servirá principalmente para personalizar as recomendações de
          conteúdo.
          <br />
          Também será usado como decoração em vários lugares onde o seu nome
          aparecer.
        </>
      }
    >
      <SelectField
        name="profile.country"
        className="w-full md:w-1/3"
        items={Countries}
        renderOption={(item) => (
          <div className="flex items-center gap-2">
            <CountryFlag country={item as Countries} size={24} />
            <p>{COUNTRIES_PT[item as Countries]}</p>
          </div>
        )}
        aria-label="Country"
      />
    </UserSettingsFormFieldBuilder>
    <Divider />
    <UserSettingsFormFieldBuilder
      title="Mostrar meus seguidores"
      description="Se você quiser que os seguidores do seu perfil sejam exibidos no site."
    >
      <SwitchField name="showFollowing" aria-label="Show following" />
    </UserSettingsFormFieldBuilder>
    <Divider />
    <UserSettingsFormFieldBuilder
      title="Mostrar minha biblioteca"
      description="Se você quiser que sua biblioteca seja exibida no site."
    >
      <SwitchField name="showLibrary" aria-label="Show library" />
    </UserSettingsFormFieldBuilder>
  </div>
)

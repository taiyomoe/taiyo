import type {
  AchievementKey,
  Locale,
  ProfileModerationField,
  RankingPeriodKind,
} from "@taiyomoe/db"

type PushTexts = {
  newChapter: string
  chapterBody: (chapter: string, groups: string | null) => string
  rankingTitle: (kind: RankingPeriodKind, rank: number) => string
  points: (points: number) => string
  achievementUnlocked: string
  achievements: Record<AchievementKey, string>
  listTitle: (deleted: boolean) => string
  profileTitle: string
  profileBody: (removed: boolean, fields: string) => string
  profileFields: Record<ProfileModerationField, string>
  reportTitle: (resolved: boolean, points: number | undefined) => string
  aPage: string
  pageOf: (media: string | null, chapter: string) => string
  aComment: string
  aRemovedComment: string
  aGroup: string
  aProfile: string
  someone: string
  followTitle: (name: string, others: number) => string
  seeWho: string
  upvoteTitle: (readers: number) => string
  anImage: string
  replyTitle: (name: string) => string
  sentAnImage: string
  dataExportTitle: string
  dataExportBody: string
  testTitle: string
  testBody: string
}

const numberFormat = (locale: Locale) => {
  const format = new Intl.NumberFormat(locale)

  return (value: number) => format.format(value)
}
const en = numberFormat("en")
const fr = numberFormat("fr")
const ptBr = numberFormat("pt-BR")

/** The text of push notifications, in the language of the device they are sent to. */
export const PUSH_TEXTS = {
  en: {
    newChapter: "New chapter",
    chapterBody: (chapter, groups) =>
      groups === null ? `New chapter ${chapter}` : `New chapter ${chapter} by ${groups}`,
    rankingTitle: (kind, rank) =>
      `You finished #${en(rank)} of the ${kind === "MONTH" ? "month" : "week"}`,
    points: (points) => `+${en(points)} points`,
    achievementUnlocked: "Achievement unlocked",
    achievements: {
      chaptersRead100: "First Hundred",
      chaptersRead1000: "A Thousand Chapters",
      chaptersRead5000: "Endless Reader",
      chaptersUploaded10: "First Releases",
      chaptersUploaded250: "Release Machine",
      chaptersUploaded100000: "Eternal Archive",
      followers25: "Rising Star",
      commentsWritten50: "Talkative",
      dailyChampion: "Champion of the Day",
      hatTrick: "Hat Trick",
      unstoppable: "Unstoppable",
      sovereign: "Sovereign",
      topTen: "Top Ten",
      weeklyPodium: "Weekly Podium",
      weeklyChampion: "Champion of the Week",
      monthlyPodium: "Monthly Podium",
      monthlyChampion: "Champion of the Month",
    },
    listTitle: (deleted) =>
      deleted ? "The moderation team deleted your list" : "The moderation team edited your list",
    profileTitle: "The moderation team edited your profile",
    profileBody: (removed, fields) => `${removed ? "Removed" : "Changed"}: ${fields}`,
    profileFields: {
      displayUsername: "display name",
      about: "about text",
      city: "city",
      avatar: "avatar",
      banner: "banner",
    },
    reportTitle: (resolved, points) => {
      const title = `The moderation team ${resolved ? "resolved" : "dismissed"} your report`

      return points === undefined ? title : `${title}: +${en(points)} points`
    },
    aPage: "A page",
    pageOf: (media, chapter) => `A page of ${media ?? "a chapter"}, chapter ${chapter}`,
    aComment: "A comment",
    aRemovedComment: "A removed comment",
    aGroup: "A group",
    aProfile: "A profile",
    someone: "Someone",
    followTitle: (name, others) =>
      others === 0
        ? `${name} started following you`
        : `${name} and ${en(others)} ${others === 1 ? "other" : "others"} started following you`,
    seeWho: "See who in your inbox",
    upvoteTitle: (readers) =>
      `${en(readers)} ${readers === 1 ? "reader" : "readers"} upvoted your comment`,
    anImage: "An image",
    replyTitle: (name) => `${name} replied to your comment`,
    sentAnImage: "Sent an image",
    dataExportTitle: "Your data is ready",
    dataExportBody: "Download the copy of your Taiyō data from your privacy settings.",
    testTitle: "Notifications are on",
    testBody: "This device will now get new chapters and replies from Taiyō.",
  },
  fr: {
    newChapter: "Nouveau chapitre",
    chapterBody: (chapter, groups) =>
      groups === null ? `Nouveau chapitre ${chapter}` : `Nouveau chapitre ${chapter} par ${groups}`,
    rankingTitle: (kind, rank) =>
      `Vous avez fini n°${fr(rank)} ${kind === "MONTH" ? "du mois" : "de la semaine"}`,
    points: (points) => `+${fr(points)} points`,
    achievementUnlocked: "Succès débloqué",
    achievements: {
      chaptersRead100: "Première centaine",
      chaptersRead1000: "Mille chapitres",
      chaptersRead5000: "Lecteur infatigable",
      chaptersUploaded10: "Premières sorties",
      chaptersUploaded250: "Machine à sorties",
      chaptersUploaded100000: "Archives éternelles",
      followers25: "Étoile montante",
      commentsWritten50: "Bavard",
      dailyChampion: "Champion du jour",
      hatTrick: "Coup du chapeau",
      unstoppable: "Inarrêtable",
      sovereign: "Souverain",
      topTen: "Top 10",
      weeklyPodium: "Podium de la semaine",
      weeklyChampion: "Champion de la semaine",
      monthlyPodium: "Podium du mois",
      monthlyChampion: "Champion du mois",
    },
    listTitle: (deleted) =>
      deleted ? "La modération a supprimé votre liste" : "La modération a modifié votre liste",
    profileTitle: "La modération a modifié votre profil",
    profileBody: (removed, fields) => `${removed ? "Supprimé" : "Modifié"} : ${fields}`,
    profileFields: {
      displayUsername: "nom d’affichage",
      about: "présentation",
      city: "ville",
      avatar: "avatar",
      banner: "bannière",
    },
    reportTitle: (resolved, points) => {
      const title = resolved
        ? "La modération a donné suite à votre signalement"
        : "La modération a classé sans suite votre signalement"

      return points === undefined ? title : `${title} : +${fr(points)} points`
    },
    aPage: "Une page",
    pageOf: (media, chapter) => `Une page de ${media ?? "un chapitre"}, chapitre ${chapter}`,
    aComment: "Un commentaire",
    aRemovedComment: "Un commentaire supprimé",
    aGroup: "Un groupe",
    aProfile: "Un profil",
    someone: "Quelqu’un",
    followTitle: (name, others) =>
      others === 0
        ? `${name} a commencé à vous suivre`
        : `${name} et ${fr(others)} ${others === 1 ? "autre personne" : "autres"} ont commencé à vous suivre`,
    seeWho: "Découvrez qui dans vos notifications",
    upvoteTitle: (readers) =>
      readers === 1
        ? "1 lecteur a voté pour votre commentaire"
        : `${fr(readers)} lecteurs ont voté pour votre commentaire`,
    anImage: "Une image",
    replyTitle: (name) => `${name} a répondu à votre commentaire`,
    sentAnImage: "A envoyé une image",
    dataExportTitle: "Vos données sont prêtes",
    dataExportBody:
      "Téléchargez la copie de vos données Taiyō depuis vos paramètres de confidentialité.",
    testTitle: "Les notifications sont activées",
    testBody: "Cet appareil recevra désormais les nouveaux chapitres et les réponses de Taiyō.",
  },
  "pt-BR": {
    newChapter: "Novo capítulo",
    chapterBody: (chapter, groups) =>
      groups === null ? `Novo capítulo ${chapter}` : `Novo capítulo ${chapter} por ${groups}`,
    rankingTitle: (kind, rank) =>
      `Você terminou em ${ptBr(rank)}º ${kind === "MONTH" ? "no mês" : "na semana"}`,
    points: (points) => `+${ptBr(points)} pontos`,
    achievementUnlocked: "Conquista desbloqueada",
    achievements: {
      chaptersRead100: "Primeira centena",
      chaptersRead1000: "Mil capítulos",
      chaptersRead5000: "Leitor incansável",
      chaptersUploaded10: "Primeiros lançamentos",
      chaptersUploaded250: "Máquina de lançamentos",
      chaptersUploaded100000: "Arquivo Eterno",
      followers25: "Estrela em ascensão",
      commentsWritten50: "Tagarela",
      dailyChampion: "Campeão do dia",
      hatTrick: "Hat-trick",
      unstoppable: "Imparável",
      sovereign: "Soberano",
      topTen: "Top 10",
      weeklyPodium: "Pódio da semana",
      weeklyChampion: "Campeão da semana",
      monthlyPodium: "Pódio do mês",
      monthlyChampion: "Campeão do mês",
    },
    listTitle: (deleted) =>
      deleted ? "A moderação excluiu sua lista" : "A moderação editou sua lista",
    profileTitle: "A moderação editou seu perfil",
    profileBody: (removed, fields) => `${removed ? "Removido" : "Alterado"}: ${fields}`,
    profileFields: {
      displayUsername: "nome de exibição",
      about: "texto de apresentação",
      city: "cidade",
      avatar: "avatar",
      banner: "banner",
    },
    reportTitle: (resolved, points) => {
      const title = resolved
        ? "A moderação resolveu sua denúncia"
        : "A moderação descartou sua denúncia"

      return points === undefined ? title : `${title}: +${ptBr(points)} pontos`
    },
    aPage: "Uma página",
    pageOf: (media, chapter) => `Uma página de ${media ?? "um capítulo"}, capítulo ${chapter}`,
    aComment: "Um comentário",
    aRemovedComment: "Um comentário removido",
    aGroup: "Um grupo",
    aProfile: "Um perfil",
    someone: "Alguém",
    followTitle: (name, others) =>
      others === 0
        ? `${name} começou a seguir você`
        : `${name} e mais ${ptBr(others)} ${others === 1 ? "pessoa" : "pessoas"} começaram a seguir você`,
    seeWho: "Veja quem nas suas notificações",
    upvoteTitle: (readers) =>
      readers === 1
        ? "1 leitor votou no seu comentário"
        : `${ptBr(readers)} leitores votaram no seu comentário`,
    anImage: "Uma imagem",
    replyTitle: (name) => `${name} respondeu ao seu comentário`,
    sentAnImage: "Enviou uma imagem",
    dataExportTitle: "Seus dados estão prontos",
    dataExportBody: "Baixe a cópia dos seus dados do Taiyō nas suas configurações de privacidade.",
    testTitle: "As notificações estão ativadas",
    testBody: "Este dispositivo agora vai receber novos capítulos e respostas do Taiyō.",
  },
} satisfies Record<Locale, PushTexts>

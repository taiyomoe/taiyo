type TagCategories =
  | "Genre"
  | "Technical"
  | "Theme"
  | "Setting"
  | "Cast"
  | "Sexual Content"
  | "Other"
  | "Cast-Traits"
  | "Theme-Action"
  | "Theme-Fantasy"
  | "Theme-Sci-Fi"
  | "Theme-Sci-Fi-Mecha"
  | "Theme-Romance"
  | "Theme-Comedy"
  | "Theme-Game"
  | "Theme-Game-Sport"
  | "Theme-Other"
  | "Theme-Arts-Music"
  | "Theme-Other-Vehicle"
  | "Theme-Other-Organisations"
  | "Theme-Drama"
  | "Theme-Arts"
  | "Theme-Slice of Life"
  | "Theme-Game-Card & Board Game"
  | "Setting-Scene"
  | "Setting-Time"
  | "Setting-Universe"
  | "Cast-Main Cast"
  | "Demographic"

export const tags = {
  // MangaDex genres (December 25, 2025)
  ACTION: {
    name: {
      en: "Action",
      pt_br: "Ação",
      fr: "Action",
    },
    description: {
      en: "Prominently features fast-paced sequences, physical combat, and intense confrontations.",
      pt_br: "Apresenta sequências de ritmo acelerado, combate físico e confrontos intensos.",
    },
    category: "Genre",
    isAdult: false,
  },
  ADVENTURE: {
    name: {
      en: "Adventure",
      pt_br: "Aventura",
      fr: "Aventure",
    },
    description: {
      en: "Centers around exploration, journeys, and discovery of new places or experiences.",
      pt_br: "Gira em torno de exploração, jornadas e descoberta de novos lugares ou experiências.",
    },
    category: "Genre",
    isAdult: false,
  },
  BOYS_LOVE: {
    name: {
      en: "Boys' Love",
      pt_br: "Boys' Love",
      fr: "Boys’ Love",
    },
    description: {
      en: "Prominently features romance between two males, not inherently sexual.",
      pt_br: "Apresenta romance entre dois homens, não necessariamente sexual.",
    },
    category: "Genre",
    isAdult: false,
  },
  COMEDY: {
    name: {
      en: "Comedy",
      pt_br: "Comédia",
      fr: "Comédie",
    },
    description: {
      en: "Primarily aims to entertain through humor, jokes, and lighthearted situations.",
      pt_br:
        "Tem como objetivo principal entreter através de humor, piadas e situações descontraídas.",
    },
    category: "Genre",
    isAdult: false,
  },
  CRIME: {
    name: {
      en: "Crime",
      pt_br: "Crime",
      fr: "Crime",
    },
    description: {
      en: "Centers around unlawful activities punishable by the state or other authority.",
      pt_br: "Gira em torno de atividades ilegais puníveis pelo estado ou outra autoridade.",
    },
    category: "Genre",
    isAdult: false,
  },
  DRAMA: {
    name: {
      en: "Drama",
      pt_br: "Drama",
      fr: "Drame",
    },
    description: {
      en: "Emphasizes emotional depth, character development, and interpersonal conflicts.",
      pt_br:
        "Enfatiza profundidade emocional, desenvolvimento de personagens e conflitos interpessoais.",
    },
    category: "Genre",
    isAdult: false,
  },
  FANTASY: {
    name: {
      en: "Fantasy",
      pt_br: "Fantasia",
      fr: "Fantasy",
    },
    description: {
      en: "Set in worlds with magic, mythical creatures, or supernatural elements.",
      pt_br: "Ambientado em mundos com magia, criaturas míticas ou elementos sobrenaturais.",
    },
    category: "Genre",
    isAdult: false,
  },
  GIRLS_LOVE: {
    name: {
      en: "Girls' Love",
      pt_br: "Girls' Love",
      fr: "Girls’ Love",
    },
    description: {
      en: "Prominently features romance between two females, not inherently sexual.",
      pt_br: "Apresenta romance entre duas mulheres, não necessariamente sexual.",
    },
    category: "Genre",
    isAdult: false,
  },
  HISTORICAL: {
    name: {
      en: "Historical",
      pt_br: "Histórico",
      fr: "Historique",
    },
    description: {
      en: "Partly or completely set during a real period of world history.",
      pt_br: "Parcialmente ou completamente ambientado em um período real da história mundial.",
    },
    category: "Genre",
    isAdult: false,
  },
  HORROR: {
    name: {
      en: "Horror",
      pt_br: "Terror",
      fr: "Horreur",
    },
    description: {
      en: "Designed to evoke fear, dread, or unease through disturbing imagery or themes.",
      pt_br:
        "Projetado para evocar medo, pavor ou desconforto através de imagens ou temas perturbadores.",
    },
    category: "Genre",
    isAdult: false,
  },
  ISEKAI: {
    name: {
      en: "Isekai",
      pt_br: "Isekai",
      fr: "Isekai",
    },
    description: {
      en: "Features characters being transported into an alternate world setting and having to adapt to their new surroundings.",
      pt_br:
        "Apresenta personagens sendo transportados para um mundo alternativo e tendo que se adaptar ao novo ambiente.",
    },
    category: "Genre",
    isAdult: false,
  },
  MAGICAL_GIRLS: {
    name: {
      en: "Magical Girls",
      pt_br: "Garotas Mágicas",
      fr: "Magical girls",
    },
    description: {
      en: "Prominently features magical girls who aim to serve the greater good.",
      pt_br: "Apresenta garotas mágicas que têm como objetivo servir o bem maior.",
    },
    category: "Genre",
    isAdult: false,
  },
  MECHA: {
    name: {
      en: "Mecha",
      pt_br: "Mecha",
      fr: "Mecha",
    },
    description: {
      en: "Prominently features piloted or autonomous giant robots and mechanical suits.",
      pt_br: "Apresenta robôs gigantes pilotados ou autônomos e trajes mecânicos.",
    },
    category: "Genre",
    isAdult: false,
  },
  MEDICAL: {
    name: {
      en: "Medical",
      pt_br: "Médico",
      fr: "Médical",
    },
    description: {
      en: "Centered around the activities of people working in the field of medicine.",
      pt_br: "Centrado nas atividades de pessoas que trabalham na área da medicina.",
    },
    category: "Genre",
    isAdult: false,
  },
  MYSTERY: {
    name: {
      en: "Mystery",
      pt_br: "Mistério",
      fr: "Mystère",
    },
    description: {
      en: "Centers around solving puzzles, uncovering secrets, or investigating unknown events.",
      pt_br:
        "Gira em torno de resolver enigmas, descobrir segredos ou investigar eventos desconhecidos.",
    },
    category: "Genre",
    isAdult: false,
  },
  PHILOSOPHICAL: {
    name: {
      en: "Philosophical",
      pt_br: "Filosófico",
      fr: "Philosophique",
    },
    description: {
      en: "Relating or devoted to the study of the fundamental nature of knowledge, reality, and existence.",
      pt_br:
        "Relacionado ou dedicado ao estudo da natureza fundamental do conhecimento, realidade e existência.",
    },
    category: "Genre",
    isAdult: false,
  },
  PSYCHOLOGICAL: {
    name: {
      en: "Psychological",
      pt_br: "Psicológico",
      fr: "Psychologique",
    },
    description: {
      en: "Explores the mental and emotional states of characters, often featuring mind games or internal struggles.",
      pt_br:
        "Explora os estados mentais e emocionais dos personagens, frequentemente apresentando jogos mentais ou lutas internas.",
    },
    category: "Genre",
    isAdult: false,
  },
  ROMANCE: {
    name: {
      en: "Romance",
      pt_br: "Romance",
      fr: "Romance",
    },
    description: {
      en: "Primarily focuses on romantic relationships and emotional connections between characters.",
      pt_br:
        "Foca principalmente em relacionamentos românticos e conexões emocionais entre personagens.",
    },
    category: "Genre",
    isAdult: false,
  },
  SCI_FI: {
    name: {
      en: "Sci-Fi",
      pt_br: "Ficção Científica",
      fr: "Science-fiction",
    },
    description: {
      en: "Set in futuristic or technologically advanced settings, often exploring scientific concepts.",
      pt_br:
        "Ambientado em cenários futuristas ou tecnologicamente avançados, frequentemente explorando conceitos científicos.",
    },
    category: "Genre",
    isAdult: false,
  },
  SLICE_OF_LIFE: {
    name: {
      en: "Slice of Life",
      pt_br: "Slice of Life",
      fr: "Tranche de vie",
    },
    description: {
      en: "Depicts everyday experiences and mundane aspects of ordinary life.",
      pt_br: "Retrata experiências cotidianas e aspectos mundanos da vida comum.",
    },
    category: "Genre",
    isAdult: false,
  },
  SPORTS: {
    name: {
      en: "Sports",
      pt_br: "Esportes",
      fr: "Sport",
    },
    description: {
      en: "Centers around athletic competitions, training, and the world of sports.",
      pt_br: "Gira em torno de competições atléticas, treinamento e o mundo dos esportes.",
    },
    category: "Genre",
    isAdult: false,
  },
  SUPERHERO: {
    name: {
      en: "Superhero",
      pt_br: "Super-herói",
      fr: "Super-héros",
    },
    description: {
      en: "Prominently features super-powered humans who aim to serve the greater good.",
      pt_br: "Apresenta humanos com superpoderes que têm como objetivo servir o bem maior.",
    },
    category: "Genre",
    isAdult: false,
  },
  SUPERNATURAL: {
    name: {
      en: "Supernatural",
      pt_br: "Sobrenatural",
      fr: "Surnaturel",
    },
    description: {
      en: "Features phenomena beyond scientific explanation, such as ghosts, spirits, or paranormal events.",
      pt_br:
        "Apresenta fenômenos além da explicação científica, como fantasmas, espíritos ou eventos paranormais.",
    },
    category: "Genre",
    isAdult: false,
  },
  THRILLER: {
    name: {
      en: "Thriller",
      pt_br: "Suspense",
      fr: "Thriller",
    },
    description: {
      en: "Built around tension, suspense, and high-stakes situations that keep readers on edge.",
      pt_br:
        "Construído em torno de tensão, suspense e situações de alto risco que mantêm os leitores em alerta.",
    },
    category: "Genre",
    isAdult: false,
  },
  TRAGEDY: {
    name: {
      en: "Tragedy",
      pt_br: "Tragédia",
      fr: "Tragédie",
    },
    description: {
      en: "Centers around tragic events and unhappy endings.",
      pt_br: "Gira em torno de eventos trágicos e finais infelizes.",
    },
    category: "Genre",
    isAdult: false,
  },
  WUXIA: {
    name: {
      en: "Wuxia",
      pt_br: "Wuxia",
      fr: "Wuxia",
    },
    description: {
      en: "Chinese fiction concerning the adventures of martial artists in Ancient China.",
      pt_br: "Ficção chinesa sobre as aventuras de artistas marciais na China Antiga.",
    },
    category: "Genre",
    isAdult: false,
  },

  // MangaDex formats (December 25, 2025)
  ONESHOT: {
    name: {
      en: "Oneshot",
      pt_br: "Oneshot",
      fr: "One-shot",
    },
    description: {
      en: "A media that is a single story.",
      pt_br: "Uma obra que é uma história única.",
    },
    category: "Technical",
    isAdult: false,
  },
  AWARD_WINNING: {
    name: {
      en: "Award Winning",
      pt_br: "Prêmio Ganhador",
      fr: "Primé",
    },
    description: {
      en: "A manga that has won an award.",
      pt_br: "Uma obra que ganhou um prêmio.",
    },
    category: "Technical",
    isAdult: false,
  },
  OFFICIAL_COLORED: {
    name: {
      en: "Official Colored",
      pt_br: "Oficial Colorido",
      fr: "Couleur officielle",
    },
    description: {
      en: "A manga that is officially colored.",
      pt_br: "Uma obra que é oficialmente colorida.",
    },
    category: "Technical",
    isAdult: false,
  },
  LONG_STRIP: {
    name: {
      en: "Long Strip",
      pt_br: "Long Strip",
      fr: "Défilement vertical",
    },
    description: {
      en: "Manga originally published in a vertical, long-strip format, designed for viewing on smartphones. Also known as webtoons.",
      pt_br:
        "Obra originalmente publicado em formato vertical de tira longa, projetado para visualização em smartphones. Também conhecido como webtoons.",
    },
    category: "Technical",
    isAdult: false,
  },
  ANTHOLOGY: {
    name: {
      en: "Anthology",
      pt_br: "Antologia",
      fr: "Anthologie",
    },
    description: {
      en: "A collection of separate works collated into a single release.",
      pt_br: "Uma coleção de obras separadas compiladas em um único lançamento.",
    },
    category: "Technical",
    isAdult: false,
  },
  FAN_COLORED: {
    name: {
      en: "Fan Colored",
      pt_br: "Fan Colorido",
      fr: "Colorisé par des fans",
    },
    description: {
      en: "A manga that is colored by fans.",
      pt_br: "Um mangá que é colorido por fãs.",
    },
    category: "Technical",
    isAdult: false,
  },
  SELF_PUBLISHED: {
    name: {
      en: "Self Published",
      pt_br: "Self Published",
      fr: "Autoédité",
    },
    description: {
      en: "A manga that is self-published.",
      pt_br: "Um mangá que é publicado por si mesmo.",
    },
    category: "Technical",
    isAdult: false,
  },
  FOUR_KOMA: {
    name: {
      en: "4-koma",
      pt_br: "4-koma",
      fr: "4-koma",
    },
    description: {
      en: "A manga in the 'yonkoma' format, which consists of four equal-sized panels arranged in a vertical strip.",
      pt_br:
        "Um mangá no formato 'yonkoma', que consiste em quatro painéis de tamanho igual dispostos em uma faixa vertical.",
    },
    category: "Technical",
    isAdult: false,
  },
  DOUJINSHI: {
    name: {
      en: "Doujinshi",
      pt_br: "Doujinshi",
      fr: "Doujinshi",
    },
    description: {
      en: "A manga that is a doujinshi.",
      pt_br: "Um mangá que é um doujinshi.",
    },
    category: "Technical",
    isAdult: false,
  },
  WEB_COMIC: {
    name: {
      en: "Web Comic",
      pt_br: "Web Comic",
      fr: "Webcomic",
    },
    description: {
      en: "A manga that is a web comic.",
      pt_br: "Um mangá que é um web comic.",
    },
    category: "Technical",
    isAdult: false,
  },
  ADAPTATION: {
    name: {
      en: "Adaptation",
      pt_br: "Adaptation",
      fr: "Adaptation",
    },
    description: {
      en: "A manga that is an adaptation.",
      pt_br: "Um mangá que é uma adaptação.",
    },
    category: "Technical",
    isAdult: false,
  },
  FULL_COLOR: {
    name: {
      en: "Full Color",
      pt_br: "Colorido",
      fr: "Tout en couleur",
    },
    description: {
      en: "Manga that were initially published in full color.",
      pt_br: "Mangá que foi inicialmente publicado em cores completas.",
    },
    category: "Technical",
    isAdult: false,
  },

  /**
   * AniList tags (December 3, 2025)
   *
   * Does not include Boys' Love, Crime, Historical, Isekai,
   * Medecine, Philosophy, Superhero, Tragedy and Wuxia.
   */
  ACHROMATIC: {
    name: {
      en: "Achromatic",
      pt_br: "Acromático",
      fr: "Achromatique",
    },
    description: {
      en: "Contains animation that is primarily done in black and white.",
      pt_br: "Contém animação feita principalmente em preto e branco.",
    },
    category: "Technical",
    isAdult: false,
  },
  ACHRONOLOGICAL_ORDER: {
    name: {
      en: "Achronological Order",
      pt_br: "Ordem Acronológica",
      fr: "Ordre non chronologique",
    },
    description: {
      en: "Chapters or episodes do not occur in chronological order.",
      pt_br: "Os capítulos ou episódios não ocorrem em ordem cronológica.",
    },
    category: "Setting-Time",
    isAdult: false,
  },
  ACROBATICS: {
    name: {
      en: "Acrobatics",
      pt_br: "Acrobacia",
      fr: "Acrobatie",
    },
    description: {
      en: "The art of jumping, tumbling, and balancing. Often paired with trapeze, trampolining, tightropes, or general gymnastics.",
      pt_br:
        "A arte de saltar, dar cambalhotas e equilibrar. Frequentemente combinada com trapézio, trampolim, corda bamba ou ginástica geral.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  ACTING: {
    name: {
      en: "Acting",
      pt_br: "Atuação",
      fr: "Comédie (jeu d’acteur)",
    },
    description: {
      en: "Centers around actors or the acting industry.",
      pt_br: "Gira em torno de atores ou da indústria de atuação.",
    },
    category: "Theme-Arts",
    isAdult: false,
  },
  ADOPTION: {
    name: {
      en: "Adoption",
      pt_br: "Adoção",
      fr: "Adoption",
    },
    description: {
      en: "Features a character who has been adopted by someone who is neither of their biological parents.",
      pt_br:
        "Apresenta um personagem que foi adotado por alguém que não é nenhum de seus pais biológicos.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  ADVERTISEMENT: {
    name: {
      en: "Advertisement",
      pt_br: "Propaganda",
      fr: "Publicité",
    },
    description: {
      en: "Produced in order to promote the products of a certain company.",
      pt_br: "Produzido para promover os produtos de uma determinada empresa.",
    },
    category: "Technical",
    isAdult: false,
  },
  AFTERLIFE: {
    name: {
      en: "Afterlife",
      pt_br: "Vida Após a Morte",
      fr: "Au-delà",
    },
    description: {
      en: "Partly or completely set in the afterlife.",
      pt_br: "Parcialmente ou completamente ambientado na vida após a morte.",
    },
    category: "Setting-Universe",
    isAdult: false,
  },
  AGE_GAP: {
    name: {
      en: "Age Gap",
      pt_br: "Diferença de Idade",
      fr: "Différence d’âge",
    },
    description: {
      en: "Prominently features romantic relations between people with a significant age difference.",
      pt_br:
        "Apresenta relações românticas entre pessoas com uma diferença de idade significativa.",
    },
    category: "Theme-Romance",
    isAdult: false,
  },
  AGE_REGRESSION: {
    name: {
      en: "Age Regression",
      pt_br: "Regressão de Idade",
      fr: "Régression d’âge",
    },
    description: {
      en: "Prominently features a character who was returned to a younger state.",
      pt_br: "Apresenta um personagem que foi retornado a um estado mais jovem.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  AGENDER: {
    name: {
      en: "Agender",
      pt_br: "Agênero",
      fr: "Agenre",
    },
    description: {
      en: "Prominently features agender characters.",
      pt_br: "Apresenta personagens agênero.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  AGRICULTURE: {
    name: {
      en: "Agriculture",
      pt_br: "Agricultura",
      fr: "Agriculture",
    },
    description: {
      en: "Prominently features agriculture practices.",
      pt_br: "Apresenta práticas agrícolas.",
    },
    category: "Theme-Slice of Life",
    isAdult: false,
  },
  AHEGAO: {
    name: {
      en: "Ahegao",
      pt_br: "Ahegao",
      fr: "Ahegao",
    },
    description: {
      en: "Features a character making an exaggerated orgasm face.",
      pt_br: "Apresenta um personagem fazendo uma expressão de orgasmo exagerada.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  AIRSOFT: {
    name: {
      en: "Airsoft",
      pt_br: "Airsoft",
      fr: "Airsoft",
    },
    description: {
      en: "Centers around the sport of airsoft.",
      pt_br: "Gira em torno do esporte de airsoft.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  ALCHEMY: {
    name: {
      en: "Alchemy",
      pt_br: "Alquimia",
      fr: "Alchimie",
    },
    description: {
      en: "Features character(s) who practice alchemy.",
      pt_br: "Apresenta personagem(ns) que praticam alquimia.",
    },
    category: "Theme-Fantasy",
    isAdult: false,
  },
  ALIENS: {
    name: {
      en: "Aliens",
      pt_br: "Alienígenas",
      fr: "Extraterrestres",
    },
    description: {
      en: "Prominently features extraterrestrial lifeforms.",
      pt_br: "Apresenta formas de vida extraterrestres.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  ALTERNATE_UNIVERSE: {
    name: {
      en: "Alternate Universe",
      pt_br: "Universo Alternativo",
      fr: "Univers alternatif",
    },
    description: {
      en: "Features multiple alternate universes in the same series.",
      pt_br: "Apresenta múltiplos universos alternativos na mesma série.",
    },
    category: "Setting-Universe",
    isAdult: false,
  },
  AMERICAN_FOOTBALL: {
    name: {
      en: "American Football",
      pt_br: "Futebol Americano",
      fr: "Football américain",
    },
    description: {
      en: "Centers around the sport of American football.",
      pt_br: "Gira em torno do esporte de futebol americano.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  AMNESIA: {
    name: {
      en: "Amnesia",
      pt_br: "Amnésia",
      fr: "Amnésie",
    },
    description: {
      en: "Prominently features a character(s) with memory loss.",
      pt_br: "Apresenta personagem(ns) com perda de memória.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  AMPUTATION: {
    name: {
      en: "Amputation",
      pt_br: "Amputação",
      fr: "Amputation",
    },
    description: {
      en: "Features amputation or amputees.",
      pt_br: "Apresenta amputação ou amputados.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  ANACHRONISM: {
    name: {
      en: "Anachronism",
      pt_br: "Anacronismo",
      fr: "Anachronisme",
    },
    description: {
      en: "Prominently features elements that are out of place in the historical period the work takes place in, particularly modern elements in a historical setting.",
      pt_br:
        "Apresenta elementos fora de lugar no período histórico em que a obra se passa, particularmente elementos modernos em um cenário histórico.",
    },
    category: "Setting-Time",
    isAdult: false,
  },
  ANAL_SEX: {
    name: {
      en: "Anal Sex",
      pt_br: "Sexo Anal",
      fr: "Sexe anal",
    },
    description: {
      en: "Features sexual penetration of the anal cavity.",
      pt_br: "Apresenta penetração sexual da cavidade anal.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  ANCIENT_CHINA: {
    name: {
      en: "Ancient China",
      pt_br: "China Antiga",
      fr: "Chine ancienne",
    },
    description: {
      en: "Setting in ancient china, does not apply to fantasy settings.",
      pt_br: "Ambientado na China antiga, não se aplica a cenários de fantasia.",
    },
    category: "Setting-Time",
    isAdult: false,
  },
  ANGELS: {
    name: {
      en: "Angels",
      pt_br: "Anjos",
      fr: "Anges",
    },
    description: {
      en: "Prominently features spiritual beings usually represented with wings and halos and believed to be attendants of God.",
      pt_br:
        "Apresenta seres espirituais geralmente representados com asas e auréolas e considerados servos de Deus.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  ANIMALS: {
    name: {
      en: "Animals",
      pt_br: "Animais",
      fr: "Animaux",
    },
    description: {
      en: "Prominently features animal characters in a leading role.",
      pt_br: "Apresenta personagens animais em papéis principais.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  ANTHROPOMORPHISM: {
    name: {
      en: "Anthropomorphism",
      pt_br: "Antropomorfismo",
      fr: "Anthropomorphisme",
    },
    description: {
      en: "Contains non-human character(s) that have attributes or characteristics of a human being.",
      pt_br:
        "Contém personagem(ns) não-humanos que possuem atributos ou características de um ser humano.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  ANTIHERO: {
    name: {
      en: "Anti-Hero",
      pt_br: "Anti-Herói",
      fr: "Antihéros",
    },
    description: {
      en: "Features a protagonist who lacks conventional heroic attributes and may be considered a borderline villain.",
      pt_br:
        "Apresenta um protagonista que carece de atributos heroicos convencionais e pode ser considerado um vilão em potencial.",
    },
    category: "Cast-Main Cast",
    isAdult: false,
  },
  ARCHERY: {
    name: {
      en: "Archery",
      pt_br: "Arco e Flecha",
      fr: "Tir à l’arc",
    },
    description: {
      en: "Centers around the sport of archery, or prominently features the use of archery in combat.",
      pt_br:
        "Gira em torno do esporte de arco e flecha, ou apresenta o uso de arco e flecha em combate.",
    },
    category: "Theme-Action",
    isAdult: false,
  },
  ARMPITS: {
    name: {
      en: "Armpits",
      pt_br: "Axilas",
      fr: "Aisselles",
    },
    description: {
      en: "Features the sexual depiction or stimulation of a character's armpits.",
      pt_br: "Apresenta a representação sexual ou estimulação das axilas de um personagem.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  AROMANTIC: {
    name: {
      en: "Aromantic",
      pt_br: "Arromântico",
      fr: "Aromantique",
    },
    description: {
      en: "Features a character who experiences little to no romantic attraction.",
      pt_br: "Apresenta um personagem que experimenta pouca ou nenhuma atração romântica.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  ARRANGED_MARRIAGE: {
    name: {
      en: "Arranged Marriage",
      pt_br: "Casamento Arranjado",
      fr: "Mariage arrangé",
    },
    description: {
      en: "Features two characters made to marry each other, usually by their family.",
      pt_br: "Apresenta dois personagens obrigados a se casarem, geralmente por suas famílias.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  ARTIFICIAL_INTELLIGENCE: {
    name: {
      en: "Artificial Intelligence",
      pt_br: "Inteligência Artificial",
      fr: "Intelligence artificielle",
    },
    description: {
      en: "Intelligent non-organic machines that work and react similarly to humans.",
      pt_br:
        "Máquinas não-orgânicas inteligentes que funcionam e reagem de forma semelhante aos humanos.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  ASEXUAL: {
    name: {
      en: "Asexual",
      pt_br: "Assexual",
      fr: "Asexuel",
    },
    description: {
      en: "Features a character who isn't sexually attracted to people of any sex or gender.",
      pt_br:
        "Apresenta um personagem que não sente atração sexual por pessoas de nenhum sexo ou gênero.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  ASHIKOKI: {
    name: {
      en: "Ashikoki",
      pt_br: "Ashikoki",
      fr: "Ashikoki",
    },
    description: {
      en: "Footjob; features stimulation of genitalia by feet.",
      pt_br: "Footjob; apresenta estimulação da genitália pelos pés.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  ASPHYXIATION: {
    name: {
      en: "Asphyxiation",
      pt_br: "Asfixia",
      fr: "Asphyxie",
    },
    description: {
      en: "Features breath play.",
      pt_br: "Apresenta jogos de respiração.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  ASSASSINS: {
    name: {
      en: "Assassins",
      pt_br: "Assassinos",
      fr: "Assassins",
    },
    description: {
      en: "Centers around characters who murder people as a profession.",
      pt_br: "Gira em torno de personagens que matam pessoas como profissão.",
    },
    category: "Theme-Other-Organisations",
    isAdult: false,
  },
  ASTRONOMY: {
    name: {
      en: "Astronomy",
      pt_br: "Astronomia",
      fr: "Astronomie",
    },
    description: {
      en: "Relating or centered around the study of celestial objects and phenomena, space, or the universe.",
      pt_br:
        "Relacionado ou centrado no estudo de objetos celestes e fenômenos, espaço ou universo.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  ATHLETICS: {
    name: {
      en: "Athletics",
      pt_br: "Atletismo",
      fr: "Athlétisme",
    },
    description: {
      en: "Centers around sporting events that involve competitive running, jumping, throwing, or walking.",
      pt_br:
        "Gira em torno de eventos esportivos que envolvem corrida, salto, arremesso ou caminhada competitivos.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  AUGMENTED_REALITY: {
    name: {
      en: "Augmented Reality",
      pt_br: "Realidade Aumentada",
      fr: "Réalité augmentée",
    },
    description: {
      en: "Prominently features events with augmented reality as the main setting.",
      pt_br: "Apresenta eventos com realidade aumentada como cenário principal.",
    },
    category: "Setting-Universe",
    isAdult: false,
  },
  AUTOBIOGRAPHICAL: {
    name: {
      en: "Autobiographical",
      pt_br: "Autobiográfico",
      fr: "Autobiographique",
    },
    description: {
      en: "Real stories and anecdotes written by the author about their own life.",
      pt_br: "Histórias reais e anedotas escritas pelo autor sobre sua própria vida.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  AVIATION: {
    name: {
      en: "Aviation",
      pt_br: "Aviação",
      fr: "Aviation",
    },
    description: {
      en: "Regarding the flying or operation of aircraft.",
      pt_br: "Relacionado ao voo ou operação de aeronaves.",
    },
    category: "Theme-Other-Vehicle",
    isAdult: false,
  },
  BADMINTON: {
    name: {
      en: "Badminton",
      pt_br: "Badminton",
      fr: "Badminton",
    },
    description: {
      en: "Centers around the sport of badminton.",
      pt_br: "Gira em torno do esporte de badminton.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  BALLET: {
    name: {
      en: "Ballet",
      pt_br: "Balé",
      fr: "Ballet",
    },
    description: {
      en: "Prominently features the dance art of ballet. Both traditional and contemporary styles.",
      pt_br: "Apresenta a arte da dança do balé. Tanto estilos tradicionais quanto contemporâneos.",
    },
    category: "Theme-Arts",
    isAdult: false,
  },
  BAND: {
    name: {
      en: "Band",
      pt_br: "Banda",
      fr: "Groupe de musique",
    },
    description: {
      en: "Main cast is a group of musicians.",
      pt_br: "O elenco principal é um grupo de músicos.",
    },
    category: "Theme-Arts-Music",
    isAdult: false,
  },
  BAR: {
    name: {
      en: "Bar",
      pt_br: "Bar",
      fr: "Bar",
    },
    description: {
      en: "Partly or completely set in a bar.",
      pt_br: "Parcialmente ou completamente ambientado em um bar.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  BASEBALL: {
    name: {
      en: "Baseball",
      pt_br: "Beisebol",
      fr: "Baseball",
    },
    description: {
      en: "Centers around the sport of baseball.",
      pt_br: "Gira em torno do esporte de beisebol.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  BASKETBALL: {
    name: {
      en: "Basketball",
      pt_br: "Basquete",
      fr: "Basket-ball",
    },
    description: {
      en: "Centers around the sport of basketball.",
      pt_br: "Gira em torno do esporte de basquete.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  BATTLE_ROYALE: {
    name: {
      en: "Battle Royale",
      pt_br: "Battle Royale",
      fr: "Battle royale",
    },
    description: {
      en: "Centers around a fierce group competition, often violent and with only one winner.",
      pt_br:
        "Gira em torno de uma competição em grupo feroz, frequentemente violenta e com apenas um vencedor.",
    },
    category: "Theme-Action",
    isAdult: false,
  },
  BIOGRAPHICAL: {
    name: {
      en: "Biographical",
      pt_br: "Biográfico",
      fr: "Biographique",
    },
    description: {
      en: "Based on true stories of real persons living or dead, written by another.",
      pt_br: "Baseado em histórias reais de pessoas reais vivas ou mortas, escrito por outro.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  BISEXUAL: {
    name: {
      en: "Bisexual",
      pt_br: "Bissexual",
      fr: "Bisexuel",
    },
    description: {
      en: "Features a character who is romantically or sexually attracted to people of more than one sex or gender.",
      pt_br:
        "Apresenta um personagem que sente atração romântica ou sexual por pessoas de mais de um sexo ou gênero.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  BLACKMAIL: {
    name: {
      en: "Blackmail",
      pt_br: "Chantagem",
      fr: "Chantage",
    },
    description: {
      en: "Features a character blackmailing another.",
      pt_br: "Apresenta um personagem chantageando outro.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  BOARD_GAME: {
    name: {
      en: "Board Game",
      pt_br: "Jogo de Tabuleiro",
      fr: "Jeu de société",
    },
    description: {
      en: "Centers around characters playing board games.",
      pt_br: "Gira em torno de personagens jogando jogos de tabuleiro.",
    },
    category: "Theme-Game",
    isAdult: false,
  },
  BOARDING_SCHOOL: {
    name: {
      en: "Boarding School",
      pt_br: "Internato",
      fr: "Internat",
    },
    description: {
      en: "Features characters attending a boarding school.",
      pt_br: "Apresenta personagens frequentando um internato.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  BODY_HORROR: {
    name: {
      en: "Body Horror",
      pt_br: "Horror Corporal",
      fr: "Body horror",
    },
    description: {
      en: "Features characters who undergo horrific transformations or disfigurement, often to their own detriment.",
      pt_br:
        "Apresenta personagens que passam por transformações horríveis ou desfiguração, frequentemente em seu próprio prejuízo.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  BODY_IMAGE: {
    name: {
      en: "Body Image",
      pt_br: "Imagem Corporal",
      fr: "Image corporelle",
    },
    description: {
      en: "Features themes of self-esteem concerning perceived defects or flaws in appearance, such as body weight or disfigurement, and may discuss topics such as eating disorders, fatphobia, and body dysmorphia.",
      pt_br:
        "Apresenta temas de autoestima relacionados a defeitos ou falhas percebidas na aparência, como peso corporal ou desfiguração, e pode discutir tópicos como distúrbios alimentares, gordofobia e dismorfia corporal.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  BODY_SWAPPING: {
    name: {
      en: "Body Swapping",
      pt_br: "Troca de Corpos",
      fr: "Échange de corps",
    },
    description: {
      en: "Centers around individuals swapping bodies with one another.",
      pt_br: "Gira em torno de indivíduos trocando de corpos uns com os outros.",
    },
    category: "Theme-Fantasy",
    isAdult: false,
  },
  BONDAGE: {
    name: {
      en: "Bondage",
      pt_br: "Bondage",
      fr: "Bondage",
    },
    description: {
      en: "Features BDSM, with or without the use of accessories.",
      pt_br: "Apresenta BDSM, com ou sem o uso de acessórios.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  BOOBJOB: {
    name: {
      en: "Boobjob",
      pt_br: "Boobjob",
      fr: "Branlette espagnole",
    },
    description: {
      en: "Features the stimulation of male genitalia by breasts.",
      pt_br: "Apresenta a estimulação da genitália masculina pelos seios.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  BOWLING: {
    name: {
      en: "Bowling",
      pt_br: "Boliche",
      fr: "Bowling",
    },
    description: {
      en: "Centers around the sport of Bowling.",
      pt_br: "Gira em torno do esporte de boliche.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  BOXING: {
    name: {
      en: "Boxing",
      pt_br: "Boxe",
      fr: "Boxe",
    },
    description: {
      en: "Centers around the sport of boxing.",
      pt_br: "Gira em torno do esporte de boxe.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  BULLYING: {
    name: {
      en: "Bullying",
      pt_br: "Bullying",
      fr: "Harcèlement scolaire",
    },
    description: {
      en: "Prominently features the use of force for intimidation, often in a school setting.",
      pt_br: "Apresenta o uso de força para intimidação, frequentemente em um ambiente escolar.",
    },
    category: "Theme-Drama",
    isAdult: false,
  },
  BUTLER: {
    name: {
      en: "Butler",
      pt_br: "Mordomo",
      fr: "Majordome",
    },
    description: {
      en: "Prominently features a character who is a butler.",
      pt_br: "Apresenta um personagem que é um mordomo.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  CALLIGRAPHY: {
    name: {
      en: "Calligraphy",
      pt_br: "Caligrafia",
      fr: "Calligraphie",
    },
    description: {
      en: "Centers around the art of calligraphy.",
      pt_br: "Gira em torno da arte da caligrafia.",
    },
    category: "Theme-Arts",
    isAdult: false,
  },
  CAMPING: {
    name: {
      en: "Camping",
      pt_br: "Acampamento",
      fr: "Camping",
    },
    description: {
      en: "Features the recreational activity of camping, either in a tent, vehicle, or simply sleeping outdoors.",
      pt_br:
        "Apresenta a atividade recreativa de acampar, seja em uma barraca, veículo ou simplesmente dormindo ao ar livre.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  CANNIBALISM: {
    name: {
      en: "Cannibalism",
      pt_br: "Canibalismo",
      fr: "Cannibalisme",
    },
    description: {
      en: "Prominently features the act of consuming another member of the same species as food.",
      pt_br: "Apresenta o ato de consumir outro membro da mesma espécie como alimento.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  CARD_BATTLE: {
    name: {
      en: "Card Battle",
      pt_br: "Batalha de Cartas",
      fr: "Combat de cartes",
    },
    description: {
      en: "Centers around individuals competing in card games.",
      pt_br: "Gira em torno de indivíduos competindo em jogos de cartas.",
    },
    category: "Theme-Game-Card & Board Game",
    isAdult: false,
  },
  CARS: {
    name: {
      en: "Cars",
      pt_br: "Carros",
      fr: "Voitures",
    },
    description: {
      en: "Centers around the use of automotive vehicles.",
      pt_br: "Gira em torno do uso de veículos automotivos.",
    },
    category: "Theme-Other-Vehicle",
    isAdult: false,
  },
  CENTAUR: {
    name: {
      en: "Centaur",
      pt_br: "Centauro",
      fr: "Centaure",
    },
    description: {
      en: "Prominently features a character with a human upper body and the lower body of a horse.",
      pt_br:
        "Apresenta um personagem com a parte superior do corpo humana e a parte inferior de um cavalo.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  CERVIX_PENETRATION: {
    name: {
      en: "Cervix Penetration",
      pt_br: "Penetração Cervical",
      fr: "Pénétration du col",
    },
    description: {
      en: "A sexual act in which the cervix is visibly penetrated.",
      pt_br: "Um ato sexual em que o colo do útero é visivelmente penetrado.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  CGI: {
    name: {
      en: "CGI",
      pt_br: "CGI",
      fr: "Images de synthèse",
    },
    description: {
      en: "Prominently features scenes created with computer-generated imagery.",
      pt_br: "Apresenta cenas criadas com imagens geradas por computador.",
    },
    category: "Technical",
    isAdult: false,
  },
  CHEATING: {
    name: {
      en: "Cheating",
      pt_br: "Traição",
      fr: "Infidélité",
    },
    description: {
      en: "Features a character with a partner shown being intimate with someone else consensually.",
      pt_br:
        "Apresenta um personagem com um parceiro sendo íntimo com outra pessoa consensualmente.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  CHEERLEADING: {
    name: {
      en: "Cheerleading",
      pt_br: "Cheerleading",
      fr: "Pom-pom girls",
    },
    description: {
      en: "Centers around the activity of cheerleading.",
      pt_br: "Gira em torno da atividade de cheerleading.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  CHIBI: {
    name: {
      en: "Chibi",
      pt_br: "Chibi",
      fr: "Chibi",
    },
    description: {
      en: 'Features "super deformed" character designs with smaller, rounder proportions and a cute look.',
      pt_br:
        'Apresenta designs de personagens "super deformados" com proporções menores, mais arredondadas e aparência fofa.',
    },
    category: "Theme-Other",
    isAdult: false,
  },
  CHIMERA: {
    name: {
      en: "Chimera",
      pt_br: "Quimera",
      fr: "Chimère",
    },
    description: {
      en: "Features a beast made by combining animals, usually with humans.",
      pt_br: "Apresenta uma fera feita pela combinação de animais, geralmente com humanos.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  CHUUNIBYOU: {
    name: {
      en: "Chuunibyou",
      pt_br: "Chuunibyou",
      fr: "Chuunibyou",
    },
    description: {
      en: 'Prominently features a character with "Middle School 2nd Year Syndrome", who either acts like a know-it-all adult or falsely believes they have special powers.',
      pt_br:
        'Apresenta um personagem com "Síndrome do 2º Ano do Ensino Médio", que age como um adulto sabe-tudo ou acredita falsamente que tem poderes especiais.',
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  CIRCUS: {
    name: {
      en: "Circus",
      pt_br: "Circo",
      fr: "Cirque",
    },
    description: {
      en: "Prominently features a circus.",
      pt_br: "Apresenta um circo.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  CLASS_STRUGGLE: {
    name: {
      en: "Class Struggle",
      pt_br: "Luta de Classes",
      fr: "Lutte des classes",
    },
    description: {
      en: "Contains conflict born between the different social classes. Generally between an dominant elite and a suffering oppressed group.",
      pt_br:
        "Contém conflito nascido entre as diferentes classes sociais. Geralmente entre uma elite dominante e um grupo oprimido que sofre.",
    },
    category: "Theme-Drama",
    isAdult: false,
  },
  CLASSIC_LITERATURE: {
    name: {
      en: "Classic Literature",
      pt_br: "Literatura Clássica",
      fr: "Littérature classique",
    },
    description: {
      en: "Discusses or adapts a work of classic world literature.",
      pt_br: "Discute ou adapta uma obra da literatura clássica mundial.",
    },
    category: "Theme-Arts",
    isAdult: false,
  },
  CLASSICAL_MUSIC: {
    name: {
      en: "Classical Music",
      pt_br: "Música Clássica",
      fr: "Musique classique",
    },
    description: {
      en: "Centers on the musical style of classical, not to be applied to anime that use classical in its soundtrack.",
      pt_br:
        "Gira em torno do estilo musical clássico, não se aplica a animes que usam clássico em sua trilha sonora.",
    },
    category: "Theme-Arts-Music",
    isAdult: false,
  },
  CLONE: {
    name: {
      en: "Clone",
      pt_br: "Clone",
      fr: "Clone",
    },
    description: {
      en: "Prominently features a character who is an artificial exact copy of another organism.",
      pt_br: "Apresenta um personagem que é uma cópia artificial exata de outro organismo.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  COASTAL: {
    name: {
      en: "Coastal",
      pt_br: "Costeiro",
      fr: "Littoral",
    },
    description: {
      en: "Story prominently takes place near the beach or around a coastal area/town. Setting is near the ocean.",
      pt_br:
        "A história se passa principalmente perto da praia ou em uma área/cidade costeira. O cenário é perto do oceano.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  COHABITATION: {
    name: {
      en: "Cohabitation",
      pt_br: "Coabitação",
      fr: "Cohabitation",
    },
    description: {
      en: "Features two or more people who live in the same household and develop a romantic or sexual relationship.",
      pt_br:
        "Apresenta duas ou mais pessoas que vivem na mesma casa e desenvolvem um relacionamento romântico ou sexual.",
    },
    category: "Theme-Romance",
    isAdult: false,
  },
  COLLEGE: {
    name: {
      en: "College",
      pt_br: "Faculdade",
      fr: "Université",
    },
    description: {
      en: "Partly or completely set in a college or university.",
      pt_br: "Parcialmente ou completamente ambientado em uma faculdade ou universidade.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  COMING_OF_AGE: {
    name: {
      en: "Coming of Age",
      pt_br: "Amadurecimento",
      fr: "Passage à l’âge adulte",
    },
    description: {
      en: "Centers around a character's transition from childhood to adulthood.",
      pt_br: "Gira em torno da transição de um personagem da infância para a vida adulta.",
    },
    category: "Theme-Drama",
    isAdult: false,
  },
  CONSPIRACY: {
    name: {
      en: "Conspiracy",
      pt_br: "Conspiração",
      fr: "Conspiration",
    },
    description: {
      en: "Contains one or more factions controlling or attempting to control the world from the shadows.",
      pt_br: "Contém uma ou mais facções controlando ou tentando controlar o mundo nas sombras.",
    },
    category: "Theme-Drama",
    isAdult: false,
  },
  COSMIC_HORROR: {
    name: {
      en: "Cosmic Horror",
      pt_br: "Horror Cósmico",
      fr: "Horreur cosmique",
    },
    description: {
      en: "A type of horror that emphasizes human insignificance in the grand scope of cosmic reality; fearing the unknown and being powerless to fight it.",
      pt_br:
        "Um tipo de horror que enfatiza a insignificância humana no grande escopo da realidade cósmica; temendo o desconhecido e sendo impotente para lutar contra ele.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  COSPLAY: {
    name: {
      en: "Cosplay",
      pt_br: "Cosplay",
      fr: "Cosplay",
    },
    description: {
      en: "Features dressing up as a different character or profession.",
      pt_br: "Apresenta vestir-se como um personagem ou profissão diferente.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  COWBOYS: {
    name: {
      en: "Cowboys",
      pt_br: "Cowboys",
      fr: "Cowboys",
    },
    description: {
      en: "Features Western or Western-inspired cowboys.",
      pt_br: "Apresenta cowboys ocidentais ou inspirados no Velho Oeste.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  CREATURE_TAMING: {
    name: {
      en: "Creature Taming",
      pt_br: "Domesticação de Criaturas",
      fr: "Dressage de créatures",
    },
    description: {
      en: "Features the taming of animals, monsters, or other creatures.",
      pt_br: "Apresenta a domesticação de animais, monstros ou outras criaturas.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  CRIMINAL_ORGANIZATION: {
    name: {
      en: "Criminal Organization",
      pt_br: "Organização Criminosa",
      fr: "Organisation criminelle",
    },
    description: {
      en: "Prominently features a group of people who commit crimes for illicit or violent purposes.",
      pt_br: "Apresenta um grupo de pessoas que cometem crimes para fins ilícitos ou violentos.",
    },
    category: "Theme-Other-Organisations",
    isAdult: false,
  },
  CROSSDRESSING: {
    name: {
      en: "Crossdressing",
      pt_br: "Crossdressing",
      fr: "Travestissement",
    },
    description: {
      en: "Prominently features a character dressing up as the opposite sex.",
      pt_br: "Apresenta um personagem vestindo-se como o sexo oposto.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  CROSSOVER: {
    name: {
      en: "Crossover",
      pt_br: "Crossover",
      fr: "Crossover",
    },
    description: {
      en: "Centers around the placement of two or more otherwise discrete fictional characters, settings, or universes into the context of a single story.",
      pt_br:
        "Gira em torno da colocação de dois ou mais personagens, cenários ou universos ficcionais distintos no contexto de uma única história.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  CULT: {
    name: {
      en: "Cult",
      pt_br: "Culto",
      fr: "Secte",
    },
    description: {
      en: "Features a social group with unorthodox religious, spiritual, or philosophical beliefs and practices.",
      pt_br:
        "Apresenta um grupo social com crenças e práticas religiosas, espirituais ou filosóficas não ortodoxas.",
    },
    category: "Theme-Other-Organisations",
    isAdult: false,
  },
  CULTIVATION: {
    name: {
      en: "Cultivation",
      pt_br: "Cultivo",
      fr: "Cultivation",
    },
    description: {
      en: 'Features characters using training, often martial arts-related, and other special methods to cultivate qi (a component of traditional Chinese philosophy, described as "life force") and gain strength or immortality.',
      pt_br:
        'Apresenta personagens usando treinamento, frequentemente relacionado a artes marciais, e outros métodos especiais para cultivar qi (um componente da filosofia tradicional chinesa, descrito como "força vital") e ganhar força ou imortalidade.',
    },
    category: "Theme-Fantasy",
    isAdult: false,
  },
  CUMFLATION: {
    name: {
      en: "Cumflation",
      pt_br: "Cumflation",
      fr: "Cumflation",
    },
    description: {
      en: "The stomach area expands outward like a balloon due to being filled specifically with semen.",
      pt_br:
        "A área do estômago expande para fora como um balão devido a ser preenchida especificamente com sêmen.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  CUNNILINGUS: {
    name: {
      en: "Cunnilingus",
      pt_br: "Cunnilingus",
      fr: "Cunnilingus",
    },
    description: {
      en: "Features oral sex performed on female genitalia.",
      pt_br: "Apresenta sexo oral realizado na genitália feminina.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  CURSES: {
    name: {
      en: "Curses",
      pt_br: "Maldições",
      fr: "Malédictions",
    },
    description: {
      en: "Features a character, object or area that has been cursed, usually by a malevolent supernatural force.",
      pt_br:
        "Apresenta um personagem, objeto ou área que foi amaldiçoado, geralmente por uma força sobrenatural malévola.",
    },
    category: "Theme-Fantasy",
    isAdult: false,
  },
  CUTE_BOYS_DOING_CUTE_THINGS: {
    name: {
      en: "Cute Boys Doing Cute Things",
      pt_br: "Garotos Fofos Fazendo Coisas Fofas",
      fr: "Garçons mignons faisant des choses mignonnes",
    },
    description: {
      en: "Centers around male characters doing cute activities, usually with little to no emphasis on drama and conflict.",
      pt_br:
        "Gira em torno de personagens masculinos fazendo atividades fofas, geralmente com pouca ou nenhuma ênfase em drama e conflito.",
    },
    category: "Theme-Slice of Life",
    isAdult: false,
  },
  CUTE_GIRLS_DOING_CUTE_THINGS: {
    name: {
      en: "Cute Girls Doing Cute Things",
      pt_br: "Garotas Fofas Fazendo Coisas Fofas",
      fr: "Filles mignonnes faisant des choses mignonnes",
    },
    description: {
      en: "Centers around female characters doing cute activities, usually with little to no emphasis on drama and conflict.\n",
      pt_br:
        "Gira em torno de personagens femininas fazendo atividades fofas, geralmente com pouca ou nenhuma ênfase em drama e conflito.",
    },
    category: "Theme-Slice of Life",
    isAdult: false,
  },
  CYBERPUNK: {
    name: {
      en: "Cyberpunk",
      pt_br: "Cyberpunk",
      fr: "Cyberpunk",
    },
    description: {
      en: "Set in a future of advanced technological and scientific achievements that have resulted in social disorder.",
      pt_br:
        "Ambientado em um futuro de avanços tecnológicos e científicos que resultaram em desordem social.",
    },
    category: "Theme-Sci-Fi",
    isAdult: false,
  },
  CYBORG: {
    name: {
      en: "Cyborg",
      pt_br: "Ciborgue",
      fr: "Cyborg",
    },
    description: {
      en: "Prominently features a human character whose physiological functions are aided or enhanced by artificial means.",
      pt_br:
        "Apresenta um personagem humano cujas funções fisiológicas são auxiliadas ou aprimoradas por meios artificiais.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  CYCLING: {
    name: {
      en: "Cycling",
      pt_br: "Ciclismo",
      fr: "Cyclisme",
    },
    description: {
      en: "Centers around the sport of cycling.",
      pt_br: "Gira em torno do esporte de ciclismo.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  DANCING: {
    name: {
      en: "Dancing",
      pt_br: "Dança",
      fr: "Danse",
    },
    description: {
      en: "Centers around the art of dance.",
      pt_br: "Gira em torno da arte da dança.",
    },
    category: "Theme-Arts-Music",
    isAdult: false,
  },
  DEATH_GAME: {
    name: {
      en: "Death Game",
      pt_br: "Jogo Mortal",
      fr: "Jeu mortel",
    },
    description: {
      en: "Features characters participating in a game, where failure results in death.",
      pt_br: "Apresenta personagens participando de um jogo, onde a falha resulta em morte.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  DEEPTHROAT: {
    name: {
      en: "Deepthroat",
      pt_br: "Garganta Profunda",
      fr: "Gorge profonde",
    },
    description: {
      en: "Features oral sex where the majority of the erect male genitalia is inside another person's mouth, usually stimulating some gagging in the back of their throat.",
      pt_br:
        "Apresenta sexo oral onde a maior parte da genitália masculina ereta está dentro da boca de outra pessoa, geralmente estimulando algum engasgo na parte de trás da garganta.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  DEFLORATION: {
    name: {
      en: "Defloration",
      pt_br: "Defloração",
      fr: "Défloration",
    },
    description: {
      en: "Features a female character who has never had sexual relations (until now).",
      pt_br: "Apresenta uma personagem feminina que nunca teve relações sexuais (até agora).",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  DELINQUENTS: {
    name: {
      en: "Delinquents",
      pt_br: "Delinquentes",
      fr: "Délinquants",
    },
    description: {
      en: 'Features characters with a notorious image and attitude, sometimes referred to as "yankees".',
      pt_br:
        'Apresenta personagens com uma imagem e atitude notória, às vezes chamados de "yankees".',
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  DEMONS: {
    name: {
      en: "Demons",
      pt_br: "Demônios",
      fr: "Démons",
    },
    description: {
      en: "Prominently features malevolent otherworldly creatures.",
      pt_br: "Apresenta criaturas malignas de outro mundo.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  DENPA: {
    name: {
      en: "Denpa",
      pt_br: "Denpa",
      fr: "Denpa",
    },
    description: {
      en: "Works that feature themes of social dissociation, delusions, and other issues like suicide, bullying, self-isolation, paranoia, and technological necessity in daily lives. Classic iconography: telephone poles, rooftops, and trains.",
      pt_br:
        "Obras que apresentam temas de dissociação social, delírios e outros problemas como suicídio, bullying, auto-isolamento, paranoia e necessidade tecnológica na vida cotidiana. Iconografia clássica: postes de telefone, telhados e trens.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  DESERT: {
    name: {
      en: "Desert",
      pt_br: "Deserto",
      fr: "Désert",
    },
    description: {
      en: "Prominently features a desert environment.",
      pt_br: "Apresenta um ambiente de deserto.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  DETECTIVE: {
    name: {
      en: "Detective",
      pt_br: "Detetive",
      fr: "Détective",
    },
    description: {
      en: "Features a character who investigates and solves crimes.",
      pt_br: "Apresenta um personagem que investiga e resolve crimes.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  DILF: {
    name: {
      en: "DILF",
      pt_br: "DILF",
      fr: "DILF",
    },
    description: {
      en: "Features sexual intercourse with older men.",
      pt_br: "Apresenta relações sexuais com homens mais velhos.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  DINOSAURS: {
    name: {
      en: "Dinosaurs",
      pt_br: "Dinossauros",
      fr: "Dinosaures",
    },
    description: {
      en: "Prominently features Dinosaurs, prehistoric reptiles that went extinct millions of years ago.",
      pt_br: "Apresenta dinossauros, répteis pré-históricos que foram extintos há milhões de anos.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  DISABILITY: {
    name: {
      en: "Disability",
      pt_br: "Deficiência",
      fr: "Handicap",
    },
    description: {
      en: "A work that features one or more characters with a physical, mental, cognitive, or developmental condition that impairs, interferes with, or limits the person's ability to engage in certain tasks or actions.",
      pt_br:
        "Uma obra que apresenta um ou mais personagens com uma condição física, mental, cognitiva ou de desenvolvimento que prejudica, interfere ou limita a capacidade da pessoa de se envolver em certas tarefas ou ações.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  DISSOCIATIVE_IDENTITIES: {
    name: {
      en: "Dissociative Identities",
      pt_br: "Identidades Dissociativas",
      fr: "Identités dissociatives",
    },
    description: {
      en: "A case where one or more people share the same body.",
      pt_br: "Um caso em que uma ou mais pessoas compartilham o mesmo corpo.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  DOUBLE_PENETRATION: {
    name: {
      en: "Double Penetration",
      pt_br: "Dupla Penetração",
      fr: "Double pénétration",
    },
    description: {
      en: "A sexual act in which the vagina/anus are penetrated by two penises/toys.",
      pt_br: "Um ato sexual em que a vagina/ânus são penetrados por dois pênis/brinquedos.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  DRAGONS: {
    name: {
      en: "Dragons",
      pt_br: "Dragões",
      fr: "Dragons",
    },
    description: {
      en: "Prominently features mythical reptiles which generally have wings and can breathe fire.",
      pt_br: "Apresenta répteis míticos que geralmente têm asas e podem cuspir fogo.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  DRAWING: {
    name: {
      en: "Drawing",
      pt_br: "Desenho",
      fr: "Dessin",
    },
    description: {
      en: "Centers around the art of drawing, including manga and doujinshi.",
      pt_br: "Gira em torno da arte do desenho, incluindo mangá e doujinshi.",
    },
    category: "Theme-Arts",
    isAdult: false,
  },
  DRUGS: {
    name: {
      en: "Drugs",
      pt_br: "Drogas",
      fr: "Drogues",
    },
    description: {
      en: "Prominently features the usage of drugs such as opioids, stimulants, hallucinogens etc.",
      pt_br: "Apresenta o uso de drogas como opioides, estimulantes, alucinógenos etc.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  DULLAHAN: {
    name: {
      en: "Dullahan",
      pt_br: "Dullahan",
      fr: "Dullahan",
    },
    description: {
      en: "Prominently features a character who is a Dullahan, a creature from Irish Folklore with a head that can be detached from its main body.",
      pt_br:
        "Apresenta um personagem que é um Dullahan, uma criatura do folclore irlandês com uma cabeça que pode ser destacada de seu corpo principal.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  DUNGEON: {
    name: {
      en: "Dungeon",
      pt_br: "Masmorra",
      fr: "Donjon",
    },
    description: {
      en: "Prominently features a dungeon environment.",
      pt_br: "Apresenta um ambiente de masmorra.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  DYSTOPIAN: {
    name: {
      en: "Dystopian",
      pt_br: "Distópico",
      fr: "Dystopie",
    },
    description: {
      en: "Partly or completely set in a society characterized by poverty, squalor or oppression.",
      pt_br:
        "Parcialmente ou completamente ambientado em uma sociedade caracterizada por pobreza, miséria ou opressão.",
    },
    category: "Setting-Time",
    isAdult: false,
  },
  ESPORTS: {
    name: {
      en: "E-Sports",
      pt_br: "E-Sports",
      fr: "E-sport",
    },
    description: {
      en: "Prominently features professional video game competitions, tournaments, players, etc.",
      pt_br: "Apresenta competições profissionais de videogame, torneios, jogadores, etc.",
    },
    category: "Theme-Game",
    isAdult: false,
  },
  ECO_HORROR: {
    name: {
      en: "Eco-Horror",
      pt_br: "Eco-Horror",
      fr: "Horreur écologique",
    },
    description: {
      en: "Utilizes a horrifying depiction of ecology to explore man and its relationship with nature.",
      pt_br:
        "Utiliza uma representação horrível da ecologia para explorar o homem e sua relação com a natureza.",
    },
    category: "Theme-Drama",
    isAdult: false,
  },
  ECONOMICS: {
    name: {
      en: "Economics",
      pt_br: "Economia",
      fr: "Économie",
    },
    description: {
      en: "Centers around the field of economics.",
      pt_br: "Gira em torno do campo da economia.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  EDUCATIONAL: {
    name: {
      en: "Educational",
      pt_br: "Educativo",
      fr: "Éducatif",
    },
    description: {
      en: "Primary aim is to educate the audience.",
      pt_br: "O objetivo principal é educar o público.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  ELDERLY_PROTAGONIST: {
    name: {
      en: "Elderly Protagonist",
      pt_br: "Protagonista Idoso",
      fr: "Protagoniste âgé",
    },
    description: {
      en: "The protagonist is either over 60 years of age, has an elderly appearance, or, in the case of non-humans, is considered elderly for their species.",
      pt_br:
        "O protagonista tem mais de 60 anos de idade, aparência idosa ou, no caso de não-humanos, é considerado idoso para sua espécie.",
    },
    category: "Cast-Main Cast",
    isAdult: false,
  },
  ELF: {
    name: {
      en: "Elf",
      pt_br: "Elfo",
      fr: "Elfe",
    },
    description: {
      en: "Prominently features a character who is an elf.",
      pt_br: "Apresenta um personagem que é um elfo.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  ENSEMBLE_CAST: {
    name: {
      en: "Ensemble Cast",
      pt_br: "Elenco Conjunto",
      fr: "Distribution chorale",
    },
    description: {
      en: "Features a large cast of characters with (almost) equal screen time and importance to the plot.",
      pt_br:
        "Apresenta um grande elenco de personagens com tempo de tela (quase) igual e importância para o enredo.",
    },
    category: "Cast-Main Cast",
    isAdult: false,
  },
  ENVIRONMENTAL: {
    name: {
      en: "Environmental",
      pt_br: "Ambiental",
      fr: "Environnement",
    },
    description: {
      en: "Concern with the state of the natural world and how humans interact with it.",
      pt_br: "Preocupação com o estado do mundo natural e como os humanos interagem com ele.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  EPISODIC: {
    name: {
      en: "Episodic",
      pt_br: "Episódico",
      fr: "Épisodique",
    },
    description: {
      en: "Features story arcs that are loosely tied or lack an overarching plot.",
      pt_br: "Apresenta arcos de história fracamente conectados ou sem um enredo abrangente.",
    },
    category: "Technical",
    isAdult: false,
  },
  ERO_GURO: {
    name: {
      en: "Ero Guro",
      pt_br: "Ero Guro",
      fr: "Ero guro",
    },
    description: {
      en: "Japanese literary and artistic movement originating in the 1930's. Works have a focus on grotesque eroticism, sexual corruption, and decadence.",
      pt_br:
        "Movimento literário e artístico japonês originado nos anos 1930. As obras focam em erotismo grotesco, corrupção sexual e decadência.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  EROTIC_PIERCINGS: {
    name: {
      en: "Erotic Piercings",
      pt_br: "Piercings Eróticos",
      fr: "Piercings érotiques",
    },
    description: {
      en: "Features a type of body modification designed to enhance sexual pleasure and intimacy, and/or decoratively adorns portions of the body considered sexual in nature.",
      pt_br:
        "Apresenta um tipo de modificação corporal projetada para aumentar o prazer sexual e a intimidade, e/ou decorar partes do corpo consideradas sexuais por natureza.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  ESPIONAGE: {
    name: {
      en: "Espionage",
      pt_br: "Espionagem",
      fr: "Espionnage",
    },
    description: {
      en: "Prominently features characters infiltrating an organization in order to steal sensitive information.",
      pt_br:
        "Apresenta personagens infiltrando uma organização para roubar informações confidenciais.",
    },
    category: "Theme-Action",
    isAdult: false,
  },
  ESTRANGED_FAMILY: {
    name: {
      en: "Estranged Family",
      pt_br: "Família Afastada",
      fr: "Famille éloignée",
    },
    description: {
      en: "At least one family member of the MC intentionally distances themselves or a family distances themselves from a person related to the MC.",
      pt_br:
        "Pelo menos um membro da família do MC se distancia intencionalmente ou uma família se distancia de uma pessoa relacionada ao MC.",
    },
    category: "Cast-Main Cast",
    isAdult: false,
  },
  EXHIBITIONISM: {
    name: {
      en: "Exhibitionism",
      pt_br: "Exibicionismo",
      fr: "Exhibitionnisme",
    },
    description: {
      en: "Features the act of exposing oneself in public for sexual pleasure.",
      pt_br: "Apresenta o ato de se expor em público para prazer sexual.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  EXORCISM: {
    name: {
      en: "Exorcism",
      pt_br: "Exorcismo",
      fr: "Exorcisme",
    },
    description: {
      en: "Involving religious methods of vanquishing youkai, demons, or other supernatural entities.",
      pt_br:
        "Envolve métodos religiosos de banir youkai, demônios ou outras entidades sobrenaturais.",
    },
    category: "Theme-Fantasy",
    isAdult: false,
  },
  FACIAL: {
    name: {
      en: "Facial",
      pt_br: "Facial",
      fr: "Facial",
    },
    description: {
      en: "Features sexual ejaculation onto an individual's face.",
      pt_br: "Apresenta ejaculação sexual no rosto de um indivíduo.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  FAIRY: {
    name: {
      en: "Fairy",
      pt_br: "Fada",
      fr: "Fée",
    },
    description: {
      en: "Prominently features a character who is a fairy.",
      pt_br: "Apresenta um personagem que é uma fada.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  FAIRY_TALE: {
    name: {
      en: "Fairy Tale",
      pt_br: "Conto de Fadas",
      fr: "Conte de fées",
    },
    description: {
      en: "This work tells a fairy tale, centers around fairy tales, or is based on a classic fairy tale.",
      pt_br:
        "Esta obra conta um conto de fadas, gira em torno de contos de fadas ou é baseada em um conto de fadas clássico.",
    },
    category: "Theme-Fantasy",
    isAdult: false,
  },
  FAKE_RELATIONSHIP: {
    name: {
      en: "Fake Relationship",
      pt_br: "Relacionamento Falso",
      fr: "Fausse relation",
    },
    description: {
      en: "When two characters enter a fake relationship that mutually benefits one or both involved.",
      pt_br:
        "Quando dois personagens entram em um relacionamento falso que beneficia mutuamente um ou ambos os envolvidos.",
    },
    category: "Theme-Drama",
    isAdult: false,
  },
  FAMILY_LIFE: {
    name: {
      en: "Family Life",
      pt_br: "Vida Familiar",
      fr: "Vie de famille",
    },
    description: {
      en: "Centers around the activities of a family unit.",
      pt_br: "Gira em torno das atividades de uma unidade familiar.",
    },
    category: "Theme-Slice of Life",
    isAdult: false,
  },
  FASHION: {
    name: {
      en: "Fashion",
      pt_br: "Moda",
      fr: "Mode",
    },
    description: {
      en: "Centers around the fashion industry.",
      pt_br: "Gira em torno da indústria da moda.",
    },
    category: "Theme-Arts",
    isAdult: false,
  },
  FEET: {
    name: {
      en: "Feet",
      pt_br: "Pés",
      fr: "Pieds",
    },
    description: {
      en: "Features the sexual depiction or stimulation of a character's feet.",
      pt_br: "Apresenta a representação sexual ou estimulação dos pés de um personagem.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  FELLATIO: {
    name: {
      en: "Fellatio",
      pt_br: "Felação",
      fr: "Fellation",
    },
    description: {
      en: "Blowjob; features oral sex performed on male genitalia.",
      pt_br: "Boquete; apresenta sexo oral realizado na genitália masculina.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  FEMALE_HAREM: {
    name: {
      en: "Female Harem",
      pt_br: "Harém Feminino",
      fr: "Harem féminin",
    },
    description: {
      en: "Main cast features the protagonist plus several female characters who are romantically interested in them.",
      pt_br:
        "O elenco principal apresenta o protagonista mais várias personagens femininas que estão romanticamente interessadas nele.",
    },
    category: "Theme-Romance",
    isAdult: false,
  },
  FEMALE_PROTAGONIST: {
    name: {
      en: "Female Protagonist",
      pt_br: "Protagonista Feminina",
      fr: "Protagoniste féminine",
    },
    description: {
      en: "Main character is female.",
      pt_br: "A personagem principal é feminina.",
    },
    category: "Cast-Main Cast",
    isAdult: false,
  },
  FEMBOY: {
    name: {
      en: "Femboy",
      pt_br: "Femboy",
      fr: "Femboy",
    },
    description: {
      en: "Features a boy who exhibits characteristics or behaviors considered in many cultures to be typical of girls.",
      pt_br:
        "Apresenta um garoto que exibe características ou comportamentos considerados em muitas culturas como típicos de garotas.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  FEMDOM: {
    name: {
      en: "Femdom",
      pt_br: "Femdom",
      fr: "Femdom",
    },
    description: {
      en: "Female Dominance. Features sexual acts with a woman in a dominant position.",
      pt_br: "Dominação Feminina. Apresenta atos sexuais com uma mulher em posição dominante.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  FENCING: {
    name: {
      en: "Fencing",
      pt_br: "Esgrima",
      fr: "Escrime",
    },
    description: {
      en: "Centers around the sport of fencing.",
      pt_br: "Gira em torno do esporte de esgrima.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  FILMMAKING: {
    name: {
      en: "Filmmaking",
      pt_br: "Produção Cinematográfica",
      fr: "Cinéma",
    },
    description: {
      en: "Centers around the art of filmmaking.",
      pt_br: "Gira em torno da arte de fazer filmes.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  FINGERING: {
    name: {
      en: "Fingering",
      pt_br: "Dedilhado",
      fr: "Doigtage",
    },
    description: {
      en: "Features vaginal or anal insertion of fingers.",
      pt_br: "Apresenta inserção vaginal ou anal de dedos.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  FIREFIGHTERS: {
    name: {
      en: "Firefighters",
      pt_br: "Bombeiros",
      fr: "Pompiers",
    },
    description: {
      en: "Centered around the life and activities of rescuers specialised in firefighting.",
      pt_br: "Centrado na vida e atividades de socorristas especializados em combate a incêndios.",
    },
    category: "Theme-Other-Organisations",
    isAdult: false,
  },
  FISHING: {
    name: {
      en: "Fishing",
      pt_br: "Pesca",
      fr: "Pêche",
    },
    description: {
      en: "Centers around the sport of fishing.",
      pt_br: "Gira em torno do esporte de pesca.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  FISTING: {
    name: {
      en: "Fisting",
      pt_br: "Fisting",
      fr: "Fisting",
    },
    description: {
      en: "A sexual activity that involves inserting one or more hands into the vagina or rectum.",
      pt_br: "Uma atividade sexual que envolve inserir uma ou mais mãos na vagina ou reto.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  FITNESS: {
    name: {
      en: "Fitness",
      pt_br: "Fitness",
      fr: "Fitness",
    },
    description: {
      en: "Centers around exercise with the aim of improving physical health.",
      pt_br: "Gira em torno de exercícios com o objetivo de melhorar a saúde física.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  FLASH: {
    name: {
      en: "Flash",
      pt_br: "Flash",
      fr: "Flash",
    },
    description: {
      en: "Created using Flash animation techniques.",
      pt_br: "Criado usando técnicas de animação Flash.",
    },
    category: "Technical",
    isAdult: false,
  },
  FLAT_CHEST: {
    name: {
      en: "Flat Chest",
      pt_br: "Peito Plano",
      fr: "Poitrine plate",
    },
    description: {
      en: "Features a female character with smaller-than-average breasts.",
      pt_br: "Apresenta uma personagem feminina com seios menores que a média.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  FOOD: {
    name: {
      en: "Food",
      pt_br: "Comida",
      fr: "Cuisine",
    },
    description: {
      en: "Centers around cooking or food appraisal.",
      pt_br: "Gira em torno de culinária ou avaliação de alimentos.",
    },
    category: "Theme-Arts",
    isAdult: false,
  },
  FOOTBALL: {
    name: {
      en: "Football",
      pt_br: "Futebol",
      fr: "Football",
    },
    description: {
      en: 'Centers around the sport of football (known in the USA as "soccer").',
      pt_br: 'Gira em torno do esporte de futebol (conhecido nos EUA como "soccer").',
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  FOREIGN: {
    name: {
      en: "Foreign",
      pt_br: "Estrangeiro",
      fr: "Étranger",
    },
    description: {
      en: "Partly or completely set in a country outside the country of origin.",
      pt_br: "Parcialmente ou completamente ambientado em um país fora do país de origem.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  FOUND_FAMILY: {
    name: {
      en: "Found Family",
      pt_br: "Família Encontrada",
      fr: "Famille choisie",
    },
    description: {
      en: "Features a group of characters with no biological relations that are united in a group providing social support.",
      pt_br:
        "Apresenta um grupo de personagens sem relações biológicas que estão unidos em um grupo fornecendo apoio social.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  FUGITIVE: {
    name: {
      en: "Fugitive",
      pt_br: "Fugitivo",
      fr: "Fugitif",
    },
    description: {
      en: "Prominently features a character evading capture by an individual or organization.",
      pt_br: "Apresenta um personagem evadindo a captura por um indivíduo ou organização.",
    },
    category: "Theme-Action",
    isAdult: false,
  },
  FULL_CGI: {
    name: {
      en: "Full CGI",
      pt_br: "CGI Completo",
      fr: "Entièrement en images de synthèse",
    },
    description: {
      en: "Almost entirely created with computer-generated imagery.",
      pt_br: "Quase inteiramente criado com imagens geradas por computador.",
    },
    category: "Technical",
    isAdult: false,
  },
  FUTANARI: {
    name: {
      en: "Futanari",
      pt_br: "Futanari",
      fr: "Futanari",
    },
    description: {
      en: "Features female characters with male genitalia.",
      pt_br: "Apresenta personagens femininas com genitália masculina.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  GAMBLING: {
    name: {
      en: "Gambling",
      pt_br: "Apostas",
      fr: "Jeux d’argent",
    },
    description: {
      en: "Centers around the act of gambling.",
      pt_br: "Gira em torno do ato de apostar.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  GANGS: {
    name: {
      en: "Gangs",
      pt_br: "Gangues",
      fr: "Gangs",
    },
    description: {
      en: "Centers around gang organizations.",
      pt_br: "Gira em torno de organizações de gangues.",
    },
    category: "Theme-Other-Organisations",
    isAdult: false,
  },
  GENDER_BENDING: {
    name: {
      en: "Gender Bending",
      pt_br: "Mudança de Gênero",
      fr: "Changement de genre",
    },
    description: {
      en: "Prominently features a character who dresses and behaves in a way characteristic of another gender, or has been transformed into a person of another gender.",
      pt_br:
        "Apresenta um personagem que se veste e se comporta de uma forma característica de outro gênero, ou foi transformado em uma pessoa de outro gênero.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  GHOST: {
    name: {
      en: "Ghost",
      pt_br: "Fantasma",
      fr: "Fantôme",
    },
    description: {
      en: "Prominently features a character who is a ghost.",
      pt_br: "Apresenta um personagem que é um fantasma.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  GO: {
    name: {
      en: "Go",
      pt_br: "Go",
      fr: "Go",
    },
    description: {
      en: "Centered around the game of Go.",
      pt_br: "Centrado no jogo de Go.",
    },
    category: "Theme-Game-Card & Board Game",
    isAdult: false,
  },
  GOBLIN: {
    name: {
      en: "Goblin",
      pt_br: "Goblin",
      fr: "Gobelin",
    },
    description: {
      en: "A goblin is a monstrous creature from European folklore. They are almost always small and grotesque, mischievous or outright malicious, and greedy. Sometimes with magical abilities.",
      pt_br:
        "Um goblin é uma criatura monstruosa do folclore europeu. Eles são quase sempre pequenos e grotescos, travessos ou completamente maliciosos, e gananciosos. Às vezes com habilidades mágicas.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  GODS: {
    name: {
      en: "Gods",
      pt_br: "Deuses",
      fr: "Dieux",
    },
    description: {
      en: "Prominently features a character of divine or religious nature.",
      pt_br: "Apresenta um personagem de natureza divina ou religiosa.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  GOLF: {
    name: {
      en: "Golf",
      pt_br: "Golfe",
      fr: "Golf",
    },
    description: {
      en: "Centers around the sport of golf.",
      pt_br: "Gira em torno do esporte de golfe.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  GORE: {
    name: {
      en: "Gore",
      pt_br: "Gore",
      fr: "Gore",
    },
    description: {
      en: "Prominently features graphic bloodshed and violence.",
      pt_br: "Apresenta derramamento de sangue e violência gráfica.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  GROUP_SEX: {
    name: {
      en: "Group Sex",
      pt_br: "Sexo em Grupo",
      fr: "Sexe en groupe",
    },
    description: {
      en: "Features more than two participants engaged in sex simultaneously.",
      pt_br: "Apresenta mais de dois participantes envolvidos em sexo simultaneamente.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  GUNS: {
    name: {
      en: "Guns",
      pt_br: "Armas de Fogo",
      fr: "Armes à feu",
    },
    description: {
      en: "Prominently features the use of guns in combat.",
      pt_br: "Apresenta o uso de armas de fogo em combate.",
    },
    category: "Theme-Action",
    isAdult: false,
  },
  GYARU: {
    name: {
      en: "Gyaru",
      pt_br: "Gyaru",
      fr: "Gyaru",
    },
    description: {
      en: "Prominently features a female character who has a distinct American-emulated fashion style, such as tanned skin, bleached hair, and excessive makeup. Also known as gal.",
      pt_br:
        "Apresenta uma personagem feminina com um estilo de moda distinto emulando o americano, como pele bronzeada, cabelo descolorido e maquiagem excessiva. Também conhecida como gal.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  HAIR_PULLING: {
    name: {
      en: "Hair Pulling",
      pt_br: "Puxar Cabelo",
      fr: "Tirage de cheveux",
    },
    description: {
      en: "A sexual act in which the giver will grab the receivers hair and tug whilst giving pleasure from behind.",
      pt_br:
        "Um ato sexual em que o doador agarra o cabelo do receptor e puxa enquanto dá prazer por trás.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  HANDBALL: {
    name: {
      en: "Handball",
      pt_br: "Handebol",
      fr: "Handball",
    },
    description: {
      en: "Centers around the sport of handball.",
      pt_br: "Gira em torno do esporte de handebol.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  HANDJOB: {
    name: {
      en: "Handjob",
      pt_br: "Punheta",
      fr: "Masturbation manuelle",
    },
    description: {
      en: "Features the stimulation of genitalia by another's hands.",
      pt_br: "Apresenta a estimulação da genitália pelas mãos de outra pessoa.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  HENSHIN: {
    name: {
      en: "Henshin",
      pt_br: "Henshin",
      fr: "Henshin",
    },
    description: {
      en: "Prominently features character or costume transformations which often grant special abilities.",
      pt_br:
        "Apresenta transformações de personagens ou figurinos que frequentemente concedem habilidades especiais.",
    },
    category: "Theme-Fantasy",
    isAdult: false,
  },
  HETEROSEXUAL: {
    name: {
      en: "Heterosexual",
      pt_br: "Heterossexual",
      fr: "Hétérosexuel",
    },
    description: {
      en: "Prominently features a romance between a man and a woman, not inherently sexual.",
      pt_br: "Apresenta um romance entre um homem e uma mulher, não necessariamente sexual.",
    },
    category: "Theme-Romance",
    isAdult: false,
  },
  HIKIKOMORI: {
    name: {
      en: "Hikikomori",
      pt_br: "Hikikomori",
      fr: "Hikikomori",
    },
    description: {
      en: "Prominently features a character who withdraws from social life, often seeking extreme isolation.",
      pt_br:
        "Apresenta um personagem que se retira da vida social, frequentemente buscando isolamento extremo.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  HIP_HOP_MUSIC: {
    name: {
      en: "Hip-hop Music",
      pt_br: "Música Hip-hop",
      fr: "Hip-hop",
    },
    description: {
      en: "Centers on the musical style of hip-hop, not to be applied to anime that use hip-hop in its soundtrack.",
      pt_br:
        "Gira em torno do estilo musical hip-hop, não se aplica a animes que usam hip-hop em sua trilha sonora.",
    },
    category: "Theme-Arts-Music",
    isAdult: false,
  },
  HOMELESS: {
    name: {
      en: "Homeless",
      pt_br: "Sem-teto",
      fr: "Sans-abri",
    },
    description: {
      en: "Prominently features a character that is homeless.",
      pt_br: "Apresenta um personagem que é sem-teto.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  HORTICULTURE: {
    name: {
      en: "Horticulture",
      pt_br: "Horticultura",
      fr: "Horticulture",
    },
    description: {
      en: "The story prominently features plant care and gardening.",
      pt_br: "A história apresenta cuidados com plantas e jardinagem.",
    },
    category: "Theme-Slice of Life",
    isAdult: false,
  },
  HUMAN_PET: {
    name: {
      en: "Human Pet",
      pt_br: "Pet Humano",
      fr: "Animal de compagnie humain",
    },
    description: {
      en: 'Features characters in a master-slave relationship where one is the "owner" and the other is a "pet."',
      pt_br:
        'Apresenta personagens em uma relação mestre-escravo onde um é o "dono" e o outro é um "pet".',
    },
    category: "Sexual Content",
    isAdult: true,
  },
  HYPERSEXUALITY: {
    name: {
      en: "Hypersexuality",
      pt_br: "Hipersexualidade",
      fr: "Hypersexualité",
    },
    description: {
      en: "Portrays a character with a hypersexuality disorder, compulsive sexual behavior, or sex addiction.",
      pt_br:
        "Retrata um personagem com transtorno de hipersexualidade, comportamento sexual compulsivo ou vício em sexo.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  ICE_SKATING: {
    name: {
      en: "Ice Skating",
      pt_br: "Patinação no Gelo",
      fr: "Patinage",
    },
    description: {
      en: "Centers around the sport of ice skating.",
      pt_br: "Gira em torno do esporte de patinação no gelo.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  IDOL: {
    name: {
      en: "Idol",
      pt_br: "Idol",
      fr: "Idol",
    },
    description: {
      en: "Centers around the life and activities of an idol.",
      pt_br: "Gira em torno da vida e atividades de um idol.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  INCEST: {
    name: {
      en: "Incest",
      pt_br: "Incesto",
      fr: "Inceste",
    },
    description: {
      en: "Features sexual or romantic relations between characters who are related by blood.",
      pt_br:
        "Apresenta relações sexuais ou românticas entre personagens que são parentes de sangue.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  INDIGENOUS_CULTURES: {
    name: {
      en: "Indigenous Cultures",
      pt_br: "Culturas Indígenas",
      fr: "Cultures autochtones",
    },
    description: {
      en: "Prominently features real-life indigenous cultures.",
      pt_br: "Apresenta culturas indígenas da vida real.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  INN: {
    name: {
      en: "Inn",
      pt_br: "Pousada",
      fr: "Auberge",
    },
    description: {
      en: "Partially or completely set in an Inn or Hotel.",
      pt_br: "Parcialmente ou completamente ambientado em uma pousada ou hotel.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  INSEKI: {
    name: {
      en: "Inseki",
      pt_br: "Inseki",
      fr: "Inseki",
    },
    description: {
      en: "Features sexual or romantic relations among step, adopted, and other non-blood related family members.",
      pt_br:
        "Apresenta relações sexuais ou românticas entre membros da família por afinidade, adotados e outros não relacionados por sangue.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  IRRUMATIO: {
    name: {
      en: "Irrumatio",
      pt_br: "Irrumatio",
      fr: "Irrumation",
    },
    description: {
      en: "Oral rape; features a character thrusting their genitalia or a phallic object into the mouth of another character.",
      pt_br:
        "Estupro oral; apresenta um personagem empurrando sua genitália ou um objeto fálico na boca de outro personagem.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  IYASHIKEI: {
    name: {
      en: "Iyashikei",
      pt_br: "Iyashikei",
      fr: "Iyashikei",
    },
    description: {
      en: "Primary aim is to heal the audience through serene depictions of characters' daily lives.",
      pt_br:
        "O objetivo principal é curar o público através de representações serenas da vida cotidiana dos personagens.",
    },
    category: "Theme-Slice of Life",
    isAdult: false,
  },
  JAZZ_MUSIC: {
    name: {
      en: "Jazz Music",
      pt_br: "Música Jazz",
      fr: "Jazz",
    },
    description: {
      en: "Centers on the musical style of jazz, not to be applied to anime that use jazz in its soundtrack.",
      pt_br:
        "Gira em torno do estilo musical jazz, não se aplica a animes que usam jazz em sua trilha sonora.",
    },
    category: "Theme-Arts-Music",
    isAdult: false,
  },
  JOSEI: {
    name: {
      en: "Josei",
      pt_br: "Josei",
      fr: "Josei",
    },
    description: {
      en: "Target demographic is adult females.",
      pt_br: "O público-alvo é mulheres adultas.",
    },
    category: "Demographic",
    isAdult: false,
  },
  JUDO: {
    name: {
      en: "Judo",
      pt_br: "Judô",
      fr: "Judo",
    },
    description: {
      en: "Centers around the sport of judo.",
      pt_br: "Gira em torno do esporte de judô.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  KABUKI: {
    name: {
      en: "Kabuki",
      pt_br: "Kabuki",
      fr: "Kabuki",
    },
    description: {
      en: "Prominently features the traditional Japanese theater art of kabuki.",
      pt_br: "Apresenta a arte teatral tradicional japonesa de kabuki.",
    },
    category: "Theme-Arts",
    isAdult: false,
  },
  KAIJU: {
    name: {
      en: "Kaiju",
      pt_br: "Kaiju",
      fr: "Kaiju",
    },
    description: {
      en: "Prominently features giant monsters.",
      pt_br: "Apresenta monstros gigantes.",
    },
    category: "Theme-Fantasy",
    isAdult: false,
  },
  KARUTA: {
    name: {
      en: "Karuta",
      pt_br: "Karuta",
      fr: "Karuta",
    },
    description: {
      en: "Centers around the game of karuta.",
      pt_br: "Gira em torno do jogo de karuta.",
    },
    category: "Theme-Game-Card & Board Game",
    isAdult: false,
  },
  KEMONOMIMI: {
    name: {
      en: "Kemonomimi",
      pt_br: "Kemonomimi",
      fr: "Kemonomimi",
    },
    description: {
      en: "Prominently features humanoid characters with animal ears.",
      pt_br: "Apresenta personagens humanoides com orelhas de animais.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  KIDS: {
    name: {
      en: "Kids",
      pt_br: "Infantil",
      fr: "Enfants",
    },
    description: {
      en: "Target demographic is young children.",
      pt_br: "O público-alvo são crianças pequenas.",
    },
    category: "Demographic",
    isAdult: false,
  },
  KINGDOM_MANAGEMENT: {
    name: {
      en: "Kingdom Management",
      pt_br: "Gestão de Reino",
      fr: "Gestion de royaume",
    },
    description: {
      en: "Characters in these series take on the responsibility of running a town or kingdom, whether they take control of an existing one, or build their own from the ground up.",
      pt_br:
        "Os personagens nessas séries assumem a responsabilidade de administrar uma cidade ou reino, seja assumindo o controle de um existente ou construindo o próprio do zero.",
    },
    category: "Theme-Drama",
    isAdult: false,
  },
  KONBINI: {
    name: {
      en: "Konbini",
      pt_br: "Konbini",
      fr: "Konbini",
    },
    description: {
      en: "Predominantly features a convenience store.",
      pt_br: "Apresenta predominantemente uma loja de conveniência.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  KUUDERE: {
    name: {
      en: "Kuudere",
      pt_br: "Kuudere",
      fr: "Kuudere",
    },
    description: {
      en: "Prominently features a character who generally retains a cold, blunt and cynical exterior, but once one gets to know them, they have a very warm and loving interior.",
      pt_br:
        "Apresenta um personagem que geralmente mantém um exterior frio, direto e cínico, mas uma vez que você o conhece, tem um interior muito caloroso e amoroso.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  LACROSSE: {
    name: {
      en: "Lacrosse",
      pt_br: "Lacrosse",
      fr: "Crosse",
    },
    description: {
      en: "A team game played with a ball and lacrosse sticks.",
      pt_br: "Um jogo de equipe jogado com uma bola e tacos de lacrosse.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  LACTATION: {
    name: {
      en: "Lactation",
      pt_br: "Lactação",
      fr: "Lactation",
    },
    description: {
      en: "Features breast milk play and production.",
      pt_br: "Apresenta brincadeiras e produção de leite materno.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  LANGUAGE_BARRIER: {
    name: {
      en: "Language Barrier",
      pt_br: "Barreira Linguística",
      fr: "Barrière de la langue",
    },
    description: {
      en: "A barrier to communication between people who are unable to speak a common language.",
      pt_br: "Uma barreira à comunicação entre pessoas que não conseguem falar uma língua comum.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  LARGE_BREASTS: {
    name: {
      en: "Large Breasts",
      pt_br: "Seios Grandes",
      fr: "Forte poitrine",
    },
    description: {
      en: "Features a character with larger-than-average breasts.",
      pt_br: "Apresenta uma personagem com seios maiores que a média.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  LGBTQ_THEMES: {
    name: {
      en: "LGBTQ+ Themes",
      pt_br: "Temas LGBTQ+",
      fr: "Thèmes LGBTQ+",
    },
    description: {
      en: "Prominently features characters or themes associated with the LGBTQ+ community, such as sexuality or gender identity.",
      pt_br:
        "Apresenta personagens ou temas associados à comunidade LGBTQ+, como sexualidade ou identidade de gênero.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  LOST_CIVILIZATION: {
    name: {
      en: "Lost Civilization",
      pt_br: "Civilização Perdida",
      fr: "Civilisation perdue",
    },
    description: {
      en: "Featuring a civilization with few ruins or records that exist in present day knowledge.",
      pt_br:
        "Apresenta uma civilização com poucas ruínas ou registros que existem no conhecimento atual.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  LOVE_TRIANGLE: {
    name: {
      en: "Love Triangle",
      pt_br: "Triângulo Amoroso",
      fr: "Triangle amoureux",
    },
    description: {
      en: "Centered around romantic feelings between more than two people. Includes all love polygons.",
      pt_br:
        "Centrado em sentimentos românticos entre mais de duas pessoas. Inclui todos os polígonos amorosos.",
    },
    category: "Theme-Romance",
    isAdult: false,
  },
  MAFIA: {
    name: {
      en: "Mafia",
      pt_br: "Máfia",
      fr: "Mafia",
    },
    description: {
      en: "Centered around Italian organised crime syndicates.",
      pt_br: "Centrado em sindicatos de crime organizado italiano.",
    },
    category: "Theme-Other-Organisations",
    isAdult: false,
  },
  MAGIC: {
    name: {
      en: "Magic",
      pt_br: "Magia",
      fr: "Magie",
    },
    description: {
      en: "Prominently features magical elements or the use of magic.",
      pt_br: "Apresenta elementos mágicos ou o uso de magia.",
    },
    category: "Theme-Fantasy",
    isAdult: false,
  },
  MAHJONG: {
    name: {
      en: "Mahjong",
      pt_br: "Mahjong",
      fr: "Mahjong",
    },
    description: {
      en: "Centered around the game of mahjong.",
      pt_br: "Centrado no jogo de mahjong.",
    },
    category: "Theme-Game-Card & Board Game",
    isAdult: false,
  },
  MAIDS: {
    name: {
      en: "Maids",
      pt_br: "Empregadas",
      fr: "Soubrettes",
    },
    description: {
      en: "Prominently features a character who is a maid.",
      pt_br: "Apresenta um personagem que é uma empregada doméstica.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  MAKEUP: {
    name: {
      en: "Makeup",
      pt_br: "Maquiagem",
      fr: "Maquillage",
    },
    description: {
      en: "Centers around the makeup industry.",
      pt_br: "Gira em torno da indústria de maquiagem.",
    },
    category: "Theme-Arts",
    isAdult: false,
  },
  MALE_HAREM: {
    name: {
      en: "Male Harem",
      pt_br: "Harém Masculino",
      fr: "Harem masculin",
    },
    description: {
      en: "Main cast features the protagonist plus several male characters who are romantically interested in them.",
      pt_br:
        "O elenco principal apresenta o protagonista mais vários personagens masculinos que estão romanticamente interessados nele.",
    },
    category: "Theme-Romance",
    isAdult: false,
  },
  MALE_PREGNANCY: {
    name: {
      en: "Male Pregnancy",
      pt_br: "Gravidez Masculina",
      fr: "Grossesse masculine",
    },
    description: {
      en: "Features pregnant male characters in a sexual context.",
      pt_br: "Apresenta personagens masculinos grávidos em um contexto sexual.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  MALE_PROTAGONIST: {
    name: {
      en: "Male Protagonist",
      pt_br: "Protagonista Masculino",
      fr: "Protagoniste masculin",
    },
    description: {
      en: "Main character is male.",
      pt_br: "O personagem principal é masculino.",
    },
    category: "Cast-Main Cast",
    isAdult: false,
  },
  MANZAI: {
    name: {
      en: "Manzai",
      pt_br: "Manzai",
      fr: "Manzai",
    },
    description: {
      en: "Prominently features an act of traditional Japanese comedy that involves two performers.",
      pt_br: "Apresenta um ato de comédia tradicional japonesa que envolve dois artistas.",
    },
    category: "Theme-Arts",
    isAdult: false,
  },
  MARRIAGE: {
    name: {
      en: "Marriage",
      pt_br: "Casamento",
      fr: "Mariage",
    },
    description: {
      en: "Centers around marriage between two or more characters.",
      pt_br: "Gira em torno do casamento entre dois ou mais personagens.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  MARTIAL_ARTS: {
    name: {
      en: "Martial Arts",
      pt_br: "Artes Marciais",
      fr: "Arts martiaux",
    },
    description: {
      en: "Centers around the use of traditional hand-to-hand combat.",
      pt_br: "Gira em torno do uso de combate corpo a corpo tradicional.",
    },
    category: "Theme-Action",
    isAdult: false,
  },
  MASOCHISM: {
    name: {
      en: "Masochism",
      pt_br: "Masoquismo",
      fr: "Masochisme",
    },
    description: {
      en: "Prominently features characters who get sexual pleasure from being hurt or controlled by others.",
      pt_br:
        "Apresenta personagens que obtêm prazer sexual ao serem machucados ou controlados por outros.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  MASTURBATION: {
    name: {
      en: "Masturbation",
      pt_br: "Masturbação",
      fr: "Masturbation",
    },
    description: {
      en: "Features erotic stimulation of one's own genitalia or other erogenous regions.",
      pt_br: "Apresenta estimulação erótica da própria genitália ou outras regiões erógenas.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  MATCHMAKING: {
    name: {
      en: "Matchmaking",
      pt_br: "Casamenteiro",
      fr: "Arrangement de rencontres",
    },
    description: {
      en: "Prominently features either a matchmaker or events with the intent of matchmaking with eventual marriage in sight.",
      pt_br:
        "Apresenta um casamenteiro ou eventos com a intenção de fazer par romântico com casamento eventual à vista.",
    },
    category: "Theme-Romance",
    isAdult: false,
  },
  MATING_PRESS: {
    name: {
      en: "Mating Press",
      pt_br: "Mating Press",
      fr: "Mating press",
    },
    description: {
      en: "Features the sex position in which two partners face each other, with one of them thrusting downwards and the other's legs tucked up towards their head.",
      pt_br:
        "Apresenta a posição sexual em que dois parceiros se encaram, com um deles empurrando para baixo e as pernas do outro dobradas em direção à cabeça.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  MATRIARCHY: {
    name: {
      en: "Matriarchy",
      pt_br: "Matriarcado",
      fr: "Matriarcat",
    },
    description: {
      en: "Prominently features a country that is ruled by a Queen or a society that is dominated by female inheritance.",
      pt_br:
        "Apresenta um país governado por uma rainha ou uma sociedade dominada pela herança feminina.",
    },
    category: "Setting",
    isAdult: false,
  },
  MEDIEVAL: {
    name: {
      en: "Medieval",
      pt_br: "Medieval",
      fr: "Médiéval",
    },
    description: {
      en: "Partially or completely set in the Middle Ages or a Middle Ages-inspired setting. Commonly features elements such as European castles and knights.",
      pt_br:
        "Parcialmente ou completamente ambientado na Idade Média ou em um cenário inspirado na Idade Média. Comumente apresenta elementos como castelos europeus e cavaleiros.",
    },
    category: "Setting-Time",
    isAdult: false,
  },
  MEMORY_MANIPULATION: {
    name: {
      en: "Memory Manipulation",
      pt_br: "Manipulação de Memória",
      fr: "Manipulation de la mémoire",
    },
    description: {
      en: "Prominently features a character(s) who has had their memories altered.",
      pt_br: "Apresenta personagem(ns) que tiveram suas memórias alteradas.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  MERMAID: {
    name: {
      en: "Mermaid",
      pt_br: "Sereia",
      fr: "Sirène",
    },
    description: {
      en: "A mythological creature with the body of a human and the tail of a fish.",
      pt_br: "Uma criatura mitológica com o corpo de um humano e a cauda de um peixe.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  META: {
    name: {
      en: "Meta",
      pt_br: "Meta",
      fr: "Méta",
    },
    description: {
      en: "Features fourth wall-breaking references to itself or genre tropes.",
      pt_br:
        "Apresenta referências que quebram a quarta parede para si mesmo ou clichês de gênero.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  METAL_MUSIC: {
    name: {
      en: "Metal Music",
      pt_br: "Música Metal",
      fr: "Metal",
    },
    description: {
      en: "Centers on the musical style of metal, not to be applied to anime that use metal in its soundtrack.",
      pt_br:
        "Gira em torno do estilo musical metal, não se aplica a animes que usam metal em sua trilha sonora.",
    },
    category: "Theme-Arts-Music",
    isAdult: false,
  },
  MILF: {
    name: {
      en: "MILF",
      pt_br: "MILF",
      fr: "MILF",
    },
    description: {
      en: "Features sexual intercourse with older women.",
      pt_br: "Apresenta relações sexuais com mulheres mais velhas.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  MILITARY: {
    name: {
      en: "Military",
      pt_br: "Militar",
      fr: "Militaire",
    },
    description: {
      en: "Centered around the life and activities of military personnel.",
      pt_br: "Centrado na vida e atividades de pessoal militar.",
    },
    category: "Theme-Other-Organisations",
    isAdult: false,
  },
  MIXED_GENDER_HAREM: {
    name: {
      en: "Mixed Gender Harem",
      pt_br: "Harém Misto",
      fr: "Harem mixte",
    },
    description: {
      en: "Main cast features the protagonist plus several people, regardless of gender, who are romantically interested in them.",
      pt_br:
        "O elenco principal apresenta o protagonista mais várias pessoas, independentemente do gênero, que estão romanticamente interessadas nele.",
    },
    category: "Theme-Romance",
    isAdult: false,
  },
  MIXED_MEDIA: {
    name: {
      en: "Mixed Media",
      pt_br: "Mídia Mista",
      fr: "Techniques mixtes",
    },
    description: {
      en: "Features a combination of different media and animation techniques. Often seen with puppetry, textiles, live action footage, stop motion, and more. This does not include works with normal usage of CGI in their production.",
      pt_br:
        "Apresenta uma combinação de diferentes mídias e técnicas de animação. Frequentemente visto com fantoches, têxteis, filmagens ao vivo, stop motion e mais. Isso não inclui obras com uso normal de CGI em sua produção.",
    },
    category: "Technical",
    isAdult: false,
  },
  MODELING: {
    name: {
      en: "Modeling",
      pt_br: "Modelagem",
      fr: "Mannequinat",
    },
    description: {
      en: "Features a line of work with the purpose of displaying and advertising products such as makeup, clothing, and jewelry. Also includes posing artistically for figure drawing, painting, sculpting, and photography.",
      pt_br:
        "Apresenta uma linha de trabalho com o propósito de exibir e anunciar produtos como maquiagem, roupas e joias. Também inclui posar artisticamente para desenho de figura, pintura, escultura e fotografia.",
    },
    category: "Theme-Arts",
    isAdult: false,
  },
  MONSTERS: {
    name: {
      en: "Monsters",
      pt_br: "Monstros",
      fr: "Monstres",
    },
    description: {
      en: "Prominently features monsters.",
      pt_br: "Apresenta monstros.",
    },
    category: "Theme-Fantasy",
    isAdult: false,
  },
  MONSTER_BOY: {
    name: {
      en: "Monster Boy",
      pt_br: "Garoto Monstro",
      fr: "Garçon monstre",
    },
    description: {
      en: "Prominently features a male character who is a part-monster.",
      pt_br: "Apresenta um personagem masculino que é parcialmente monstro.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  MONSTER_GIRL: {
    name: {
      en: "Monster Girl",
      pt_br: "Garota Monstro",
      fr: "Fille monstre",
    },
    description: {
      en: "Prominently features a female character who is part-monster.",
      pt_br: "Apresenta uma personagem feminina que é parcialmente monstro.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  MOPEDS: {
    name: {
      en: "Mopeds",
      pt_br: "Ciclomotores",
      fr: "Mobylettes",
    },
    description: {
      en: "Prominently features mopeds.",
      pt_br: "Apresenta ciclomotores.",
    },
    category: "Theme-Other-Vehicle",
    isAdult: false,
  },
  MOTORCYCLES: {
    name: {
      en: "Motorcycles",
      pt_br: "Motocicletas",
      fr: "Motos",
    },
    description: {
      en: "Prominently features the use of motorcycles.",
      pt_br: "Apresenta o uso de motocicletas.",
    },
    category: "Theme-Other-Vehicle",
    isAdult: false,
  },
  MOUNTAINEERING: {
    name: {
      en: "Mountaineering",
      pt_br: "Alpinismo",
      fr: "Alpinisme",
    },
    description: {
      en: "Prominently features characters discussing or hiking mountains.",
      pt_br: "Apresenta personagens discutindo ou escalando montanhas.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  MUSICAL_THEATER: {
    name: {
      en: "Musical Theater",
      pt_br: "Teatro Musical",
      fr: "Comédie musicale",
    },
    description: {
      en: "Features a performance that combines songs, spoken dialogue, acting, and dance.",
      pt_br: "Apresenta uma performance que combina canções, diálogos falados, atuação e dança.",
    },
    category: "Theme-Arts-Music",
    isAdult: false,
  },
  MYTHOLOGY: {
    name: {
      en: "Mythology",
      pt_br: "Mitologia",
      fr: "Mythologie",
    },
    description: {
      en: "Prominently features mythological elements, especially those from religious or cultural tradition.",
      pt_br:
        "Apresenta elementos mitológicos, especialmente aqueles da tradição religiosa ou cultural.",
    },
    category: "Theme-Fantasy",
    isAdult: false,
  },

  NAKADASHI: {
    name: {
      en: "Nakadashi",
      pt_br: "Nakadashi",
      fr: "Nakadashi",
    },
    description: {
      en: "Creampie; features sexual ejaculation inside of a character.",
      pt_br: "Creampie; apresenta ejaculação sexual dentro de um personagem.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  NATURAL_DISASTER: {
    name: {
      en: "Natural Disaster",
      pt_br: "Desastre Natural",
      fr: "Catastrophe naturelle",
    },
    description: {
      en: "It focuses on catastrophic events of natural origin, such as earthquakes, tsunamis,  volcanic eruptions, and severe storms. These works often present situations of extreme danger in which the characters struggle to survive and overcome the adversity.",
      pt_br:
        "Foca em eventos catastróficos de origem natural, como terremotos, tsunamis, erupções vulcânicas e tempestades severas. Essas obras frequentemente apresentam situações de perigo extremo nas quais os personagens lutam para sobreviver e superar a adversidade.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  NECROMANCY: {
    name: {
      en: "Necromancy",
      pt_br: "Necromancia",
      fr: "Nécromancie",
    },
    description: {
      en: "When the dead are summoned as spirits, skeletons, or the undead, usually for the purpose of gaining information or to be used as a weapon.",
      pt_br:
        "Quando os mortos são invocados como espíritos, esqueletos ou mortos-vivos, geralmente para obter informações ou serem usados como arma.",
    },
    category: "Theme-Fantasy",
    isAdult: false,
  },
  NEKOMIMI: {
    name: {
      en: "Nekomimi",
      pt_br: "Nekomimi",
      fr: "Nekomimi",
    },
    description: {
      en: "Humanoid characters with cat-like features such as cat ears and a tail.",
      pt_br: "Personagens humanoides com características felinas como orelhas de gato e cauda.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  NETORARE: {
    name: {
      en: "Netorare",
      pt_br: "Netorare",
      fr: "Netorare",
    },
    description: {
      en: "Netorare is what happens when the protagonist gets their partner stolen from them by someone else. It is a sexual fetish designed to cause sexual jealousy by way of having the partner indulge in sexual activity with someone other than the protagonist.",
      pt_br:
        "Netorare é quando o protagonista tem seu parceiro roubado por outra pessoa. É um fetiche sexual projetado para causar ciúme sexual ao ter o parceiro se envolvendo em atividade sexual com alguém diferente do protagonista.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  NETORASE: {
    name: {
      en: "Netorase",
      pt_br: "Netorase",
      fr: "Netorase",
    },
    description: {
      en: "Features characters in a romantic relationship who agree to be sexually intimate with others.",
      pt_br:
        "Apresenta personagens em um relacionamento romântico que concordam em ter intimidade sexual com outros.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  NETORI: {
    name: {
      en: "Netori",
      pt_br: "Netori",
      fr: "Netori",
    },
    description: {
      en: "Features the protagonist stealing the partner of someone else. The opposite of netorare.",
      pt_br: "Apresenta o protagonista roubando o parceiro de outra pessoa. O oposto de netorare.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  NINJA: {
    name: {
      en: "Ninja",
      pt_br: "Ninja",
      fr: "Ninja",
    },
    description: {
      en: "Prominently features Japanese warriors traditionally trained in espionage, sabotage and assasination.",
      pt_br:
        "Apresenta guerreiros japoneses tradicionalmente treinados em espionagem, sabotagem e assassinato.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  NO_DIALOGUE: {
    name: {
      en: "No Dialogue",
      pt_br: "Sem Diálogo",
      fr: "Sans dialogue",
    },
    description: {
      en: "This work contains no dialogue.",
      pt_br: "Esta obra não contém diálogos.",
    },
    category: "Technical",
    isAdult: false,
  },
  NOIR: {
    name: {
      en: "Noir",
      pt_br: "Noir",
      fr: "Noir",
    },
    description: {
      en: "Stylized as a cynical crime drama with low-key visuals.",
      pt_br: "Estilizado como um drama policial cínico com visuais discretos.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  NONFICTION: {
    name: {
      en: "Non-fiction",
      pt_br: "Não-Ficção",
      fr: "Non-fiction",
    },
    description: {
      en: "A work that provides information regarding a real world topic and does not focus on an imaginary narrative.",
      pt_br:
        "Uma obra que fornece informações sobre um tópico do mundo real e não foca em uma narrativa imaginária.",
    },
    category: "Technical",
    isAdult: false,
  },
  NUDITY: {
    name: {
      en: "Nudity",
      pt_br: "Nudez",
      fr: "Nudité",
    },
    description: {
      en: "Features a character wearing no clothing or exposing intimate body parts.",
      pt_br: "Apresenta um personagem sem roupas ou expondo partes íntimas do corpo.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  NUN: {
    name: {
      en: "Nun",
      pt_br: "Freira",
      fr: "Nonne",
    },
    description: {
      en: "Prominently features a character who is a nun.",
      pt_br: "Apresenta um personagem que é uma freira.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  OFFICE: {
    name: {
      en: "Office",
      pt_br: "Escritório",
      fr: "Bureau",
    },
    description: {
      en: "Features people who work in a business office.",
      pt_br: "Apresenta pessoas que trabalham em um escritório comercial.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  OFFICE_LADY: {
    name: {
      en: "Office Lady",
      pt_br: "Mulher de Escritório",
      fr: "Employée de bureau",
    },
    description: {
      en: "Prominently features a female office worker or OL.",
      pt_br: "Apresenta uma trabalhadora de escritório ou OL.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  OIRAN: {
    name: {
      en: "Oiran",
      pt_br: "Oiran",
      fr: "Oiran",
    },
    description: {
      en: "Prominently features a courtesan character of the Japanese Edo Period.",
      pt_br: "Apresenta uma personagem cortesã do Período Edo japonês.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  OJOUSAMA: {
    name: {
      en: "Ojou-sama",
      pt_br: "Ojou-sama",
      fr: "Ojou-sama",
    },
    description: {
      en: "Features a wealthy, high-class, oftentimes stuck up and demanding female character.",
      pt_br:
        "Apresenta uma personagem feminina rica, de alta classe, frequentemente arrogante e exigente.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  OMEGAVERSE: {
    name: {
      en: "Omegaverse",
      pt_br: "Omegaverse",
      fr: "Omegaverse",
    },
    description: {
      en: "Alternative universe that prominently features dynamics modeled after wolves in which there are alphas, betas, and omegas and heat cycles as well as impregnation, regardless of gender.",
      pt_br:
        "Universo alternativo que apresenta dinâmicas baseadas em lobos com alfas, betas e ômegas, ciclos de cio e impregnação, independentemente do gênero.",
    },
    category: "Setting-Universe",
    isAdult: true,
  },
  ORPHAN: {
    name: {
      en: "Orphan",
      pt_br: "Órfão",
      fr: "Orphelin",
    },
    description: {
      en: "Prominently features a character that is an orphan.",
      pt_br: "Apresenta um personagem que é órfão.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  OTAKU_CULTURE: {
    name: {
      en: "Otaku Culture",
      pt_br: "Cultura Otaku",
      fr: "Culture otaku",
    },
    description: {
      en: "Centers around the culture of a fanatical fan-base.",
      pt_br: "Gira em torno da cultura de uma base de fãs fanáticos.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  OUTDOOR_ACTIVITIES: {
    name: {
      en: "Outdoor Activities",
      pt_br: "Atividades ao Ar Livre",
      fr: "Activités de plein air",
    },
    description: {
      en: "Centers around hiking, camping or other outdoor activities.",
      pt_br: "Gira em torno de caminhadas, acampamentos ou outras atividades ao ar livre.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  OYAKODON: {
    name: {
      en: "Oyakodon",
      pt_br: "Oyakodon",
      fr: "Oyakodon",
    },
    description: {
      en: "Features a character who has sexual relations with both the mother and her daughter.",
      pt_br: "Apresenta um personagem que tem relações sexuais tanto com a mãe quanto com a filha.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  PANDEMIC: {
    name: {
      en: "Pandemic",
      pt_br: "Pandemia",
      fr: "Pandémie",
    },
    description: {
      en: "Prominently features a disease prevalent over a whole country or the world.",
      pt_br: "Apresenta uma doença prevalente em todo um país ou no mundo.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  PARENTHOOD: {
    name: {
      en: "Parenthood",
      pt_br: "Parentalidade",
      fr: "Parentalité",
    },
    description: {
      en: "Centers around the experience of raising a child.",
      pt_br: "Gira em torno da experiência de criar um filho.",
    },
    category: "Theme-Slice of Life",
    isAdult: false,
  },
  PARKOUR: {
    name: {
      en: "Parkour",
      pt_br: "Parkour",
      fr: "Parkour",
    },
    description: {
      en: "Centers around the sport of parkour.",
      pt_br: "Gira em torno do esporte de parkour.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  PARODY: {
    name: {
      en: "Parody",
      pt_br: "Paródia",
      fr: "Parodie",
    },
    description: {
      en: "Features deliberate exaggeration of popular tropes or a particular genre to comedic effect.",
      pt_br:
        "Apresenta exagero deliberado de tropos populares ou um gênero específico para efeito cômico.",
    },
    category: "Theme-Comedy",
    isAdult: false,
  },
  PET_PLAY: {
    name: {
      en: "Pet Play",
      pt_br: "Pet Play",
      fr: "Pet play",
    },
    description: {
      en: "Treating a participant as though they were a pet animal. Often involves a collar and possibly BDSM.",
      pt_br:
        "Tratar um participante como se fosse um animal de estimação. Frequentemente envolve coleira e possivelmente BDSM.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  PHOTOGRAPHY: {
    name: {
      en: "Photography",
      pt_br: "Fotografia",
      fr: "Photographie",
    },
    description: {
      en: "Centers around the use of cameras to capture photos.",
      pt_br: "Gira em torno do uso de câmeras para capturar fotos.",
    },
    category: "Theme-Arts",
    isAdult: false,
  },
  PIRATES: {
    name: {
      en: "Pirates",
      pt_br: "Piratas",
      fr: "Pirates",
    },
    description: {
      en: "Prominently features sea-faring adventurers branded as criminals by the law.",
      pt_br: "Apresenta aventureiros marítimos rotulados como criminosos pela lei.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  POKER: {
    name: {
      en: "Poker",
      pt_br: "Pôquer",
      fr: "Poker",
    },
    description: {
      en: "Centers around the game of poker or its variations.",
      pt_br: "Gira em torno do jogo de pôquer ou suas variações.",
    },
    category: "Theme-Game-Card & Board Game",
    isAdult: false,
  },
  POLICE: {
    name: {
      en: "Police",
      pt_br: "Polícia",
      fr: "Police",
    },
    description: {
      en: "Centers around the life and activities of law enforcement officers.",
      pt_br: "Gira em torno da vida e atividades de policiais.",
    },
    category: "Theme-Other-Organisations",
    isAdult: false,
  },
  POLITICS: {
    name: {
      en: "Politics",
      pt_br: "Política",
      fr: "Politique",
    },
    description: {
      en: "Centers around politics, politicians, or government activities.",
      pt_br: "Gira em torno da política, políticos ou atividades governamentais.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  POLYAMOROUS: {
    name: {
      en: "Polyamorous",
      pt_br: "Poliamoroso",
      fr: "Polyamour",
    },
    description: {
      en: "Features a character who is in a consenting relationship with multiple people at one time.",
      pt_br:
        "Apresenta um personagem que está em um relacionamento consensual com múltiplas pessoas ao mesmo tempo.",
    },
    category: "Theme-Romance",
    isAdult: false,
  },
  POST_APOCALYPTIC: {
    name: {
      en: "Post-Apocalyptic",
      pt_br: "Pós-Apocalíptico",
      fr: "Post-apocalyptique",
    },
    description: {
      en: "Partly or completely set in a world or civilization after a global disaster.",
      pt_br:
        "Parcial ou completamente ambientado em um mundo ou civilização após um desastre global.",
    },
    category: "Setting-Universe",
    isAdult: false,
  },
  POV: {
    name: {
      en: "POV",
      pt_br: "POV",
      fr: "POV",
    },
    description: {
      en: "Point of View; features scenes shown from the perspective of the series protagonist.",
      pt_br: "Ponto de Vista; apresenta cenas mostradas da perspectiva do protagonista da série.",
    },
    category: "Technical",
    isAdult: false,
  },
  PREGNANCY: {
    name: {
      en: "Pregnancy",
      pt_br: "Gravidez",
      fr: "Grossesse",
    },
    description: {
      en: "Features pregnant female characters or discusses the topic of pregnancy.",
      pt_br: "Apresenta personagens femininas grávidas ou discute o tema da gravidez.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  PRIMARILY_ADULT_CAST: {
    name: {
      en: "Primarily Adult Cast",
      pt_br: "Elenco Principalmente Adulto",
      fr: "Personnages surtout adultes",
    },
    description: {
      en: "Main cast is mostly composed of characters above a high school age.",
      pt_br:
        "O elenco principal é composto principalmente por personagens acima da idade do ensino médio.",
    },
    category: "Cast-Main Cast",
    isAdult: false,
  },
  PRIMARILY_ANIMAL_CAST: {
    name: {
      en: "Primarily Animal Cast",
      pt_br: "Elenco Principalmente Animal",
      fr: "Personnages surtout animaux",
    },
    description: {
      en: "Main cast is mostly composed animal or animal-like characters.",
      pt_br:
        "O elenco principal é composto principalmente por personagens animais ou semelhantes a animais.",
    },
    category: "Cast-Main Cast",
    isAdult: false,
  },
  PRIMARILY_CHILD_CAST: {
    name: {
      en: "Primarily Child Cast",
      pt_br: "Elenco Principalmente Infantil",
      fr: "Personnages surtout enfants",
    },
    description: {
      en: "Main cast is mostly composed of characters below a high school age.",
      pt_br:
        "O elenco principal é composto principalmente por personagens abaixo da idade do ensino médio.",
    },
    category: "Cast-Main Cast",
    isAdult: false,
  },
  PRIMARILY_FEMALE_CAST: {
    name: {
      en: "Primarily Female Cast",
      pt_br: "Elenco Principalmente Feminino",
      fr: "Personnages surtout féminins",
    },
    description: {
      en: "Main cast is mostly composed of female characters.",
      pt_br: "O elenco principal é composto principalmente por personagens femininas.",
    },
    category: "Cast-Main Cast",
    isAdult: false,
  },
  PRIMARILY_MALE_CAST: {
    name: {
      en: "Primarily Male Cast",
      pt_br: "Elenco Principalmente Masculino",
      fr: "Personnages surtout masculins",
    },
    description: {
      en: "Main cast is mostly composed of male characters.",
      pt_br: "O elenco principal é composto principalmente por personagens masculinos.",
    },
    category: "Cast-Main Cast",
    isAdult: false,
  },
  PRIMARILY_TEEN_CAST: {
    name: {
      en: "Primarily Teen Cast",
      pt_br: "Elenco Principalmente Adolescente",
      fr: "Personnages surtout adolescents",
    },
    description: {
      en: "Main cast is mostly composed of teen characters.",
      pt_br: "O elenco principal é composto principalmente por personagens adolescentes.",
    },
    category: "Cast-Main Cast",
    isAdult: false,
  },
  PRISON: {
    name: {
      en: "Prison",
      pt_br: "Prisão",
      fr: "Prison",
    },
    description: {
      en: "Partly or completely set in a prison.",
      pt_br: "Parcial ou completamente ambientado em uma prisão.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  PROSTITUTION: {
    name: {
      en: "Prostitution",
      pt_br: "Prostituição",
      fr: "Prostitution",
    },
    description: {
      en: "Features characters who are paid for sexual favors.",
      pt_br: "Apresenta personagens que são pagos por favores sexuais.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  PROXY_BATTLE: {
    name: {
      en: "Proxy Battle",
      pt_br: "Batalha por Procuração",
      fr: "Combat par procuration",
    },
    description: {
      en: "A proxy battle is a battle where humans use creatures/robots to do the fighting for them, either by commanding those creatures/robots or by simply evolving them/changing them into battle mode.",
      pt_br:
        "Uma batalha por procuração é onde humanos usam criaturas/robôs para lutar por eles, seja comandando essas criaturas/robôs ou simplesmente evoluindo-os/transformando-os em modo de batalha.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  PSYCHOSEXUAL: {
    name: {
      en: "Psychosexual",
      pt_br: "Psicossexual",
      fr: "Psychosexuel",
    },
    description: {
      en: "Work that involves the psychological aspects of sexual impulses.",
      pt_br: "Obra que envolve os aspectos psicológicos dos impulsos sexuais.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  PUBLIC_SEX: {
    name: {
      en: "Public Sex",
      pt_br: "Sexo em Público",
      fr: "Sexe en public",
    },
    description: {
      en: "Features sexual acts performed in public settings.",
      pt_br: "Apresenta atos sexuais realizados em locais públicos.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  PUPPETRY: {
    name: {
      en: "Puppetry",
      pt_br: "Teatro de Marionetes",
      fr: "Marionnettes",
    },
    description: {
      en: "Animation style involving the manipulation of puppets to act out scenes.",
      pt_br: "Estilo de animação que envolve a manipulação de marionetes para encenar cenas.",
    },
    category: "Technical",
    isAdult: false,
  },
  RAKUGO: {
    name: {
      en: "Rakugo",
      pt_br: "Rakugo",
      fr: "Rakugo",
    },
    description: {
      en: "Rakugo is the traditional Japanese performance art of comic storytelling.",
      pt_br: "Rakugo é a arte performática tradicional japonesa de contar histórias cômicas.",
    },
    category: "Theme-Arts",
    isAdult: false,
  },
  RAPE: {
    name: {
      en: "Rape",
      pt_br: "Estupro",
      fr: "Viol",
    },
    description: {
      en: "Features non-consensual sexual penetration.",
      pt_br: "Apresenta penetração sexual não consensual.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  REAL_ROBOT: {
    name: {
      en: "Real Robot",
      pt_br: "Robô Realista",
      fr: "Real robot",
    },
    description: {
      en: "Prominently features mechanical designs loosely influenced by real-world robotics.",
      pt_br: "Apresenta designs mecânicos vagamente influenciados pela robótica do mundo real.",
    },
    category: "Theme-Sci-Fi-Mecha",
    isAdult: false,
  },
  REHABILITATION: {
    name: {
      en: "Rehabilitation",
      pt_br: "Reabilitação",
      fr: "Réhabilitation",
    },
    description: {
      en: "Prominently features the recovery of a character who became incapable of social life or work.",
      pt_br:
        "Apresenta a recuperação de um personagem que se tornou incapaz de vida social ou trabalho.",
    },
    category: "Theme-Drama",
    isAdult: false,
  },
  REINCARNATION: {
    name: {
      en: "Reincarnation",
      pt_br: "Reencarnação",
      fr: "Réincarnation",
    },
    description: {
      en: "Features a character being born again after death, typically as another person or in another world.",
      pt_br:
        "Apresenta um personagem renascendo após a morte, tipicamente como outra pessoa ou em outro mundo.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  RELIGION: {
    name: {
      en: "Religion",
      pt_br: "Religião",
      fr: "Religion",
    },
    description: {
      en: "Centers on the belief that humanity is related to supernatural, transcendental, and spiritual elements.",
      pt_br:
        "Gira em torno da crença de que a humanidade está relacionada a elementos sobrenaturais, transcendentais e espirituais.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  RESCUE: {
    name: {
      en: "Rescue",
      pt_br: "Resgate",
      fr: "Sauvetage",
    },
    description: {
      en: "Centers around operations that carry out urgent treatment of injuries, remove people from danger, or save lives. This includes series that are about search-and-rescue teams, trauma surgeons, firefighters, and more.",
      pt_br:
        "Gira em torno de operações que realizam tratamento urgente de ferimentos, removem pessoas do perigo ou salvam vidas. Inclui séries sobre equipes de busca e resgate, cirurgiões de trauma, bombeiros e mais.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  RESTAURANT: {
    name: {
      en: "Restaurant",
      pt_br: "Restaurante",
      fr: "Restaurant",
    },
    description: {
      en: "Features a business that prepares and serves food and drinks to customers. Also encompasses cafes and bistros.",
      pt_br:
        "Apresenta um negócio que prepara e serve comida e bebidas aos clientes. Também engloba cafés e bistrôs.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  REVENGE: {
    name: {
      en: "Revenge",
      pt_br: "Vingança",
      fr: "Vengeance",
    },
    description: {
      en: "Prominently features a character who aims to exact punishment in a resentful or vindictive manner.",
      pt_br: "Apresenta um personagem que visa aplicar punição de maneira ressentida ou vingativa.",
    },
    category: "Theme-Drama",
    isAdult: false,
  },
  REVERSE_ISEKAI: {
    name: {
      en: "Reverse Isekai",
      pt_br: "Isekai Reverso",
      fr: "Isekai inversé",
    },
    description: {
      en: "Features a character from a fantasy world who is transported into a modern day setting.",
      pt_br:
        "Apresenta um personagem de um mundo de fantasia que é transportado para um cenário moderno.",
    },
    category: "Theme-Fantasy",
    isAdult: false,
  },
  RIMJOB: {
    name: {
      en: "Rimjob",
      pt_br: "Beijo Grego",
      fr: "Anulingus",
    },
    description: {
      en: "Features oral sex performed on the anus.",
      pt_br: "Apresenta sexo oral realizado no ânus.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  ROBOTS: {
    name: {
      en: "Robots",
      pt_br: "Robôs",
      fr: "Robots",
    },
    description: {
      en: "Prominently features humanoid machines.",
      pt_br: "Apresenta máquinas humanoides.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  ROCK_MUSIC: {
    name: {
      en: "Rock Music",
      pt_br: "Música Rock",
      fr: "Rock",
    },
    description: {
      en: "Centers on the musical style of rock, not to be applied to anime that use rock in its soundtrack.",
      pt_br:
        "Gira em torno do estilo musical rock, não se aplica a anime que usa rock em sua trilha sonora.",
    },
    category: "Theme-Arts-Music",
    isAdult: false,
  },
  ROTOSCOPING: {
    name: {
      en: "Rotoscoping",
      pt_br: "Rotoscopia",
      fr: "Rotoscopie",
    },
    description: {
      en: "Animation technique that animators use to trace over motion picture footage, frame by frame, to produce realistic action.",
      pt_br:
        "Técnica de animação que animadores usam para traçar sobre filmagens, quadro a quadro, para produzir ação realista.",
    },
    category: "Technical",
    isAdult: false,
  },
  ROYAL_AFFAIRS: {
    name: {
      en: "Royal Affairs",
      pt_br: "Assuntos Reais",
      fr: "Affaires royales",
    },
    description: {
      en: "Features nobility, alliances, arranged marriage, succession disputes, religious orders and other elements of royal politics.",
      pt_br:
        "Apresenta nobreza, alianças, casamento arranjado, disputas de sucessão, ordens religiosas e outros elementos da política real.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  RUGBY: {
    name: {
      en: "Rugby",
      pt_br: "Rugby",
      fr: "Rugby",
    },
    description: {
      en: "Centers around the sport of rugby.",
      pt_br: "Gira em torno do esporte de rugby.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  RURAL: {
    name: {
      en: "Rural",
      pt_br: "Rural",
      fr: "Rural",
    },
    description: {
      en: "Partly or completely set in the countryside.",
      pt_br: "Parcial ou completamente ambientado no campo.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  SADISM: {
    name: {
      en: "Sadism",
      pt_br: "Sadismo",
      fr: "Sadisme",
    },
    description: {
      en: "Prominently features characters deriving pleasure, especially sexual gratification, from inflicting pain, suffering, or humiliation on others.",
      pt_br:
        "Apresenta personagens que obtêm prazer, especialmente gratificação sexual, ao infligir dor, sofrimento ou humilhação em outros.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  SAMURAI: {
    name: {
      en: "Samurai",
      pt_br: "Samurai",
      fr: "Samouraï",
    },
    description: {
      en: "Prominently features warriors of medieval Japanese nobility bound by a code of honor.",
      pt_br: "Apresenta guerreiros da nobreza japonesa medieval ligados por um código de honra.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  SATIRE: {
    name: {
      en: "Satire",
      pt_br: "Sátira",
      fr: "Satire",
    },
    description: {
      en: "Prominently features the use of comedy or ridicule to expose and criticise social phenomena.",
      pt_br:
        "Apresenta o uso de comédia ou ridicularização para expor e criticar fenômenos sociais.",
    },
    category: "Theme-Comedy",
    isAdult: false,
  },
  SCAT: {
    name: {
      en: "Scat",
      pt_br: "Escatologia",
      fr: "Scato",
    },
    description: {
      en: "Lots of feces.",
      pt_br: "Muitas fezes.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  SCHOOL: {
    name: {
      en: "School",
      pt_br: "Escola",
      fr: "École",
    },
    description: {
      en: "Partly or completely set in a primary or secondary educational institution.",
      pt_br:
        "Parcial ou completamente ambientado em uma instituição de ensino fundamental ou médio.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  SCHOOL_CLUB: {
    name: {
      en: "School Club",
      pt_br: "Clube Escolar",
      fr: "Club scolaire",
    },
    description: {
      en: "Partly or completely set in a school club scene.",
      pt_br: "Parcial ou completamente ambientado em um cenário de clube escolar.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  SCISSORING: {
    name: {
      en: "Scissoring",
      pt_br: "Tesoura",
      fr: "Ciseaux",
    },
    description: {
      en: "A form of sexual activity between women in which the genitals are stimulated by being rubbed against one another.",
      pt_br:
        "Uma forma de atividade sexual entre mulheres na qual os genitais são estimulados ao serem esfregados um contra o outro.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  SCUBA_DIVING: {
    name: {
      en: "Scuba Diving",
      pt_br: "Mergulho",
      fr: "Plongée sous-marine",
    },
    description: {
      en: "Prominently features characters diving with the aid of special breathing equipment.",
      pt_br: "Apresenta personagens mergulhando com a ajuda de equipamento especial de respiração.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  SEINEN: {
    name: {
      en: "Seinen",
      pt_br: "Seinen",
      fr: "Seinen",
    },
    description: {
      en: "Target demographic is adult males.",
      pt_br: "O público-alvo é homens adultos.",
    },
    category: "Demographic",
    isAdult: false,
  },
  SEX_TOYS: {
    name: {
      en: "Sex Toys",
      pt_br: "Brinquedos Sexuais",
      fr: "Sextoys",
    },
    description: {
      en: "Features objects that are designed to stimulate sexual pleasure.",
      pt_br: "Apresenta objetos projetados para estimular o prazer sexual.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  SHAPESHIFTING: {
    name: {
      en: "Shapeshifting",
      pt_br: "Metamorfose",
      fr: "Métamorphose",
    },
    description: {
      en: "Features character(s) who changes one's appearance or form.",
      pt_br: "Apresenta personagem(ns) que muda(m) sua aparência ou forma.",
    },
    category: "Theme-Fantasy",
    isAdult: false,
  },
  SHIMAIDON: {
    name: {
      en: "Shimaidon",
      pt_br: "Shimaidon",
      fr: "Shimaidon",
    },
    description: {
      en: "Features a character who has sexual relations with two sisters.",
      pt_br: "Apresenta um personagem que tem relações sexuais com duas irmãs.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  SHIPS: {
    name: {
      en: "Ships",
      pt_br: "Navios",
      fr: "Navires",
    },
    description: {
      en: "Prominently features the use of sea-based transportation vessels.",
      pt_br: "Apresenta o uso de embarcações de transporte marítimo.",
    },
    category: "Theme-Other-Vehicle",
    isAdult: false,
  },
  SHOGI: {
    name: {
      en: "Shogi",
      pt_br: "Shogi",
      fr: "Shogi",
    },
    description: {
      en: "Centers around the game of shogi.",
      pt_br: "Gira em torno do jogo de shogi.",
    },
    category: "Theme-Game-Card & Board Game",
    isAdult: false,
  },
  SHOUJO: {
    name: {
      en: "Shoujo",
      pt_br: "Shoujo",
      fr: "Shoujo",
    },
    description: {
      en: "Target demographic is teenage and young adult females.",
      pt_br: "O público-alvo é mulheres adolescentes e jovens adultas.",
    },
    category: "Demographic",
    isAdult: false,
  },
  SHOUNEN: {
    name: {
      en: "Shounen",
      pt_br: "Shounen",
      fr: "Shounen",
    },
    description: {
      en: "Target demographic is teenage and young adult males.",
      pt_br: "O público-alvo é homens adolescentes e jovens adultos.",
    },
    category: "Demographic",
    isAdult: false,
  },
  SHRINE_MAIDEN: {
    name: {
      en: "Shrine Maiden",
      pt_br: "Sacerdotisa",
      fr: "Prêtresse shintō",
    },
    description: {
      en: "Prominently features a character who is a shrine maiden.",
      pt_br: "Apresenta um personagem que é uma sacerdotisa de santuário.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  SKATEBOARDING: {
    name: {
      en: "Skateboarding",
      pt_br: "Skate",
      fr: "Skateboard",
    },
    description: {
      en: "Centers around or prominently features skateboarding as a sport.",
      pt_br: "Gira em torno ou apresenta o skate como esporte.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  SKELETON: {
    name: {
      en: "Skeleton",
      pt_br: "Esqueleto",
      fr: "Squelette",
    },
    description: {
      en: "Prominently features skeleton(s) as a character.",
      pt_br: "Apresenta esqueleto(s) como personagem.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  SLAPSTICK: {
    name: {
      en: "Slapstick",
      pt_br: "Pastelão",
      fr: "Slapstick",
    },
    description: {
      en: "Prominently features comedy based on deliberately clumsy actions or embarrassing events.",
      pt_br:
        "Apresenta comédia baseada em ações deliberadamente desajeitadas ou eventos embaraçosos.",
    },
    category: "Theme-Comedy",
    isAdult: false,
  },
  SLAVERY: {
    name: {
      en: "Slavery",
      pt_br: "Escravidão",
      fr: "Esclavage",
    },
    description: {
      en: "Prominently features slaves, slavery, or slave trade.",
      pt_br: "Apresenta escravos, escravidão ou tráfico de escravos.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  SNOWSCAPE: {
    name: {
      en: "Snowscape",
      pt_br: "Paisagem Nevada",
      fr: "Paysage enneigé",
    },
    description: {
      en: "Prominently or partially set in a snowy environment.",
      pt_br: "Proeminentemente ou parcialmente ambientado em um ambiente nevado.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  SOFTWARE_DEVELOPMENT: {
    name: {
      en: "Software Development",
      pt_br: "Desenvolvimento de Software",
      fr: "Développement logiciel",
    },
    description: {
      en: "Centers around characters developing or programming a piece of technology, software, gaming, etc.",
      pt_br:
        "Gira em torno de personagens desenvolvendo ou programando tecnologia, software, jogos, etc.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  SPACE: {
    name: {
      en: "Space",
      pt_br: "Espaço",
      fr: "Espace",
    },
    description: {
      en: "Partly or completely set in outer space.",
      pt_br: "Parcial ou completamente ambientado no espaço sideral.",
    },
    category: "Setting-Universe",
    isAdult: false,
  },
  SPACE_OPERA: {
    name: {
      en: "Space Opera",
      pt_br: "Ópera Espacial",
      fr: "Space opera",
    },
    description: {
      en: "Centers around space warfare, advanced technology, chivalric romance and adventure.",
      pt_br:
        "Gira em torno de guerra espacial, tecnologia avançada, romance cavalheiresco e aventura.",
    },
    category: "Theme-Sci-Fi",
    isAdult: false,
  },
  SPEARPLAY: {
    name: {
      en: "Spearplay",
      pt_br: "Combate com Lança",
      fr: "Maniement de la lance",
    },
    description: {
      en: "Prominently features the use of spears in combat.",
      pt_br: "Apresenta o uso de lanças em combate.",
    },
    category: "Theme-Action",
    isAdult: false,
  },
  SQUIRTING: {
    name: {
      en: "Squirting",
      pt_br: "Ejaculação Feminina",
      fr: "Squirting",
    },
    description: {
      en: "Female ejaculation; features the expulsion of liquid from the female genitalia.",
      pt_br: "Ejaculação feminina; apresenta a expulsão de líquido da genitália feminina.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  STEAMPUNK: {
    name: {
      en: "Steampunk",
      pt_br: "Steampunk",
      fr: "Steampunk",
    },
    description: {
      en: "Prominently features technology and designs inspired by 19th-century industrial steam-powered machinery.",
      pt_br:
        "Apresenta tecnologia e designs inspirados em maquinário industrial a vapor do século XIX.",
    },
    category: "Theme-Fantasy",
    isAdult: false,
  },
  STOP_MOTION: {
    name: {
      en: "Stop Motion",
      pt_br: "Stop Motion",
      fr: "Stop motion",
    },
    description: {
      en: "Animation style characterized by physical objects being moved incrementally between frames to create the illusion of movement.",
      pt_br:
        "Estilo de animação caracterizado por objetos físicos sendo movidos incrementalmente entre quadros para criar a ilusão de movimento.",
    },
    category: "Technical",
    isAdult: false,
  },
  SUCCUBUS: {
    name: {
      en: "Succubus",
      pt_br: "Súcubo",
      fr: "Succube",
    },
    description: {
      en: "Prominently features a character who is a succubus, a creature in medieval folklore that typically uses their sexual prowess to trap and seduce people to feed off them.",
      pt_br:
        "Apresenta um personagem que é uma súcubo, uma criatura do folclore medieval que tipicamente usa sua habilidade sexual para prender e seduzir pessoas para se alimentar delas.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  SUICIDE: {
    name: {
      en: "Suicide",
      pt_br: "Suicídio",
      fr: "Suicide",
    },
    description: {
      en: "The act or an instance of taking or attempting to take one's own life voluntarily and intentionally.",
      pt_br:
        "O ato ou uma instância de tirar ou tentar tirar a própria vida voluntária e intencionalmente.",
    },
    category: "Theme-Drama",
    isAdult: false,
  },
  SUMATA: {
    name: {
      en: "Sumata",
      pt_br: "Sumata",
      fr: "Sumata",
    },
    description: {
      en: "Pussyjob; features the stimulation of male genitalia by the thighs and labia majora of a female character.",
      pt_br:
        "Apresenta a estimulação da genitália masculina pelas coxas e grandes lábios de uma personagem feminina.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  SUMO: {
    name: {
      en: "Sumo",
      pt_br: "Sumô",
      fr: "Sumo",
    },
    description: {
      en: "Centers around the sport of sumo.",
      pt_br: "Gira em torno do esporte de sumô.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  SUPER_POWER: {
    name: {
      en: "Super Power",
      pt_br: "Super Poder",
      fr: "Superpouvoirs",
    },
    description: {
      en: "Prominently features characters with special abilities that allow them to do what would normally be physically or logically impossible.",
      pt_br:
        "Apresenta personagens com habilidades especiais que permitem fazer o que normalmente seria física ou logicamente impossível.",
    },
    category: "Theme-Fantasy",
    isAdult: false,
  },
  SUPER_ROBOT: {
    name: {
      en: "Super Robot",
      pt_br: "Super Robô",
      fr: "Super robot",
    },
    description: {
      en: "Prominently features large robots often piloted by hot-blooded protagonists.",
      pt_br: "Apresenta grandes robôs frequentemente pilotados por protagonistas impetuosos.",
    },
    category: "Theme-Sci-Fi-Mecha",
    isAdult: false,
  },
  SURFING: {
    name: {
      en: "Surfing",
      pt_br: "Surfe",
      fr: "Surf",
    },
    description: {
      en: "Centers around surfing as a sport.",
      pt_br: "Gira em torno do surfe como esporte.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  SURREAL_COMEDY: {
    name: {
      en: "Surreal Comedy",
      pt_br: "Comédia Surreal",
      fr: "Comédie absurde",
    },
    description: {
      en: "Prominently features comedic moments that defy casual reasoning, resulting in illogical events.",
      pt_br:
        "Apresenta momentos cômicos que desafiam o raciocínio casual, resultando em eventos ilógicos.",
    },
    category: "Theme-Comedy",
    isAdult: false,
  },
  SURVIVAL: {
    name: {
      en: "Survival",
      pt_br: "Sobrevivência",
      fr: "Survie",
    },
    description: {
      en: "Centers around the struggle to live in spite of extreme obstacles.",
      pt_br: "Gira em torno da luta para viver apesar de obstáculos extremos.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  SWAPPING: {
    name: {
      en: "Swapping",
      pt_br: "Troca de Casais",
      fr: "Échangisme",
    },
    description: {
      en: "Features consensual partner swapping between couples during sexual activities.",
      pt_br: "Apresenta troca consensual de parceiros entre casais durante atividades sexuais.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  SWEAT: {
    name: {
      en: "Sweat",
      pt_br: "Suor",
      fr: "Sueur",
    },
    description: {
      en: "Lots of sweat.",
      pt_br: "Muito suor.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  SWIMMING: {
    name: {
      en: "Swimming",
      pt_br: "Natação",
      fr: "Natation",
    },
    description: {
      en: "Centers around the sport of swimming.",
      pt_br: "Gira em torno do esporte de natação.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  SWORDPLAY: {
    name: {
      en: "Swordplay",
      pt_br: "Combate com Espada",
      fr: "Maniement de l’épée",
    },
    description: {
      en: "Prominently features the use of swords in combat.",
      pt_br: "Apresenta o uso de espadas em combate.",
    },
    category: "Theme-Action",
    isAdult: false,
  },
  TABLE_TENNIS: {
    name: {
      en: "Table Tennis",
      pt_br: "Tênis de Mesa",
      fr: "Tennis de table",
    },
    description: {
      en: 'Centers around the sport of table tennis (also known as "ping pong").',
      pt_br: 'Gira em torno do esporte de tênis de mesa (também conhecido como "ping pong").',
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  TANKS: {
    name: {
      en: "Tanks",
      pt_br: "Tanques",
      fr: "Chars",
    },
    description: {
      en: "Prominently features the use of tanks or other armoured vehicles.",
      pt_br: "Apresenta o uso de tanques ou outros veículos blindados.",
    },
    category: "Theme-Other-Vehicle",
    isAdult: false,
  },
  TANNED_SKIN: {
    name: {
      en: "Tanned Skin",
      pt_br: "Pele Bronzeada",
      fr: "Peau bronzée",
    },
    description: {
      en: "Prominently features characters with tanned skin.",
      pt_br: "Apresenta personagens com pele bronzeada.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  TEACHER: {
    name: {
      en: "Teacher",
      pt_br: "Professor",
      fr: "Enseignant",
    },
    description: {
      en: "Protagonist is an educator, usually in a school setting.",
      pt_br: "O protagonista é um educador, geralmente em um ambiente escolar.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  TEENS_LOVE: {
    name: {
      en: "Teens' Love",
      pt_br: "Amor Adolescente",
      fr: "Teens’ Love",
    },
    description: {
      en: "Sexually explicit love-story between individuals of the opposite sex, specifically targeting females of teens and young adult age.",
      pt_br:
        "História de amor sexualmente explícita entre indivíduos do sexo oposto, direcionada especificamente para mulheres adolescentes e jovens adultas.",
    },
    category: "Theme-Romance",
    isAdult: false,
  },
  TENNIS: {
    name: {
      en: "Tennis",
      pt_br: "Tênis",
      fr: "Tennis",
    },
    description: {
      en: "Centers around the sport of tennis.",
      pt_br: "Gira em torno do esporte de tênis.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  TENTACLES: {
    name: {
      en: "Tentacles",
      pt_br: "Tentáculos",
      fr: "Tentacules",
    },
    description: {
      en: "Features the long appendages most commonly associated with octopuses or squid, often sexually penetrating a character.",
      pt_br:
        "Apresenta os longos apêndices mais comumente associados a polvos ou lulas, frequentemente penetrando sexualmente um personagem.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  TERRORISM: {
    name: {
      en: "Terrorism",
      pt_br: "Terrorismo",
      fr: "Terrorisme",
    },
    description: {
      en: "Centers around the activities of a terrorist or terrorist organization.",
      pt_br: "Gira em torno das atividades de um terrorista ou organização terrorista.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  THREESOME: {
    name: {
      en: "Threesome",
      pt_br: "Ménage à Trois",
      fr: "Plan à trois",
    },
    description: {
      en: "Features sexual acts between three people.",
      pt_br: "Apresenta atos sexuais entre três pessoas.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  TIME_LOOP: {
    name: {
      en: "Time Loop",
      pt_br: "Loop Temporal",
      fr: "Boucle temporelle",
    },
    description: {
      en: "A character is stuck in a repetitive cycle that they are attempting to break out of. This is distinct from a manipulating time of their own choice.",
      pt_br:
        "Um personagem está preso em um ciclo repetitivo do qual está tentando sair. Isso é diferente de manipular o tempo por vontade própria.",
    },
    category: "Theme-Sci-Fi",
    isAdult: false,
  },
  TIME_MANIPULATION: {
    name: {
      en: "Time Manipulation",
      pt_br: "Manipulação do Tempo",
      fr: "Manipulation du temps",
    },
    description: {
      en: "Prominently features time-traveling or other time-warping phenomena.",
      pt_br: "Apresenta viagem no tempo ou outros fenômenos de distorção temporal.",
    },
    category: "Theme-Sci-Fi",
    isAdult: false,
  },
  TIME_SKIP: {
    name: {
      en: "Time Skip",
      pt_br: "Salto Temporal",
      fr: "Ellipse temporelle",
    },
    description: {
      en: "Features a gap in time used to advance the story.",
      pt_br: "Apresenta um intervalo no tempo usado para avançar a história.",
    },
    category: "Setting-Time",
    isAdult: false,
  },
  TOKUSATSU: {
    name: {
      en: "Tokusatsu",
      pt_br: "Tokusatsu",
      fr: "Tokusatsu",
    },
    description: {
      en: "Prominently features elements that resemble special effects in Japanese live-action shows",
      pt_br:
        "Apresenta elementos que se assemelham a efeitos especiais em programas japoneses de live-action.",
    },
    category: "Theme-Sci-Fi",
    isAdult: false,
  },
  TOMBOY: {
    name: {
      en: "Tomboy",
      pt_br: "Moleca",
      fr: "Garçon manqué",
    },
    description: {
      en: "Features a girl who exhibits characteristics or behaviors considered in many cultures to be typical of boys.",
      pt_br:
        "Apresenta uma garota que exibe características ou comportamentos considerados em muitas culturas como típicos de meninos.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  TORTURE: {
    name: {
      en: "Torture",
      pt_br: "Tortura",
      fr: "Torture",
    },
    description: {
      en: "The act of deliberately inflicting severe pain or suffering upon another individual or oneself as a punishment or with a specific purpose.",
      pt_br:
        "O ato de infligir deliberadamente dor ou sofrimento severo a outro indivíduo ou a si mesmo como punição ou com um propósito específico.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  TRAINS: {
    name: {
      en: "Trains",
      pt_br: "Trens",
      fr: "Trains",
    },
    description: {
      en: "Prominently features trains.",
      pt_br: "Apresenta trens.",
    },
    category: "Theme-Other-Vehicle",
    isAdult: false,
  },
  TRANSGENDER: {
    name: {
      en: "Transgender",
      pt_br: "Transgênero",
      fr: "Transgenre",
    },
    description: {
      en: "Features a character whose gender identity differs from the sex they were assigned at birth.",
      pt_br:
        "Apresenta um personagem cuja identidade de gênero difere do sexo atribuído ao nascimento.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  TRAVEL: {
    name: {
      en: "Travel",
      pt_br: "Viagem",
      fr: "Voyage",
    },
    description: {
      en: "Centers around character(s) moving between places a significant distance apart.",
      pt_br:
        "Gira em torno de personagem(ns) se movendo entre lugares a uma distância significativa.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  TRIADS: {
    name: {
      en: "Triads",
      pt_br: "Tríades",
      fr: "Triades",
    },
    description: {
      en: "Centered around Chinese organised crime syndicates.",
      pt_br: "Gira em torno de sindicatos do crime organizado chinês.",
    },
    category: "Theme-Other-Organisations",
    isAdult: false,
  },
  TSUNDERE: {
    name: {
      en: "Tsundere",
      pt_br: "Tsundere",
      fr: "Tsundere",
    },
    description: {
      en: "Prominently features a character who acts cold and hostile in order to mask warmer emotions.",
      pt_br:
        "Apresenta um personagem que age de forma fria e hostil para mascarar emoções mais calorosas.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  TWINS: {
    name: {
      en: "Twins",
      pt_br: "Gêmeos",
      fr: "Jumeaux",
    },
    description: {
      en: "Prominently features two or more siblings that were born at one birth.",
      pt_br: "Apresenta dois ou mais irmãos que nasceram em um único parto.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  UNREQUITED_LOVE: {
    name: {
      en: "Unrequited Love",
      pt_br: "Amor Não Correspondido",
      fr: "Amour non réciproque",
    },
    description: {
      en: "One or more characters are experiencing an unrequited love that may or may not be reciprocated.",
      pt_br:
        "Um ou mais personagens estão experimentando um amor não correspondido que pode ou não ser retribuído.",
    },
    category: "Theme-Romance",
    isAdult: false,
  },
  URBAN: {
    name: {
      en: "Urban",
      pt_br: "Urbano",
      fr: "Urbain",
    },
    description: {
      en: "Partly or completely set in a city.",
      pt_br: "Parcial ou completamente ambientado em uma cidade.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  URBAN_FANTASY: {
    name: {
      en: "Urban Fantasy",
      pt_br: "Fantasia Urbana",
      fr: "Fantasy urbaine",
    },
    description: {
      en: "Set in a world similar to the real world, but with the existence of magic or other supernatural elements.",
      pt_br:
        "Ambientado em um mundo similar ao mundo real, mas com a existência de magia ou outros elementos sobrenaturais.",
    },
    category: "Setting-Universe",
    isAdult: false,
  },
  VAMPIRE: {
    name: {
      en: "Vampire",
      pt_br: "Vampiro",
      fr: "Vampire",
    },
    description: {
      en: "Prominently features a character who is a vampire.",
      pt_br: "Apresenta um personagem que é um vampiro.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  VERTICAL_VIDEO: {
    name: {
      en: "Vertical Video",
      pt_br: "Vídeo Vertical",
      fr: "Vidéo verticale",
    },
    description: {
      en: "Animated works originally created in a vertical aspect ratio (such as 9:16), intended for viewing on smartphones.",
      pt_br:
        "Obras animadas originalmente criadas em proporção vertical (como 9:16), destinadas à visualização em smartphones.",
    },
    category: "Technical",
    isAdult: false,
  },
  VETERINARIAN: {
    name: {
      en: "Veterinarian",
      pt_br: "Veterinário",
      fr: "Vétérinaire",
    },
    description: {
      en: "Prominently features a veterinarian or one of the main characters is a veterinarian.",
      pt_br: "Apresenta um veterinário ou um dos personagens principais é veterinário.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  VIDEO_GAMES: {
    name: {
      en: "Video Games",
      pt_br: "Videogames",
      fr: "Jeux vidéo",
    },
    description: {
      en: "Centers around characters playing video games.",
      pt_br: "Gira em torno de personagens jogando videogames.",
    },
    category: "Theme-Game",
    isAdult: false,
  },
  VIKINGS: {
    name: {
      en: "Vikings",
      pt_br: "Vikings",
      fr: "Vikings",
    },
    description: {
      en: "Prominently features Scandinavian seafaring pirates and warriors.",
      pt_br: "Apresenta piratas e guerreiros escandinavos navegadores.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  VILLAINESS: {
    name: {
      en: "Villainess",
      pt_br: "Vilã",
      fr: "Méchante",
    },
    description: {
      en: "Centers around or prominently features a villainous noble lady.",
      pt_br: "Gira em torno ou apresenta uma dama nobre vilã.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  VIRGINITY: {
    name: {
      en: "Virginity",
      pt_br: "Virgindade",
      fr: "Virginité",
    },
    description: {
      en: "Features a male character who has never had sexual relations (until now).",
      pt_br: "Apresenta um personagem masculino que nunca teve relações sexuais (até agora).",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  VIRTUAL_WORLD: {
    name: {
      en: "Virtual World",
      pt_br: "Mundo Virtual",
      fr: "Monde virtuel",
    },
    description: {
      en: "Partly or completely set in the world inside a video game.",
      pt_br: "Parcial ou completamente ambientado no mundo dentro de um videogame.",
    },
    category: "Setting-Universe",
    isAdult: false,
  },
  VOCAL_SYNTH: {
    name: {
      en: "Vocal Synth",
      pt_br: "Sintetizador Vocal",
      fr: "Synthèse vocale",
    },
    description: {
      en: "Features one or more singers or characters that are products of a synthesize singing program. Popular examples are Vocaloids, UTAUloids, and CeVIOs.",
      pt_br:
        "Apresenta um ou mais cantores ou personagens que são produtos de um programa de síntese vocal. Exemplos populares são Vocaloids, UTAUloids e CeVIOs.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  VOLLEYBALL: {
    name: {
      en: "Volleyball",
      pt_br: "Vôlei",
      fr: "Volley-ball",
    },
    description: {
      en: "Centers around the sport of volleyball.",
      pt_br: "Gira em torno do esporte de vôlei.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  VORE: {
    name: {
      en: "Vore",
      pt_br: "Vore",
      fr: "Vore",
    },
    description: {
      en: "Features a character being swallowed or swallowing another creature whole.",
      pt_br: "Apresenta um personagem sendo engolido ou engolindo outra criatura inteira.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  VOYEUR: {
    name: {
      en: "Voyeur",
      pt_br: "Voyeur",
      fr: "Voyeurisme",
    },
    description: {
      en: "Features a character who enjoys seeing the sex acts or sex organs of others.",
      pt_br:
        "Apresenta um personagem que gosta de ver os atos sexuais ou órgãos sexuais de outros.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  VTUBER: {
    name: {
      en: "VTuber",
      pt_br: "VTuber",
      fr: "VTuber",
    },
    description: {
      en: "Prominently features a character who is either an actual or fictive VTuber.",
      pt_br: "Apresenta um personagem que é um VTuber real ou fictício.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  WAR: {
    name: {
      en: "War",
      pt_br: "Guerra",
      fr: "Guerre",
    },
    description: {
      en: "Partly or completely set during wartime.",
      pt_br: "Parcial ou completamente ambientado durante tempo de guerra.",
    },
    category: "Theme-Other",
    isAdult: false,
  },
  WATERSPORTS: {
    name: {
      en: "Watersports",
      pt_br: "Urofilia",
      fr: "Urophilie",
    },
    description: {
      en: "Features sexual situations involving urine.",
      pt_br: "Apresenta situações sexuais envolvendo urina.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
  WEREWOLF: {
    name: {
      en: "Werewolf",
      pt_br: "Lobisomem",
      fr: "Loup-garou",
    },
    description: {
      en: "Prominently features a character who is a werewolf.",
      pt_br: "Apresenta um personagem que é um lobisomem.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  WILDERNESS: {
    name: {
      en: "Wilderness",
      pt_br: "Natureza Selvagem",
      fr: "Nature sauvage",
    },
    description: {
      en: "Predominantly features a location with little to no human activity, such as a deserted island, a jungle, or a snowy mountain range.",
      pt_br:
        "Apresenta predominantemente um local com pouca ou nenhuma atividade humana, como uma ilha deserta, uma selva ou uma cordilheira nevada.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  WITCH: {
    name: {
      en: "Witch",
      pt_br: "Bruxa",
      fr: "Sorcière",
    },
    description: {
      en: "Prominently features a character who is a witch.",
      pt_br: "Apresenta um personagem que é uma bruxa.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  WORK: {
    name: {
      en: "Work",
      pt_br: "Trabalho",
      fr: "Travail",
    },
    description: {
      en: "Centers around the activities of a certain occupation.",
      pt_br: "Gira em torno das atividades de uma determinada ocupação.",
    },
    category: "Setting-Scene",
    isAdult: false,
  },
  WRESTLING: {
    name: {
      en: "Wrestling",
      pt_br: "Luta Livre",
      fr: "Catch",
    },
    description: {
      en: "Centers around the sport of wrestling.",
      pt_br: "Gira em torno do esporte de luta livre.",
    },
    category: "Theme-Game-Sport",
    isAdult: false,
  },
  WRITING: {
    name: {
      en: "Writing",
      pt_br: "Escrita",
      fr: "Écriture",
    },
    description: {
      en: "Centers around the profession of writing books or novels.",
      pt_br: "Gira em torno da profissão de escrever livros ou romances.",
    },
    category: "Theme-Arts",
    isAdult: false,
  },
  YAKUZA: {
    name: {
      en: "Yakuza",
      pt_br: "Yakuza",
      fr: "Yakuza",
    },
    description: {
      en: "Centered around Japanese organised crime syndicates.",
      pt_br: "Gira em torno de sindicatos do crime organizado japonês.",
    },
    category: "Theme-Other-Organisations",
    isAdult: false,
  },
  YANDERE: {
    name: {
      en: "Yandere",
      pt_br: "Yandere",
      fr: "Yandere",
    },
    description: {
      en: "Prominently features a character who is obsessively in love with another, to the point of acting deranged or violent.",
      pt_br:
        "Apresenta um personagem que está obsessivamente apaixonado por outro, a ponto de agir de forma perturbada ou violenta.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  YOUKAI: {
    name: {
      en: "Youkai",
      pt_br: "Youkai",
      fr: "Yōkai",
    },
    description: {
      en: "Prominently features supernatural creatures from Japanese folklore.",
      pt_br: "Apresenta criaturas sobrenaturais do folclore japonês.",
    },
    category: "Theme-Fantasy",
    isAdult: false,
  },
  YURI: {
    name: {
      en: "Yuri",
      pt_br: "Yuri",
      fr: "Yuri",
    },
    description: {
      en: "Prominently features romance between two females, not inherently sexual. Also known as Girls' Love.",
      pt_br:
        "Apresenta romance entre duas mulheres, não inerentemente sexual. Também conhecido como Girls' Love.",
    },
    category: "Theme-Romance",
    isAdult: false,
  },
  ZOMBIE: {
    name: {
      en: "Zombie",
      pt_br: "Zumbi",
      fr: "Zombie",
    },
    description: {
      en: "Prominently features reanimated corpses which often prey on live humans and turn them into zombies.",
      pt_br:
        "Apresenta cadáveres reanimados que frequentemente atacam humanos vivos e os transformam em zumbis.",
    },
    category: "Cast-Traits",
    isAdult: false,
  },
  ZOOPHILIA: {
    name: {
      en: "Zoophilia",
      pt_br: "Zoofilia",
      fr: "Zoophilie",
    },
    description: {
      en: "Features a character who has a sexual attraction for non-human animals.",
      pt_br: "Apresenta um personagem que tem atração sexual por animais não humanos.",
    },
    category: "Sexual Content",
    isAdult: true,
  },
} as const satisfies Record<
  string,
  {
    name: Record<"en" | "pt_br" | "fr", string>
    description: Record<"en" | "pt_br", string>
    category: TagCategories
    isAdult: boolean
  }
>

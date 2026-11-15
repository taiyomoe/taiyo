import type { ChangelogEntry } from "@/features/changelog/lib/changelog"

export const CHANGELOG_ENTRIES: readonly ChangelogEntry[] = [
  {
    id: "2026-11-15-taiyo-2",
    date: "2026-11-15",
    title: { en: "Taiyō 2.0", fr: "Taiyō 2.0", "pt-BR": "Taiyō 2.0" },
    image: {
      src: {
        en: "/changelog/taiyo-2.en.webp",
        fr: "/changelog/taiyo-2.fr.webp",
        "pt-BR": "/changelog/taiyo-2.pt-BR.webp",
      },
      width: 1800,
      height: 1200,
      alt: {
        en: "Taiyō 2.0: a title page with a Continue reading button, the notifications inbox and a reading level card",
        fr: "Taiyō 2.0 : une page de titre avec le bouton Continuer, la boîte de réception des notifications et une carte de niveau de lecture",
        "pt-BR":
          "Taiyō 2.0: uma página de título com o botão Continuar, a caixa de entrada de notificações e um cartão de nível de leitura",
      },
    },
    body: {
      en: [
        "Taiyō has been rebuilt from the ground up. Every page is new, from the home page to the reader, and so is almost everything behind them. Here's what's waiting for you.",
        { heading: "A reader built around you" },
        "Read in single page, double page or long strip. Manhwa and manhua open in long strip, with their own saved layout. Zoom into any page, adjust brightness, contrast and colours, and keep scrolling into the next chapter without leaving the page. Your settings follow your account to every device.",
        [
          "Pick up exactly where you left off",
          "Bookmark pages and see what you've already read",
          "Download chapters to read them offline",
          "Report a broken page right from the reader",
        ],
        { heading: "Never miss a chapter" },
        "New chapters from your library and the groups you follow, replies to your comments, upvotes and new followers all land in your inbox as they happen. Turn on push notifications to get them on your device, and pick exactly which ones you want.",
        { heading: "Comments everywhere" },
        "Titles, chapters, groups and profiles all have a comment section. Reply to others, upvote, hide spoilers, and add emoji, images and GIFs. In the reader, comments open in a drawer without losing your page.",
        { heading: "A profile that's yours" },
        "Your profile shows your reading history, stats and level, which grows with every page you read. Reading also earns points to spend in the shop on avatar borders, name effects and titles, or on a loot box opened in 3D.",
        { heading: "Lists" },
        "Collect your favourite titles into lists, arrange them by dragging, and keep them private or share them. The most upvoted lists make it to the top lists page.",
        { heading: "Find your next read" },
        "Advanced search filters by tags, authors, content rating, format, demographic, year, status and language, and keeps every filter in the link so you can share it. Press Ctrl K (⌘K on Mac) on any page to jump to a title, a group, a user or a page.",
        { heading: "Built for scanlation groups" },
        "Claim your group, invite your members and choose what each of them can do. Drop in whole folders or ZIP and CBZ archives, and Taiyō reads the chapter numbers from the file names. Schedule releases, link chapters to your own site, and keep browsing while uploads run in the background.",
        { heading: "In your language" },
        "Taiyō is now available in English, Brazilian Portuguese and French, in a dark or a light theme.",
      ],
      fr: [
        "Taiyō a été entièrement reconstruit. Chaque page est nouvelle, de l’accueil au lecteur, tout comme presque tout ce qui se trouve derrière. Voici ce qui vous attend.",
        { heading: "Un lecteur pensé pour vous" },
        "Lisez en page simple, en double page ou en défilement vertical. Les manhwa et les manhua s’ouvrent en défilement vertical, avec leur propre mise en page enregistrée. Zoomez sur n’importe quelle page, réglez la luminosité, le contraste et les couleurs, et enchaînez sur le chapitre suivant sans quitter la page. Vos réglages suivent votre compte sur tous vos appareils.",
        [
          "Reprenez exactement là où vous vous étiez arrêté",
          "Placez des marque-pages et retrouvez ce que vous avez déjà lu",
          "Téléchargez des chapitres pour les lire hors ligne",
          "Signalez une page défectueuse directement depuis le lecteur",
        ],
        { heading: "Ne ratez plus aucun chapitre" },
        "Les nouveaux chapitres de votre bibliothèque et des groupes que vous suivez, les réponses à vos commentaires, les votes et les nouveaux abonnés arrivent dans votre boîte de réception en temps réel. Activez les notifications push pour les recevoir sur votre appareil, et choisissez précisément celles qui vous intéressent.",
        { heading: "Des commentaires partout" },
        "Les titres, les chapitres, les groupes et les profils ont tous leur section de commentaires. Répondez aux autres, votez, masquez les spoilers et ajoutez des emojis, des images et des GIF. Dans le lecteur, les commentaires s’ouvrent dans un panneau sans vous faire perdre votre page.",
        { heading: "Un profil à votre image" },
        "Votre profil affiche votre historique de lecture, vos statistiques et votre niveau, qui progresse à chaque page lue. La lecture vous rapporte aussi des points à dépenser dans la boutique en bordures d’avatar, effets de nom et titres, ou dans un coffre qui s’ouvre en 3D.",
        { heading: "Listes" },
        "Rassemblez vos titres préférés dans des listes, réorganisez-les par glisser-déposer, et gardez-les pour vous ou partagez-les. Les listes qui recueillent le plus de votes arrivent sur la page des meilleures listes.",
        { heading: "Trouvez votre prochaine lecture" },
        "La recherche avancée filtre par tags, auteurs, classification du contenu, format, démographie, année, statut et langue, et garde chaque filtre dans le lien pour que vous puissiez le partager. Appuyez sur Ctrl K (⌘K sur Mac) depuis n’importe quelle page pour accéder à un titre, un groupe, un utilisateur ou une page.",
        { heading: "Pensé pour les groupes de scantrad" },
        "Revendiquez votre groupe, invitez vos membres et choisissez ce que chacun peut faire. Déposez des dossiers entiers ou des archives ZIP et CBZ, et Taiyō lit les numéros de chapitre dans les noms de fichiers. Programmez vos sorties, liez des chapitres à votre propre site et continuez à naviguer pendant que les envois se poursuivent en arrière-plan.",
        { heading: "Dans votre langue" },
        "Taiyō est désormais disponible en anglais, en portugais du Brésil et en français, avec un thème sombre ou clair.",
      ],
      "pt-BR": [
        "O Taiyō foi reconstruído do zero. Todas as páginas são novas, da página inicial ao leitor, e quase tudo por trás delas também. Veja o que espera por você.",
        { heading: "Um leitor feito para você" },
        "Leia em página única, página dupla ou rolagem contínua. Manhwas e manhuas abrem em rolagem contínua, com um layout salvo só para eles. Dê zoom em qualquer página, ajuste brilho, contraste e cores, e continue rolando para o próximo capítulo sem sair da página. Suas configurações acompanham sua conta em todos os dispositivos.",
        [
          "Continue exatamente de onde parou",
          "Marque páginas e veja o que você já leu",
          "Baixe capítulos para ler offline",
          "Reporte uma página com problema direto do leitor",
        ],
        { heading: "Nunca perca um capítulo" },
        "Novos capítulos da sua biblioteca e dos grupos que você segue, respostas aos seus comentários, votos e novos seguidores chegam na sua caixa de entrada na hora. Ative as notificações push para recebê-las no seu dispositivo e escolha exatamente quais você quer receber.",
        { heading: "Comentários em todo lugar" },
        "Títulos, capítulos, grupos e perfis têm uma seção de comentários. Responda aos outros, vote, esconda spoilers e adicione emojis, imagens e GIFs. No leitor, os comentários abrem em uma gaveta sem você perder a página.",
        { heading: "Um perfil com a sua cara" },
        "Seu perfil mostra seu histórico de leitura, suas estatísticas e seu nível, que sobe a cada página lida. Ler também rende pontos para gastar na loja com bordas de avatar, efeitos de nome e títulos, ou em um baú aberto em 3D.",
        { heading: "Listas" },
        "Reúna seus títulos favoritos em listas, organize-os arrastando e mantenha as listas privadas ou compartilhe. As listas mais votadas chegam à página de melhores listas.",
        { heading: "Encontre sua próxima leitura" },
        "A pesquisa avançada filtra por tags, autores, classificação de conteúdo, formato, demografia, ano, status e idioma, e mantém cada filtro no link para você compartilhar. Aperte Ctrl K (⌘K no Mac) em qualquer página para ir direto a um título, grupo, usuário ou página.",
        { heading: "Feito para grupos de scan" },
        "Reivindique seu grupo, convide seus membros e escolha o que cada um pode fazer. Solte pastas inteiras ou arquivos ZIP e CBZ, e o Taiyō lê os números dos capítulos pelos nomes dos arquivos. Agende lançamentos, vincule capítulos ao seu próprio site e continue navegando enquanto os envios rodam em segundo plano.",
        { heading: "No seu idioma" },
        "O Taiyō agora está disponível em inglês, português do Brasil e francês, com tema escuro ou claro.",
      ],
    },
    sections: [
      {
        title: { en: "Improvements", fr: "Améliorations", "pt-BR": "Melhorias" },
        items: [
          {
            tag: "home",
            text: {
              en: "Choose which content ratings you see, from Normal to NSFL, and the whole site follows",
              fr: "Choisissez les classifications de contenu que vous voyez, de Normal à NSFL, et tout le site s’adapte",
              "pt-BR":
                "Escolha quais classificações de conteúdo você vê, de Normal a NSFL, e o site inteiro acompanha",
            },
          },
          {
            tag: "home",
            text: {
              en: "Show the latest updates as a list, a grid or compact rows, remembered on your account",
              fr: "Affichez les dernières mises à jour en liste, en grille ou en lignes compactes, mémorisé sur votre compte",
              "pt-BR":
                "Veja as últimas atualizações em lista, grade ou linhas compactas, salvo na sua conta",
            },
          },
          {
            tag: "home",
            text: {
              en: "Hover a relative time to see the exact time, locally and in UTC",
              fr: "Survolez une date relative pour voir l’heure exacte, en heure locale et en UTC",
              "pt-BR":
                "Passe o mouse sobre um tempo relativo para ver o horário exato, local e em UTC",
            },
          },
          {
            tag: "home",
            text: {
              en: "The newest titles on Taiyō get a carousel on the home page and a page of their own",
              fr: "Les derniers titres arrivés sur Taiyō ont un carrousel sur l’accueil et leur propre page",
              "pt-BR":
                "Os títulos mais novos do Taiyō ganham um carrossel na página inicial e uma página própria",
            },
          },
          {
            tag: "titles",
            text: {
              en: "Chapters are grouped by volume, with search, sorting and an unread filter",
              fr: "Les chapitres sont regroupés par volume, avec recherche, tri et un filtre des non-lus",
              "pt-BR":
                "Os capítulos são agrupados por volume, com busca, ordenação e um filtro de não lidos",
            },
          },
          {
            tag: "titles",
            text: {
              en: "On a computer, a title's cover and reading buttons stay in view while you scroll its chapters",
              fr: "Sur ordinateur, la couverture et les boutons de lecture d’un titre restent visibles pendant que vous parcourez ses chapitres",
              "pt-BR":
                "No computador, a capa e os botões de leitura de um título ficam visíveis enquanto você rola os capítulos",
            },
          },
          {
            tag: "titles",
            text: {
              en: "Browse every cover and banner of a title, and open or download them full size",
              fr: "Parcourez toutes les couvertures et bannières d’un titre, et ouvrez-les ou téléchargez-les en taille réelle",
              "pt-BR":
                "Veja todas as capas e banners de um título, e abra ou baixe em tamanho real",
            },
          },
          {
            tag: "titles",
            text: {
              en: "Suggest edits to a title's information, reviewed field by field",
              fr: "Suggérez des modifications aux informations d’un titre, vérifiées champ par champ",
              "pt-BR": "Sugira edições nas informações de um título, revisadas campo por campo",
            },
          },
          {
            tag: "reader",
            text: {
              en: "Switch to another group's version of the same chapter from the reader",
              fr: "Passez à la version d’un autre groupe pour le même chapitre depuis le lecteur",
              "pt-BR": "Troque para a versão de outro grupo do mesmo capítulo direto do leitor",
            },
          },
          {
            tag: "reader",
            text: {
              en: "A warning before you leave Taiyō for a chapter hosted on a group's own site",
              fr: "Un avertissement avant de quitter Taiyō pour un chapitre hébergé sur le site d’un groupe",
              "pt-BR":
                "Um aviso antes de você sair do Taiyō para um capítulo hospedado no site de um grupo",
            },
          },
          {
            tag: "notifications",
            text: {
              en: "Mute new chapters for a single title without removing it from your library",
              fr: "Coupez les notifications de nouveaux chapitres d’un titre sans le retirer de votre bibliothèque",
              "pt-BR": "Silencie os novos capítulos de um título sem tirá-lo da sua biblioteca",
            },
          },
          {
            tag: "search",
            text: {
              en: "Sort titles by how many readers follow them or how many chapters they have",
              fr: "Triez les titres selon le nombre de lecteurs qui les suivent ou leur nombre de chapitres",
              "pt-BR":
                "Ordene títulos pela quantidade de leitores que os acompanham ou de capítulos",
            },
          },
          {
            tag: "search",
            text: {
              en: "Searching an alternative title shows which one matched",
              fr: "Une recherche sur un titre alternatif indique celui qui correspond",
              "pt-BR": "Pesquisar por um título alternativo mostra qual deles correspondeu",
            },
          },
          {
            tag: "search",
            text: {
              en: "Open a random title from the sidebar, the command palette or advanced search",
              fr: "Ouvrez un titre au hasard depuis la barre latérale, la palette de commandes ou la recherche avancée",
              "pt-BR":
                "Abra um título aleatório pela barra lateral, pela paleta de comandos ou pela pesquisa avançada",
            },
          },
          {
            tag: "groups",
            text: {
              en: "Follow a group to get its new chapters, and see its titles, members and stats",
              fr: "Suivez un groupe pour recevoir ses nouveaux chapitres, et consultez ses titres, ses membres et ses statistiques",
              "pt-BR":
                "Siga um grupo para receber os novos capítulos, e veja os títulos, membros e estatísticas dele",
            },
          },
          {
            tag: "uploads",
            text: {
              en: "Space out a batch of chapters to release one every few hours or days",
              fr: "Espacez les sorties d’un lot de chapitres pour en publier un toutes les quelques heures ou quelques jours",
              "pt-BR":
                "Espace os lançamentos de um lote de capítulos para soltar um a cada algumas horas ou dias",
            },
          },
          {
            tag: "profiles",
            text: {
              en: "Hover a name anywhere to see that person's profile card",
              fr: "Survolez un nom n’importe où pour voir la carte de profil de la personne",
              "pt-BR":
                "Passe o mouse sobre um nome em qualquer lugar para ver o cartão de perfil da pessoa",
            },
          },
          {
            tag: "profiles",
            text: {
              en: "Crop, rotate and zoom your avatar and banner, and animated GIFs stay animated",
              fr: "Recadrez, faites pivoter et zoomez votre avatar et votre bannière, et les GIF animés le restent",
              "pt-BR":
                "Recorte, gire e dê zoom no seu avatar e banner, e GIFs animados continuam animados",
            },
          },
          {
            tag: "profiles",
            text: {
              en: "Links to titles, chapters, profiles, groups and lists show a preview card when shared",
              fr: "Les liens vers les titres, chapitres, profils, groupes et listes affichent un aperçu quand vous les partagez",
              "pt-BR":
                "Links de títulos, capítulos, perfis, grupos e listas mostram uma prévia quando compartilhados",
            },
          },
          {
            tag: "comments",
            text: {
              en: "Copy a link to any comment, and opening it takes you straight there",
              fr: "Copiez le lien de n’importe quel commentaire, qui vous y mène directement",
              "pt-BR": "Copie o link de qualquer comentário, e abri-lo leva você direto até ele",
            },
          },
          {
            tag: "comments",
            text: {
              en: "Star images from comments to reuse them in your own",
              fr: "Ajoutez des images de commentaires à vos favoris pour les réutiliser dans les vôtres",
              "pt-BR": "Favorite imagens de comentários para usar nos seus",
            },
          },
          {
            tag: "accounts",
            text: {
              en: "The sign-in screen remembers whether you last used Google, Discord or email",
              fr: "L’écran de connexion se souvient si vous avez utilisé Google, Discord ou l’e-mail la dernière fois",
              "pt-BR":
                "A tela de login lembra se você entrou por último com Google, Discord ou e-mail",
            },
          },
          {
            tag: "accounts",
            text: {
              en: "Reset a forgotten password from the sign-in screen",
              fr: "Réinitialisez un mot de passe oublié depuis l’écran de connexion",
              "pt-BR": "Redefina uma senha esquecida pela tela de login",
            },
          },
          {
            tag: "accounts",
            text: {
              en: "Link your Discord and Google accounts, and change your email address",
              fr: "Associez vos comptes Discord et Google, et changez votre adresse e-mail",
              "pt-BR":
                "Vincule suas contas do Discord e do Google, e troque seu endereço de e-mail",
            },
          },
          {
            tag: "accounts",
            text: {
              en: "Choose whether others can see your library, your stats and who you follow",
              fr: "Choisissez si les autres peuvent voir votre bibliothèque, vos statistiques et les personnes que vous suivez",
              "pt-BR":
                "Escolha se os outros podem ver sua biblioteca, suas estatísticas e quem você segue",
            },
          },
        ],
      },
      {
        title: { en: "Security", fr: "Sécurité", "pt-BR": "Segurança" },
        items: [
          {
            tag: "accounts",
            text: {
              en: "Protect your account with two-factor sign-in from an authenticator app, with backup codes",
              fr: "Protégez votre compte avec la connexion en deux étapes via une application d’authentification, avec des codes de secours",
              "pt-BR":
                "Proteja sua conta com login em duas etapas por um app autenticador, com códigos de backup",
            },
          },
          {
            tag: "accounts",
            text: {
              en: "See every device you're signed in on, and sign out of the others",
              fr: "Voyez tous les appareils où vous êtes connecté, et déconnectez les autres",
              "pt-BR":
                "Veja todos os dispositivos em que você está conectado e desconecte os outros",
            },
          },
          {
            tag: "accounts",
            text: {
              en: "Resetting your password signs you out everywhere",
              fr: "Réinitialiser votre mot de passe vous déconnecte partout",
              "pt-BR": "Redefinir sua senha desconecta você de todos os lugares",
            },
          },
          {
            tag: "accounts",
            text: {
              en: "Linking a social account asks you to have signed in recently",
              fr: "Associer un compte Google ou Discord demande une connexion récente",
              "pt-BR": "Vincular uma conta do Google ou do Discord exige um login recente",
            },
          },
          {
            tag: "accounts",
            text: {
              en: "Signing in never reveals whether an email address has an account",
              fr: "La connexion ne révèle jamais si une adresse e-mail possède un compte",
              "pt-BR": "O login nunca revela se um endereço de e-mail tem uma conta",
            },
          },
          {
            tag: "offline",
            text: {
              en: "Signing out deletes the chapters you downloaded on that device",
              fr: "La déconnexion supprime les chapitres téléchargés sur cet appareil",
              "pt-BR": "Sair da conta apaga os capítulos que você baixou naquele dispositivo",
            },
          },
          {
            tag: "notifications",
            text: {
              en: "Signing out stops push notifications on that device",
              fr: "La déconnexion arrête les notifications push sur cet appareil",
              "pt-BR": "Sair da conta interrompe as notificações push naquele dispositivo",
            },
          },
        ],
      },
    ],
  },
]

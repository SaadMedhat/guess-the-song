export const DEEZER_GENRES = {
  POP: 132,
  RAP: 116,
  ROCK: 152,
  DANCE: 113,
  RNB: 165,
  ALTERNATIVE: 85,
  ELECTRO: 106,
  FOLK: 466,
  REGGAE: 144,
  JAZZ: 129,
  CLASSICAL: 98,
  METAL: 464,
  SOUL: 169,
  LATINO: 197,
} as const

export const GENRE_LABELS: Readonly<Record<number, string>> = {
  [DEEZER_GENRES.POP]: "Pop",
  [DEEZER_GENRES.RAP]: "Rap/Hip-Hop",
  [DEEZER_GENRES.ROCK]: "Rock",
  [DEEZER_GENRES.DANCE]: "Dance",
  [DEEZER_GENRES.RNB]: "R&B",
  [DEEZER_GENRES.ALTERNATIVE]: "Alternativo",
  [DEEZER_GENRES.ELECTRO]: "Elettronica",
  [DEEZER_GENRES.FOLK]: "Folk",
  [DEEZER_GENRES.REGGAE]: "Reggae",
  [DEEZER_GENRES.JAZZ]: "Jazz",
  [DEEZER_GENRES.CLASSICAL]: "Classica",
  [DEEZER_GENRES.METAL]: "Metal",
  [DEEZER_GENRES.SOUL]: "Soul & Funk",
  [DEEZER_GENRES.LATINO]: "Latino",
}

export const DECADES = [
  { value: 1980, label: "Anni 80" },
  { value: 1990, label: "Anni 90" },
  { value: 2000, label: "Anni 2000" },
  { value: 2010, label: "Anni 2010" },
  { value: 2020, label: "Anni 2020" },
] as const

export const DIFFICULTY_CONFIG = {
  easy: {
    label: "Facile",
    description: "Hit popolari e riconoscibili",
    scoreMultiplier: 0.8,
  },
  medium: {
    label: "Normale",
    description: "Mix di brani famosi e meno noti",
    scoreMultiplier: 1.0,
  },
  hard: {
    label: "Difficile",
    description: "Brani di nicchia e deep cuts",
    scoreMultiplier: 1.5,
  },
} as const

export const GAME_MODE_CONFIG = {
  classic: {
    label: "Classica",
    description: "10 round. Ascolta e indovina.",
    totalRounds: 10,
    timePerRound: 30,
    maxSkips: 3,
  },
  timed: {
    label: "A tempo",
    description: "Meno ascolti, più punti. L'audio si sblocca gradualmente.",
    totalRounds: 10,
    timePerRound: 15,
    maxSkips: 0,
  },
  challenge: {
    label: "Sfida",
    description: "Scegli un genere o un decennio. Metti alla prova le tue conoscenze.",
    totalRounds: 10,
    timePerRound: 30,
    maxSkips: 3,
  },
  local: {
    label: "Multiplayer Locale",
    description: "2–4 giocatori. Stesso schermo. Il primo che risponde vince.",
    totalRounds: 10,
    timePerRound: 30,
    maxSkips: 0,
  },
} as const

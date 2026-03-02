import type { DeezerTrack } from "@/types/deezer"
import type { Difficulty } from "@/types/game"
import { getChart, getGenreChart, searchTracks } from "./deezer-client"
import { fisherYatesShuffle } from "@/lib/utils/shuffle"
import { DEEZER_GENRES } from "@/lib/constants"

const DEFAULT_POOL_SIZE = 10

/**
 * Filter tracks that have a valid preview URL and deduplicate by id.
 */
const filterValidTracks = (
  tracks: ReadonlyArray<DeezerTrack>
): ReadonlyArray<DeezerTrack> => {
  const seen = new Set<number>()
  return tracks.filter((track) => {
    if (!track.preview || track.preview === "" || seen.has(track.id))
      return false
    seen.add(track.id)
    return true
  })
}

/**
 * Take N shuffled tracks from a pool, with fallback if not enough.
 */
const pickTracks = (
  tracks: ReadonlyArray<DeezerTrack>,
  count: number = DEFAULT_POOL_SIZE
): ReadonlyArray<DeezerTrack> => {
  const valid = filterValidTracks(tracks)
  const shuffled = fisherYatesShuffle(valid)
  return shuffled.slice(0, count)
}

/**
 * Pick random items from an array.
 */
const pickRandom = <T>(arr: ReadonlyArray<T>, count: number): ReadonlyArray<T> =>
  fisherYatesShuffle(arr).slice(0, count)

/**
 * Popular search terms for medium difficulty.
 */
const POPULAR_SEARCH_TERMS = [
  "hit 2024", "hit 2025", "hit 2023",
  "top songs", "popular music",
  "summer hits", "dance hits",
  "best songs 2020s", "viral hits",
  "party music", "workout music",
  "chill hits", "love songs popular",
  "trending music", "global top",
] as const

/**
 * Niche search terms for hard difficulty — obscure, deep cuts.
 */
const HARD_SEARCH_TERMS = [
  "indie underground", "album tracks deep cuts",
  "B-sides rarities", "experimental music",
  "world music traditional", "ambient electronic",
  "math rock", "shoegaze dreampop",
  "post punk revival", "progressive rock",
  "neo soul underground", "garage rock",
] as const

/**
 * Niche genres for hard difficulty.
 */
const HARD_GENRE_IDS = [
  DEEZER_GENRES.JAZZ,
  DEEZER_GENRES.CLASSICAL,
  DEEZER_GENRES.FOLK,
  DEEZER_GENRES.METAL,
  DEEZER_GENRES.REGGAE,
  DEEZER_GENRES.SOUL,
  DEEZER_GENRES.ALTERNATIVE,
] as const

/**
 * All genre IDs for medium difficulty variety.
 */
const ALL_GENRE_IDS = Object.values(DEEZER_GENRES)

// --- Easy: top chart hits only (most recognizable) ---

const getEasyPool = async (
  count: number
): Promise<ReadonlyArray<DeezerTrack>> => {
  const chart = await getChart(100)
  return pickTracks(chart.tracks.data, count)
}

// --- Medium: chart + random genres + random searches (current behavior) ---

const getMediumPool = async (
  count: number
): Promise<ReadonlyArray<DeezerTrack>> => {
  const randomGenres = pickRandom(ALL_GENRE_IDS, 2)
  const randomSearches = pickRandom(POPULAR_SEARCH_TERMS, 2)

  const [mainChart, ...extras] = await Promise.all([
    getChart(100),
    ...randomGenres.map((genreId) => getGenreChart(genreId, 50).then((r) => r.tracks.data)),
    ...randomSearches.map((term) => searchTracks(term).then((r) => r.data)),
  ])

  const allTracks = [
    ...mainChart.tracks.data,
    ...extras.flat(),
  ]

  return pickTracks(allTracks, count)
}

// --- Hard: niche genres + obscure searches, no main chart ---

const getHardPool = async (
  count: number
): Promise<ReadonlyArray<DeezerTrack>> => {
  const randomGenres = pickRandom(HARD_GENRE_IDS, 3)
  const randomSearches = pickRandom(HARD_SEARCH_TERMS, 3)

  const results = await Promise.all([
    ...randomGenres.map((genreId) => getGenreChart(genreId, 100).then((r) => r.tracks.data)),
    ...randomSearches.map((term) => searchTracks(term).then((r) => r.data)),
  ])

  const allTracks = results.flat()
  return pickTracks(allTracks, count)
}

/**
 * Route to the correct pool strategy based on difficulty.
 */
const POOL_BY_DIFFICULTY: Readonly<Record<Difficulty, (count: number) => Promise<ReadonlyArray<DeezerTrack>>>> = {
  easy: getEasyPool,
  medium: getMediumPool,
  hard: getHardPool,
}

/**
 * Get track pool for classic/timed modes with difficulty.
 */
export const getClassicPool = async (
  difficulty: Difficulty = "medium",
  count: number = DEFAULT_POOL_SIZE
): Promise<ReadonlyArray<DeezerTrack>> =>
  POOL_BY_DIFFICULTY[difficulty](count)

/**
 * Alias for classic pool (same source for timed mode).
 */
export const getTimedPool = getClassicPool

/**
 * Get track pool filtered by genre chart with difficulty adjustment.
 */
export const getChallengePool = async (
  genreId: number,
  difficulty: Difficulty = "medium",
  count: number = DEFAULT_POOL_SIZE
): Promise<ReadonlyArray<DeezerTrack>> => {
  if (difficulty === "easy") {
    const chart = await getGenreChart(genreId, 100)
    return pickTracks(chart.tracks.data, count)
  }

  if (difficulty === "hard") {
    const [chart, ...searches] = await Promise.all([
      getGenreChart(genreId, 100),
      searchTracks(`${genreId} underground`),
      searchTracks(`${genreId} deep cuts`),
    ])
    const allTracks = [
      ...chart.tracks.data,
      ...searches.flatMap((r) => r.data),
    ]
    return pickTracks(allTracks, count)
  }

  // medium
  const [chart, searchResult] = await Promise.all([
    getGenreChart(genreId, 100),
    searchTracks(`top ${genreId} hits`),
  ])
  const allTracks = [
    ...chart.tracks.data,
    ...searchResult.data,
  ]
  return pickTracks(allTracks, count)
}

/**
 * Get track pool for a specific decade with difficulty adjustment.
 */
export const getDecadePool = async (
  decade: number,
  difficulty: Difficulty = "medium",
  count: number = DEFAULT_POOL_SIZE
): Promise<ReadonlyArray<DeezerTrack>> => {
  const searchQueriesByDifficulty: Readonly<Record<Difficulty, ReadonlyArray<string>>> = {
    easy: [
      `biggest hits ${decade}s`,
      `number one ${decade}s`,
    ],
    medium: [
      `top hits ${decade}s`,
      `best songs ${decade}s`,
      `greatest hits ${decade}`,
      `classic ${decade}s music`,
    ],
    hard: [
      `${decade}s underground`,
      `${decade}s deep cuts`,
      `${decade}s B-sides`,
      `obscure ${decade}s`,
      `forgotten ${decade}s songs`,
    ],
  }

  const searchQueries = searchQueriesByDifficulty[difficulty]
  const results = await Promise.all(
    searchQueries.map((q) => searchTracks(q))
  )

  const allTracks = results.flatMap((r) => r.data)
  return pickTracks(allTracks, count)
}

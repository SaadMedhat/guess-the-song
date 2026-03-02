import type { DeezerTrack } from "@/types/deezer"
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
 * Popular search terms to supplement chart data with varied tracks.
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
 * Genre IDs to randomly sample from for variety.
 */
const GENRE_IDS = Object.values(DEEZER_GENRES)

/**
 * Get track pool from multiple sources for maximum variety.
 * Combines global chart + random genre charts + random search queries.
 */
export const getClassicPool = async (
  count: number = DEFAULT_POOL_SIZE
): Promise<ReadonlyArray<DeezerTrack>> => {
  const randomGenres = pickRandom(GENRE_IDS, 2)
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

/**
 * Alias for classic pool (same source for timed mode).
 */
export const getTimedPool = getClassicPool

/**
 * Get track pool filtered by genre chart + supplementary searches.
 */
export const getChallengePool = async (
  genreId: number,
  count: number = DEFAULT_POOL_SIZE
): Promise<ReadonlyArray<DeezerTrack>> => {
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
 * Get track pool for a specific decade by searching for popular tracks.
 */
export const getDecadePool = async (
  decade: number,
  count: number = DEFAULT_POOL_SIZE
): Promise<ReadonlyArray<DeezerTrack>> => {
  const searchQueries = [
    `top hits ${decade}s`,
    `best songs ${decade}s`,
    `greatest hits ${decade}`,
    `classic ${decade}s music`,
  ]

  const results = await Promise.all(
    searchQueries.map((q) => searchTracks(q))
  )

  const allTracks = results.flatMap((r) => r.data)
  return pickTracks(allTracks, count)
}

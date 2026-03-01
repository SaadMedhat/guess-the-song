import type { DeezerTrack } from "@/types/deezer"
import { getChart, getGenreChart, searchTracks } from "./deezer-client"
import { fisherYatesShuffle } from "@/lib/utils/shuffle"

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
 * Get track pool from the global chart (Classic & Timed modes).
 */
export const getClassicPool = async (
  count: number = DEFAULT_POOL_SIZE
): Promise<ReadonlyArray<DeezerTrack>> => {
  const chart = await getChart()
  return pickTracks(chart.tracks.data, count)
}

/**
 * Alias for classic pool (same source for timed mode).
 */
export const getTimedPool = getClassicPool

/**
 * Get track pool filtered by genre chart.
 */
export const getChallengePool = async (
  genreId: number,
  count: number = DEFAULT_POOL_SIZE
): Promise<ReadonlyArray<DeezerTrack>> => {
  const chart = await getGenreChart(genreId)
  return pickTracks(chart.tracks.data, count)
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
  ]

  const results = await Promise.all(
    searchQueries.map((q) => searchTracks(q))
  )

  const allTracks = results.flatMap((r) => r.data)
  return pickTracks(allTracks, count)
}

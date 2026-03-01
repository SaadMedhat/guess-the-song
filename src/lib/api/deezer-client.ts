import type {
  DeezerSearchResponse,
  DeezerChartResponse,
  DeezerGenreListResponse,
  DeezerArtistTopResponse,
  DeezerPlaylistTracksResponse,
  DeezerTrack,
} from "@/types/deezer"

const BASE_URL = "/api/deezer"

const fetchDeezer = async <T>(
  path: string,
  params?: Record<string, string>
): Promise<T> => {
  const searchParams = new URLSearchParams(params)
  const query = searchParams.toString()
  const url = `${BASE_URL}/${path}${query ? `?${query}` : ""}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Deezer API error: ${response.status}`)
  }

  const data = (await response.json()) as T
  return data
}

export const searchTracks = (query: string): Promise<DeezerSearchResponse> =>
  fetchDeezer<DeezerSearchResponse>("search", { q: query })

export const getChart = (): Promise<DeezerChartResponse> =>
  fetchDeezer<DeezerChartResponse>("chart")

export const getGenreChart = (
  genreId: number
): Promise<DeezerChartResponse> =>
  fetchDeezer<DeezerChartResponse>(`chart/${genreId}`)

export const getGenres = (): Promise<DeezerGenreListResponse> =>
  fetchDeezer<DeezerGenreListResponse>("genre")

export const getArtistTop = (
  artistId: number
): Promise<DeezerArtistTopResponse> =>
  fetchDeezer<DeezerArtistTopResponse>(`artist/${artistId}/top`)

export const getPlaylistTracks = (
  playlistId: number
): Promise<DeezerPlaylistTracksResponse> =>
  fetchDeezer<DeezerPlaylistTracksResponse>(`playlist/${playlistId}/tracks`)

export const getTrack = (trackId: number): Promise<DeezerTrack> =>
  fetchDeezer<DeezerTrack>(`track/${trackId}`)

export type DeezerArtist = {
  readonly id: number
  readonly name: string
  readonly picture_medium?: string | undefined
  readonly picture_big?: string | undefined
}

export type DeezerAlbum = {
  readonly id: number
  readonly title: string
  readonly cover_small: string
  readonly cover_medium: string
  readonly cover_big: string
  readonly cover_xl: string
}

export type DeezerTrack = {
  readonly id: number
  readonly title: string
  readonly title_short: string
  readonly artist: DeezerArtist
  readonly album: DeezerAlbum
  readonly preview: string
  readonly duration: number
}

export type DeezerSearchResponse = {
  readonly data: ReadonlyArray<DeezerTrack>
  readonly total: number
  readonly next?: string | undefined
}

export type DeezerChartResponse = {
  readonly tracks: {
    readonly data: ReadonlyArray<DeezerTrack>
  }
}

export type DeezerGenre = {
  readonly id: number
  readonly name: string
  readonly picture_medium: string
}

export type DeezerGenreListResponse = {
  readonly data: ReadonlyArray<DeezerGenre>
}

export type DeezerArtistTopResponse = {
  readonly data: ReadonlyArray<DeezerTrack>
}

export type DeezerPlaylistTracksResponse = {
  readonly data: ReadonlyArray<DeezerTrack>
}

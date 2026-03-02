"use client"

import { useQuery } from "@tanstack/react-query"
import {
  searchTracks,
  getChart,
  getGenreChart,
  getGenres,
  getArtistTop,
} from "./deezer-client"
import { getClassicPool, getTimedPool, getChallengePool, getDecadePool } from "./track-pool"

const STALE_TIME_CHART = 1000 * 60 * 30
const STALE_TIME_SEARCH = 0

export const useSearchTracks = (query: string, enabled: boolean = true) =>
  useQuery({
    queryKey: ["deezer", "search", query],
    queryFn: () => searchTracks(query),
    enabled: enabled && query.length >= 2,
    staleTime: STALE_TIME_SEARCH,
  })

export const useChart = () =>
  useQuery({
    queryKey: ["deezer", "chart"],
    queryFn: () => getChart(),
    staleTime: STALE_TIME_CHART,
  })

export const useGenreChart = (genreId: number, enabled: boolean = true) =>
  useQuery({
    queryKey: ["deezer", "chart", genreId],
    queryFn: () => getGenreChart(genreId),
    enabled,
    staleTime: STALE_TIME_CHART,
  })

export const useGenres = () =>
  useQuery({
    queryKey: ["deezer", "genres"],
    queryFn: getGenres,
    staleTime: STALE_TIME_CHART,
  })

export const useArtistTop = (artistId: number, enabled: boolean = true) =>
  useQuery({
    queryKey: ["deezer", "artist", artistId, "top"],
    queryFn: () => getArtistTop(artistId),
    enabled,
    staleTime: STALE_TIME_CHART,
  })

export const useClassicPool = (
  sessionId: number,
  enabled: boolean = true
) =>
  useQuery({
    queryKey: ["pool", "classic", sessionId],
    queryFn: () => getClassicPool(),
    enabled,
    staleTime: 0,
    gcTime: 0,
  })

export const useTimedPool = (
  sessionId: number,
  enabled: boolean = true
) =>
  useQuery({
    queryKey: ["pool", "timed", sessionId],
    queryFn: () => getTimedPool(),
    enabled,
    staleTime: 0,
    gcTime: 0,
  })

export const useChallengePool = (
  genreId: number,
  sessionId: number,
  enabled: boolean = true
) =>
  useQuery({
    queryKey: ["pool", "challenge", genreId, sessionId],
    queryFn: () => getChallengePool(genreId),
    enabled,
    staleTime: 0,
    gcTime: 0,
  })

export const useDecadePool = (
  decade: number,
  sessionId: number,
  enabled: boolean = true
) =>
  useQuery({
    queryKey: ["pool", "decade", decade, sessionId],
    queryFn: () => getDecadePool(decade),
    enabled,
    staleTime: 0,
    gcTime: 0,
  })

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
import type { Difficulty } from "@/types/game"

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
  difficulty: Difficulty = "medium",
  enabled: boolean = true
) =>
  useQuery({
    queryKey: ["pool", "classic", difficulty, sessionId],
    queryFn: () => getClassicPool(difficulty),
    enabled,
    staleTime: 0,
    gcTime: 0,
  })

export const useTimedPool = (
  sessionId: number,
  difficulty: Difficulty = "medium",
  enabled: boolean = true
) =>
  useQuery({
    queryKey: ["pool", "timed", difficulty, sessionId],
    queryFn: () => getTimedPool(difficulty),
    enabled,
    staleTime: 0,
    gcTime: 0,
  })

export const useChallengePool = (
  genreId: number,
  sessionId: number,
  difficulty: Difficulty = "medium",
  enabled: boolean = true
) =>
  useQuery({
    queryKey: ["pool", "challenge", genreId, difficulty, sessionId],
    queryFn: () => getChallengePool(genreId, difficulty),
    enabled,
    staleTime: 0,
    gcTime: 0,
  })

export const useDecadePool = (
  decade: number,
  sessionId: number,
  difficulty: Difficulty = "medium",
  enabled: boolean = true
) =>
  useQuery({
    queryKey: ["pool", "decade", decade, difficulty, sessionId],
    queryFn: () => getDecadePool(decade, difficulty),
    enabled,
    staleTime: 0,
    gcTime: 0,
  })

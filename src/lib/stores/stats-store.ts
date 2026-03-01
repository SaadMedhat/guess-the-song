import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { GameRecord, ModeStats, StatsState } from "@/types/stats"
import type { GameMode, RoundResult } from "@/types/game"

const MAX_HISTORY = 50

type StatsActions = {
  readonly recordGame: (params: {
    readonly mode: GameMode
    readonly score: number
    readonly totalRounds: number
    readonly bestStreak: number
    readonly rounds: ReadonlyArray<RoundResult>
    readonly genreId?: number | undefined
    readonly decade?: number | undefined
  }) => void
  readonly clearHistory: () => void
}

type StatsStore = StatsState & StatsActions

const createModeStats = (
  existing: ModeStats | undefined,
  score: number,
  totalRounds: number,
  correctAnswers: number,
  bestStreak: number
): ModeStats => {
  const prev: ModeStats = existing ?? {
    gamesPlayed: 0,
    totalScore: 0,
    bestScore: 0,
    averageScore: 0,
    totalCorrect: 0,
    totalRounds: 0,
    bestStreak: 0,
    averageAccuracy: 0,
  }

  const gamesPlayed = prev.gamesPlayed + 1
  const totalScore = prev.totalScore + score
  const newTotalCorrect = prev.totalCorrect + correctAnswers
  const newTotalRounds = prev.totalRounds + totalRounds

  return {
    gamesPlayed,
    totalScore,
    bestScore: Math.max(prev.bestScore, score),
    averageScore: Math.round(totalScore / gamesPlayed),
    totalCorrect: newTotalCorrect,
    totalRounds: newTotalRounds,
    bestStreak: Math.max(prev.bestStreak, bestStreak),
    averageAccuracy:
      newTotalRounds > 0
        ? Math.round((newTotalCorrect / newTotalRounds) * 100)
        : 0,
  }
}

export const useStatsStore = create<StatsStore>()(
  persist(
    (set) => ({
      gamesPlayed: 0,
      totalScore: 0,
      bestScore: 0,
      bestStreak: 0,
      history: [],
      modeStats: {},

      recordGame: (params): void => {
        set((state) => {
          const correctAnswers = params.rounds.filter(
            (r) => r.isCorrect
          ).length

          const record: GameRecord = {
            id: crypto.randomUUID(),
            mode: params.mode,
            date: new Date().toISOString(),
            score: params.score,
            totalRounds: params.totalRounds,
            correctAnswers,
            bestStreak: params.bestStreak,
            rounds: params.rounds,
            genreId: params.genreId,
            decade: params.decade,
          }

          const newHistory = [record, ...state.history].slice(0, MAX_HISTORY)
          const newGamesPlayed = state.gamesPlayed + 1
          const newTotalScore = state.totalScore + params.score

          return {
            gamesPlayed: newGamesPlayed,
            totalScore: newTotalScore,
            bestScore: Math.max(state.bestScore, params.score),
            bestStreak: Math.max(state.bestStreak, params.bestStreak),
            history: newHistory,
            modeStats: {
              ...state.modeStats,
              [params.mode]: createModeStats(
                state.modeStats[params.mode],
                params.score,
                params.totalRounds,
                correctAnswers,
                params.bestStreak
              ),
            },
          }
        })
      },

      clearHistory: (): void => {
        set({
          gamesPlayed: 0,
          totalScore: 0,
          bestScore: 0,
          bestStreak: 0,
          history: [],
          modeStats: {},
        })
      },
    }),
    {
      name: "guess-the-song-stats",
      // Handle SSR hydration: skip hydration on server
      skipHydration: true,
    }
  )
)

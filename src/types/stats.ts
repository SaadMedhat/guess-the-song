import type { GameMode, RoundResult } from "./game"

export type GameRecord = {
  readonly id: string
  readonly mode: GameMode
  readonly date: string
  readonly score: number
  readonly totalRounds: number
  readonly correctAnswers: number
  readonly bestStreak: number
  readonly rounds: ReadonlyArray<RoundResult>
  readonly genreId?: number | undefined
  readonly decade?: number | undefined
}

export type ModeStats = {
  readonly gamesPlayed: number
  readonly totalScore: number
  readonly bestScore: number
  readonly averageScore: number
  readonly totalCorrect: number
  readonly totalRounds: number
  readonly bestStreak: number
  readonly averageAccuracy: number
}

export type StatsState = {
  readonly gamesPlayed: number
  readonly totalScore: number
  readonly bestScore: number
  readonly bestStreak: number
  readonly history: ReadonlyArray<GameRecord>
  readonly modeStats: Readonly<Partial<Record<GameMode, ModeStats>>>
}

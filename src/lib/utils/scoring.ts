import type { TimedStep, Difficulty } from "@/types/game"
import { TIMED_MULTIPLIERS } from "@/types/game"
import { DIFFICULTY_CONFIG } from "@/lib/constants"

const SCORE_BASE = 100
const STREAK_BONUS_PER = 10
const STREAK_BONUS_CAP = 50

type ScoreParams = {
  readonly isCorrect: boolean
  readonly timeRemaining: number
  readonly totalTime: number
  readonly streak: number
  readonly timedStep?: TimedStep | undefined
  readonly difficulty?: Difficulty | undefined
}

export type ScoreBreakdown = {
  readonly base: number
  readonly timeBonus: number
  readonly streakBonus: number
  readonly multiplier: number
  readonly difficultyMultiplier: number
  readonly total: number
}

/**
 * Calculate score for a round.
 */
export const calculateScore = (params: ScoreParams): ScoreBreakdown => {
  if (!params.isCorrect) {
    return { base: 0, timeBonus: 0, streakBonus: 0, multiplier: 1, difficultyMultiplier: 1, total: 0 }
  }

  const base = SCORE_BASE

  const timeBonus =
    params.totalTime > 0
      ? Math.round(SCORE_BASE * (params.timeRemaining / params.totalTime))
      : 0

  const streakBonus = Math.min(params.streak * STREAK_BONUS_PER, STREAK_BONUS_CAP)

  const multiplier =
    params.timedStep !== undefined
      ? (TIMED_MULTIPLIERS[params.timedStep] ?? 1)
      : 1

  const difficultyMultiplier =
    params.difficulty !== undefined
      ? DIFFICULTY_CONFIG[params.difficulty].scoreMultiplier
      : 1

  const total = Math.round((base + timeBonus + streakBonus) * multiplier * difficultyMultiplier)

  return { base, timeBonus, streakBonus, multiplier, difficultyMultiplier, total }
}

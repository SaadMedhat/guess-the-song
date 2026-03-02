"use client"

import { useState, useCallback, useRef, useLayoutEffect } from "react"
import type {
  GameState,
  GameConfig,
  GamePhase,
  GameMode,
  RoundResult,
  TimedStep,
} from "@/types/game"
import { DEFAULT_GAME_CONFIG, TIMED_STEPS } from "@/types/game"
import type { DeezerTrack } from "@/types/deezer"
import { checkAnswer } from "@/lib/utils/fuzzy-match"
import { calculateScore } from "@/lib/utils/scoring"

const INITIAL_STATE: GameState = {
  mode: "classic",
  config: DEFAULT_GAME_CONFIG,
  phase: "IDLE",
  currentRound: 0,
  totalRounds: 10,
  score: 0,
  streak: 0,
  bestStreak: 0,
  skipsRemaining: 3,
  trackPool: [],
  currentTrack: null,
  roundResults: [],
  players: [],
  currentPlayerIndex: 0,
  timedStep: 2,
}

type UseGameEngineReturn = {
  readonly state: GameState
  readonly startGame: (
    mode: GameMode,
    tracks: ReadonlyArray<DeezerTrack>,
    config?: Partial<GameConfig>
  ) => void
  readonly submitAnswer: (
    answer: string,
    timeRemaining: number,
    totalTime: number
  ) => RoundResult
  readonly skip: () => RoundResult
  readonly timeUp: () => RoundResult
  readonly nextRound: () => void
  readonly advanceTimedStep: () => TimedStep | null
  readonly resetGame: () => void
  readonly setPhase: (phase: GamePhase) => void
}

export const useGameEngine = (): UseGameEngineReturn => {
  const [state, setState] = useState<GameState>(INITIAL_STATE)
  const stateRef = useRef(state)
  useLayoutEffect(() => {
    stateRef.current = state
  })

  const setPhase = useCallback((phase: GamePhase): void => {
    setState((prev) => ({ ...prev, phase }))
  }, [])

  const startGame = useCallback(
    (
      mode: GameMode,
      tracks: ReadonlyArray<DeezerTrack>,
      config?: Partial<GameConfig>
    ): void => {
      const gameConfig: GameConfig = {
        ...DEFAULT_GAME_CONFIG,
        ...config,
        mode,
      }

      setState({
        mode,
        config: gameConfig,
        phase: "READY",
        currentRound: 1,
        totalRounds: gameConfig.totalRounds,
        score: 0,
        streak: 0,
        bestStreak: 0,
        skipsRemaining: gameConfig.maxSkips,
        trackPool: tracks,
        currentTrack: tracks[0] ?? null,
        roundResults: [],
        players: [],
        currentPlayerIndex: 0,
        timedStep: 2,
      })
    },
    []
  )

  const createRoundResult = useCallback(
    (params: {
      readonly isCorrect: boolean
      readonly isSkipped: boolean
      readonly isTimedOut: boolean
      readonly answer: string
      readonly pointsEarned: number
      readonly timeUsed: number
    }): RoundResult => {
      const current = stateRef.current
      return {
        roundNumber: current.currentRound,
        track: current.currentTrack!,
        isCorrect: params.isCorrect,
        isSkipped: params.isSkipped,
        isTimedOut: params.isTimedOut,
        answer: params.answer,
        pointsEarned: params.pointsEarned,
        timeUsed: params.timeUsed,
        timedStep: current.mode === "timed" ? current.timedStep : undefined,
      }
    },
    []
  )

  const submitAnswer = useCallback(
    (answer: string, timeRemaining: number, totalTime: number): RoundResult => {
      const current = stateRef.current
      if (current.currentTrack === null) {
        return createRoundResult({
          isCorrect: false,
          isSkipped: false,
          isTimedOut: false,
          answer,
          pointsEarned: 0,
          timeUsed: totalTime,
        })
      }

      const isCorrect = checkAnswer(
        answer,
        current.currentTrack.title_short,
        current.currentTrack.artist.name
      )

      const newStreak = isCorrect ? current.streak + 1 : 0

      const scoreResult = calculateScore({
        isCorrect,
        timeRemaining,
        totalTime,
        streak: newStreak,
        timedStep: current.mode === "timed" ? current.timedStep : undefined,
      })

      const result = createRoundResult({
        isCorrect,
        isSkipped: false,
        isTimedOut: false,
        answer,
        pointsEarned: scoreResult.total,
        timeUsed: totalTime - timeRemaining,
      })

      setState((prev) => ({
        ...prev,
        phase: isCorrect ? "CORRECT" : "WRONG",
        score: prev.score + scoreResult.total,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        roundResults: [...prev.roundResults, result],
      }))

      return result
    },
    [createRoundResult]
  )

  const skip = useCallback((): RoundResult => {
    const result = createRoundResult({
      isCorrect: false,
      isSkipped: true,
      isTimedOut: false,
      answer: "",
      pointsEarned: 0,
      timeUsed: 0,
    })

    setState((prev) => ({
      ...prev,
      phase: "SKIPPED",
      streak: 0,
      skipsRemaining: Math.max(0, prev.skipsRemaining - 1),
      roundResults: [...prev.roundResults, result],
    }))

    return result
  }, [createRoundResult])

  const timeUp = useCallback((): RoundResult => {
    const current = stateRef.current
    const result = createRoundResult({
      isCorrect: false,
      isSkipped: false,
      isTimedOut: true,
      answer: "",
      pointsEarned: 0,
      timeUsed: current.config.timePerRound,
    })

    setState((prev) => ({
      ...prev,
      phase: "TIME_UP",
      streak: 0,
      roundResults: [...prev.roundResults, result],
    }))

    return result
  }, [createRoundResult])

  const nextRound = useCallback((): void => {
    setState((prev) => {
      const nextRoundNum = prev.currentRound + 1

      if (nextRoundNum > prev.totalRounds) {
        return { ...prev, phase: "GAME_OVER" }
      }

      const nextTrack = prev.trackPool[nextRoundNum - 1] ?? null

      return {
        ...prev,
        phase: "PLAYING_AUDIO",
        currentRound: nextRoundNum,
        currentTrack: nextTrack,
        timedStep: 2,
      }
    })
  }, [])

  const advanceTimedStep = useCallback((): TimedStep | null => {
    const current = stateRef.current
    const currentIndex = TIMED_STEPS.indexOf(current.timedStep)

    if (currentIndex >= TIMED_STEPS.length - 1) return null

    const nextStep = TIMED_STEPS[currentIndex + 1]
    if (nextStep === undefined) return null

    setState((prev) => ({ ...prev, timedStep: nextStep }))
    return nextStep
  }, [])

  const resetGame = useCallback((): void => {
    setState(INITIAL_STATE)
  }, [])

  return {
    state,
    startGame,
    submitAnswer,
    skip,
    timeUp,
    nextRound,
    advanceTimedStep,
    resetGame,
    setPhase,
  }
}

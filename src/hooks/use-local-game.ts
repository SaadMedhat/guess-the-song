"use client"

import { useState, useCallback } from "react"
import type { DeezerTrack } from "@/types/deezer"
import type {
  Player,
  Difficulty,
  LocalGamePhase,
  LocalGameState,
  LocalRoundResult,
} from "@/types/game"
import { BUZZER_ANSWER_TIME } from "@/types/game"
import { checkAnswer } from "@/lib/utils/fuzzy-match"
import { calculateScore } from "@/lib/utils/scoring"

const TOTAL_ROUNDS = 10

const createPlayers = (
  names: ReadonlyArray<string>
): ReadonlyArray<Player> =>
  names.map((name, index) => ({
    id: `player-${index}`,
    name,
    score: 0,
    streak: 0,
    bestStreak: 0,
  }))

const INITIAL_STATE: LocalGameState = {
  phase: "IDLE",
  players: [],
  currentRound: 0,
  totalRounds: TOTAL_ROUNDS,
  difficulty: "medium",
  trackPool: [],
  currentTrack: null,
  answeringPlayerId: null,
  eliminatedPlayerIds: [],
  roundResults: [],
}

type UseLocalGameReturn = {
  readonly state: LocalGameState
  readonly startGame: (
    playerNames: ReadonlyArray<string>,
    tracks: ReadonlyArray<DeezerTrack>,
    difficulty?: Difficulty
  ) => void
  readonly beginRound: () => void
  readonly buzz: (playerId: string) => boolean
  readonly submitAnswer: (
    answer: string,
    timeRemaining: number
  ) => boolean
  readonly answerTimeout: () => void
  readonly buzzerExpired: () => void
  readonly nextRound: () => void
  readonly setPhase: (phase: LocalGamePhase) => void
  readonly resetGame: () => void
}

export const useLocalGame = (): UseLocalGameReturn => {
  const [state, setState] = useState<LocalGameState>(INITIAL_STATE)

  const startGame = useCallback(
    (
      playerNames: ReadonlyArray<string>,
      tracks: ReadonlyArray<DeezerTrack>,
      difficulty: Difficulty = "medium"
    ): void => {
      const players = createPlayers(playerNames)
      const firstTrack = tracks[0]
      if (firstTrack === undefined) return

      setState({
        ...INITIAL_STATE,
        phase: "READY",
        players,
        currentRound: 1,
        totalRounds: TOTAL_ROUNDS,
        difficulty,
        trackPool: tracks,
        currentTrack: firstTrack,
      })
    },
    []
  )

  const beginRound = useCallback((): void => {
    setState((prev) => {
      if (prev.phase !== "READY" && prev.phase !== "BUZZER_WAIT") return prev
      return {
        ...prev,
        phase: "BUZZER_WAIT",
        answeringPlayerId: null,
        eliminatedPlayerIds: [],
      }
    })
  }, [])

  const buzz = useCallback((playerId: string): boolean => {
    const accepted = { current: false }

    setState((prev) => {
      if (prev.phase !== "BUZZER_WAIT") return prev
      if (prev.eliminatedPlayerIds.includes(playerId)) return prev

      accepted.current = true
      return {
        ...prev,
        phase: "PLAYER_ANSWERING",
        answeringPlayerId: playerId,
      }
    })

    return accepted.current
  }, [])

  const submitAnswer = useCallback(
    (answer: string, timeRemaining: number): boolean => {
      const correct = { current: false }

      setState((prev) => {
        if (prev.phase !== "PLAYER_ANSWERING") return prev
        if (prev.currentTrack === null) return prev
        if (prev.answeringPlayerId === null) return prev

        const isCorrect = checkAnswer(
          answer,
          prev.currentTrack.title_short,
          prev.currentTrack.artist.name
        )

        correct.current = isCorrect

        const answeringPlayer = prev.players.find(
          (p) => p.id === prev.answeringPlayerId
        )
        if (answeringPlayer === undefined) return prev

        if (isCorrect) {
          const newStreak = answeringPlayer.streak + 1
          const scoreResult = calculateScore({
            isCorrect: true,
            timeRemaining,
            totalTime: BUZZER_ANSWER_TIME,
            streak: newStreak,
            difficulty: prev.difficulty,
          })

          const updatedPlayers = prev.players.map((p) => {
            if (p.id !== prev.answeringPlayerId) return p
            return {
              ...p,
              score: p.score + scoreResult.total,
              streak: newStreak,
              bestStreak: Math.max(p.bestStreak, newStreak),
            }
          })

          const roundResult: LocalRoundResult = {
            roundNumber: prev.currentRound,
            track: prev.currentTrack,
            winnerId: prev.answeringPlayerId,
            winnerName: answeringPlayer.name,
            pointsEarned: scoreResult.total,
            buzzOrder: [...prev.eliminatedPlayerIds, prev.answeringPlayerId],
            timeUsed: BUZZER_ANSWER_TIME - timeRemaining,
          }

          return {
            ...prev,
            phase: "ANSWER_CORRECT",
            players: updatedPlayers,
            answeringPlayerId: null,
            roundResults: [...prev.roundResults, roundResult],
          }
        }

        // Wrong answer — eliminate this player, reset streak
        const updatedPlayers = prev.players.map((p) => {
          if (p.id !== prev.answeringPlayerId) return p
          return { ...p, streak: 0 }
        })

        const newEliminated = [
          ...prev.eliminatedPlayerIds,
          prev.answeringPlayerId,
        ]

        // Check if all players are eliminated
        const allEliminated = prev.players.every((p) =>
          newEliminated.includes(p.id)
        )

        if (allEliminated) {
          const roundResult: LocalRoundResult = {
            roundNumber: prev.currentRound,
            track: prev.currentTrack,
            winnerId: null,
            winnerName: null,
            pointsEarned: 0,
            buzzOrder: newEliminated,
            timeUsed: BUZZER_ANSWER_TIME - timeRemaining,
          }

          // Reset streaks for all players
          const resetPlayers = updatedPlayers.map((p) => ({
            ...p,
            streak: 0,
          }))

          return {
            ...prev,
            phase: "ROUND_OVER",
            players: resetPlayers,
            answeringPlayerId: null,
            eliminatedPlayerIds: newEliminated,
            roundResults: [...prev.roundResults, roundResult],
          }
        }

        return {
          ...prev,
          phase: "ANSWER_WRONG",
          players: updatedPlayers,
          answeringPlayerId: null,
          eliminatedPlayerIds: newEliminated,
        }
      })

      return correct.current
    },
    []
  )

  const answerTimeout = useCallback((): void => {
    setState((prev) => {
      if (prev.phase !== "PLAYER_ANSWERING") return prev
      if (prev.answeringPlayerId === null) return prev
      if (prev.currentTrack === null) return prev

      // Reset streak for timeout player
      const updatedPlayers = prev.players.map((p) => {
        if (p.id !== prev.answeringPlayerId) return p
        return { ...p, streak: 0 }
      })

      const newEliminated = [
        ...prev.eliminatedPlayerIds,
        prev.answeringPlayerId,
      ]

      const allEliminated = prev.players.every((p) =>
        newEliminated.includes(p.id)
      )

      if (allEliminated) {
        const roundResult: LocalRoundResult = {
          roundNumber: prev.currentRound,
          track: prev.currentTrack,
          winnerId: null,
          winnerName: null,
          pointsEarned: 0,
          buzzOrder: newEliminated,
          timeUsed: BUZZER_ANSWER_TIME,
        }

        const resetPlayers = updatedPlayers.map((p) => ({
          ...p,
          streak: 0,
        }))

        return {
          ...prev,
          phase: "ROUND_OVER",
          players: resetPlayers,
          answeringPlayerId: null,
          eliminatedPlayerIds: newEliminated,
          roundResults: [...prev.roundResults, roundResult],
        }
      }

      return {
        ...prev,
        phase: "ANSWER_WRONG",
        players: updatedPlayers,
        answeringPlayerId: null,
        eliminatedPlayerIds: newEliminated,
      }
    })
  }, [])

  const buzzerExpired = useCallback((): void => {
    setState((prev) => {
      if (prev.phase !== "BUZZER_WAIT") return prev
      if (prev.currentTrack === null) return prev

      const roundResult: LocalRoundResult = {
        roundNumber: prev.currentRound,
        track: prev.currentTrack,
        winnerId: null,
        winnerName: null,
        pointsEarned: 0,
        buzzOrder: [],
        timeUsed: 0,
      }

      // Reset all streaks since nobody answered
      const resetPlayers = prev.players.map((p) => ({
        ...p,
        streak: 0,
      }))

      return {
        ...prev,
        phase: "ROUND_OVER" as const,
        players: resetPlayers,
        answeringPlayerId: null,
        roundResults: [...prev.roundResults, roundResult],
      }
    })
  }, [])

  const nextRound = useCallback((): void => {
    setState((prev) => {
      const nextRoundNum = prev.currentRound + 1

      if (nextRoundNum > prev.totalRounds) {
        return { ...prev, phase: "GAME_OVER" }
      }

      const nextTrack = prev.trackPool[nextRoundNum - 1]
      if (nextTrack === undefined) {
        return { ...prev, phase: "GAME_OVER" }
      }

      return {
        ...prev,
        phase: "READY",
        currentRound: nextRoundNum,
        currentTrack: nextTrack,
        answeringPlayerId: null,
        eliminatedPlayerIds: [],
      }
    })
  }, [])

  const setPhase = useCallback((phase: LocalGamePhase): void => {
    setState((prev) => ({ ...prev, phase }))
  }, [])

  const resetGame = useCallback((): void => {
    setState(INITIAL_STATE)
  }, [])

  return {
    state,
    startGame,
    beginRound,
    buzz,
    submitAnswer,
    answerTimeout,
    buzzerExpired,
    nextRound,
    setPhase,
    resetGame,
  }
}

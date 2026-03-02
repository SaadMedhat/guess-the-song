"use client"

import { Suspense, useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useLocalGame } from "@/hooks/use-local-game"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import { useTimer } from "@/hooks/use-timer"
import { useClassicPool } from "@/lib/api/queries"
import { useGameStore } from "@/lib/stores/game-store"
import { useStatsStore } from "@/lib/stores/stats-store"
import { BUZZER_ANSWER_TIME } from "@/types/game"
import type { RoundResult, LocalRoundResult, Difficulty } from "@/types/game"
import { TimerBar } from "@/components/game/timer-bar"
import { RoundIndicator } from "@/components/game/round-indicator"
import { AudioVisualizer } from "@/components/game/audio-visualizer"
import { AnswerInput } from "@/components/game/answer-input"
import { ResultFeedback } from "@/components/game/result-feedback"
import { SongReveal } from "@/components/game/song-reveal"
import { BuzzerPanel } from "@/components/game/buzzer-panel"
import { PlayerScoreboard } from "@/components/game/player-scoreboard"
import { LocalGameOver } from "@/components/game/local-game-over"
import { fadeIn, slideInUp } from "@/lib/motion"

const VALID_DIFFICULTIES = new Set<string>(["easy", "medium", "hard"])

const useDifficulty = (): Difficulty => {
  const searchParams = useSearchParams()
  return useMemo(() => {
    const raw = searchParams.get("difficulty")
    if (raw !== null && VALID_DIFFICULTIES.has(raw)) return raw as Difficulty
    return "medium"
  }, [searchParams])
}

const BUZZER_WINDOW = 30
const FEEDBACK_DELAY_CORRECT = 2000
const FEEDBACK_DELAY_WRONG = 1200
const ROUND_OVER_DELAY = 2500

/**
 * Parse player names from URL search params.
 */
const usePlayerNames = (): ReadonlyArray<string> => {
  const searchParams = useSearchParams()

  return useMemo(() => {
    const names: Array<string> = []
    const keys = ["p1", "p2", "p3", "p4"] as const
    keys.forEach((key) => {
      const value = searchParams.get(key)
      if (value !== null && value.trim().length > 0) {
        names.push(value.trim())
      }
    })
    return names
  }, [searchParams])
}

/**
 * Convert LocalRoundResult to RoundResult for stats recording.
 */
const toRoundResult = (lr: LocalRoundResult): RoundResult => ({
  roundNumber: lr.roundNumber,
  track: lr.track,
  isCorrect: lr.winnerId !== null,
  isSkipped: false,
  isTimedOut: lr.winnerId === null,
  answer: lr.winnerName ?? "",
  pointsEarned: lr.pointsEarned,
  timeUsed: lr.timeUsed,
})

export default function LocalPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-gradient-game px-5">
          <AudioVisualizer isPlaying barCount={20} />
          <p className="font-display text-lg font-semibold text-foreground">
            Caricamento...
          </p>
        </main>
      }
    >
      <LocalContent />
    </Suspense>
  )
}

function LocalContent(): React.ReactElement {
  const router = useRouter()
  const playerNames = usePlayerNames()
  const difficulty = useDifficulty()

  const {
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
  } = useLocalGame()
  const audio = useAudioPlayer()
  const setInGame = useGameStore((s) => s.setInGame)
  const recordGame = useStatsStore((s) => s.recordGame)
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasStartedRef = useRef(false)
  const hasRecordedRef = useRef(false)
  const [sessionId, setSessionId] = useState(0)

  // Buzzer window timer (30s for the round)
  const handleBuzzerTimeout = useCallback((): void => {
    if (state.phase !== "BUZZER_WAIT") return
    if (state.currentTrack === null) return

    audio.stop()
    buzzerExpired()
  }, [state.phase, state.currentTrack, audio, buzzerExpired])

  const buzzerTimer = useTimer({
    duration: BUZZER_WINDOW,
    onTimeout: handleBuzzerTimeout,
  })

  // Answer timer (10s for the answering player)
  const handleAnswerTimeout = useCallback((): void => {
    if (state.phase !== "PLAYER_ANSWERING") return
    answerTimeout()
  }, [state.phase, answerTimeout])

  const answerTimer = useTimer({
    duration: BUZZER_ANSWER_TIME,
    onTimeout: handleAnswerTimeout,
  })

  // Redirect if not enough players
  useEffect(() => {
    if (playerNames.length < 2) {
      router.replace("/")
    }
  }, [playerNames, router])

  // Fetch track pool
  const {
    data: trackPool,
    isLoading,
    isError,
  } = useClassicPool(sessionId, difficulty)

  // Start game when pool is ready
  useEffect(() => {
    if (
      trackPool !== undefined &&
      trackPool.length > 0 &&
      !hasStartedRef.current &&
      playerNames.length >= 2
    ) {
      hasStartedRef.current = true
      setInGame(true)
      startGame(playerNames, trackPool, difficulty)
    }
  }, [trackPool, playerNames, difficulty, startGame, setInGame])

  // Auto-begin round when READY
  useEffect(() => {
    if (state.phase === "READY" && state.currentTrack !== null) {
      audio.play(state.currentTrack.preview)
      buzzerTimer.reset()
      buzzerTimer.start()
      beginRound()

      // Preload next track
      const nextIndex = state.currentRound
      const nextTrack = state.trackPool[nextIndex]
      if (nextTrack !== undefined) {
        audio.preload(nextTrack.preview)
      }
    }
    // Only trigger on phase change to READY
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase])

  // Handle ANSWER_WRONG → return to BUZZER_WAIT after brief delay
  useEffect(() => {
    if (state.phase !== "ANSWER_WRONG") return

    feedbackTimeoutRef.current = setTimeout(() => {
      setPhase("BUZZER_WAIT")
      buzzerTimer.start() // Resume from where it was
    }, FEEDBACK_DELAY_WRONG)

    return (): void => {
      if (feedbackTimeoutRef.current !== null) {
        clearTimeout(feedbackTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, setPhase])

  // Handle ANSWER_CORRECT → auto advance after delay
  useEffect(() => {
    if (state.phase !== "ANSWER_CORRECT") return

    feedbackTimeoutRef.current = setTimeout(() => {
      nextRound()
    }, FEEDBACK_DELAY_CORRECT)

    return (): void => {
      if (feedbackTimeoutRef.current !== null) {
        clearTimeout(feedbackTimeoutRef.current)
      }
    }
  }, [state.phase, nextRound])

  // Handle ROUND_OVER (nobody got it) → auto advance after delay
  useEffect(() => {
    if (state.phase !== "ROUND_OVER") return

    feedbackTimeoutRef.current = setTimeout(() => {
      nextRound()
    }, ROUND_OVER_DELAY)

    return (): void => {
      if (feedbackTimeoutRef.current !== null) {
        clearTimeout(feedbackTimeoutRef.current)
      }
    }
  }, [state.phase, nextRound])

  // Record stats on game over
  useEffect(() => {
    if (state.phase !== "GAME_OVER") return
    if (hasRecordedRef.current) return

    hasRecordedRef.current = true
    setInGame(false)

    const sorted = [...state.players].sort((a, b) => b.score - a.score)
    const winnerScore = sorted[0]?.score ?? 0
    const winnerStreak = sorted[0]?.bestStreak ?? 0

    recordGame({
      mode: "local",
      score: winnerScore,
      totalRounds: state.totalRounds,
      bestStreak: winnerStreak,
      rounds: state.roundResults.map(toRoundResult),
    })
  }, [
    state.phase,
    state.players,
    state.totalRounds,
    state.roundResults,
    setInGame,
    recordGame,
  ])

  // Cleanup on unmount
  useEffect(
    () => (): void => {
      setInGame(false)
      if (feedbackTimeoutRef.current !== null) {
        clearTimeout(feedbackTimeoutRef.current)
      }
    },
    [setInGame]
  )

  const handleBuzz = useCallback(
    (playerId: string): void => {
      if (state.phase !== "BUZZER_WAIT") return
      const accepted = buzz(playerId)
      if (!accepted) return

      buzzerTimer.stop()
      answerTimer.reset()
      answerTimer.start()
    },
    [state.phase, buzz, buzzerTimer, answerTimer]
  )

  const handleSubmitAnswer = useCallback(
    (answer: string): void => {
      if (state.phase !== "PLAYER_ANSWERING") return
      answerTimer.stop()

      const isCorrect = submitAnswer(answer, answerTimer.timeRemaining)
      if (isCorrect) {
        audio.stop()
        buzzerTimer.reset()
      }
    },
    [state.phase, answerTimer, submitAnswer, audio, buzzerTimer]
  )

  const handlePlayAgain = useCallback((): void => {
    hasStartedRef.current = false
    hasRecordedRef.current = false
    resetGame()
    setSessionId((prev) => prev + 1)
  }, [resetGame])

  const handleHome = useCallback((): void => {
    resetGame()
    router.push("/")
  }, [resetGame, router])

  const handleExit = useCallback((): void => {
    audio.stop()
    buzzerTimer.stop()
    answerTimer.stop()
    resetGame()
    setInGame(false)
    router.push("/")
  }, [audio, buzzerTimer, answerTimer, resetGame, setInGame, router])

  const answeringPlayer = state.answeringPlayerId !== null
    ? state.players.find((p) => p.id === state.answeringPlayerId)
    : undefined

  const isFeedbackPhase =
    state.phase === "ANSWER_CORRECT" ||
    state.phase === "ANSWER_WRONG" ||
    state.phase === "ROUND_OVER"

  // Active timer for the timer bar
  const activeTimer = state.phase === "PLAYER_ANSWERING"
    ? answerTimer
    : buzzerTimer

  const showTimerBar =
    state.phase === "BUZZER_WAIT" || state.phase === "PLAYER_ANSWERING"

  // Not enough players
  if (playerNames.length < 2) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-gradient-game" />
    )
  }

  // --- LOADING ---
  if (
    isLoading ||
    state.phase === "IDLE" ||
    state.phase === "LOADING_TRACKS"
  ) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-gradient-game px-5">
        <motion.div
          className="flex flex-col items-center gap-5"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <AudioVisualizer isPlaying barCount={20} />
          <p className="font-display text-lg font-semibold text-foreground">
            Caricamento brani...
          </p>
          <p className="text-sm text-muted-foreground">
            {playerNames.length} giocatori pronti
          </p>
        </motion.div>
      </main>
    )
  }

  // --- ERROR ---
  if (isError) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-gradient-game px-5">
        <motion.div
          className="flex flex-col items-center gap-4"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <p className="font-display text-lg font-semibold text-destructive">
            Impossibile caricare i brani
          </p>
          <p className="text-sm text-muted-foreground">
            Impossibile raggiungere Deezer. Controlla la connessione.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={(): void => {
                setSessionId((prev) => prev + 1)
              }}
              className="rounded-xl bg-primary px-6 py-2.5 font-display text-sm font-bold text-primary-foreground"
            >
              Riprova
            </button>
            <button
              type="button"
              onClick={handleHome}
              className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-foreground"
            >
              Home
            </button>
          </div>
        </motion.div>
      </main>
    )
  }

  // --- GAME OVER ---
  if (state.phase === "GAME_OVER") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-game px-5 py-10">
        <LocalGameOver
          players={state.players}
          roundResults={state.roundResults}
          totalRounds={state.totalRounds}
          onPlayAgain={handlePlayAgain}
          onHome={handleHome}
        />
      </main>
    )
  }

  // --- GAMEPLAY ---
  return (
    <main className="relative flex min-h-dvh flex-col bg-gradient-game">
      {/* Exit button */}
      <button
        type="button"
        onClick={handleExit}
        className="absolute top-4 right-4 z-50 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
        aria-label="Esci dal gioco"
      >
        ✕
      </button>

      {/* Top bar: round + scoreboard */}
      <div className="flex flex-col gap-2 px-5 pt-5 pb-2">
        <div className="flex items-center justify-between">
          <RoundIndicator
            current={state.currentRound}
            total={state.totalRounds}
          />
        </div>
        <PlayerScoreboard
          players={state.players}
          answeringPlayerId={state.answeringPlayerId}
          eliminatedPlayerIds={state.eliminatedPlayerIds}
        />
      </div>

      {/* Timer bar */}
      {showTimerBar && (
        <div className="px-5">
          <TimerBar
            percentage={activeTimer.percentage}
            timeRemaining={activeTimer.timeRemaining}
            isRunning={activeTimer.isRunning}
          />
        </div>
      )}

      {/* Center: visualizer + status */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5">
        <AnimatePresence mode="wait">
          {/* Playing / Buzzer wait */}
          {!isFeedbackPhase && state.phase !== "PLAYER_ANSWERING" && (
            <motion.div
              key={`buzzer-${state.currentRound}`}
              className="flex flex-col items-center gap-4"
              variants={slideInUp}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <AudioVisualizer
                isPlaying={audio.isPlaying}
                barCount={24}
              />
              <p
                className="text-sm text-muted-foreground"
                aria-live="polite"
              >
                Premi il tuo buzzer!
              </p>
            </motion.div>
          )}

          {/* Player answering */}
          {state.phase === "PLAYER_ANSWERING" && answeringPlayer !== undefined && (
            <motion.div
              key={`answering-${state.currentRound}-${answeringPlayer.id}`}
              className="flex w-full max-w-sm flex-col items-center gap-4"
              variants={slideInUp}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <AudioVisualizer
                isPlaying={audio.isPlaying}
                barCount={24}
              />
              <p className="font-display text-lg font-bold text-foreground">
                {answeringPlayer.name}, rispondi!
              </p>
              <AnswerInput
                onSubmit={handleSubmitAnswer}
                isDisabled={false}
              />
            </motion.div>
          )}

          {/* Correct feedback */}
          {state.phase === "ANSWER_CORRECT" && state.currentTrack !== null && (
            <motion.div
              key={`correct-${state.currentRound}`}
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ResultFeedback
                isCorrect
                track={state.currentTrack}
                pointsEarned={
                  state.roundResults.length > 0
                    ? (state.roundResults[state.roundResults.length - 1]?.pointsEarned ?? 0)
                    : 0
                }
                isVisible
              />
            </motion.div>
          )}

          {/* Wrong feedback */}
          {state.phase === "ANSWER_WRONG" && (
            <motion.div
              key={`wrong-${state.currentRound}-${state.eliminatedPlayerIds.length}`}
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.p
                className="font-display text-lg font-bold text-destructive"
                animate={{ x: [0, -8, 8, -4, 4, 0] }}
                transition={{ duration: 0.4 }}
              >
                Sbagliato!
              </motion.p>
              <p className="text-sm text-muted-foreground">
                Gli altri possono provare
              </p>
            </motion.div>
          )}

          {/* Round over — nobody got it */}
          {state.phase === "ROUND_OVER" && state.currentTrack !== null && (
            <motion.div
              key={`over-${state.currentRound}`}
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="font-display text-lg font-bold text-muted-foreground">
                Nessuno ha indovinato
              </p>
              <SongReveal track={state.currentTrack} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom: buzzer panel */}
      <div className="px-5 pb-6">
        <BuzzerPanel
          players={state.players}
          eliminatedPlayerIds={state.eliminatedPlayerIds}
          answeringPlayerId={state.answeringPlayerId}
          isActive={state.phase === "BUZZER_WAIT"}
          onBuzz={handleBuzz}
        />
      </div>
    </main>
  )
}

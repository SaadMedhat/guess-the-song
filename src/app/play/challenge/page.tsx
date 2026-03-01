"use client"

import { Suspense, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useGameEngine } from "@/hooks/use-game-engine"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import { useTimer } from "@/hooks/use-timer"
import { useChallengePool, useDecadePool } from "@/lib/api/queries"
import { useGameStore } from "@/lib/stores/game-store"
import { useStatsStore } from "@/lib/stores/stats-store"
import { GENRE_LABELS, DECADES } from "@/lib/constants"
import { TimerBar } from "@/components/game/timer-bar"
import { ScoreDisplay } from "@/components/game/score-display"
import { RoundIndicator } from "@/components/game/round-indicator"
import { StreakCounter } from "@/components/game/streak-counter"
import { AudioVisualizer } from "@/components/game/audio-visualizer"
import { AnswerInput } from "@/components/game/answer-input"
import { ResultFeedback } from "@/components/game/result-feedback"
import { GameOver } from "@/components/game/game-over"
import { fadeIn, slideInUp } from "@/lib/motion"

const TIME_PER_ROUND = 30
const FEEDBACK_DELAY_CORRECT = 2000
const FEEDBACK_DELAY_WRONG = 2500

/**
 * Parse search params to determine challenge type.
 */
const useChallengeParams = (): {
  readonly type: "genre" | "decade" | null
  readonly genreId: number | null
  readonly decade: number | null
  readonly label: string
} => {
  const searchParams = useSearchParams()

  return useMemo(() => {
    const genreRaw = searchParams.get("genre")
    const decadeRaw = searchParams.get("decade")

    if (genreRaw !== null) {
      const genreId = Number(genreRaw)
      if (!Number.isNaN(genreId)) {
        return {
          type: "genre" as const,
          genreId,
          decade: null,
          label: GENRE_LABELS[genreId] ?? "Sfida",
        }
      }
    }

    if (decadeRaw !== null) {
      const decade = Number(decadeRaw)
      if (!Number.isNaN(decade)) {
        const decadeEntry = DECADES.find((d) => d.value === decade)
        return {
          type: "decade" as const,
          genreId: null,
          decade,
          label: decadeEntry?.label ?? `${decade}s`,
        }
      }
    }

    return { type: null, genreId: null, decade: null, label: "" }
  }, [searchParams])
}

export default function ChallengePage(): React.ReactElement {
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
      <ChallengeContent />
    </Suspense>
  )
}

function ChallengeContent(): React.ReactElement {
  const router = useRouter()
  const { type, genreId, decade, label } = useChallengeParams()

  const {
    state,
    startGame,
    submitAnswer,
    skip,
    timeUp,
    nextRound,
    setPhase,
    resetGame,
  } = useGameEngine()
  const audio = useAudioPlayer()
  const setInGame = useGameStore((s) => s.setInGame)
  const recordGame = useStatsStore((s) => s.recordGame)
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasStartedRef = useRef(false)
  const hasRecordedRef = useRef(false)

  const handleTimeout = useCallback((): void => {
    if (
      state.phase !== "PLAYING_AUDIO" &&
      state.phase !== "WAITING_ANSWER"
    )
      return
    audio.stop()
    timeUp()
  }, [state.phase, audio, timeUp])

  const timer = useTimer({
    duration: TIME_PER_ROUND,
    onTimeout: handleTimeout,
  })

  // Fetch track pool based on challenge type
  const genrePool = useChallengePool(genreId ?? 0, type === "genre" && genreId !== null)
  const decadePool = useDecadePool(decade ?? 0, type === "decade" && decade !== null)

  const activePool = type === "genre" ? genrePool : decadePool
  const trackPool = activePool.data
  const isLoading = activePool.isLoading
  const isError = activePool.isError
  const refetch = activePool.refetch

  // Redirect if no valid params
  useEffect(() => {
    if (type === null) {
      router.replace("/")
    }
  }, [type, router])

  // Start game when pool is ready
  useEffect(() => {
    if (
      trackPool !== undefined &&
      trackPool.length > 0 &&
      !hasStartedRef.current
    ) {
      hasStartedRef.current = true
      setInGame(true)
      startGame("challenge", trackPool, {
        totalRounds: 10,
        timePerRound: TIME_PER_ROUND,
        maxSkips: 3,
      })
    }
  }, [trackPool, startGame, setInGame])

  // Auto-play first round when game is READY
  useEffect(() => {
    if (state.phase === "READY" && state.currentTrack !== null) {
      setPhase("PLAYING_AUDIO")
    }
  }, [state.phase, state.currentTrack, setPhase])

  // Play audio + start timer when entering PLAYING_AUDIO
  useEffect(() => {
    if (state.phase !== "PLAYING_AUDIO") return
    if (state.currentTrack === null) return

    audio.play(state.currentTrack.preview)
    timer.reset()
    timer.start()
    setPhase("WAITING_ANSWER")

    // Preload next track
    const nextIndex = state.currentRound
    const nextTrack = state.trackPool[nextIndex]
    if (nextTrack !== undefined) {
      audio.preload(nextTrack.preview)
    }
    // Only trigger on phase change to PLAYING_AUDIO
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase])

  // Auto-advance after feedback
  useEffect(() => {
    const isFeedback =
      state.phase === "CORRECT" ||
      state.phase === "WRONG" ||
      state.phase === "SKIPPED" ||
      state.phase === "TIME_UP"

    if (!isFeedback) return

    const delay =
      state.phase === "CORRECT"
        ? FEEDBACK_DELAY_CORRECT
        : FEEDBACK_DELAY_WRONG

    feedbackTimeoutRef.current = setTimeout(() => {
      nextRound()
    }, delay)

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
    recordGame({
      mode: "challenge",
      score: state.score,
      totalRounds: state.totalRounds,
      bestStreak: state.bestStreak,
      rounds: state.roundResults,
    })
  }, [
    state.phase,
    state.score,
    state.totalRounds,
    state.bestStreak,
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

  const handleSubmitAnswer = useCallback(
    (answer: string): void => {
      if (state.phase !== "WAITING_ANSWER") return
      audio.stop()
      timer.stop()
      submitAnswer(answer, timer.timeRemaining, TIME_PER_ROUND)
    },
    [state.phase, audio, timer, submitAnswer]
  )

  const handleSkip = useCallback((): void => {
    if (state.phase !== "WAITING_ANSWER") return
    if (state.skipsRemaining <= 0) return
    audio.stop()
    timer.stop()
    skip()
  }, [state.phase, state.skipsRemaining, audio, timer, skip])

  const handlePlayAgain = useCallback((): void => {
    hasStartedRef.current = false
    hasRecordedRef.current = false
    resetGame()
    refetch()
  }, [resetGame, refetch])

  const handleHome = useCallback((): void => {
    resetGame()
    router.push("/")
  }, [resetGame, router])

  const handleExit = useCallback((): void => {
    audio.stop()
    timer.stop()
    resetGame()
    setInGame(false)
    router.push("/")
  }, [audio, timer, resetGame, setInGame, router])

  const isFeedbackPhase =
    state.phase === "CORRECT" ||
    state.phase === "WRONG" ||
    state.phase === "SKIPPED" ||
    state.phase === "TIME_UP"

  const isInputActive = state.phase === "WAITING_ANSWER"

  const lastResult =
    state.roundResults.length > 0
      ? state.roundResults[state.roundResults.length - 1]
      : undefined

  // No valid challenge params — show nothing while redirecting
  if (type === null) {
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
            Sfida {label}
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
                refetch()
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
    const correctCount = state.roundResults.filter(
      (r) => r.isCorrect
    ).length
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-game px-5 py-10">
        <GameOver
          score={state.score}
          totalRounds={state.totalRounds}
          correctAnswers={correctCount}
          bestStreak={state.bestStreak}
          rounds={state.roundResults}
          onPlayAgain={handlePlayAgain}
          onHome={handleHome}
          subtitle={`Il tuo score ${label}: ${state.score}`}
        />
      </main>
    )
  }

  // --- GAMEPLAY ---
  return (
    <main className="relative flex min-h-dvh flex-col bg-gradient-game">
      {/* Top bar: category badge + round + score + exit */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <ChallengeBadge label={label} />
          <RoundIndicator
            current={state.currentRound}
            total={state.totalRounds}
          />
        </div>
        <div className="flex items-center gap-3">
          <StreakCounter streak={state.streak} />
          <ScoreDisplay score={state.score} />
          <button
            type="button"
            onClick={handleExit}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            aria-label="Esci dal gioco"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Timer bar */}
      <div className="px-5">
        <TimerBar
          percentage={timer.percentage}
          timeRemaining={timer.timeRemaining}
          isRunning={timer.isRunning}
        />
      </div>

      {/* Center: visualizer + play area */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-5">
        <AnimatePresence mode="wait">
          {!isFeedbackPhase && (
            <motion.div
              key={`playing-${state.currentRound}`}
              className="flex flex-col items-center gap-6"
              variants={slideInUp}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Audio visualizer */}
              <div className="flex flex-col items-center gap-4">
                <AudioVisualizer
                  isPlaying={audio.isPlaying}
                  barCount={24}
                />

                {/* Play/Pause button */}
                <motion.button
                  type="button"
                  onClick={(): void => {
                    if (state.currentTrack === null) return
                    if (audio.isPlaying) {
                      audio.pause()
                      return
                    }
                    audio.play(state.currentTrack.preview)
                  }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
                  whileTap={{ scale: 0.92 }}
                  animate={
                    audio.isPlaying
                      ? {
                          boxShadow: [
                            "0 0 0px oklch(0.72 0.25 290 / 0%)",
                            "0 0 20px oklch(0.72 0.25 290 / 40%)",
                            "0 0 0px oklch(0.72 0.25 290 / 0%)",
                          ],
                        }
                      : {}
                  }
                  transition={
                    audio.isPlaying
                      ? { duration: 1.5, repeat: Infinity }
                      : {}
                  }
                  aria-label={
                    audio.isPlaying ? "Metti in pausa" : "Riproduci audio"
                  }
                >
                  {audio.isPlaying ? <PauseIcon /> : <PlayIcon />}
                </motion.button>
              </div>

              <p
                className="text-sm text-muted-foreground"
                aria-live="polite"
              >
                {isInputActive
                  ? "Che canzone è?"
                  : "Premi play per ascoltare"}
              </p>
            </motion.div>
          )}

          {/* Feedback */}
          {isFeedbackPhase && state.currentTrack !== null && (
            <motion.div
              key={`feedback-${state.currentRound}`}
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ResultFeedback
                isCorrect={state.phase === "CORRECT"}
                track={state.currentTrack}
                pointsEarned={lastResult?.pointsEarned ?? 0}
                isVisible
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom: input + skip */}
      <div className="flex flex-col items-center gap-3 px-5 pb-8">
        <AnswerInput
          onSubmit={handleSubmitAnswer}
          isDisabled={!isInputActive}
        />

        {state.skipsRemaining > 0 && (
          <button
            type="button"
            onClick={handleSkip}
            disabled={!isInputActive}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
          >
            Salta ({state.skipsRemaining} rimasti)
          </button>
        )}
      </div>
    </main>
  )
}

// --- Local components ---

const ChallengeBadge = ({
  label,
}: {
  readonly label: string
}): React.ReactElement => (
  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
    {label}
  </span>
)

const PlayIcon = (): React.ReactElement => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="ml-1"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
)

const PauseIcon = (): React.ReactElement => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
)

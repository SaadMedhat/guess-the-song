"use client"

import { motion } from "framer-motion"
import type { RoundResult } from "@/types/game"
import { staggerContainer, staggerItem, scaleUp } from "@/lib/motion"

type GameOverProps = {
  readonly score: number
  readonly totalRounds: number
  readonly correctAnswers: number
  readonly bestStreak: number
  readonly rounds: ReadonlyArray<RoundResult>
  readonly onPlayAgain: () => void
  readonly onHome: () => void
}

export const GameOver = ({
  score,
  totalRounds,
  correctAnswers,
  bestStreak,
  rounds,
  onPlayAgain,
  onHome,
}: GameOverProps): React.ReactElement => {
  const accuracy =
    totalRounds > 0 ? Math.round((correctAnswers / totalRounds) * 100) : 0

  return (
    <motion.div
      className="flex w-full max-w-md flex-col items-center gap-8 px-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex flex-col items-center gap-2" variants={staggerItem}>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Fine partita
        </h2>
      </motion.div>

      <motion.div
        className="flex flex-col items-center gap-1"
        variants={scaleUp}
      >
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Punteggio finale
        </span>
        <span className="font-display tabular-nums text-6xl font-bold text-primary text-glow">
          {score}
        </span>
      </motion.div>

      <motion.div
        className="grid w-full grid-cols-3 gap-4"
        variants={staggerItem}
      >
        <StatBox label="Precisione" value={`${accuracy}%`} />
        <StatBox label="Corrette" value={`${correctAnswers}/${totalRounds}`} />
        <StatBox label="Miglior serie" value={`${bestStreak}`} />
      </motion.div>

      <motion.div
        className="flex w-full flex-col gap-2"
        variants={staggerItem}
      >
        {rounds.map((round) => (
          <div
            key={round.roundNumber}
            className="flex items-center justify-between rounded-lg bg-card px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  round.isCorrect ? "bg-success" : "bg-destructive"
                }`}
              />
              <span className="text-sm text-foreground">
                {round.track.title_short}
              </span>
              <span className="text-xs text-muted-foreground">
                {round.track.artist.name}
              </span>
            </div>
            <span className="font-display tabular-nums text-sm font-semibold text-muted-foreground">
              +{round.pointsEarned}
            </span>
          </div>
        ))}
      </motion.div>

      <motion.div
        className="flex w-full gap-3"
        variants={staggerItem}
      >
        <button
          type="button"
          onClick={onPlayAgain}
          className="flex-1 rounded-xl bg-primary py-3 font-display text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Gioca ancora
        </button>
        <button
          type="button"
          onClick={onHome}
          className="flex-1 rounded-xl border border-border py-3 font-display text-sm font-bold text-foreground transition-colors hover:bg-card"
        >
          Home
        </button>
      </motion.div>
    </motion.div>
  )
}

const StatBox = ({
  label,
  value,
}: {
  readonly label: string
  readonly value: string
}): React.ReactElement => (
  <div className="flex flex-col items-center gap-0.5 rounded-xl bg-card p-3">
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
    <span className="font-display tabular-nums text-xl font-bold text-foreground">
      {value}
    </span>
  </div>
)

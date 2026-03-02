"use client"

import { motion } from "framer-motion"
import type { Player, LocalRoundResult } from "@/types/game"
import { staggerContainer, staggerItem, scaleUp } from "@/lib/motion"

type LocalGameOverProps = {
  readonly players: ReadonlyArray<Player>
  readonly roundResults: ReadonlyArray<LocalRoundResult>
  readonly totalRounds: number
  readonly onPlayAgain: () => void
  readonly onHome: () => void
}

const PODIUM_COLORS: ReadonlyArray<{
  readonly bg: string
  readonly text: string
  readonly glow: string
}> = [
  {
    bg: "bg-primary/20",
    text: "text-primary",
    glow: "shadow-[0_0_30px_oklch(0.72_0.25_290_/_30%)]",
  },
  {
    bg: "bg-success/20",
    text: "text-success",
    glow: "",
  },
  {
    bg: "bg-warning/20",
    text: "text-warning",
    glow: "",
  },
]

const RANK_LABELS: ReadonlyArray<string> = ["1°", "2°", "3°", "4°"]

export const LocalGameOver = ({
  players,
  roundResults,
  totalRounds,
  onPlayAgain,
  onHome,
}: LocalGameOverProps): React.ReactElement => {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const maxScore = sorted[0]?.score ?? 1
  const winner = sorted[0]

  return (
    <motion.div
      className="flex w-full max-w-md flex-col items-center gap-8 px-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Title */}
      <motion.div
        className="flex flex-col items-center gap-2"
        variants={staggerItem}
      >
        <h2 className="font-display text-2xl font-bold text-foreground">
          Classifica finale
        </h2>
        {winner !== undefined && (
          <p className="text-sm font-medium text-muted-foreground">
            {winner.name} vince!
          </p>
        )}
      </motion.div>

      {/* Podium */}
      <motion.div
        className="flex w-full items-end justify-center gap-3"
        variants={staggerItem}
      >
        {getPodiumOrder(sorted).map(({ player, rank }) => {
          if (player === undefined) return null

          const heightPercent = maxScore > 0
            ? Math.max(30, Math.round((player.score / maxScore) * 100))
            : 30
          const podiumColor = PODIUM_COLORS[rank] ?? PODIUM_COLORS[2]!
          const isWinner = rank === 0

          return (
            <motion.div
              key={player.id}
              className="flex flex-1 flex-col items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: rank === 0 ? 0.6 : rank === 1 ? 0.3 : 0.1,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              {/* Crown for winner */}
              {isWinner && (
                <motion.span
                  className="text-2xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  👑
                </motion.span>
              )}

              {/* Name */}
              <span
                className={`max-w-full truncate text-sm font-bold ${podiumColor.text}`}
              >
                {player.name}
              </span>

              {/* Bar */}
              <motion.div
                className={`flex w-full flex-col items-center justify-end rounded-t-xl ${podiumColor.bg} ${podiumColor.glow}`}
                style={{ minHeight: 40 }}
                initial={{ height: 0 }}
                animate={{ height: `${heightPercent * 1.2}px` }}
                transition={{
                  delay: rank === 0 ? 0.7 : rank === 1 ? 0.4 : 0.15,
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                }}
              >
                <span
                  className={`font-display tabular-nums text-xl font-bold ${podiumColor.text} py-2`}
                >
                  {player.score}
                </span>
              </motion.div>

              {/* Rank */}
              <span className="text-xs font-medium text-muted-foreground">
                {RANK_LABELS[rank] ?? ""}
              </span>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Full ranking */}
      <motion.div
        className="flex w-full flex-col gap-2"
        variants={staggerItem}
      >
        {sorted.map((player, index) => {
          const roundsWon = roundResults.filter(
            (r) => r.winnerId === player.id
          ).length

          return (
            <motion.div
              key={player.id}
              className="flex items-center justify-between rounded-lg bg-card px-3 py-2.5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-bold text-muted-foreground">
                  {RANK_LABELS[index] ?? `${index + 1}°`}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {player.name}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">
                  {roundsWon}/{totalRounds} round
                </span>
                <span className="font-display tabular-nums text-sm font-bold text-foreground">
                  {player.score}
                </span>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Actions */}
      <motion.div className="flex w-full gap-3" variants={scaleUp}>
        <button
          type="button"
          onClick={onPlayAgain}
          className="flex-1 rounded-xl bg-primary py-3 font-display text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Rivincita
        </button>
        <button
          type="button"
          onClick={onHome}
          className="flex-1 rounded-xl border border-border py-3 font-display text-sm font-bold text-foreground transition-colors hover:bg-card"
        >
          Menu
        </button>
      </motion.div>
    </motion.div>
  )
}

/**
 * Arrange players in podium order: [2nd, 1st, 3rd]
 */
const getPodiumOrder = (
  sorted: ReadonlyArray<Player>
): ReadonlyArray<{ readonly player: Player | undefined; readonly rank: number }> => {
  if (sorted.length <= 1) {
    return [{ player: sorted[0], rank: 0 }]
  }
  if (sorted.length === 2) {
    return [
      { player: sorted[1], rank: 1 },
      { player: sorted[0], rank: 0 },
    ]
  }
  return [
    { player: sorted[1], rank: 1 },
    { player: sorted[0], rank: 0 },
    { player: sorted[2], rank: 2 },
  ]
}

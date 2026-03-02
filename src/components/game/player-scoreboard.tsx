"use client"

import { motion } from "framer-motion"
import type { Player } from "@/types/game"

type PlayerScoreboardProps = {
  readonly players: ReadonlyArray<Player>
  readonly answeringPlayerId: string | null
  readonly eliminatedPlayerIds: ReadonlyArray<string>
}

const DOT_COLORS: ReadonlyArray<string> = [
  "bg-primary",
  "bg-success",
  "bg-warning",
  "bg-destructive",
]

export const PlayerScoreboard = ({
  players,
  answeringPlayerId,
  eliminatedPlayerIds,
}: PlayerScoreboardProps): React.ReactElement => (
  <div className="flex gap-2 overflow-x-auto">
    {players.map((player, index) => {
      const isAnswering = answeringPlayerId === player.id
      const isEliminated = eliminatedPlayerIds.includes(player.id)
      const dotColor = DOT_COLORS[index] ?? DOT_COLORS[0]!

      return (
        <motion.div
          key={player.id}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all ${
            isAnswering
              ? "bg-card ring-1 ring-primary/50"
              : "bg-card/60"
          } ${isEliminated ? "opacity-40" : ""}`}
          layout
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`}
          />
          <span className="max-w-16 truncate text-xs font-medium text-foreground">
            {player.name}
          </span>
          <motion.span
            className="font-display tabular-nums text-xs font-bold text-muted-foreground"
            key={player.score}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.3 }}
          >
            {player.score}
          </motion.span>
        </motion.div>
      )
    })}
  </div>
)

"use client"

import { motion } from "framer-motion"
import type { Player } from "@/types/game"
import { buzzerPulse } from "@/lib/motion"

type BuzzerPanelProps = {
  readonly players: ReadonlyArray<Player>
  readonly eliminatedPlayerIds: ReadonlyArray<string>
  readonly answeringPlayerId: string | null
  readonly isActive: boolean
  readonly onBuzz: (playerId: string) => void
}

const BUZZER_STYLES: ReadonlyArray<{
  readonly bg: string
  readonly glow: string
}> = [
  {
    bg: "bg-primary text-primary-foreground",
    glow: "shadow-[0_0_20px_oklch(0.72_0.25_290_/_40%)]",
  },
  {
    bg: "bg-success text-success-foreground",
    glow: "shadow-[0_0_20px_oklch(0.75_0.18_165_/_40%)]",
  },
  {
    bg: "bg-warning text-warning-foreground",
    glow: "shadow-[0_0_20px_oklch(0.80_0.16_80_/_40%)]",
  },
  {
    bg: "bg-destructive text-foreground",
    glow: "shadow-[0_0_20px_oklch(0.65_0.22_25_/_40%)]",
  },
]

export const BuzzerPanel = ({
  players,
  eliminatedPlayerIds,
  answeringPlayerId,
  isActive,
  onBuzz,
}: BuzzerPanelProps): React.ReactElement => (
  <div className="grid grid-cols-2 gap-3">
    {players.map((player, index) => {
      const style = BUZZER_STYLES[index] ?? BUZZER_STYLES[0]!
      const isEliminated = eliminatedPlayerIds.includes(player.id)
      const isAnswering = answeringPlayerId === player.id
      const isDisabled = !isActive || isEliminated || isAnswering

      return (
        <motion.button
          key={player.id}
          type="button"
          onClick={(): void => onBuzz(player.id)}
          disabled={isDisabled}
          className={`relative flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl font-display transition-all ${style.bg} ${
            isDisabled ? "opacity-30" : style.glow
          }`}
          variants={buzzerPulse}
          animate={isActive && !isEliminated ? "pulse" : "idle"}
          whileTap={isDisabled ? {} : { scale: 0.95 }}
          aria-label={`Buzzer di ${player.name}`}
        >
          <span className="text-lg font-bold">{player.name}</span>
          {isEliminated && (
            <span className="text-xs font-medium opacity-70">Eliminato</span>
          )}
          {isAnswering && (
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-foreground/50"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.button>
      )
    })}
  </div>
)

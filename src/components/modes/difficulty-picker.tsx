"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { Difficulty } from "@/types/game"
import { DIFFICULTY_CONFIG } from "@/lib/constants"

type DifficultyPickerProps = {
  readonly onSelect: (difficulty: Difficulty) => void
  readonly onClose: () => void
}

const DIFFICULTIES: ReadonlyArray<{
  readonly value: Difficulty
  readonly icon: string
}> = [
  { value: "easy", icon: "🎵" },
  { value: "medium", icon: "🎶" },
  { value: "hard", icon: "🔥" },
]

export const DifficultyPicker = ({
  onSelect,
  onClose,
}: DifficultyPickerProps): React.ReactElement => {
  const [selected, setSelected] = useState<Difficulty>("medium")

  return (
    <motion.div
      className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <p className="text-sm font-medium text-muted-foreground">
        Scegli la difficolt&agrave;
      </p>

      <div className="flex flex-col gap-2">
        {DIFFICULTIES.map((diff) => {
          const config = DIFFICULTY_CONFIG[diff.value]
          const isSelected = selected === diff.value
          return (
            <button
              key={diff.value}
              type="button"
              onClick={(): void => setSelected(diff.value)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <span className="text-xl">{diff.icon}</span>
              <div className="flex-1">
                <p
                  className={`text-sm font-bold ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}
                >
                  {config.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {config.description}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                  isSelected
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                x{config.scoreMultiplier}
              </span>
            </button>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={(): void => onSelect(selected)}
          className="flex-1 rounded-xl bg-primary py-2.5 font-display text-sm font-bold text-primary-foreground transition-all hover:brightness-110"
        >
          Gioca
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Indietro
        </button>
      </div>
    </motion.div>
  )
}

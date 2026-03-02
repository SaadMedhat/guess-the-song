"use client"

import type { Difficulty } from "@/types/game"
import { DIFFICULTY_CONFIG } from "@/lib/constants"

type DifficultyChipsProps = {
  readonly value: Difficulty
  readonly onChange: (difficulty: Difficulty) => void
}

const DIFFICULTIES: ReadonlyArray<Difficulty> = ["easy", "medium", "hard"]

export const DifficultyChips = ({
  value,
  onChange,
}: DifficultyChipsProps): React.ReactElement => (
  <div className="flex flex-col gap-2">
    <p className="text-xs font-medium text-muted-foreground">Difficolt&agrave;</p>
    <div className="flex gap-2">
      {DIFFICULTIES.map((diff) => {
        const config = DIFFICULTY_CONFIG[diff]
        const isSelected = value === diff
        return (
          <button
            key={diff}
            type="button"
            onClick={(): void => onChange(diff)}
            className={`flex-1 rounded-lg border px-3 py-2 text-center text-xs font-medium transition-all ${
              isSelected
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {config.label}
          </button>
        )
      })}
    </div>
  </div>
)

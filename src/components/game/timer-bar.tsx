"use client"

import { motion } from "framer-motion"

type TimerBarProps = {
  readonly percentage: number
  readonly timeRemaining: number
  readonly isRunning: boolean
}

const getBarColor = (percentage: number): string => {
  if (percentage > 0.5) return "bg-primary"
  if (percentage > 0.25) return "bg-warning"
  return "bg-destructive"
}

export const TimerBar = ({
  percentage,
  timeRemaining,
  isRunning,
}: TimerBarProps): React.ReactElement => {
  const barColor = getBarColor(percentage)

  return (
    <div className="flex w-full items-center gap-3">
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${barColor}`}
          initial={{ scaleX: 1 }}
          animate={{
            scaleX: percentage,
            transition: { duration: 0.1, ease: "linear" },
          }}
          style={{ transformOrigin: "left" }}
        />
        {isRunning && percentage <= 0.25 && (
          <motion.div
            className="absolute inset-0 rounded-full bg-destructive/30"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </div>
      <span
        className={`font-display tabular-nums text-sm font-bold ${
          percentage <= 0.25 ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        {Math.ceil(timeRemaining)}s
      </span>
    </div>
  )
}

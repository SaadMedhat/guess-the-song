"use client"

import { motion } from "framer-motion"
import { TIMED_STEPS } from "@/types/game"
import type { TimedStep } from "@/types/game"

type StepProgressProps = {
  readonly currentStep: TimedStep
}

const STEP_LABELS: Readonly<Record<TimedStep, string>> = {
  2: "2s",
  5: "5s",
  10: "10s",
  15: "15s",
  30: "30s",
}

export const StepProgress = ({
  currentStep,
}: StepProgressProps): React.ReactElement => {
  const currentIndex = TIMED_STEPS.indexOf(currentStep)

  return (
    <div
      className="flex items-center gap-3"
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={TIMED_STEPS.length}
      aria-label={`Step ${currentIndex + 1} di ${TIMED_STEPS.length}: ${currentStep} secondi di audio`}
    >
      {TIMED_STEPS.map((step, index) => {
        const isActive = index === currentIndex
        const isCompleted = index < currentIndex

        return (
          <div key={step} className="flex flex-col items-center gap-1">
            <motion.div
              className={`h-2.5 w-2.5 rounded-full ${
                isActive
                  ? "bg-primary"
                  : isCompleted
                    ? "bg-primary/50"
                    : "bg-muted"
              }`}
              animate={{
                scale: isActive ? 1.4 : 1,
                opacity: isActive ? 1 : isCompleted ? 0.7 : 0.3,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            />
            <span
              className={`text-[10px] tabular-nums ${
                isActive
                  ? "font-bold text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {STEP_LABELS[step]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

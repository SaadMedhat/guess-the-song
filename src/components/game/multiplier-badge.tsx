"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { TimedStep } from "@/types/game"
import { TIMED_MULTIPLIERS } from "@/types/game"
import { multiplierPop } from "@/lib/motion"

type MultiplierBadgeProps = {
  readonly timedStep: TimedStep
}

export const MultiplierBadge = ({
  timedStep,
}: MultiplierBadgeProps): React.ReactElement => {
  const multiplier = TIMED_MULTIPLIERS[timedStep]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={timedStep}
        className="flex flex-col items-center gap-1"
        variants={multiplierPop}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.span
          className="font-display tabular-nums text-5xl font-bold text-primary text-glow"
          animate={{
            textShadow: [
              "0 0 20px oklch(0.72 0.25 290 / 40%)",
              "0 0 40px oklch(0.72 0.25 290 / 60%)",
              "0 0 20px oklch(0.72 0.25 290 / 40%)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          x{multiplier}
        </motion.span>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Moltiplicatore
        </span>
      </motion.div>
    </AnimatePresence>
  )
}

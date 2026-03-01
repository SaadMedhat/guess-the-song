"use client"

import { motion, AnimatePresence } from "framer-motion"
import { bounce } from "@/lib/motion"

type StreakCounterProps = {
  readonly streak: number
}

export const StreakCounter = ({
  streak,
}: StreakCounterProps): React.ReactElement | null => {
  if (streak < 2) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={streak}
        className="flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1"
        variants={bounce}
        initial="idle"
        animate="bounce"
      >
        <span className="text-sm">🔥</span>
        <span className="font-display tabular-nums text-sm font-bold text-primary">
          {streak}x serie
        </span>
      </motion.div>
    </AnimatePresence>
  )
}

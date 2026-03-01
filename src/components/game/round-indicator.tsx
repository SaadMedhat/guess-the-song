"use client"

import { motion } from "framer-motion"

type RoundIndicatorProps = {
  readonly current: number
  readonly total: number
}

export const RoundIndicator = ({
  current,
  total,
}: RoundIndicatorProps): React.ReactElement => {
  const progress = total > 0 ? current / total : 0

  return (
    <div className="flex items-center gap-3">
      <span className="font-display tabular-nums text-sm font-semibold text-muted-foreground">
        <span className="text-foreground">{current}</span>
        <span className="mx-0.5">/</span>
        {total}
      </span>
      <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          animate={{ scaleX: progress }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ transformOrigin: "left" }}
        />
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"

type ScoreDisplayProps = {
  readonly score: number
  readonly label?: string | undefined
}

export const ScoreDisplay = ({
  score,
  label = "Punti",
}: ScoreDisplayProps): React.ReactElement => {
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) => Math.round(v))
  const [displayScore, setDisplayScore] = useState(0)
  const prevScoreRef = useRef(0)

  useEffect(() => {
    const controls = animate(motionValue, score, {
      duration: 0.6,
      ease: "easeOut",
    })

    const unsubscribe = rounded.on("change", (v) => {
      setDisplayScore(v)
    })

    const isIncreasing = score > prevScoreRef.current
    prevScoreRef.current = score

    if (isIncreasing) {
      // trigger animation handled by the motion.span below
    }

    return (): void => {
      controls.stop()
      unsubscribe()
    }
  }, [score, motionValue, rounded])

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <motion.span
        className="font-display tabular-nums text-3xl font-bold text-foreground"
        key={score}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 0.3 }}
      >
        {displayScore}
      </motion.span>
    </div>
  )
}

"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useReducedMotion } from "framer-motion"

type AudioVisualizerProps = {
  readonly isPlaying: boolean
  readonly barCount?: number | undefined
}

const BAR_COUNT_DEFAULT = 16

export const AudioVisualizer = ({
  isPlaying,
  barCount = BAR_COUNT_DEFAULT,
}: AudioVisualizerProps): React.ReactElement => {
  const prefersReducedMotion = useReducedMotion()

  const [heights, setHeights] = useState<ReadonlyArray<number>>(
    Array.from({ length: barCount }, () => 0.15)
  )
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Derive static display heights when not animating (paused or reduced-motion)
  const displayHeights =
    prefersReducedMotion === true || !isPlaying
      ? Array.from({ length: barCount }, (): number => (isPlaying ? 0.5 : 0.15))
      : heights

  useEffect(() => {
    if (prefersReducedMotion === true || !isPlaying) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setHeights(
        Array.from({ length: barCount }, () => 0.15 + Math.random() * 0.85)
      )
    }, 120)

    return (): void => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPlaying, barCount, prefersReducedMotion])

  return (
    <div
      className="flex h-12 items-end justify-center gap-[2px]"
      aria-label={isPlaying ? "Audio in riproduzione" : "Audio in pausa"}
      role="img"
    >
      {displayHeights.map((height, index) => (
        <motion.div
          key={index}
          className="w-1 rounded-full bg-primary"
          animate={{
            height: `${height * 100}%`,
            opacity: isPlaying ? 0.6 + height * 0.4 : 0.2,
          }}
          transition={{ duration: prefersReducedMotion === true ? 0 : 0.1, ease: "easeOut" }}
        />
      ))}
    </div>
  )
}

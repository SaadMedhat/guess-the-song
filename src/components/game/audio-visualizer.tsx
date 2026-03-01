"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

type AudioVisualizerProps = {
  readonly isPlaying: boolean
  readonly barCount?: number | undefined
}

const BAR_COUNT_DEFAULT = 16

export const AudioVisualizer = ({
  isPlaying,
  barCount = BAR_COUNT_DEFAULT,
}: AudioVisualizerProps): React.ReactElement => {
  const [heights, setHeights] = useState<ReadonlyArray<number>>(
    Array.from({ length: barCount }, () => 0.15)
  )
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setHeights(
          Array.from({ length: barCount }, () =>
            0.15 + Math.random() * 0.85
          )
        )
      }, 120)
    }

    if (!isPlaying) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setHeights(Array.from({ length: barCount }, () => 0.15))
    }

    return (): void => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPlaying, barCount])

  return (
    <div
      className="flex h-12 items-end justify-center gap-[2px]"
      aria-label={isPlaying ? "Audio in riproduzione" : "Audio in pausa"}
      role="img"
    >
      {heights.map((height, index) => (
        <motion.div
          key={index}
          className="w-1 rounded-full bg-primary"
          animate={{
            height: `${height * 100}%`,
            opacity: isPlaying ? 0.6 + height * 0.4 : 0.2,
          }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        />
      ))}
    </div>
  )
}

"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

const BAR_COUNT = 32

export const HeroVisualizer = (): React.ReactElement => {
  const [heights, setHeights] = useState<ReadonlyArray<number>>(
    Array.from({ length: BAR_COUNT }, () => 0.1)
  )
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setHeights(
        Array.from({ length: BAR_COUNT }, (_, i) => {
          // Create a wave pattern that moves from center outward
          const center = BAR_COUNT / 2
          const distFromCenter = Math.abs(i - center) / center
          const base = 0.15 + (1 - distFromCenter) * 0.4
          return base + Math.random() * 0.35
        })
      )
    }, 150)

    return (): void => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 flex h-28 items-end justify-center gap-[3px] opacity-[0.07]"
      aria-hidden="true"
    >
      {heights.map((height, index) => (
        <motion.div
          key={index}
          className="w-1.5 rounded-full bg-primary"
          animate={{ height: `${height * 100}%` }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      ))}
    </div>
  )
}

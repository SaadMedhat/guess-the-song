"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useReducedMotion } from "framer-motion"

const BAR_COUNT = 32

const staticWave = Array.from({ length: BAR_COUNT }, (_, i) => {
  const center = BAR_COUNT / 2
  const distFromCenter = Math.abs(i - center) / center
  return 0.15 + (1 - distFromCenter) * 0.4
})

export const HeroVisualizer = (): React.ReactElement => {
  const prefersReducedMotion = useReducedMotion()

  const [heights, setHeights] = useState<ReadonlyArray<number>>(staticWave)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (prefersReducedMotion === true) return

    intervalRef.current = setInterval(() => {
      setHeights(
        Array.from({ length: BAR_COUNT }, (_, i) => {
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
  }, [prefersReducedMotion])

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
          transition={{ duration: prefersReducedMotion === true ? 0 : 0.2, ease: "easeOut" }}
        />
      ))}
    </div>
  )
}

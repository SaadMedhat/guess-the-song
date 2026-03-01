"use client"

import { useState, useRef, useCallback, useEffect } from "react"

type UseTimerOptions = {
  readonly duration: number
  readonly onTimeout?: (() => void) | undefined
  readonly interval?: number | undefined
}

type UseTimerReturn = {
  readonly timeRemaining: number
  readonly percentage: number
  readonly isRunning: boolean
  readonly start: () => void
  readonly stop: () => void
  readonly reset: () => void
}

export const useTimer = ({
  duration,
  onTimeout,
  interval = 100,
}: UseTimerOptions): UseTimerReturn => {
  const [timeRemaining, setTimeRemaining] = useState(duration)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onTimeoutRef = useRef(onTimeout)
  onTimeoutRef.current = onTimeout

  const clearTimer = useCallback((): void => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback((): void => {
    clearTimer()
    setIsRunning(true)

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = Math.max(0, prev - interval / 1000)
        if (next <= 0) {
          clearTimer()
          setIsRunning(false)
          onTimeoutRef.current?.()
          return 0
        }
        return next
      })
    }, interval)
  }, [interval, clearTimer])

  const stop = useCallback((): void => {
    clearTimer()
    setIsRunning(false)
  }, [clearTimer])

  const reset = useCallback((): void => {
    clearTimer()
    setIsRunning(false)
    setTimeRemaining(duration)
  }, [duration, clearTimer])

  useEffect(() => clearTimer, [clearTimer])

  const percentage = duration > 0 ? timeRemaining / duration : 0

  return { timeRemaining, percentage, isRunning, start, stop, reset }
}

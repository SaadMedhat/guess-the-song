"use client"

import { useState, useEffect } from "react"

export const useDebounce = <T>(value: T, delay: number = 200): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return (): void => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

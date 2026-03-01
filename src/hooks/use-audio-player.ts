"use client"

import { useState, useRef, useCallback, useEffect } from "react"

type UseAudioPlayerReturn = {
  readonly isPlaying: boolean
  readonly currentTime: number
  readonly duration: number
  readonly play: (url: string) => void
  readonly pause: () => void
  readonly stop: () => void
  readonly seek: (time: number) => void
  readonly playSegment: (url: string, startTime: number, endTime: number) => void
  readonly preload: (url: string) => void
}

export const useAudioPlayer = (): UseAudioPlayerReturn => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const preloadRef = useRef<HTMLAudioElement | null>(null)
  const segmentEndRef = useRef<number | null>(null)
  const timeUpdateRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cleanupTimeUpdate = useCallback((): void => {
    if (timeUpdateRef.current !== null) {
      clearInterval(timeUpdateRef.current)
      timeUpdateRef.current = null
    }
  }, [])

  const startTimeTracking = useCallback((): void => {
    cleanupTimeUpdate()
    timeUpdateRef.current = setInterval(() => {
      if (audioRef.current === null) return

      const time = audioRef.current.currentTime
      setCurrentTime(time)

      if (
        segmentEndRef.current !== null &&
        time >= segmentEndRef.current
      ) {
        audioRef.current.pause()
        setIsPlaying(false)
        cleanupTimeUpdate()
      }
    }, 50)
  }, [cleanupTimeUpdate])

  const getOrCreateAudio = useCallback((): HTMLAudioElement => {
    if (audioRef.current === null) {
      audioRef.current = new Audio()
    }
    return audioRef.current
  }, [])

  const play = useCallback(
    (url: string): void => {
      const audio = getOrCreateAudio()
      segmentEndRef.current = null

      if (audio.src !== url) {
        audio.src = url
        audio.load()
      }

      audio.onloadedmetadata = (): void => {
        setDuration(audio.duration)
      }

      audio.play().then(() => {
        setIsPlaying(true)
        startTimeTracking()
      }).catch(() => {
        setIsPlaying(false)
      })
    },
    [getOrCreateAudio, startTimeTracking]
  )

  const pause = useCallback((): void => {
    if (audioRef.current === null) return
    audioRef.current.pause()
    setIsPlaying(false)
    cleanupTimeUpdate()
  }, [cleanupTimeUpdate])

  const stop = useCallback((): void => {
    if (audioRef.current === null) return
    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setIsPlaying(false)
    setCurrentTime(0)
    segmentEndRef.current = null
    cleanupTimeUpdate()
  }, [cleanupTimeUpdate])

  const seek = useCallback((time: number): void => {
    if (audioRef.current === null) return
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }, [])

  const playSegment = useCallback(
    (url: string, startTime: number, endTime: number): void => {
      const audio = getOrCreateAudio()
      segmentEndRef.current = endTime

      if (audio.src !== url) {
        audio.src = url
        audio.load()
      }

      audio.onloadedmetadata = (): void => {
        setDuration(audio.duration)
        audio.currentTime = startTime
        audio.play().then(() => {
          setIsPlaying(true)
          startTimeTracking()
        }).catch(() => {
          setIsPlaying(false)
        })
      }

      if (audio.readyState >= 2) {
        audio.currentTime = startTime
        audio.play().then(() => {
          setIsPlaying(true)
          startTimeTracking()
        }).catch(() => {
          setIsPlaying(false)
        })
      }
    },
    [getOrCreateAudio, startTimeTracking]
  )

  const preload = useCallback((url: string): void => {
    if (preloadRef.current !== null) {
      preloadRef.current.src = ""
    }
    preloadRef.current = new Audio()
    preloadRef.current.src = url
    preloadRef.current.preload = "auto"
    preloadRef.current.load()
  }, [])

  useEffect(
    () => (): void => {
      cleanupTimeUpdate()
      if (audioRef.current !== null) {
        audioRef.current.pause()
        audioRef.current.src = ""
        audioRef.current = null
      }
      if (preloadRef.current !== null) {
        preloadRef.current.src = ""
        preloadRef.current = null
      }
    },
    [cleanupTimeUpdate]
  )

  return {
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    stop,
    seek,
    playSegment,
    preload,
  }
}

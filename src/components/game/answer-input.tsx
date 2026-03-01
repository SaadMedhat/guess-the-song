"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDebounce } from "@/hooks/use-debounce"
import { useSearchTracks } from "@/lib/api/queries"
import { Skeleton } from "@/components/ui/skeleton"

type Suggestion = {
  readonly id: number
  readonly title: string
  readonly artist: string
}

type AnswerInputProps = {
  readonly onSubmit: (answer: string) => void
  readonly isDisabled: boolean
  readonly placeholder?: string | undefined
}

export const AnswerInput = ({
  onSubmit,
  isDisabled,
  placeholder = "Titolo o artista...",
}: AnswerInputProps): React.ReactElement => {
  const [value, setValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedValue = useDebounce(value, 200)

  const { data, isLoading } = useSearchTracks(debouncedValue, debouncedValue.length >= 2)

  const suggestions: ReadonlyArray<Suggestion> = (data?.data ?? [])
    .slice(0, 6)
    .map((track) => ({
      id: track.id,
      title: track.title_short,
      artist: track.artist.name,
    }))

  const handleSubmit = useCallback(
    (answer: string): void => {
      if (answer.trim().length === 0) return
      onSubmit(answer.trim())
      setValue("")
      setIsOpen(false)
      setSelectedIndex(-1)
    },
    [onSubmit]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === "Enter") {
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selected = suggestions[selectedIndex]
          if (selected !== undefined) {
            handleSubmit(`${selected.title} - ${selected.artist}`)
            return
          }
        }
        handleSubmit(value)
        return
      }

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        return
      }

      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        return
      }

      if (e.key === "Escape") {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    },
    [value, selectedIndex, suggestions, handleSubmit]
  )

  useEffect(() => {
    if (debouncedValue.length >= 2 && suggestions.length > 0) {
      setIsOpen(true)
      setSelectedIndex(-1)
    }
    if (debouncedValue.length < 2) {
      setIsOpen(false)
    }
  }, [debouncedValue, suggestions.length])

  useEffect(() => {
    if (!isDisabled) {
      inputRef.current?.focus()
    }
  }, [isDisabled])

  return (
    <div className="relative w-full max-w-md">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e): void => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={(): void => {
          if (suggestions.length > 0) setIsOpen(true)
        }}
        onBlur={(): void => {
          setTimeout(() => setIsOpen(false), 200)
        }}
        disabled={isDisabled}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-border bg-card px-4 text-base text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        aria-label="La tua risposta"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        autoComplete="off"
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-full z-50 mb-1 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-2xl"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {isLoading && (
              <div className="flex flex-col gap-2 p-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            )}

            {!isLoading &&
              suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  type="button"
                  className={`flex w-full items-baseline gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                    index === selectedIndex
                      ? "bg-primary/10 text-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                  onMouseDown={(e): void => {
                    e.preventDefault()
                    handleSubmit(
                      `${suggestion.title} - ${suggestion.artist}`
                    )
                  }}
                  onMouseEnter={(): void => setSelectedIndex(index)}
                >
                  <span className="font-medium">{suggestion.title}</span>
                  <span className="text-muted-foreground">
                    {suggestion.artist}
                  </span>
                </button>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

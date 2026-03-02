"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { DifficultyChips } from "@/components/modes/difficulty-chips"
import type { Difficulty } from "@/types/game"

const MIN_PLAYERS = 2
const MAX_PLAYERS = 4

const PLAYER_COLORS = [
  "text-primary",
  "text-success",
  "text-warning",
  "text-destructive",
] as const

export const PlayerSetup = ({
  onClose,
}: {
  readonly onClose: () => void
}): React.ReactElement => {
  const router = useRouter()
  const [names, setNames] = useState<ReadonlyArray<string>>(["", ""])
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")

  const updateName = useCallback(
    (index: number, value: string): void => {
      setNames((prev) =>
        prev.map((n, i) => (i === index ? value : n))
      )
    },
    []
  )

  const addPlayer = useCallback((): void => {
    if (names.length >= MAX_PLAYERS) return
    setNames((prev) => [...prev, ""])
  }, [names.length])

  const removePlayer = useCallback(
    (index: number): void => {
      if (names.length <= MIN_PLAYERS) return
      setNames((prev) => prev.filter((_, i) => i !== index))
    },
    [names.length]
  )

  const validNames = names.filter((n) => n.trim().length > 0)
  const canStart = validNames.length >= MIN_PLAYERS

  const handleStart = (): void => {
    if (!canStart) return
    const params = new URLSearchParams()
    validNames.forEach((name, i) => {
      params.append(`p${i + 1}`, name.trim())
    })
    params.append("difficulty", difficulty)
    router.push(`/play/local?${params.toString()}`)
  }

  return (
    <motion.div
      className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <p className="text-sm font-medium text-muted-foreground">
        Inserisci i nomi dei giocatori
      </p>

      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {names.map((name, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span
                className={`font-display text-sm font-bold tabular-nums ${PLAYER_COLORS[index] ?? "text-foreground"}`}
              >
                P{index + 1}
              </span>
              <input
                type="text"
                value={name}
                onChange={(e): void => updateName(index, e.target.value)}
                placeholder={`Giocatore ${index + 1}`}
                maxLength={16}
                className="h-10 flex-1 rounded-lg border border-border bg-secondary px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
              {names.length > MIN_PLAYERS && (
                <button
                  type="button"
                  onClick={(): void => removePlayer(index)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Rimuovi giocatore ${index + 1}`}
                >
                  ✕
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {names.length < MAX_PLAYERS && (
        <button
          type="button"
          onClick={addPlayer}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        >
          <span>+</span>
          <span>Aggiungi giocatore</span>
        </button>
      )}

      {/* Difficulty */}
      <DifficultyChips value={difficulty} onChange={setDifficulty} />

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleStart}
          disabled={!canStart}
          className="flex-1 rounded-xl bg-primary py-2.5 font-display text-sm font-bold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-30 disabled:hover:brightness-100"
        >
          Inizia
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Indietro
        </button>
      </div>
    </motion.div>
  )
}

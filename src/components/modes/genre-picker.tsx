"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { DEEZER_GENRES, GENRE_LABELS, DECADES } from "@/lib/constants"

type PickerTab = "genre" | "decade"

type GenrePickerProps = {
  readonly onClose: () => void
}

const GENRE_ENTRIES = Object.values(DEEZER_GENRES).map((id) => ({
  id,
  label: GENRE_LABELS[id] ?? "Sconosciuto",
}))

export const GenrePicker = ({
  onClose,
}: GenrePickerProps): React.ReactElement => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<PickerTab>("genre")
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [selectedDecade, setSelectedDecade] = useState<number | null>(null)

  const canPlay =
    (activeTab === "genre" && selectedGenre !== null) ||
    (activeTab === "decade" && selectedDecade !== null)

  const handlePlay = (): void => {
    if (activeTab === "genre" && selectedGenre !== null) {
      router.push(`/play/challenge?genre=${selectedGenre}`)
      return
    }
    if (activeTab === "decade" && selectedDecade !== null) {
      router.push(`/play/challenge?decade=${selectedDecade}`)
    }
  }

  return (
    <motion.div
      className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Tab toggle */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {(["genre", "decade"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={(): void => setActiveTab(tab)}
            className={`relative flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            }`}
          >
            {activeTab === tab && (
              <motion.div
                className="absolute inset-0 rounded-lg bg-secondary"
                layoutId="picker-tab"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              {tab === "genre" ? "Per genere" : "Per decennio"}
            </span>
          </button>
        ))}
      </div>

      {/* Chips */}
      <AnimatePresence mode="wait">
        {activeTab === "genre" && (
          <motion.div
            key="genre"
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {GENRE_ENTRIES.map((genre) => {
              const isSelected = selectedGenre === genre.id
              return (
                <button
                  key={genre.id}
                  type="button"
                  onClick={(): void => setSelectedGenre(genre.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                    isSelected
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {genre.label}
                </button>
              )
            })}
          </motion.div>
        )}

        {activeTab === "decade" && (
          <motion.div
            key="decade"
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {DECADES.map((decade) => {
              const isSelected = selectedDecade === decade.value
              return (
                <button
                  key={decade.value}
                  type="button"
                  onClick={(): void => setSelectedDecade(decade.value)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                    isSelected
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {decade.label}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handlePlay}
          disabled={!canPlay}
          className="flex-1 rounded-xl bg-primary py-2.5 font-display text-sm font-bold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-30 disabled:hover:brightness-100"
        >
          Gioca
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

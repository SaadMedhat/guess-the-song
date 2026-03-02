"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useStatsStore } from "@/lib/stores/stats-store"
import { Nav } from "@/components/layout/nav"
import { staggerContainer, staggerItem, slideInUp } from "@/lib/motion"
import type { GameMode } from "@/types/game"
import type { GameRecord, ModeStats } from "@/types/stats"

const MODE_LABELS: Readonly<Record<GameMode, string>> = {
  classic: "Classica",
  timed: "A tempo",
  challenge: "Sfida",
  local: "Multiplayer",
}

const MODE_ICONS: Readonly<Record<GameMode, string>> = {
  classic: "🎵",
  timed: "⏱️",
  challenge: "🎯",
  local: "👥",
}

const MODES_ORDER: ReadonlyArray<GameMode> = ["classic", "timed", "challenge", "local"]

const MAX_HISTORY_DISPLAY = 20

const formatDate = (iso: string): string => {
  const date = new Date(iso)
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  return `${day}/${month}`
}

export default function StatsPage(): React.ReactElement {
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    const unsub = useStatsStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })
    useStatsStore.persist.rehydrate()
    return unsub
  }, [])

  const gamesPlayed = useStatsStore((s) => s.gamesPlayed)
  const totalScore = useStatsStore((s) => s.totalScore)
  const bestScore = useStatsStore((s) => s.bestScore)
  const bestStreak = useStatsStore((s) => s.bestStreak)
  const history = useStatsStore((s) => s.history)
  const modeStats = useStatsStore((s) => s.modeStats)

  if (!hasHydrated) {
    return (
      <>
        <Nav />
        <main className="flex min-h-dvh items-center justify-center bg-gradient-game">
          <p className="text-sm text-muted-foreground">Caricamento...</p>
        </main>
      </>
    )
  }

  const averageScore = gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0

  // Empty state
  if (gamesPlayed === 0) {
    return (
      <>
        <Nav />
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-gradient-game px-5">
          <motion.div
            className="flex flex-col items-center gap-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-5xl">🎧</span>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Nessuna partita ancora
            </h1>
            <p className="max-w-xs text-sm text-muted-foreground">
              Gioca la tua prima partita per iniziare a tracciare le statistiche.
            </p>
            <Link
              href="/"
              className="mt-2 rounded-xl bg-primary px-6 py-2.5 font-display text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Gioca ora
            </Link>
          </motion.div>
        </main>
      </>
    )
  }

  return (
    <>
      <Nav />
      <main className="flex min-h-dvh flex-col items-center bg-gradient-game px-5 pb-12">
        <motion.div
          className="flex w-full max-w-lg flex-col gap-8 pt-24"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.h1
            className="font-display text-3xl font-bold text-foreground"
            variants={slideInUp}
          >
            Statistiche
          </motion.h1>

          {/* Overview grid */}
          <motion.div
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            variants={staggerItem}
          >
            <StatCard label="Partite" value={gamesPlayed} />
            <StatCard label="Score medio" value={averageScore} />
            <StatCard label="Miglior score" value={bestScore} />
            <StatCard label="Miglior serie" value={bestStreak} />
          </motion.div>

          {/* Per-mode breakdown */}
          <motion.div className="flex flex-col gap-3" variants={staggerItem}>
            <h2 className="font-display text-lg font-bold text-foreground">
              Per modalità
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {MODES_ORDER.map((mode) => {
                const stats = modeStats[mode]
                if (stats === undefined) return null
                return (
                  <ModeStatsCard
                    key={mode}
                    mode={mode}
                    stats={stats}
                  />
                )
              })}
            </div>
            {MODES_ORDER.every((m) => modeStats[m] === undefined) && (
              <p className="text-sm text-muted-foreground">
                Gioca una partita per vedere le statistiche per modalità.
              </p>
            )}
          </motion.div>

          {/* Game history */}
          <motion.div className="flex flex-col gap-3" variants={staggerItem}>
            <h2 className="font-display text-lg font-bold text-foreground">
              Storico
            </h2>
            <div className="flex flex-col gap-2">
              {history.slice(0, MAX_HISTORY_DISPLAY).map((record) => (
                <HistoryRow key={record.id} record={record} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </>
  )
}

// --- Local components ---

const StatCard = ({
  label,
  value,
}: {
  readonly label: string
  readonly value: number
}): React.ReactElement => (
  <div className="flex flex-col items-center gap-1 rounded-xl bg-card p-4">
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
    <AnimatedNumber value={value} className="font-display tabular-nums text-2xl font-bold text-foreground" />
  </div>
)

const AnimatedNumber = ({
  value,
  className,
}: {
  readonly value: number
  readonly className: string
}): React.ReactElement => (
  <motion.span
    className={className}
    key={value}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
  >
    {value}
  </motion.span>
)

const ModeStatsCard = ({
  mode,
  stats,
}: {
  readonly mode: GameMode
  readonly stats: ModeStats
}): React.ReactElement => (
  <motion.div
    className="flex flex-col gap-3 rounded-xl bg-card p-4"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center gap-2">
      <span className="text-lg">{MODE_ICONS[mode]}</span>
      <span className="font-display text-sm font-bold text-foreground">
        {MODE_LABELS[mode]}
      </span>
      <span className="ml-auto text-xs text-muted-foreground">
        {stats.gamesPlayed} partite
      </span>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <MiniStat label="Miglior" value={stats.bestScore} />
      <MiniStat label="Media" value={stats.averageScore} />
      <MiniStat label="Precisione" value={`${stats.averageAccuracy}%`} />
    </div>
  </motion.div>
)

const MiniStat = ({
  label,
  value,
}: {
  readonly label: string
  readonly value: number | string
}): React.ReactElement => (
  <div className="flex flex-col items-center gap-0.5">
    <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
    <span className="font-display tabular-nums text-sm font-bold text-foreground">
      {value}
    </span>
  </div>
)

const HistoryRow = ({
  record,
}: {
  readonly record: GameRecord
}): React.ReactElement => (
  <div className="flex items-center justify-between rounded-lg bg-card px-3 py-2.5">
    <div className="flex items-center gap-2.5">
      <span className="text-base">{MODE_ICONS[record.mode]}</span>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">
          {MODE_LABELS[record.mode]}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {formatDate(record.date)} · {record.correctAnswers}/{record.totalRounds} corrette
        </span>
      </div>
    </div>
    <span className="font-display tabular-nums text-sm font-bold text-foreground">
      {record.score}
    </span>
  </div>
)

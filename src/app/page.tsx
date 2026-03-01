"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Nav } from "@/components/layout/nav"
import { ModeCard } from "@/components/modes/mode-card"
import { GenrePicker } from "@/components/modes/genre-picker"
import { PlayerSetup } from "@/components/modes/player-setup"
import { HeroVisualizer } from "@/components/modes/hero-visualizer"
import { staggerContainer, slideInUp } from "@/lib/motion"
import type { GameMode } from "@/types/game"

type ExpandedPanel = "challenge" | "local" | null

const MODE_DATA: ReadonlyArray<{
  readonly mode: GameMode
  readonly icon: string
  readonly label: string
  readonly description: string
  readonly detail: string
}> = [
  {
    mode: "classic",
    icon: "🎵",
    label: "Classica",
    description: "10 brani dalle classifiche di oggi. Indovina il titolo o l'artista prima che scada il tempo.",
    detail: "10 round · 3 skip",
  },
  {
    mode: "timed",
    icon: "⏱️",
    label: "A tempo",
    description: "L'audio si sblocca gradualmente — 2s, 5s, 10s, 15s, 30s. Meno ascolti = più punti.",
    detail: "10 round · niente skip",
  },
  {
    mode: "challenge",
    icon: "🎯",
    label: "Sfida",
    description: "Scegli un genere o un decennio e metti alla prova le tue conoscenze.",
    detail: "10 round · 3 skip",
  },
  {
    mode: "local",
    icon: "👥",
    label: "Multiplayer",
    description: "2–4 giocatori, stesso schermo. Tutti ascoltano — il primo che risponde vince il round.",
    detail: "2–4 giocatori · 10 round",
  },
]

export default function HomePage(): React.ReactElement {
  const router = useRouter()
  const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel>(null)

  const handleModeClick = useCallback(
    (mode: GameMode): void => {
      if (mode === "classic") {
        router.push("/play/classic")
        return
      }
      if (mode === "timed") {
        router.push("/play/timed")
        return
      }
      if (mode === "challenge") {
        setExpandedPanel((prev) => (prev === "challenge" ? null : "challenge"))
        return
      }
      if (mode === "local") {
        setExpandedPanel((prev) => (prev === "local" ? null : "local"))
      }
    },
    [router]
  )

  const closePanel = useCallback((): void => {
    setExpandedPanel(null)
  }, [])

  return (
    <>
      <Nav />
      <main className="flex min-h-dvh flex-col items-center bg-gradient-game px-5 pb-12">
        <motion.div
          className="flex w-full max-w-md flex-col items-center gap-10 pt-24"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Hero */}
          <motion.div
            className="relative flex flex-col items-center gap-4 text-center"
            variants={slideInUp}
          >
            <HeroVisualizer />

            <h1 className="font-display text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
              Guess
              <span className="text-primary text-glow">The</span>
              Song
            </h1>

            <p className="max-w-xs text-base leading-relaxed text-muted-foreground">
              Ascolta. Indovina. Sfida.
              <br />
              <span className="text-foreground/70">
                Quanto è veloce il tuo orecchio?
              </span>
            </p>

            {/* Decorative dots */}
            <div className="mt-2 flex gap-1.5">
              {Array.from({ length: 3 }, (_, i) => (
                <motion.div
                  key={i}
                  className="h-1 w-1 rounded-full bg-primary/40"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Mode cards */}
          <div className="flex w-full flex-col gap-3">
            {MODE_DATA.map((data) => (
              <div key={data.mode} className="flex flex-col gap-3">
                <ModeCard
                  mode={data.mode}
                  label={data.label}
                  description={data.description}
                  icon={data.icon}
                  detail={data.detail}
                  onClick={(): void => handleModeClick(data.mode)}
                />

                {/* Inline expansion panels */}
                <AnimatePresence>
                  {data.mode === "challenge" &&
                    expandedPanel === "challenge" && (
                      <GenrePicker onClose={closePanel} />
                    )}
                  {data.mode === "local" && expandedPanel === "local" && (
                    <PlayerSetup onClose={closePanel} />
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Footer hint */}
          <motion.p
            className="text-center text-xs text-muted-foreground/50"
            variants={slideInUp}
          >
            Powered by Deezer · Anteprime 30s · Nessun account richiesto
          </motion.p>
        </motion.div>
      </main>
    </>
  )
}

"use client"

import Link from "next/link"
import { useGameStore } from "@/lib/stores/game-store"
import { motion, AnimatePresence } from "framer-motion"

export const Nav = (): React.ReactElement => {
  const isInGame = useGameStore((s) => s.isInGame)

  return (
    <AnimatePresence>
      {!isInGame && (
        <motion.header
          className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-5 py-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Link href="/" className="font-display text-lg font-bold text-foreground">
            Guess<span className="text-primary">The</span>Song
          </Link>
          <Link
            href="/stats"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Statistiche
          </Link>
        </motion.header>
      )}
    </AnimatePresence>
  )
}

"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { DeezerTrack } from "@/types/deezer"
import { SongReveal } from "./song-reveal"
import { shake, scaleUp } from "@/lib/motion"

type ResultFeedbackProps = {
  readonly isCorrect: boolean
  readonly track: DeezerTrack
  readonly pointsEarned: number
  readonly isVisible: boolean
}

export const ResultFeedback = ({
  isCorrect,
  track,
  pointsEarned,
  isVisible,
}: ResultFeedbackProps): React.ReactElement => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        className="flex flex-col items-center gap-4"
        variants={isCorrect ? scaleUp : shake}
        initial={isCorrect ? "hidden" : "idle"}
        animate={isCorrect ? "visible" : "shake"}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      >
        {isCorrect && (
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/20">
              <motion.span
                className="text-2xl"
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                ✓
              </motion.span>
            </div>
            <motion.p
              className="font-display text-lg font-bold text-success"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              +{pointsEarned}
            </motion.p>
          </motion.div>
        )}

        {!isCorrect && (
          <motion.div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <span className="text-xl text-destructive">✗</span>
          </motion.div>
        )}

        <SongReveal track={track} />
      </motion.div>
    )}
  </AnimatePresence>
)

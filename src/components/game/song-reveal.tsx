"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import type { DeezerTrack } from "@/types/deezer"
import { slideInUp } from "@/lib/motion"

type SongRevealProps = {
  readonly track: DeezerTrack
}

export const SongReveal = ({
  track,
}: SongRevealProps): React.ReactElement => (
  <motion.div
    className="flex items-center gap-4"
    variants={slideInUp}
    initial="hidden"
    animate="visible"
  >
    <motion.div
      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg shadow-lg"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
    >
      <Image
        src={track.album.cover_medium}
        alt={`${track.album.title} cover`}
        fill
        className="object-cover"
        sizes="64px"
      />
    </motion.div>
    <div className="flex flex-col gap-0.5">
      <motion.p
        className="font-display text-base font-bold text-foreground"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        {track.title_short}
      </motion.p>
      <motion.p
        className="text-sm text-muted-foreground"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        {track.artist.name}
      </motion.p>
    </div>
  </motion.div>
)

"use client"

import { motion } from "framer-motion"
import { staggerItem } from "@/lib/motion"
import type { GameMode } from "@/types/game"

type ModeCardTheme = {
  readonly gradient: string
  readonly iconBg: string
  readonly hoverBorder: string
  readonly accentLine: string
}

const MODE_THEMES: Readonly<Record<GameMode, ModeCardTheme>> = {
  classic: {
    gradient: "from-primary/5 to-transparent",
    iconBg: "bg-primary/10",
    hoverBorder: "group-hover:border-primary/40",
    accentLine: "bg-primary",
  },
  timed: {
    gradient: "from-warning/5 to-transparent",
    iconBg: "bg-warning/10",
    hoverBorder: "group-hover:border-warning/40",
    accentLine: "bg-warning",
  },
  challenge: {
    gradient: "from-success/5 to-transparent",
    iconBg: "bg-success/10",
    hoverBorder: "group-hover:border-success/40",
    accentLine: "bg-success",
  },
  local: {
    gradient: "from-destructive/5 to-transparent",
    iconBg: "bg-destructive/10",
    hoverBorder: "group-hover:border-destructive/40",
    accentLine: "bg-destructive",
  },
}

type ModeCardProps = {
  readonly mode: GameMode
  readonly label: string
  readonly description: string
  readonly icon: string
  readonly detail: string
  readonly onClick: () => void
}

export const ModeCard = ({
  mode,
  label,
  description,
  icon,
  detail,
  onClick,
}: ModeCardProps): React.ReactElement => {
  const theme = MODE_THEMES[mode]

  return (
    <motion.div variants={staggerItem}>
      <motion.button
        type="button"
        onClick={onClick}
        className={`group relative flex w-full flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${theme.gradient} bg-card p-5 text-left transition-colors ${theme.hoverBorder}`}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Accent line at top */}
        <div
          className={`absolute top-0 left-0 h-[2px] w-0 transition-all duration-300 group-hover:w-full ${theme.accentLine}`}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${theme.iconBg}`}
            >
              {icon}
            </div>
            <div className="flex flex-col">
              <h3 className="font-display text-base font-bold text-foreground">
                {label}
              </h3>
              <p className="text-xs text-muted-foreground">{detail}</p>
            </div>
          </div>

          {/* Arrow */}
          <motion.span
            className="text-muted-foreground/50 transition-colors group-hover:text-foreground"
            initial={{ x: 0 }}
            whileHover={{ x: 3 }}
          >
            →
          </motion.span>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </motion.button>
    </motion.div>
  )
}

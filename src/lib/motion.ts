import type { Variants, Transition } from "framer-motion"

export const SPRING_BOUNCE: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
}

export const SPRING_SMOOTH: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 30,
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export const slideInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...SPRING_SMOOTH },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...SPRING_SMOOTH },
  },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...SPRING_SMOOTH },
  },
  exit: { opacity: 0, x: 40, transition: { duration: 0.2 } },
}

export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...SPRING_BOUNCE },
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15 } },
}

export const shake: Variants = {
  idle: { x: 0 },
  shake: {
    x: [0, -10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.5 },
  },
}

export const bounce: Variants = {
  idle: { scale: 1 },
  bounce: {
    scale: [1, 1.3, 0.95, 1.1, 1],
    transition: { duration: 0.4 },
  },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...SPRING_SMOOTH },
  },
}

export const pulseGlow: Variants = {
  idle: {
    boxShadow: "0 0 0px oklch(0.72 0.25 290 / 0%)",
  },
  pulse: {
    boxShadow: [
      "0 0 10px oklch(0.72 0.25 290 / 30%)",
      "0 0 25px oklch(0.72 0.25 290 / 50%)",
      "0 0 10px oklch(0.72 0.25 290 / 30%)",
    ],
    transition: { duration: 1.5, repeat: Infinity },
  },
}
